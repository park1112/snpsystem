import React, { useRef, useState } from 'react';
import { Button, Box } from '@mui/material';
import PropTypes from 'prop-types';

const CameraCapture = ({ onCapture }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [isCameraOpen, setIsCameraOpen] = useState(false);

    const startCamera = async () => {
        try {
            // 후면 카메라 설정
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: { exact: "environment" } }
            });
            videoRef.current.srcObject = stream;
        } catch (err) {
            console.error('Error accessing the camera', err);
        }
    };

    const capturePhoto = () => {
        const context = canvasRef.current.getContext('2d');
        context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
        const imageDataUrl = canvasRef.current.toDataURL('image/png');

        // Convert data URL to a File object
        fetch(imageDataUrl)
            .then(res => res.blob())
            .then(blob => {
                const file = new File([blob], `photo_${Date.now()}.png`, { type: 'image/png' });
                onCapture(file);
            });

        setIsCameraOpen(false);
        // Stop the camera stream
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    };

    return (
        <Box>
            <Button variant="contained" onClick={startCamera} sx={{ mb: 2 }}>
                카메라 열기
            </Button>

            {isCameraOpen && (
                <Box>
                    <video ref={videoRef} autoPlay style={{ width: '100%' }} />
                    <Button variant="contained" color="primary" onClick={capturePhoto} sx={{ mt: 2 }}>
                        사진 찍기
                    </Button>
                </Box>
            )}

            {/* canvas 태그를 self-closing으로 변경 */}
            <canvas ref={canvasRef} style={{ display: 'none' }} width="640" height="480" />
        </Box>
    );
};

// Add prop-types validation
CameraCapture.propTypes = {
    onCapture: PropTypes.func.isRequired,
};

export default CameraCapture;
