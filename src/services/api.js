// src/services/api.js
import axios from 'axios';

// Server configurations for different modules
const API_ENDPOINTS = {
  // Main vision inspection server
  PACKAGING: 'http://localhost:5000',
  BULLET: 'http://localhost:5000', 
  CABLE_FAULT: 'http://localhost:5000',
  
  // OCR services 
  OCR: 'http://localhost:5500',
  INVOICE_OCR: 'http://localhost:5500',
  INVOICE_OCR_GEMINI: 'http://localhost:8000', // Gemini-based Invoice OCR
  WHEEL_OCR: 'http://localhost:5500', // Wheel Inspection OCR
  
  // Advanced inspection services (different servers)
  THREAD_DETECTION: 'http://localhost:5000',
  TRAIN_PANTOGRAPH: 'http://localhost:5002', 
  BOLT_ASSEMBLY: 'http://localhost:5003',
  XRAY_INSPECTION: 'http://localhost:5000'
};

// Live streaming endpoints
const LIVE_STREAM_ENDPOINTS = {
  THREAD_VIDEO_FEED: `${API_ENDPOINTS.THREAD_DETECTION}/video_feed`,
  THREAD_STATUS: `${API_ENDPOINTS.THREAD_DETECTION}/detection_status`,
};

// Export API endpoints for components to use
export { API_ENDPOINTS, LIVE_STREAM_ENDPOINTS };

// Legacy support
const BASE_URL = API_ENDPOINTS.PACKAGING;
const OCR_BASE_URL = API_ENDPOINTS.OCR;

/**
 * Utility function to construct full image URL from relative path
 * @param {string} imagePath - Relative or absolute image path
 * @param {string} serverUrl - Base server URL
 * @returns {string} Full image URL
 */
export const getFullImageUrl = (imagePath, serverUrl) => {
  if (!imagePath) return null;
  // If already a full URL, return as is
  if (imagePath.startsWith('http')) return imagePath;
  // If relative path, prepend server URL
  return `${serverUrl}${imagePath.startsWith('/') ? imagePath : '/' + imagePath}`;
};

/**
 * Get full image URL for specific inspection types
 */
export const getPackagingImageUrl = (imagePath) => getFullImageUrl(imagePath, API_ENDPOINTS.PACKAGING);
export const getBulletImageUrl = (imagePath) => getFullImageUrl(imagePath, API_ENDPOINTS.BULLET);
export const getCableFaultImageUrl = (imagePath) => getFullImageUrl(imagePath, API_ENDPOINTS.CABLE_FAULT);
export const getThreadImageUrl = (imagePath) => getFullImageUrl(imagePath, API_ENDPOINTS.THREAD_DETECTION);
export const getXRayImageUrl = (imagePath) => getFullImageUrl(imagePath, API_ENDPOINTS.XRAY_INSPECTION);
export const getPantographImageUrl = (imagePath) => getFullImageUrl(imagePath, API_ENDPOINTS.TRAIN_PANTOGRAPH);
export const getBoltAssemblyImageUrl = (imagePath) => getFullImageUrl(imagePath, API_ENDPOINTS.BOLT_ASSEMBLY);

/**
 * Sends prediction request for a previously uploaded image
 * @param {string} imagePath - Path of the image on the server
 * @param {string} module - Endpoint module name ('tray', 'bullet', 'ocr', 'wheel_ocr' etc.)
 * @param {string} [trayType] - Optional tray type ('blue' or 'white')
 */
