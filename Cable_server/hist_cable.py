import cv2
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.cm import get_cmap
from collections import defaultdict
from ultralytics import YOLO
import gradio as gr
import time

# Load the YOLOv8 model
model = YOLO(r"D:\6_deep_vision\demo\hist\best_histogram.pt")  # Replace 'best.pt' with the path to your YOLOv8 weights file


# Function to normalize coordinates
def normalize_coordinates(x, y, width, height):
    return x / width, y / height

# Function to process images and generate histogram
def process_images(uploaded_files):
    defect_counts_per_image = defaultdict(lambda: defaultdict(int))
    
    for idx, uploaded_file in enumerate(uploaded_files):
        # The file is directly provided as bytes
        file_bytes = uploaded_file
        # Decode the image
        image = cv2.imdecode(np.frombuffer(file_bytes, np.uint8), cv2.IMREAD_COLOR)
        if image is None:
            continue  # Skip if image could not be decoded

        image_height, image_width, _ = image.shape

        # Perform object detection
        results = model(image, device='cpu')

        detected_objects = {}

        for result in results:
            boxes = result.boxes
            for box in boxes:
                x1, y1, x2, y2 = map(int, box.xyxy[0])  # Get the bounding box coordinates
                label = int(box.cls.item())  # Convert tensor to integer
                confidence = float(box.conf.item())  # Convert tensor to float

                # Normalize coordinates
                norm_x1, norm_y1 = normalize_coordinates(x1, y1, image_width, image_height)
                norm_x2, norm_y2 = normalize_coordinates(x2, y2, image_width, image_height)

                # Consider each defect separately
                detected_objects[label] = detected_objects.get(label, []) + [(norm_x1, norm_y1, norm_x2, norm_y2)]

        # Use index as image identifier
        for label, coords in detected_objects.items():
            defect_counts_per_image[idx][label] += len(coords)

    # Get class names from the results
    class_names = results[0].names

    # Aggregate counts for the histogram
    defect_histogram = defaultdict(int)
    for image_idx, defects in defect_counts_per_image.items():
        for label, count in defects.items():
            defect_histogram[(label, count)] += 1

    return defect_histogram, class_names


def generate_histogram(uploaded_files):
    start_time = time.time()  # Start the timer
    
    defect_histogram, class_names = process_images(uploaded_files)
    
    end_time = time.time()  # End the timer
    processing_time = end_time - start_time  # Calculate the processing time

    # Plot histogram of defect frequencies
    labels = [f"{class_names[label]} - {count} occurrence(s)" for (label, count) in defect_histogram.keys()]
    frequencies = list(defect_histogram.values())

    # Generate dark shades of colors
    cmap = get_cmap('Dark2')  # 'Dark2' colormap provides dark colors
    colors = [cmap(i / len(labels)) for i in range(len(labels))]

    fig, ax = plt.subplots(figsize=(16, 10))  # Increase figure size
    bars = ax.bar(labels, frequencies, color=colors)
    ax.legend(loc='best', fontsize=25)
    
    ax.set_xlabel('Defect Class and Number of Occurrences in a Single Image', fontsize=14)
    ax.set_ylabel('Frequency', fontsize=14)
    ax.set_title('Histogram of Defect Frequencies', fontsize=16)
    
    # Set horizontal labels with increased font size and slight rotation
    ax.set_xticks(range(len(labels)))
    ax.set_xticklabels(labels, rotation=30, ha='right', fontsize=14)  # Adjust rotation and fontsize

    # Annotate bars with counts with offset to prevent overlap
    for bar in bars:
        yval = bar.get_height()
        ax.text(bar.get_x() + bar.get_width() / 2, yval + 0.5,  # Add offset
                int(yval), va='bottom', ha='center', fontsize=14)  # Increased fontsize for labels on bars

    plt.tight_layout()
    
    return fig, f"Processing Time: {processing_time:.2f} seconds"


    


# Gradio app
interface = gr.Interface(
    fn=generate_histogram,
    inputs=gr.Files(label="Upload Images", type="binary"),  # Handle file as binary
    outputs=[
        gr.Plot(label="Histogram of Defect Frequencies"),
        gr.Textbox(label="Processing Time")
    ],
    title="Line Cable Fault Defect Detection",
    css="footer {visibility: hidden}"  # Path to your custom CSS file
)

interface.launch()
