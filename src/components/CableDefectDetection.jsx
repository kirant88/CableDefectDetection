// src/components/CableDefectDetection.jsx
import React, { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import c4i4logo from "../assets/images/c4i4-Logo-02.png";
import headerc4i4logo from "../assets/images/C4i4Logo.png";
import {
  Cable,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Upload,
  BarChart3,
  Image as ImageIcon,
  Play,
  Camera,
  RotateCcw,
  Zap,
  Activity,
  TrendingUp,
  AlertCircle,
  FileCheck,
  Sun,
  Moon,
  FolderOpen,
  Sparkles,
} from "lucide-react";
import {
  setCapturedImage,
  setProcessedImage,
  setPredictionCount,
  setStatus,
  resetState,
} from "../features/imageSlice";
import {
  uploadImage,
  getCableFaultImageUrl,
  API_ENDPOINTS,
} from "../services/api";
import axios from "axios";
import {
  Box,
  Button,
  IconButton,
  Card,
  CardContent,
  Typography,
  Stack,
  Paper,
  Backdrop,
  CircularProgress,
  Chip,
  Alert,
  Tabs,
  Tab,
  Table,
  Link,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  useTheme,
  alpha,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

// Enhanced Loading Animation Component
const LoadingAnimation = () => {
  const theme = useTheme();
  return (
    <motion.div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: "2rem",
      }}
    >
      {/* Animated Cable Icon */}
      <motion.div
        animate={{
          rotate: [0, 10, -10, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <Cable size={80} color={theme.palette.primary.main} strokeWidth={2} />
      </motion.div>

      {/* Scanning Wave */}
      <Box
        sx={{
          position: "relative",
          width: "200px",
          height: "4px",
          bgcolor: "grey.200",
          borderRadius: "2px",
          overflow: "hidden",
        }}
      >
        <motion.div
          animate={{
            x: ["-100%", "200%"],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            position: "absolute",
            width: "50%",
            height: "100%",
            background:
              "linear-gradient(90deg, transparent, #1976d2, transparent)",
          }}
        />
      </Box>

      {/* Pulsing Dots */}
      <Box sx={{ display: "flex", gap: 1.5 }}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.3,
            }}
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              backgroundColor: theme.palette.primary.main,
            }}
          />
        ))}
      </Box>

      <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
        Analyzing Cable...
      </Typography>
    </motion.div>
  );
};

// Animated Status Icon Component
const AnimatedStatusIcon = ({ status }) => {
  const theme = useTheme();
  if (!status) {
    return (
      <motion.div
        animate={{
          rotate: [0, 360],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        <Cable size={60} color={theme.palette.text.disabled} />
      </motion.div>
    );
  }

  if (status === "NO DEFECT") {
    return (
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 15,
        }}
      >
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        >
          <CheckCircle size={60} color={theme.palette.success.main} />
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 10,
      }}
    >
      <motion.div
        animate={{
          rotate: [0, -10, 10, -10, 0],
        }}
        transition={{
          duration: 0.5,
          repeat: Infinity,
          repeatDelay: 1,
        }}
      >
        <XCircle size={60} color={theme.palette.error.main} />
      </motion.div>
    </motion.div>
  );
};

// Animated Counter Component
const AnimatedCounter = ({ value, status }) => {
  const theme = useTheme();
  return (
    <motion.div
      key={value}
      initial={{ scale: 1.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 15,
      }}
    >
      <Typography
        variant="h2"
        sx={{
          color:
            value > 0 ? theme.palette.error.main : theme.palette.success.main,
          fontWeight: "bold",
          fontFamily: "monospace",
        }}
      >
        {value || 0}
      </Typography>
    </motion.div>
  );
};

// Enhanced Action Button Component
const AnimatedButton = ({ children, icon: Icon, ...props }) => {
  return (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <Button
        startIcon={Icon && <Icon size={20} />}
        sx={{
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: "-100%",
            width: "100%",
            height: "100%",
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
            transition: "left 0.5s",
          },
          "&:hover::before": {
            left: "100%",
          },
        }}
        {...props}
      >
        {children}
      </Button>
    </motion.div>
  );
};

