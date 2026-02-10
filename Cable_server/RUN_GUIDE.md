# Histogram Cable Fault Detection - Run Guide

## 1. Using Conda Environment

1. Install [Miniconda](https://docs.conda.io/en/latest/miniconda.html) or [Anaconda](https://www.anaconda.com/products/distribution).
2. Open Anaconda Prompt and navigate to this folder:
   ```sh
   cd D:\C4i4\C4i4_Projects\Github\VISION_LAB\demo\hist
   ```
3. Create the environment:
   ```sh
   conda env create -f environment.yml
   ```
4. Activate the environment:
   ```sh
   conda activate hist_cable_env
   ```
5. Run the main application:
   ```sh
   python hist_cable.py
   ```

## 2. Using Python venv

1. Open Command Prompt and navigate to this folder:
   ```sh
   cd D:\C4i4\C4i4_Projects\Github\VISION_LAB\demo\hist
   ```
2. Create a virtual environment:
   ```sh
   python -m venv venv
   ```
3. Activate the virtual environment:
   - On Windows:
     ```sh
     venv\Scripts\activate
     ```
   - On Linux/Mac:
     ```sh
     source venv/bin/activate
     ```
4. Install dependencies:
   ```sh
   pip install -r requirements.txt
   ```
5. Run the main application:
   ```sh
   python hist_cable.py
   ```
