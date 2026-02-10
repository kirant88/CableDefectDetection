"""
Flask Backend Server for Cable Fault Detection
Supports:
1. Single image fault detection
2. Bulk upload with histogram generation
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import cv2
import numpy as np
import matplotlib

matplotlib.use("Agg")  # Use non-GUI backend
import matplotlib.pyplot as plt
from matplotlib.cm import get_cmap
from collections import defaultdict
from ultralytics import YOLO
import os
import base64
from datetime import datetime
import uuid

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Configuration
UPLOAD_FOLDER = "uploads"
PROCESSED_FOLDER = "processed"
HISTOGRAM_FOLDER = "histograms"
# MODEL_PATH = r"D:\Vision Lab\ui changes\Cable_server\best_histogram.pt"
MODEL_PATH = (
    r"D:\Vision Lab Inspection\Vision Lab\ui changes\Cable_server\best_histogram.pt"
)

# Create necessary folders
for folder in [UPLOAD_FOLDER, PROCESSED_FOLDER, HISTOGRAM_FOLDER]:
    os.makedirs(folder, exist_ok=True)

# Load YOLOv8 model
try:
    model = YOLO(MODEL_PATH)
    print(f"✅ Model loaded successfully from {MODEL_PATH}")
    print(model.names)
except Exception as e:
    print(f"❌ Error loading model: {e}")
    model = None

# Color mapping for different defect types
DEFECT_COLORS = {
    0: (255, 0, 0),  # Red
    1: (0, 255, 0),  # Green
    2: (0, 0, 255),  # Blue
    3: (255, 255, 0),  # Cyan
    4: (255, 0, 255),  # Magenta
    5: (0, 255, 255),  # Yellow
    6: (128, 0, 128),  # Purple
    7: (255, 165, 0),  # Orange
}


def get_defect_color(class_id):
    """Get color for a specific defect class"""
    return DEFECT_COLORS.get(class_id, (255, 255, 255))


def normalize_coordinates(x, y, width, height):
    """Normalize coordinates to 0-1 range"""
    return x / width, y / height


def process_single_image(image_bytes, filename):
    """Process a single image for fault detection"""
    try:
        # Decode image
        nparr = np.frombuffer(image_bytes, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if image is None:
            return None, "Failed to decode image"

        image_height, image_width, _ = image.shape

        # Perform object detection
        results = model(image, device="cpu")

        # Initialize fault tracking
        faults = []
        fault_counts = defaultdict(int)

        # Process detections
        for result in results:
            boxes = result.boxes
            for box in boxes:
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                label = int(box.cls.item())
                confidence = float(box.conf.item())

                # Get class name
                class_name = results[0].names[label]

                # Track fault
                fault_counts[class_name] += 1

                faults.append(
                    {
                        "class": class_name,
                        "confidence": round(confidence * 100, 2),
                        "bbox": [x1, y1, x2, y2],
                    }
                )

                # Draw bounding box
                color = get_defect_color(label)
                cv2.rectangle(image, (x1, y1), (x2, y2), color, 2)

                # Draw label
                label_text = f"{class_name}: {confidence:.2f}"
                (text_width, text_height), _ = cv2.getTextSize(
                    label_text, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2
                )
                cv2.rectangle(
                    image, (x1, y1 - text_height - 10), (x1 + text_width, y1), color, -1
                )
                cv2.putText(
                    image,
                    label_text,
                    (x1, y1 - 5),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.6,
                    (255, 255, 255),
                    2,
                )

        # Save processed image
        processed_filename = (
            f"processed_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{filename}"
        )
        processed_path = os.path.join(PROCESSED_FOLDER, processed_filename)
        cv2.imwrite(processed_path, image)

        return {
            "success": True,
            "processed_image": f"/processed/{processed_filename}",
            "fault_count": len(faults),
            "fault_types": len(fault_counts),
            "faults": faults,
            "fault_summary": dict(fault_counts),
            "image_size": {"width": image_width, "height": image_height},
        }, None

    except Exception as e:
        return None, str(e)


def process_bulk_images(image_files):
    """Process multiple images and generate histogram"""
    try:
        defect_counts_per_image = defaultdict(lambda: defaultdict(int))
        all_class_names = set()
        total_images = len(image_files)
        processed_images = 0

        for idx, (file_bytes, filename) in enumerate(image_files):
            # Decode image
            nparr = np.frombuffer(file_bytes, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

            if image is None:
                continue

            # Perform object detection
            results = model(image, device="cpu")

            detected_objects = defaultdict(list)

            for result in results:
                boxes = result.boxes
                for box in boxes:
                    label = int(box.cls.item())
                    class_name = results[0].names[label]
                    all_class_names.add(class_name)
                    detected_objects[label].append(class_name)

            # Count defects per image
            for label, detections in detected_objects.items():
                defect_counts_per_image[idx][label] += len(detections)

            processed_images += 1

        # Get class names
        class_names = results[0].names if results else {}

        # Aggregate counts for histogram
        defect_histogram = defaultdict(int)
        for image_idx, defects in defect_counts_per_image.items():
            for label, count in defects.items():
                defect_histogram[(label, count)] += 1

        # Generate histogram
        histogram_path = generate_histogram_chart(
            defect_histogram, class_names, processed_images
        )

        # Calculate statistics
        total_faults = sum(
            sum(counts.values()) for counts in defect_counts_per_image.values()
        )

        fault_type_summary = defaultdict(int)
        for defects in defect_counts_per_image.values():
            for label, count in defects.items():
                fault_type_summary[class_names[label]] += count

        # Build defect distribution with proper labels for histogram
        defect_distribution_labeled = {}
        for (label, count), frequency in defect_histogram.items():
            class_name = class_names[label]
            key = f"{class_name} - {count} occurrence(s)"
            defect_distribution_labeled[key] = frequency

        return {
            "success": True,
            "histogram": f"/histograms/{os.path.basename(histogram_path)}",
            "total_images": total_images,
            "processed_images": processed_images,
            "total_faults": total_faults,
            "fault_types": len(all_class_names),
            "fault_summary": dict(fault_type_summary),
            "defect_distribution": defect_distribution_labeled,
        }, None

    except Exception as e:
        return None, str(e)


def generate_histogram_chart(defect_histogram, class_names, total_images):
    """Generate histogram chart from defect data"""
    # Prepare data for plotting
    labels = [
        f"{class_names[label]} - {count} occurrence(s)"
        for (label, count) in defect_histogram.keys()
    ]
    frequencies = list(defect_histogram.values())

    # Generate colors
    cmap = get_cmap("Dark2")
    colors = [cmap(i / len(labels)) for i in range(len(labels))]

    # Create figure
    fig, ax = plt.subplots(figsize=(16, 10))
    bars = ax.bar(labels, frequencies, color=colors)

    ax.set_xlabel("Defect Class and Number of Occurrences", fontsize=14)
    ax.set_ylabel("Frequency (Number of Images)", fontsize=14)
    ax.set_title(
        f"Cable Fault Detection - Defect Histogram\n"
        f"Total Images Analyzed: {total_images}",
        fontsize=16,
    )

    # Set labels
    ax.set_xticks(range(len(labels)))
    ax.set_xticklabels(labels, rotation=30, ha="right", fontsize=12)

    # Annotate bars
    for bar in bars:
        yval = bar.get_height()
        ax.text(
            bar.get_x() + bar.get_width() / 2,
            yval + 0.5,
            int(yval),
            va="bottom",
            ha="center",
            fontsize=12,
        )

    plt.tight_layout()

    # Save histogram
    histogram_filename = f"histogram_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
    histogram_path = os.path.join(HISTOGRAM_FOLDER, histogram_filename)
    plt.savefig(histogram_path, dpi=100, bbox_inches="tight")
    plt.close()

    return histogram_path


# ============================================================================
# API ROUTES
# ============================================================================


@app.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint"""
    return jsonify(
        {
            "status": "healthy",
            "model_loaded": model is not None,
            "timestamp": datetime.now().isoformat(),
        }
    )


