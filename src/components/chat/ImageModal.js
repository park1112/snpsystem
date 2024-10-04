import React from 'react';
import { Box, Modal, Button, IconButton, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

const ModalContent = styled(Box)(({ theme }) => ({
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '80%',
    maxWidth: '800px',
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
    outline: 'none',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
}));

const ModalImage = styled('img')({
    maxWidth: '100%',
    maxHeight: '70vh',
    objectFit: 'contain',
});

const NavigationButton = styled(IconButton)(({ theme }) => ({
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    color: 'white',
    '&:hover': {
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
}));

const ImageModal = ({ modalOpen, handleCloseModal, images, currentImageIndex, showPreviousImage, showNextImage }) => {
    if (!images || images.length === 0) {
        return null;
    }

    return (
        <Modal
            open={modalOpen}
            onClose={handleCloseModal}
            aria-labelledby="image-modal"
            aria-describedby="image-modal-description"
        >
            <ModalContent>
                {images.length > 1 && (
                    <NavigationButton onClick={showPreviousImage} sx={{ left: 10 }}>
                        <NavigateBeforeIcon />
                    </NavigationButton>
                )}
                {images[currentImageIndex] ? (
                    <ModalImage
                        src={images[currentImageIndex]}
                        alt={`Uploaded ${currentImageIndex + 1}`}
                    />
                ) : (
                    <Typography>이미지를 불러올 수 없습니다.</Typography>
                )}
                {images.length > 1 && (
                    <NavigationButton onClick={showNextImage} sx={{ right: 10 }}>
                        <NavigateNextIcon />
                    </NavigationButton>
                )}
                <Button onClick={handleCloseModal} sx={{ mt: 2 }}>닫기</Button>
            </ModalContent>
        </Modal>
    );
};

export default ImageModal;