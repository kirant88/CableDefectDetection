import { createSlice } from '@reduxjs/toolkit';

const createInitialModuleState = () => ({
  capturedImage: null,
  processedImage: null,
  processedImageNoblink: null,
  predictionCount: 0,
  detectedCount: 0,
  missingCount: 0,
  misorientedCount: 0,
  status: '-',
  statusColor: 'transparent',
  shouldBlink: false,
});

const initialState = {
  packaging: createInitialModuleState(),
  bullet: createInitialModuleState(),
  cable: createInitialModuleState(),
  ocr: createInitialModuleState(),
  wheel_ocr: createInitialModuleState(),
  bolt_assembly: createInitialModuleState(),
  thread_detection: createInitialModuleState(),
  train_pantograph: createInitialModuleState(),
  xray_inspection: createInitialModuleState(),
};

const imageSlice = createSlice({
  name: 'image',
  initialState,
  reducers: {
    setCapturedImage: (state, action) => {
      const { module, image } = action.payload;
      state[module].capturedImage = image;
    },
    setProcessedImage: (state, action) => {
      const { module, image, imageNoblink } = action.payload;
      state[module].processedImage = image;
      if (imageNoblink !== undefined) {
        state[module].processedImageNoblink = imageNoblink;
      }
    },
    setPredictionCount: (state, action) => {
      const { module, count, detected, missing, misoriented } = action.payload;
      if (detected !== undefined && missing !== undefined) {
        state[module].detectedCount = detected;
        state[module].missingCount = missing;
        state[module].misorientedCount = misoriented || 0;
        state[module].predictionCount = detected + missing;
        state[module].shouldBlink = missing > 0 || (misoriented || 0) > 0;
      } else {
        state[module].predictionCount = count;
        state[module].shouldBlink = false;
      }
    },
    setStatus: (state, action) => {
      const { module, status, color } = action.payload;
      state[module].status = status;
      state[module].statusColor = color;
    },
    resetState: (state, action) => {
      const { module } = action.payload;
      state[module] = createInitialModuleState();
    },
  },
});

export const {
  setCapturedImage,
  setProcessedImage,
  setPredictionCount,
  setStatus,
  resetState,
} = imageSlice.actions;

export default imageSlice.reducer;