@app.route("/cable/predict", methods=["POST"])
def predict_single():
    """Single image fault detection"""
    if model is None:
        return jsonify({"status": "error", "message": "Model not loaded"}), 500

    if "image" not in request.files:
        return jsonify({"status": "error", "message": "No image provided"}), 400

    file = request.files["image"]
    if file.filename == "":
        return jsonify({"status": "error", "message": "Empty filename"}), 400

    try:
        # Read image bytes
        image_bytes = file.read()

        # Process image
        result, error = process_single_image(image_bytes, file.filename)

        if error:
            return jsonify({"status": "error", "message": error}), 500

        return jsonify(
            {
                "status": "success",
                "processed_image": result["processed_image"],
                "fault_count": result["fault_count"],
                "defect_count": result[
                    "fault_count"
                ],  # Alias for frontend compatibility
                "fault_types": result["fault_types"],
                "faults": result["faults"],
                "fault_summary": result["fault_summary"],
                "fault_details": {
                    "type": (
                        ", ".join(result["fault_summary"].keys())
                        if result["fault_summary"]
                        else "None"
                    ),
                    "severity": (
                        "HIGH"
                        if result["fault_count"] > 5
                        else "MEDIUM" if result["fault_count"] > 2 else "LOW"
                    ),
                    "location": f"{result['fault_count']} fault(s) detected",
                },
            }
        )

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/cable/bulk_predict", methods=["POST"])
def predict_bulk():
    """Bulk image processing with histogram generation"""
    if model is None:
        return jsonify({"status": "error", "message": "Model not loaded"}), 500

    if "images" not in request.files:
        return jsonify({"status": "error", "message": "No images provided"}), 400

    files = request.files.getlist("images")

    if len(files) == 0:
        return jsonify({"status": "error", "message": "No images in request"}), 400

    try:
        # Prepare image data
        image_files = []
        for file in files:
            if file.filename != "":
                image_bytes = file.read()
                image_files.append((image_bytes, file.filename))

        if len(image_files) == 0:
            return jsonify({"status": "error", "message": "No valid images found"}), 400

        # Process bulk images
        result, error = process_bulk_images(image_files)

        if error:
            return jsonify({"status": "error", "message": error}), 500

        return jsonify(
            {
                "status": "success",
                "histogram_image": result["histogram"],
                "total_images": result["total_images"],
                "processed_images": result["processed_images"],
                "total_faults": result["total_faults"],
                "fault_types": result["fault_types"],
                "fault_summary": result["fault_summary"],
                "defect_distribution": result["defect_distribution"],
            }
        )

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/cable/stats", methods=["GET"])
def get_stats():
    """Get statistics about processed images"""
    try:
        processed_count = len(os.listdir(PROCESSED_FOLDER))
        histogram_count = len(os.listdir(HISTOGRAM_FOLDER))

        return jsonify(
            {
                "status": "success",
                "processed_images": processed_count,
                "generated_histograms": histogram_count,
            }
        )
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


# Static file serving
@app.route("/processed/<filename>")
def serve_processed(filename):
    """Serve processed images"""
    return send_from_directory(PROCESSED_FOLDER, filename)


@app.route("/histograms/<filename>")
def serve_histogram(filename):
    """Serve histogram images"""
    return send_from_directory(HISTOGRAM_FOLDER, filename)


@app.route("/uploads/<filename>")
def serve_upload(filename):
    """Serve uploaded images"""
    return send_from_directory(UPLOAD_FOLDER, filename)


if __name__ == "__main__":
    print("=" * 60)
    print("🔌 Cable Fault Detection Server")
    print("=" * 60)
    print(f"📁 Upload folder: {UPLOAD_FOLDER}")
    print(f"📁 Processed folder: {PROCESSED_FOLDER}")
    print(f"📁 Histogram folder: {HISTOGRAM_FOLDER}")
    print(f"🤖 Model: {MODEL_PATH}")
    print(f"✅ Model loaded: {model is not None}")
    print("=" * 60)
    print("🚀 Starting Flask server on http://localhost:5000")
    print("=" * 60)

    app.run(debug=True, host="0.0.0.0", port=5000)
