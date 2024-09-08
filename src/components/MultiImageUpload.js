// components/common/MultiImageUpload.js
import React, { useState, useCallback } from 'react';
import { Box, Button, IconButton, Typography, CircularProgress } from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { v4 as uuidv4 } from 'uuid';

const MultiImageUpload = ({ onImagesChange }) => {
    const [images, setImages] = useState([]);
    const [isUploading, setIsUploading] = useState(false);

    const handleImageUpload = useCallback(async (event) => {
        const files = Array.from(event.target.files);
        setIsUploading(true);

        try {
            const storage = getStorage();
            const newImages = await Promise.all(
                files.map(async (file) => {
                    const imageId = uuidv4();
                    const storageRef = ref(storage, `images/${imageId}`);
                    await uploadBytes(storageRef, file);
                    const url = await getDownloadURL(storageRef);
                    return { id: imageId, url };
                })
            );

            setImages((prevImages) => [...prevImages, ...newImages]);
            onImagesChange([...images, ...newImages]);
        } catch (error) {
            console.error("Error uploading images:", error);
            // Here you might want to show an error message to the user
        } finally {
            setIsUploading(false);
        }
    }, [images, onImagesChange]);

    const handleDeleteImage = useCallback(async (imageToDelete) => {
        try {
            const storage = getStorage();
            const imageRef = ref(storage, `images/${imageToDelete.id}`);
            await deleteObject(imageRef);

            setImages((prevImages) => prevImages.filter(img => img.id !== imageToDelete.id));
            onImagesChange(images.filter(img => img.id !== imageToDelete.id));
        } catch (error) {
            console.error("Error deleting image:", error);
            // Here you might want to show an error message to the user
        }
    }, [images, onImagesChange]);

    return (
        <Box>
            <input
                accept="image/*"
                style={{ display: 'none' }}
                id="raised-button-file"
                multiple
                type="file"
                onChange={handleImageUpload}
                disabled={isUploading}
            />
            <label htmlFor="raised-button-file">
                <Button variant="contained" component="span" disabled={isUploading}>
                    {isUploading ? <CircularProgress size={24} /> : "이미지 업로드"}
                </Button>
            </label>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', mt: 2 }}>
                {images.map((image) => (
                    <Box key={image.id} sx={{ position: 'relative', m: 1 }}>
                        <img src={image.url} alt="uploaded" style={{ width: 100, height: 100, objectFit: 'cover' }} />
                        <IconButton
                            sx={{ position: 'absolute', top: 0, right: 0, bgcolor: 'background.paper' }}
                            size="small"
                            onClick={() => handleDeleteImage(image)}
                        >
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Box>
                ))}
            </Box>

            {images.length > 0 && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                    {images.length}개의 이미지가 업로드되었습니다.
                </Typography>
            )}
        </Box>
    );
};

export default MultiImageUpload;