const CableDefectDetection = ({ toggleTheme, mode }) => {
  const videoRef = useRef(null);
  const dispatch = useDispatch();
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [stream, setStream] = useState(null);
  const [faultDetails, setFaultDetails] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  const [bulkFiles, setBulkFiles] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [bulkResults, setBulkResults] = useState(null);

  const DEFECT_COLORS = {
    break: theme.palette.error.main,
    thunderbolt: theme.palette.error.dark,
  };

  const module = "cable";
  const { capturedImage, processedImage, predictionCount, status } =
    useSelector((state) => state.image[module] || {});

  const startWebcam = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStream(mediaStream);
    } catch (error) {
      console.error("Webcam access error:", error);
      alert(
        "Failed to access webcam. Please ensure camera permissions are granted.",
      );
    }
  };

  const stopWebcam = () => {
    stream?.getTracks().forEach((track) => track.stop());
    setStream(null);
  };

  const capture = () => {
    const canvas = document.createElement("canvas");
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg");
    dispatch(setCapturedImage({ module, image: dataUrl }));
    stopWebcam();
  };

  const handleUpload = (e) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      dispatch(resetState({ module }));
      dispatch(setCapturedImage({ module, image: event.target.result }));
      stopWebcam();
    };
    reader.readAsDataURL(e.target.files[0]);
  };

  const predict = async () => {
    if (!capturedImage) return alert("No image available!");

    const file = dataURLToFile(capturedImage, "cable_image.jpg");

    try {
      setLoading(true);
      const predictRes = await uploadImage(file, module);

      if (predictRes.status !== "success") {
        alert("Detection failed: " + predictRes.message);
        setLoading(false);
        return;
      }

      dispatch(
        setProcessedImage({
          module,
          image: getCableFaultImageUrl(predictRes.processed_image),
        }),
      );

      dispatch(
        setPredictionCount({
          module,
          count: predictRes.fault_count || predictRes.defect_count || 0,
        }),
      );

      const hasFaults =
        (predictRes.fault_count || predictRes.defect_count || 0) > 0;
      dispatch(
        setStatus({
          module,
          status: hasFaults ? "DEFECT DETECTED" : "NO DEFECT",
          color: hasFaults ? "red" : "green",
        }),
      );

      if (predictRes.fault_details) {
        setFaultDetails(predictRes.fault_details);
      }

      setLoading(false);
    } catch (err) {
      console.error("Error during cable fault detection:", err);
      alert("Detection failed due to network or server error.");
      setLoading(false);
    }
  };

  const handleBulkUpload = (e) => {
    const files = Array.from(e.target.files);
    setBulkFiles(files);
    setChartData([]);
    setBulkResults(null);
  };

  const processBulkImages = async () => {
    if (bulkFiles.length === 0) {
      alert("Please select images first");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      bulkFiles.forEach((file) => {
        formData.append("images", file);
      });

      const response = await axios.post(
        `${API_ENDPOINTS.CABLE_FAULT}/cable/bulk_predict`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 120000,
        },
      );

      if (response.data.status === "success") {
        let chartDataArray = Object.entries(
          response.data.defect_distribution || {},
        ).map(([label, frequency]) => {
          let [defectType, occurrenceStr] = label.split(" - ");
          defectType = defectType.toLowerCase();
          let occurrence = 1;
          if (occurrenceStr) {
            const match = occurrenceStr.match(/(\d+)/);
            if (match) occurrence = parseInt(match[1], 10);
          }
          return {
            name: label,
            displayName: label,
            count: frequency,
            color: DEFECT_COLORS[defectType] || "#999999",
            defectType,
            occurrence,
          };
        });

        chartDataArray.sort((a, b) => {
          if (a.occurrence !== b.occurrence) {
            return a.occurrence - b.occurrence;
          }
          if (a.defectType === b.defectType) return 0;
          if (a.defectType === "break") return -1;
          return 1;
        });

        setChartData(chartDataArray);
        setBulkResults(response.data);
      } else {
        alert("Processing failed: " + response.data.message);
      }

      setLoading(false);
    } catch (err) {
      console.error("Error during processing:", err);
      alert("Processing failed due to network or server error.");
      setLoading(false);
    }
  };

  const dataURLToFile = (dataUrl, filename) => {
    const [meta, content] = dataUrl.split(",");
    const mime = meta.match(/:(.*?);/)[1];
    const binary = atob(content);
    const array = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) array[i] = binary.charCodeAt(i);
    return new File([array], filename, { type: mime });
  };

  const handleReset = () => {
    stopWebcam();
    dispatch(resetState({ module }));
    setFaultDetails(null);
  };

  const handleResetBulk = () => {
    setBulkFiles([]);
    setChartData([]);
    setBulkResults(null);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    if (newValue === 0) {
      handleResetBulk();
    } else {
      handleReset();
    }
  };

  return (
    <Box
      sx={{
        bgcolor: "background.default",
        color: "text.primary",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        p: 3,
      }}
    >
      {/* Animated Header */}

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 3,
            px: 2,
            position: "relative", // important for centering
          }}
        >
          {/* LEFT — ICON */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <motion.div
              animate={{
                rotate: [0, 10, -10, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Cable
                size={48}
                color={theme.palette.primary.main}
                strokeWidth={2}
              />
            </motion.div>
          </Box>

          {/* CENTER — TEXT */}
          <Typography
            variant="h4"
            sx={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              fontFamily: "'Oswald', sans-serif",
              background: `linear-gradient(90deg,
          ${theme.palette.primary.light} 0%,
          ${theme.palette.primary.main} 50%,
          ${theme.palette.secondary.main} 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textShadow: `0 0 20px ${alpha(theme.palette.primary.main, 0.5)}`,
            }}
          >
            CABLE DEFECT DETECTION
          </Typography>

          {/* RIGHT — LOGO + THEME TOGGLE */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <Box
              component="img"
              src={headerc4i4logo}
              alt="C4I4 Logo"
              sx={{
                height: 36,
                width: "auto",
                objectFit: "contain",
              }}
            />

            <IconButton
              onClick={toggleTheme}
              size="small"
              aria-label="toggle theme"
              sx={{
                ml: 1,
                bgcolor: "background.paper",
                color: "text.primary",
                boxShadow: 2,
                transition: "all 0.3s ease",
                "&:hover": {
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                  transform: "rotate(180deg)",
                },
              }}
            >
              {mode === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </IconButton>
          </motion.div>
        </Box>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Paper elevation={3} sx={{ mb: 2, p: 0.1 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              borderBottom: 1,
              borderColor: "divider",
              "& .MuiTab-root": {
                fontWeight: 600,
              },
            }}
          >
            <Tab
              icon={<ImageIcon size={20} />}
              label="Single Detection"
              iconPosition="start"
            />
            <Tab
              icon={<BarChart3 size={20} />}
              label="Bulk Analysis"
              iconPosition="start"
            />
          </Tabs>
        </Paper>
      </motion.div>

      {/* Single Image Detection */}
      <AnimatePresence mode="wait">
        {tabValue === 0 && (
          <motion.div
            key="single"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 } }}>
              <Grid container spacing={1}>
                {/* Image Area */}
                <Grid size={{ xs: 12, md: 8 }}>
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Box
                      sx={{
                        width: "95%",
                        aspectRatio: "16 / 9",
                        borderRadius: 2,
                        overflow: "hidden",
                        boxShadow: 3,
                        border: "3px solid",
                        borderColor:
                          status === "NO DEFECT"
                            ? "success.main"
                            : status === "DEFECT DETECTED"
                              ? "error.main"
                              : "grey.300",
                        bgcolor: "background.paper",
                        position: "relative",
                        transition: "border-color 0.3s",
                      }}
                    >
                      {!capturedImage ? (
                        <>
                          <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "contain",
                            }}
                          />
                          {stream && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              style={{
                                position: "absolute",
                                top: "50%",
                                left: "50%",
                                transform: "translate(-50%, -50%)",
                                pointerEvents: "none",
                              }}
                            >
                              <motion.div
                                animate={{
                                  scale: [1, 1.2, 1],
                                  opacity: [0.5, 0.8, 0.5],
                                }}
                                transition={{
                                  duration: 2,
                                  repeat: Infinity,
                                }}
                                style={{
                                  width: "100px",
                                  height: "100px",
                                  border: `3px solid ${theme.palette.primary.main}`,
                                  borderRadius: "50%",
                                }}
                              />
                            </motion.div>
                          )}
                        </>
                      ) : (
                        <motion.img
                          key={processedImage || capturedImage}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.5 }}
                          src={processedImage || capturedImage}
                          alt="Cable Inspection"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                          }}
                        />
                      )}
                    </Box>

                    <Stack
                      direction="row"
                      spacing={1}
                      mt={2}
                      useFlexGap
                      flexWrap="wrap"
                      sx={{ justifyContent: "center" }}
                    >
                      <AnimatedButton
                        variant="outlined"
                        color="secondary"
                        onClick={startWebcam}
                        icon={Play}
                      >
                        START
                      </AnimatedButton>
                      <AnimatedButton
                        variant="outlined"
                        onClick={capture}
                        disabled={!stream}
                        icon={Camera}
                        sx={{
                          color: theme.palette.secondary.main,
                          borderColor: theme.palette.secondary.main,
                          "&:hover": {
                            borderColor: theme.palette.secondary.dark,
                            bgcolor: alpha(theme.palette.secondary.main, 0.1),
                          },
                        }}
                      >
                        CAPTURE
                      </AnimatedButton>
                      <AnimatedButton
                        variant="outlined"
                        onClick={handleReset}
                        icon={RotateCcw}
                        sx={{
                          color: theme.palette.error.main,
                          borderColor: theme.palette.error.main,
                          "&:hover": {
                            borderColor: theme.palette.error.dark,
                            bgcolor: alpha(theme.palette.error.main, 0.1),
                          },
                        }}
                      >
                        CLEAR
                      </AnimatedButton>
                      <AnimatedButton
                        variant="outlined"
                        component="label"
                        icon={Upload}
                        sx={{
                          color: theme.palette.warning.main,
                          borderColor: theme.palette.warning.main,
                          "&:hover": {
                            borderColor: theme.palette.warning.dark,
                            bgcolor: alpha(theme.palette.warning.main, 0.1),
                          },
                        }}
                      >
                        UPLOAD
                        <input
                          type="file"
                          hidden
                          onChange={handleUpload}
                          accept="image/*"
                        />
                      </AnimatedButton>
                      <AnimatedButton
                        variant="contained"
                        color="success"
                        onClick={predict}
                        disabled={!capturedImage || loading}
                        icon={Activity}
                      >
                        DETECT
                      </AnimatedButton>
                    </Stack>
                  </motion.div>
                </Grid>

                {/* Result Area */}
                <Grid size={{ xs: 12, md: 4 }}>
                  <Stack spacing={2}>
                    {/* Horizontal Stack for Status & Count */}
                    <Stack direction="row" spacing={2}>
                      {/* Status Card */}
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        style={{ flex: 1 }}
                      >
                        <Card
                          sx={{
                            textAlign: "center",
                            bgcolor:
                              status === "NO DEFECT"
                                ? "success.light"
                                : "background.paper",
                            transition: "background-color 0.3s",
                          }}
                        >
                          <CardContent>
                            <Box sx={{ mb: 2 }}>
                              <AnimatedStatusIcon status={status} />
                            </Box>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              DETECTION STATUS
                            </Typography>
                            <motion.div
                              key={status}
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ type: "spring" }}
                            >
                              <Typography
                                variant="h4"
                                mt={1}
                                sx={{
                                  color:
                                    status === "NO DEFECT"
                                      ? "green"
                                      : status === "DEFECT DETECTED"
                                        ? "red"
                                        : "text.primary",
                                  fontWeight: "bold",
                                }}
                              >
                                {status || "READY"}
                              </Typography>
                            </motion.div>
                          </CardContent>
                        </Card>
                      </motion.div>

                      {/* Fault Count Card */}
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        style={{ flex: 1 }}
                      >
                        <Card>
                          <CardContent sx={{ textAlign: "center" }}>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              DEFECT COUNT
                            </Typography>
                            <Box sx={{ my: 2 }}>
                              <AnimatedCounter
                                value={predictionCount}
                                status={status}
                              />
                            </Box>
                            <AnimatePresence mode="wait">
                              {predictionCount > 0 ? (
                                <motion.div
                                  key="action"
                                  initial={{ scale: 0, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  exit={{ scale: 0, opacity: 0 }}
                                >
                                  <Chip
                                    label="ACTION REQUIRED"
                                    color="error"
                                    icon={<AlertTriangle size={16} />}
                                  />
                                </motion.div>
                              ) : predictionCount === 0 && status ? (
                                <motion.div
                                  key="ok"
                                  initial={{ scale: 0, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  exit={{ scale: 0, opacity: 0 }}
                                >
                                  <Chip
                                    label="CABLE OK"
                                    color="success"
                                    icon={<CheckCircle size={16} />}
                                  />
                                </motion.div>
                              ) : null}
                            </AnimatePresence>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </Stack>

                    {/* Fault Details Card */}
                    <AnimatePresence>
                      {faultDetails && (
                        <motion.div
                          initial={{ opacity: 0, y: 20, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -20, scale: 0.9 }}
                        >
                          <Card>
                            <CardContent>
                              <Typography
                                variant="h6"
                                gutterBottom
                                sx={{ fontWeight: 600 }}
                              >
                                <AlertCircle
                                  size={20}
                                  style={{
                                    verticalAlign: "middle",
                                    marginRight: "8px",
                                  }}
                                />
                                DEFECT DETAILS
                              </Typography>
                              <Stack spacing={2} mt={2}>
                                {faultDetails.type && (
                                  <Box>
                                    <Typography
                                      variant="caption"
                                      color="textSecondary"
                                    >
                                      Type:
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      sx={{ fontWeight: 600 }}
                                    >
                                      {faultDetails.type}
                                    </Typography>
                                  </Box>
                                )}
                                {faultDetails.severity && (
                                  <Box>
                                    <Typography
                                      variant="caption"
                                      color="textSecondary"
                                    >
                                      Severity:
                                    </Typography>
                                    <Box mt={0.5}>
                                      <Chip
                                        label={faultDetails.severity}
                                        color={
                                          faultDetails.severity === "HIGH"
                                            ? "error"
                                            : faultDetails.severity === "MEDIUM"
                                              ? "warning"
                                              : "info"
                                        }
                                        size="small"
                                      />
                                    </Box>
                                  </Box>
                                )}
                                {faultDetails.location && (
                                  <Box>
                                    <Typography
                                      variant="caption"
                                      color="textSecondary"
                                    >
                                      Location:
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      sx={{ fontWeight: 600 }}
                                    >
                                      {faultDetails.location}
                                    </Typography>
                                  </Box>
                                )}
                              </Stack>
                            </CardContent>
                          </Card>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Info Alert */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      <Alert severity="info" icon={<Sparkles size={20} />}>
                        Upload or capture a cable image to detect defects,
                        breaks, or insulation damage.
                      </Alert>
                    </motion.div>
                  </Stack>
                </Grid>
              </Grid>
            </Paper>
          </motion.div>
        )}

        {/* Bulk Analysis Tab */}
        {tabValue === 1 && (
          <motion.div
            key="bulk"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 } }}>
              <Grid container spacing={3}>
                {/* Upload Area */}
                <Grid size={{ xs: 12, md: 4 }}>
                  <Stack spacing={2}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Card>
                        <CardContent>
                          <Typography
                            variant="h6"
                            gutterBottom
                            sx={{ fontWeight: 600 }}
                          >
                            <Upload
                              size={20}
                              style={{
                                verticalAlign: "middle",
                                marginRight: "8px",
                              }}
                            />
                            Bulk Upload
                          </Typography>
                          <Divider sx={{ my: 2 }} />

                          <Stack spacing={1.5}>
                            <AnimatedButton
                              variant="outlined"
                              component="label"
                              fullWidth
                              icon={ImageIcon}
                            >
                              SELECT IMAGES
                              <input
                                type="file"
                                hidden
                                multiple
                                accept="image/*"
                                onChange={handleBulkUpload}
                              />
                            </AnimatedButton>

                            <AnimatedButton
                              variant="outlined"
                              component="label"
                              fullWidth
                              icon={FolderOpen}
                            >
                              SELECT FOLDER
                              <input
                                type="file"
                                hidden
                                multiple
                                accept="image/*"
                                webkitdirectory="true"
                                onChange={handleBulkUpload}
                              />
                            </AnimatedButton>
                          </Stack>

                          <AnimatePresence>
                            {bulkFiles.length > 0 && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                              >
                                <Alert severity="success" sx={{ my: 2 }}>
                                  <strong>{bulkFiles.length}</strong> image(s)
                                  selected
                                </Alert>
                                <Stack spacing={1}>
                                  <AnimatedButton
                                    variant="contained"
                                    color="success"
                                    fullWidth
                                    onClick={processBulkImages}
                                    disabled={loading}
                                    icon={BarChart3}
                                  >
                                    ANALYZE
                                  </AnimatedButton>
                                  <AnimatedButton
                                    variant="outlined"
                                    color="secondary"
                                    fullWidth
                                    onClick={handleResetBulk}
                                    icon={RotateCcw}
                                  >
                                    CLEAR
                                  </AnimatedButton>
                                </Stack>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {!bulkFiles.length && (
                            <Alert severity="warning" sx={{ mt: 2 }}>
                              Please select multiple images for analysis
                            </Alert>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>

                    {/* Summary Card */}
                    <AnimatePresence>
                      {bulkResults && bulkResults.fault_summary && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                        >
                          <Card>
                            <CardContent>
                              <Typography
                                variant="h6"
                                gutterBottom
                                sx={{ fontWeight: 600 }}
                              >
                                <TrendingUp
                                  size={20}
                                  style={{
                                    verticalAlign: "middle",
                                    marginRight: "8px",
                                  }}
                                />
                                Summary
                              </Typography>
                              <Divider sx={{ my: 2 }} />

                              <Box
                                sx={{
                                  mb: 2,
                                  p: 2,
                                  bgcolor: "primary.50",
                                  borderRadius: 2,
                                }}
                              >
                                <Stack
                                  direction="row"
                                  justifyContent="space-between"
                                  alignItems="center"
                                >
                                  <Typography
                                    variant="body2"
                                    color="textSecondary"
                                    sx={{ fontWeight: 500 }}
                                  >
                                    Total Images:
                                  </Typography>
                                  <Chip
                                    label={
                                      bulkResults.total_images ||
                                      bulkFiles.length
                                    }
                                    color="primary"
                                    size="small"
                                    sx={{ fontWeight: "bold" }}
                                  />
                                </Stack>
                              </Box>

                              <TableContainer
                                component={Paper}
                                variant="outlined"
                              >
                                <Table size="small">
                                  <TableHead>
                                    <TableRow>
                                      <TableCell>
                                        <strong>Defect Type</strong>
                                      </TableCell>
                                      <TableCell align="right">
                                        <strong>Count</strong>
                                      </TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {Object.entries(
                                      bulkResults.fault_summary,
                                    ).map(([type, count], index) => (
                                      <motion.tr
                                        key={type}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        component={TableRow}
                                      >
                                        <TableCell
                                          sx={{ textTransform: "capitalize" }}
                                        >
                                          {type.replace(/_/g, " ")}
                                        </TableCell>
                                        <TableCell align="right">
                                          <Chip
                                            label={count}
                                            color="error"
                                            size="small"
                                          />
                                        </TableCell>
                                      </motion.tr>
                                    ))}
                                  </TableBody>
                                </Table>
                              </TableContainer>
                            </CardContent>
                          </Card>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Stack>
                </Grid>

                {/* Chart Area */}
                <Grid size={{ xs: 12, md: 8 }}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Card
                      sx={{
                        height: "600px",
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <CardContent
                        sx={{
                          flex: 1,
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        <Typography
                          variant="h6"
                          gutterBottom
                          sx={{ fontWeight: 600 }}
                        >
                          <BarChart3
                            size={20}
                            style={{
                              verticalAlign: "middle",
                              marginRight: "8px",
                            }}
                          />
                          Defect Distribution
                        </Typography>
                        <Divider sx={{ my: 2 }} />

                        {chartData.length > 0 ? (
                          <Box sx={{ flex: 1, minHeight: 0 }}>
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                data={chartData}
                                margin={{
                                  top: 20,
                                  right: 30,
                                  left: 20,
                                  bottom: 80,
                                }}
                              >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                  dataKey="name"
                                  angle={-45}
                                  textAnchor="end"
                                  height={100}
                                  interval={0}
                                />
                                <YAxis
                                  allowDecimals={false}
                                  label={{
                                    value: "Frequency",
                                    angle: -90,
                                    position: "insideLeft",
                                  }}
                                />
                                <Tooltip />
                                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                                  {chartData.map((entry, index) => (
                                    <Cell
                                      key={`cell-${index}`}
                                      fill={entry.color}
                                    />
                                  ))}
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </Box>
                        ) : (
                          <Box
                            sx={{
                              flex: 1,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              border: "2px dashed",
                              borderColor: loading
                                ? "primary.main"
                                : "grey.300",
                              borderRadius: 2,
                              bgcolor: loading ? "primary.50" : "grey.50",
                            }}
                          >
                            {loading ? (
                              <LoadingAnimation />
                            ) : (
                              <Box sx={{ textAlign: "center", p: 3 }}>
                                <motion.div
                                  animate={{
                                    y: [0, -10, 0],
                                  }}
                                  transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                  }}
                                >
                                  <BarChart3 size={60} color="#999" />
                                </motion.div>
                                <Typography
                                  variant="h6"
                                  color="textSecondary"
                                  sx={{ mt: 2 }}
                                >
                                  Histogram will appear here
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="textSecondary"
                                >
                                  Select images and click "ANALYZE"
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              </Grid>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading Backdrop for Single Detection */}
      {loading && tabValue === 0 && (
        <Backdrop
          open
          sx={{
            color: "#fff",
            zIndex: (theme) => theme.zIndex.drawer + 1,
            backdropFilter: "blur(4px)",
          }}
        >
          <LoadingAnimation />
        </Backdrop>
      )}

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          justifyContent="center"
          alignItems="center"
        >
          <motion.div
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          >
            <img
              src={c4i4logo} // or imported image
              alt="Shield"
              width={25}
              height={25}
            />
          </motion.div>

          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              fontWeight: 500,
              letterSpacing: 1,
            }}
          >
            © 2026{" "}
            <Link
              href="https://c4i4.org/"
              target="_blank"
              rel="noopener noreferrer"
              underline="hover"
              color="primary"
            >
              C4i4{" "}
            </Link>
            Vision Lab • Cable Defect Detection System
          </Typography>
        </Stack>
      </motion.div>
    </Box>
  );
};

export default CableDefectDetection;
