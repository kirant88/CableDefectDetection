@echo off
conda env create -f environment.yml
conda activate hist_cable_env
python hist_cable.py
pause
