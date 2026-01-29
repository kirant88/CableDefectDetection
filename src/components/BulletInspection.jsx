import React, { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import c4i4logo from "../assets/images/c4i4-Logo-02.png";
import headerc4i4logo from "../assets/images/C4i4Logo.png";
import {
  setCapturedImage,
  setProcessedImage,
  setPredictionCount,
  setStatus,
  resetState,
} from "../features/imageSlice";
import { uploadImage, getBulletImageUrl } from "../services/api";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Stack,
  Paper,
  IconButton,
  Backdrop,
  Link,
  CircularProgress,
  useTheme,
  alpha,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import {
  Camera,
  Upload,
  Play,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sun,
  Moon,
  Shield,
} from "lucide-react";

const BulletInspection = ({ toggleTheme, mode }) => {
  const videoRef = useRef(null);
  const dispatch = useDispatch();
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [stream, setStream] = useState(null);
  const module = "bullet";
  const { capturedImage, processedImage, predictionCount, status } =
    useSelector((state) => state.image[module] || {});

  const startWebcam = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStream(mediaStream);
    } catch (error) {
      console.error("Webcam access error:", error);
      alert("Failed to access webcam");
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
      // Clear previous results
      dispatch(resetState({ module }));
      // Set new image
      dispatch(setCapturedImage({ module, image: event.target.result }));
      stopWebcam();
    };
    reader.readAsDataURL(e.target.files[0]);
  };

  const predict = async () => {
    if (!capturedImage) return alert("No image available!");

    const file = dataURLToFile(capturedImage, "image.jpg");

    try {
      setLoading(true);
      const predictRes = await uploadImage(file, module);
      console.log("✅ Upload Response:", predictRes);

      if (predictRes.status !== "success") {
        alert("Prediction failed: " + predictRes.message);
        setLoading(false);
        return;
      }

      dispatch(
        setProcessedImage({
          module,
          image: getBulletImageUrl(predictRes.processed_image),
        }),
      );
      dispatch(setPredictionCount({ module, count: predictRes.defect_count }));
      dispatch(
        setStatus({
          module,
          status: predictRes.defect_count == 0 ? "PASS" : "FAIL",
          color: predictRes.defect_count == 0 ? "green" : "red",
        }),
      );
      setLoading(false);
    } catch (err) {
      console.error("❌ Error during prediction:", err);
      alert("Prediction failed due to network or server error.");
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  const buttonVariants = {
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.95 },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  const statusIconVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20,
      },
    },
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
          }}
        >
          {/* LEFT — CASING INSPECTION */}
          <Typography
            variant="h4"
            sx={{
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
            CASING INSPECTION
          </Typography>

          {/* RIGHT — LOGO + C4I4 + THEME TOGGLE */}
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

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        style={{ flex: 1 }}
      >
        <Paper
          elevation={6}
          sx={{
            p: 3,
            bgcolor: "background.paper",
            borderRadius: 3,
            border: 1,
            borderColor: "divider",
            height: "100%",
          }}
        >
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 8 }}>
              <motion.div variants={itemVariants}>
                <Box
                  sx={{
                    width: "100%",
                    aspectRatio: "16 / 9",
                    borderRadius: 2,
                    overflow: "hidden",
                    boxShadow: 3,
                    border: 2,
                    borderColor: "divider",
                    bgcolor: "common.black",
                    position: "relative",
                  }}
                >
                  <AnimatePresence mode="wait">
                    {!capturedImage ? (
                      <motion.video
                        key="video"
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                          position: "absolute",
                          top: 0,
                          left: 0,
                        }}
                      />
                    ) : (
                      <motion.img
                        key="image"
                        src={processedImage || capturedImage}
                        alt="Captured"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.4 }}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                          position: "absolute",
                          top: 0,
                          left: 0,
                        }}
                      />
                    )}
                  </AnimatePresence>
                </Box>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Stack
                  direction="row"
                  spacing={1}
                  mt={2}
                  useFlexGap
                  flexWrap="wrap"
                  sx={{ justifyContent: "center", alignItems: "center" }}
                >
                  <motion.div
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <Button
                      variant="outlined"
                      onClick={startWebcam}
                      startIcon={<Play size={18} />}
                      sx={{
                        color: theme.palette.primary.main,
                        borderColor: theme.palette.primary.main,
                        "&:hover": {
                          borderColor: theme.palette.primary.dark,
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          boxShadow: `0 0 20px ${alpha(theme.palette.primary.main, 0.3)}`,
                        },
                      }}
                    >
                      START
                    </Button>
                  </motion.div>

                  <motion.div
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <Button
                      variant="outlined"
                      onClick={capture}
                      startIcon={<Camera size={18} />}
                      sx={{
                        color: theme.palette.secondary.main,
                        borderColor: theme.palette.secondary.main,
                        "&:hover": {
                          borderColor: theme.palette.secondary.dark,
                          bgcolor: alpha(theme.palette.secondary.main, 0.1),
                          boxShadow: `0 0 20px ${alpha(theme.palette.secondary.main, 0.3)}`,
                        },
                      }}
                    >
                      CAPTURE
                    </Button>
                  </motion.div>

                  <motion.div
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <Button
                      variant="outlined"
                      onClick={() => {
                        stopWebcam();
                        dispatch(resetState({ module }));
                      }}
                      startIcon={<Trash2 size={18} />}
                      sx={{
                        color: theme.palette.error.main,
                        borderColor: theme.palette.error.main,
                        "&:hover": {
                          borderColor: theme.palette.error.dark,
                          bgcolor: alpha(theme.palette.error.main, 0.1),
                          boxShadow: `0 0 20px ${alpha(theme.palette.error.main, 0.3)}`,
                        },
                      }}
                    >
                      CLEAR
                    </Button>
                  </motion.div>

                  <motion.div
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <Button
                      variant="outlined"
                      component="label"
                      startIcon={<Upload size={18} />}
                      sx={{
                        color: theme.palette.warning.main,
                        borderColor: theme.palette.warning.main,
                        "&:hover": {
                          borderColor: theme.palette.warning.dark,
                          bgcolor: alpha(theme.palette.warning.main, 0.1),
                          boxShadow: `0 0 20px ${alpha(theme.palette.warning.main, 0.3)}`,
                        },
                      }}
                    >
                      UPLOAD
                      <input type="file" hidden onChange={handleUpload} />
                    </Button>
                  </motion.div>

                  <motion.div
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <Button
                      variant="contained"
                      onClick={predict}
                      startIcon={<CheckCircle2 size={18} />}
                      sx={{
                        bgcolor: theme.palette.success.main,
                        color: theme.palette.success.contrastText,
                        fontWeight: 600,
                        "&:hover": {
                          bgcolor: theme.palette.success.dark,
                          boxShadow: `0 0 25px ${alpha(theme.palette.success.main, 0.5)}`,
                        },
                      }}
                    >
                      PREDICT
                    </Button>
                  </motion.div>
                </Stack>
              </motion.div>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <motion.div variants={cardVariants}>
                <Card
                  sx={{
                    textAlign: "center",
                    mb: 2,
                    bgcolor: "background.paper",
                    border: 1,
                    borderColor:
                      status === "PASS"
                        ? "success.main"
                        : status === "FAIL"
                          ? "error.main"
                          : "divider",
                    boxShadow:
                      status === "PASS"
                        ? `0 8px 32px ${alpha(theme.palette.success.main, 0.3)}`
                        : status === "FAIL"
                          ? `0 8px 32px ${alpha(theme.palette.error.main, 0.3)}`
                          : "none",
                  }}
                >
                  <CardContent sx={{ textAlign: "center" }}>
                    <Typography
                      variant="h6"
                      sx={{
                        color: "text.primary",
                        fontWeight: 600,
                        letterSpacing: 1,
                      }}
                    >
                      INSPECTION STATUS
                    </Typography>
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={status}
                        variants={statusIconVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          marginTop: 8,
                        }}
                      >
                        {status === "PASS" ? (
                          <CheckCircle2
                            size={56}
                            color={theme.palette.success.main}
                            strokeWidth={3}
                          />
                        ) : status === "FAIL" ? (
                          <XCircle
                            size={56}
                            color={theme.palette.error.main}
                            strokeWidth={3}
                          />
                        ) : (
                          <AlertTriangle
                            size={56}
                            color={theme.palette.text.secondary}
                            strokeWidth={2}
                          />
                        )}
                      </motion.div>
                    </AnimatePresence>
                    <motion.div
                      key={`status-${status}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <Typography
                        variant="h3"
                        mt={1}
                        sx={{
                          color:
                            status === "PASS"
                              ? theme.palette.success.main
                              : status === "FAIL"
                                ? theme.palette.error.main
                                : theme.palette.text.secondary,
                          fontWeight: 800,
                          textShadow:
                            status === "PASS"
                              ? `0 0 20px ${alpha(theme.palette.success.main, 0.5)}`
                              : status === "FAIL"
                                ? `0 0 20px ${alpha(theme.palette.error.main, 0.5)}`
                                : "none",
                        }}
                      >
                        {status || "PENDING"}
                      </Typography>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={cardVariants} transition={{ delay: 0.1 }}>
                <Card
                  sx={{
                    textAlign: "center",
                    mb: 2,
                    bgcolor: "background.paper",
                    border: 1,
                    borderColor: "divider",
                    boxShadow: 3,
                  }}
                >
                  <CardContent>
                    <Typography
                      variant="h6"
                      sx={{
                        color: "text.primary",
                        fontWeight: 600,
                        letterSpacing: 1,
                      }}
                    >
                      DEFECT COUNT
                    </Typography>
                    <motion.div
                      key={predictionCount}
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 15,
                      }}
                    >
                      <Typography
                        variant="h1"
                        mt={1}
                        sx={{
                          color:
                            predictionCount === 0
                              ? theme.palette.success.main
                              : predictionCount > 0
                                ? theme.palette.error.main
                                : theme.palette.text.secondary,
                          fontWeight: 900,
                          textShadow:
                            predictionCount === 0
                              ? `0 0 30px ${alpha(theme.palette.success.main, 0.6)}`
                              : predictionCount > 0
                                ? `0 0 30px ${alpha(theme.palette.error.main, 0.6)}`
                                : "none",
                        }}
                      >
                        {predictionCount || 0}
                      </Typography>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>

            {loading && (
              <Backdrop
                open
                sx={{
                  color: "#fff",
                  zIndex: (theme) => theme.zIndex.drawer + 1,
                  bgcolor: alpha(theme.palette.background.default, 0.9),
                  backdropFilter: "blur(8px)",
                }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <CircularProgress
                    size={60}
                    sx={{
                      color: theme.palette.primary.main,
                      filter: `drop-shadow(0 0 10px ${alpha(theme.palette.primary.main, 0.6)})`,
                    }}
                  />
                </motion.div>
              </Backdrop>
            )}
          </Grid>
        </Paper>
      </motion.div>

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
                color="inherit"
              >
                C4I4
              </Link>{" "}
              Vision Lab • Bullet Casing Inspection System
            </Typography>
          </Stack>
    
      </motion.div>
    </Box>
  );
};

export default BulletInspection;
