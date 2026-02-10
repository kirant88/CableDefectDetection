# Cable Fault Detection - Setup Guide

## 📋 Overview
Complete cable fault detection system with:
- **Single Image Detection**: Analyze individual cable images with bounding boxes
- **Bulk Analysis**: Process multiple images and generate defect distribution histogram

## 🚀 Quick Start

### 1. Start Backend Server

```powershell
cd d:\6_deep_vision\demo\hist
python cable_fault_server.py
```

The server will start on `http://localhost:5000`

### 2. Start Frontend (if not running)

```powershell
cd d:\6_deep_vision\Vision_UI
npm run dev
```

Frontend will be available at `http://localhost:5173`

### 3. Access Cable Fault Detection

Navigate to: `http://localhost:5173/cable_fault`

## 🎯 Features

### Single Image Detection Tab
- **Webcam Capture**: Start camera and capture live images
- **File Upload**: Upload cable images from your computer
- **Real-time Detection**: YOLOv8 model detects faults with bounding boxes
- **Visual Feedback**: Color-coded status (Green = No Faults, Red = Fault Detected)
- **Fault Details**: Shows fault type, severity (HIGH/MEDIUM/LOW), and location

### Bulk Analysis & Histogram Tab
- **Multiple Upload**: Select multiple cable images at once
- **Batch Processing**: Analyzes all images in one go
- **Histogram Generation**: Visual bar chart showing defect distribution
- **Statistics Summary**:
  - Total images processed
  - Total faults found
  - Number of fault types
  - Breakdown by defect type
- **Defect Table**: Detailed count of each defect type

## 📊 Histogram Interpretation

The histogram shows:
- **X-axis**: Defect class and occurrence count per image
- **Y-axis**: Frequency (number of images with that pattern)
- **Color-coded bars**: Different colors for different defect types
- **Annotations**: Numbers on top of bars show frequency

Example: "Crack - 2 occurrences" with frequency 5 means:
- 5 images had exactly 2 cracks each

## 🔧 API Endpoints

### Health Check
```
GET http://localhost:5000/health
```

### Single Image Detection
```
POST http://localhost:5000/cable/predict
Content-Type: multipart/form-data
Body: image file
```

### Bulk Analysis
```
POST http://localhost:5000/cable/bulk_predict
Content-Type: multipart/form-data
Body: multiple image files (use key: "images")
```

### Get Statistics
```
GET http://localhost:5000/cable/stats
```

## 📂 File Locations

### Backend
- **Server**: `d:\6_deep_vision\demo\hist\cable_fault_server.py`
- **Model**: `d:\6_deep_vision\demo\hist\best_histogram.pt`
- **Uploads**: `d:\6_deep_vision\demo\hist\uploads/`
- **Processed**: `d:\6_deep_vision\demo\hist\processed/`
- **Histograms**: `d:\6_deep_vision\demo\hist\histograms/`

### Frontend
- **Component**: `d:\6_deep_vision\Vision_UI\src\components\CableFaultDetection.jsx`
- **API Config**: `d:\6_deep_vision\Vision_UI\src\services\api.js`
- **State**: `d:\6_deep_vision\Vision_UI\src\features\ImageSlice.js`

## 🎨 UI Components

### Single Detection View
```
+------------------+    +------------------+
|                  |    |  Detection       |
|  Video/Image     |    |  Status          |
|  Display         |    |  (READY/OK/FAULT)|
|                  |    +------------------+
|                  |    |  Fault Count     |
+------------------+    |  0                |
|                  |    +------------------+
| START | CAPTURE  |    |  Fault Details   |
| CLEAR | UPLOAD   |    |  - Type          |
|       | DETECT   |    |  - Severity      |
+------------------+    |  - Location      |
                        +------------------+
```

### Bulk Analysis View
```
+------------------+    +--------------------------------+
|  Bulk Upload     |    |  Histogram Display             |
|                  |    |                                |
| SELECT IMAGES    |    |  [Bar Chart Visualization]     |
|                  |    |                                |
| 10 images        |    |  ▮▮▮▮▮                        |
| selected         |    |  ▮▮▮▮▮▮▮                      |
|                  |    |  ▮▮▮                          |
| ANALYZE &        |    |                                |
| GENERATE         |    +--------------------------------+
| HISTOGRAM        |    |  Defect Type Summary           |
|                  |    |  +---------+-------+           |
| CLEAR            |    |  | Type    | Count |           |
+------------------+    |  +---------+-------+           |
|  Summary         |    |  | Crack   |   15  |           |
|  Total: 10       |    |  | Break   |    8  |           |
|  Faults: 23      |    |  | Frayed  |   12  |           |
|  Types: 3        |    |  +---------+-------+           |
+------------------+    +--------------------------------+
```

## 🐛 Troubleshooting

### Backend Issues
1. **Model not loading**: Check if `best_histogram.pt` exists at the specified path
2. **CORS errors**: Ensure Flask-CORS is installed: `pip install flask-cors`
3. **Port already in use**: Change port in `cable_fault_server.py` (line: `app.run(port=5000)`)

### Frontend Issues
1. **Connection refused**: Make sure backend server is running on port 5000
2. **Images not displaying**: Check browser console for CORS errors
3. **Histogram not generating**: Ensure you selected at least 2 images

### Required Packages
```bash
pip install flask flask-cors opencv-python numpy matplotlib ultralytics
```

## 📝 Notes

- **Model**: Uses YOLOv8 for cable fault detection
- **Supported Formats**: JPG, JPEG, PNG
- **Processing Time**: 
  - Single image: ~1-2 seconds
  - Bulk (10 images): ~10-20 seconds
- **Max Upload**: No hard limit (adjust timeout if needed)

## 🎯 Next Steps

1. Test single image detection with sample cable images
2. Try bulk analysis with multiple images (5-10 recommended)
3. Review histogram to understand fault patterns
4. Export results or processed images as needed

---

For issues or questions, check the console logs in both backend and frontend terminals.
