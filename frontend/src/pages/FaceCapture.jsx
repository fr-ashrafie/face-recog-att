import React, { useRef, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  CameraAlt as CameraIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { captureAttendance } from '../app/slices/attendanceSlice';

function FaceCapture() {
  const dispatch = useDispatch();
  const { loading, captureResult } = useSelector((state) => state.attendance);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState('');
  const [capturedImage, setCapturedImage] = useState(null);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setError('');
      }
    } catch (err) {
      setError('Unable to access camera. Please ensure you have granted camera permissions.');
      console.error('Camera error:', err);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  }, [stream]);

  React.useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = canvas.toDataURL('image/jpeg').split(',')[1];
    setCapturedImage(imageData);

    // Stop camera after capture
    stopCamera();

    // Send to server for recognition
    try {
      const result = await dispatch(captureAttendance(imageData)).unwrap();
      console.log('Attendance captured:', result);
    } catch (err) {
      setError(err?.detail || 'Failed to process attendance');
    }
  };

  const resetCapture = () => {
    setCapturedImage(null);
    setError('');
    startCamera();
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Face Capture
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              {!capturedImage ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    style={{
                      width: '100%',
                      maxWidth: 640,
                      borderRadius: 8,
                      backgroundColor: '#000',
                    }}
                  />
                  <canvas ref={canvasRef} style={{ display: 'none' }} />
                  
                  <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<CameraIcon />}
                      onClick={capturePhoto}
                      disabled={loading || !!error}
                    >
                      Capture
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<RefreshIcon />}
                      onClick={resetCapture}
                      disabled={loading || !!error}
                    >
                      Restart Camera
                    </Button>
                  </Box>
                </>
              ) : (
                <Box sx={{ textAlign: 'center' }}>
                  <img
                    src={`data:image/jpeg;base64,${capturedImage}`}
                    alt="Captured"
                    style={{
                      maxWidth: '100%',
                      maxHeight: 400,
                      borderRadius: 8,
                    }}
                  />
                  <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'center' }}>
                    <Button
                      variant="outlined"
                      startIcon={<RefreshIcon />}
                      onClick={resetCapture}
                    >
                      Retake
                    </Button>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Instructions
              </Typography>
              <Typography variant="body2" paragraph>
                1. Position your face in the center of the camera frame
              </Typography>
              <Typography variant="body2" paragraph>
                2. Ensure good lighting on your face
              </Typography>
              <Typography variant="body2" paragraph>
                3. Remove glasses or face coverings if possible
              </Typography>
              <Typography variant="body2" paragraph>
                4. Click "Capture" to take a photo
              </Typography>
              <Typography variant="body2">
                5. Wait for the system to recognize and mark your attendance
              </Typography>

              {loading && (
                <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={24} />
                  <Typography variant="body2">Processing...</Typography>
                </Box>
              )}

              {captureResult && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    Attendance marked successfully!
                  </Typography>
                  {captureResult.student && (
                    <Typography variant="body2">
                      Welcome, {captureResult.student.first_name} {captureResult.student.last_name}!
                    </Typography>
                  )}
                </Alert>
              )}

              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default FaceCapture;
