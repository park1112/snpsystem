import React, { useState } from 'react';
import { Box, IconButton, Grid, Button } from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DeleteIcon from '@mui/icons-material/Delete';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../utils/firebase';

export default function ImageUpload({ chatId }) {
    const [previewImages, setPreviewImages] = useState([]); // 미리보기 이미지 상태
    const [uploadedImages, setUploadedImages] = useState([]);

    const handleFileChange = async (event) => {
        const files = Array.from(event.target.files);

        // 이미지 30장 초과 제한
        if (previewImages.length + files.length > 30) {
            alert('이미지는 최대 30장까지 등록할 수 있습니다.');
            return;
        }

        const uploadPromises = files.map(async (file) => {
            const fileExtension = file.name.split('.').pop();
            const fileName = `${chatId}_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExtension}`;
            const storageRef = ref(storage, `chats/${chatId}/${fileName}`);

            try {
                const snapshot = await uploadBytes(storageRef, file);
                const downloadUrl = await getDownloadURL(snapshot.ref);
                return { file, url: downloadUrl };
            } catch (error) {
                console.error('Error uploading image:', error);
                return null;
            }
        });

        const uploadedUrls = await Promise.all(uploadPromises);
        const validUrls = uploadedUrls.filter(urlObj => urlObj !== null);
        const validImages = validUrls.map(urlObj => urlObj.url);

        setPreviewImages([...previewImages, ...files.map(file => URL.createObjectURL(file))]);
        setUploadedImages([...uploadedImages, ...validImages]);
    };

    // 개별 이미지 삭제
    const handleDeleteImage = (index) => {
        const newPreviewImages = previewImages.filter((_, i) => i !== index);
        const newUploadedImages = uploadedImages.filter((_, i) => i !== index);

        setPreviewImages(newPreviewImages);
        setUploadedImages(newUploadedImages);
    };

    // 모든 이미지 삭제
    const handleDeleteAllImages = () => {
        setPreviewImages([]);
        setUploadedImages([]);
    };

    return (
        <Box>
            <input
                accept="image/*"
                style={{ display: 'none' }}
                id="icon-button-file"
                type="file"
                onChange={handleFileChange}
                multiple
            />
            <label htmlFor="icon-button-file">
                <IconButton color="primary" component="span">
                    <AttachFileIcon />
                </IconButton>
            </label>

            {previewImages.length > 0 && (
                <Box>
                    <Grid container spacing={2}>
                        {previewImages.map((image, index) => (
                            <Grid item xs={4} key={index}>
                                <Box sx={{ position: 'relative' }}>
                                    <img
                                        src={image}
                                        alt="Preview"
                                        style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: 8 }}
                                    />
                                    <IconButton
                                        sx={{
                                            position: 'absolute',
                                            top: 5,
                                            right: 5,
                                            backgroundColor: 'rgba(255, 255, 255, 0.7)',
                                        }}
                                        onClick={() => handleDeleteImage(index)}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>

                    <Button
                        sx={{ marginTop: 2 }}
                        variant="outlined"
                        color="error"
                        onClick={handleDeleteAllImages}
                    >
                        모두 삭제
                    </Button>
                </Box>
            )}
        </Box>
    );
}