export const uploadImage = async (file, module, trayType) => {
  // Handle wheel OCR differently
  if (module === 'wheel_ocr') {
    return await uploadWheelOCRImage(file);
  }

  const formData = new FormData();
  formData.append('image', file);
  if (trayType) formData.append('tray_type', trayType);

  const response = await axios.post(`${BASE_URL}/${module}/predict`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

/**
 * OCR API Functions for localhost:5500
 */

/**
 * Upload image for OCR processing
 * @param {File} file - Image file to process
 * @returns {Promise} API response with OCR results
 */
export const uploadImageForOCR = async (file) => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await axios.post(`${OCR_BASE_URL}/ocr/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    timeout: 30000, // 30 second timeout for OCR processing
  });

  return response.data;
};

/**
 * Get OCR processing status
 * @param {string} jobId - Job ID from upload response
 * @returns {Promise} Processing status
 */
export const getOCRStatus = async (jobId) => {
  const response = await axios.get(`${OCR_BASE_URL}/ocr/status/${jobId}`);
  return response.data;
};

/**
 * Get OCR results
 * @param {string} jobId - Job ID from upload response
 * @returns {Promise} OCR text results
 */
export const getOCRResults = async (jobId) => {
  const response = await axios.get(`${OCR_BASE_URL}/ocr/results/${jobId}`);
  return response.data;
};

/**
 * Check OCR service health
 * @returns {Promise} Service health status
 */
export const checkOCRHealth = async () => {
  try {
    const response = await axios.get(`${OCR_BASE_URL}/health`, {
      timeout: 5000, // 5 second timeout for health check
    });
    return { status: 'connected', data: response.data };
  } catch (error) {
    return { status: 'disconnected', error: error.message };
  }
};

/**
 * Get live OCR feed (WebSocket alternative for polling)
 * @returns {Promise} Current inspection data
 */
export const getLiveOCRFeed = async () => {
  const response = await axios.get(`${OCR_BASE_URL}/ocr/live`);
  return response.data;
};

// =============================================================================
// PACKAGING INSPECTION API (localhost:5000)
// =============================================================================

/**
 * Upload image for packaging inspection
 * @param {File} file - Image file
 * @param {string} [trayType] - Optional tray type ('blue' or 'white')
 */
export const uploadPackagingImage = async (file, trayType) => {
  const formData = new FormData();
  formData.append('image', file);
  if (trayType) formData.append('tray_type', trayType);

  const response = await axios.post(`${API_ENDPOINTS.PACKAGING}/tray/predict`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

/**
 * Get packaging inspection status
 */
export const getPackagingStatus = async () => {
  const response = await axios.get(`${API_ENDPOINTS.PACKAGING}/health`);
  return response.data;
};

// =============================================================================
// BULLET INSPECTION API (localhost:5000)
// =============================================================================

/**
 * Upload image for bullet inspection
 * @param {File} file - Image file
 */
export const uploadBulletImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await axios.post(`${API_ENDPOINTS.BULLET}/bullet/predict`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

/**
 * Get bullet inspection status
 */
export const getBulletStatus = async () => {
  const response = await axios.get(`${API_ENDPOINTS.BULLET}/health`);
  return response.data;
};

// =============================================================================
// THREAD DETECTION API (localhost:5000)
// =============================================================================

/**
 * Upload image for thread detection
 * @param {File} file - Image file
 */
export const uploadThreadImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await axios.post(`${API_ENDPOINTS.THREAD_DETECTION}/thread/predict`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 30000,
  });
  return response.data;
};

/**
 * Get thread detection service health
 */
export const checkThreadDetectionHealth = async () => {
  try {
    const response = await axios.get(`${API_ENDPOINTS.THREAD_DETECTION}/health`, {
      timeout: 5000,
    });
    return { status: 'connected', data: response.data };
  } catch (error) {
    return { status: 'disconnected', error: error.message };
  }
};

// =============================================================================
// TRAIN PANTOGRAPH API (localhost:5002)
// =============================================================================

/**
 * Upload image for train pantograph inspection
 * @param {File} file - Image file
 */
export const uploadPantographImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await axios.post(`${API_ENDPOINTS.TRAIN_PANTOGRAPH}/pantograph/predict`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 45000, // Longer timeout for complex analysis
  });
  return response.data;
};

/**
 * Get pantograph inspection service health
 */
export const checkPantographHealth = async () => {
  try {
    const response = await axios.get(`${API_ENDPOINTS.TRAIN_PANTOGRAPH}/health`, {
      timeout: 5000,
    });
    return { status: 'connected', data: response.data };
  } catch (error) {
    return { status: 'disconnected', error: error.message };
  }
};

// =============================================================================
// BOLT ASSEMBLY API (localhost:5003)
// =============================================================================

/**
 * Upload image for bolt assembly inspection
 * @param {File} file - Image file
 */
export const uploadBoltAssemblyImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await axios.post(`${API_ENDPOINTS.BOLT_ASSEMBLY}/bolt/predict`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 35000,
  });
  return response.data;
};

/**
 * Get bolt assembly service health
 */
export const checkBoltAssemblyHealth = async () => {
  try {
    const response = await axios.get(`${API_ENDPOINTS.BOLT_ASSEMBLY}/health`, {
      timeout: 5000,
    });
    return { status: 'connected', data: response.data };
  } catch (error) {
    return { status: 'disconnected', error: error.message };
  }
};

// =============================================================================
// X-RAY INSPECTION API (localhost:5000)
// =============================================================================

/**
 * Upload image for X-ray inspection
 * @param {File} file - Image file
 */
export const uploadXRayImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await axios.post(`${API_ENDPOINTS.XRAY_INSPECTION}/xray/predict`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000, // Longest timeout for X-ray processing
  });
  return response.data;
};

/**
 * Get X-ray inspection service health
 */
export const checkXRayHealth = async () => {
  try {
    const response = await axios.get(`${API_ENDPOINTS.XRAY_INSPECTION}/health`, {
      timeout: 5000,
    });
    return { status: 'connected', data: response.data };
  } catch (error) {
    return { status: 'disconnected', error: error.message };
  }
};

// =============================================================================
// INVOICE OCR API (localhost:5500)
// =============================================================================

/**
 * Upload image for invoice OCR processing
 * @param {File} file - Image file
 */
export const uploadInvoiceImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await axios.post(`${API_ENDPOINTS.INVOICE_OCR}/invoice/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 30000,
  });
  return response.data;
};

// =============================================================================
// CABLE FAULT DETECTION API (localhost:5000)
// =============================================================================

/**
 * Upload image for cable fault detection
 * @param {File} file - Image file
 */
export const uploadCableFaultImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await axios.post(`${API_ENDPOINTS.CABLE_FAULT}/cable/predict`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

/**
 * Get cable fault detection status
 */
export const getCableFaultStatus = async () => {
  const response = await axios.get(`${API_ENDPOINTS.CABLE_FAULT}/health`);
  return response.data;
};

// =============================================================================
// WHEEL INSPECTION OCR API (localhost:5500)
// =============================================================================

/**
 * Upload image for wheel inspection OCR
 * @param {File} file - Image file
 */
export const uploadWheelOCRImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await axios.post(`${API_ENDPOINTS.WHEEL_OCR}/wheel/ocr`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 30000,
  });
  return response.data;
};

/**
 * Get wheel OCR service health
 */
export const checkWheelOCRHealth = async () => {
  try {
    const response = await axios.get(`${API_ENDPOINTS.WHEEL_OCR}/health`, {
      timeout: 5000,
    });
    return { status: 'connected', data: response.data };
  } catch (error) {
    return { status: 'disconnected', error: error.message };
  }
};
