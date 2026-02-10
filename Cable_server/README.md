# Histogram Cable Fault Detection

This application detects and visualizes cable faults using a YOLOv8 model and provides a histogram of defect frequencies via a Gradio web interface.

## Features
- Detects defects in uploaded images using YOLOv8.
- Generates a histogram of defect frequencies per image.
- Interactive web interface using Gradio.

## Requirements
- Python 3.8+
- OpenCV
- NumPy
- Matplotlib
- Ultralytics (YOLOv8)
- Gradio
- Torch

## Setup
See [RUN_GUIDE.md](./RUN_GUIDE.md) for detailed setup and run instructions using either Conda or venv.

## Files
- `hist_cable.py`: Main application for defect detection and histogram visualization.
- `best.pt`: YOLOv8 weights file (update the path in the script if needed).
- `dataset/`: Place your input images here.

## Usage
1. Place your images in the `dataset/` folder.
2. Update the path to the YOLOv8 weights file in `hist_cable.py` if needed.
3. Run the application as described in the run guide.
4. Use the Gradio interface to upload images and view results.

