import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useDropzone } from 'react-dropzone';
import { styled } from '@mui/material/styles';
import { Box, Typography, IconButton, Button } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CameraCapture from './CameraCapture';
import BlockContent from './BlockContent';
import RejectionFiles from './RejectionFiles';
import MultiFilePreview from './MultiFilePreview';

// ----------------------------------------------------------------------

const DropZoneStyle = styled('div')(({ theme }) => ({
    outline: 'none',
    padding: theme.spacing(5, 1),
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.background.neutral,
    border: `1px dashed ${theme.palette.grey[500_32]}`,
    '&:hover': { opacity: 0.72, cursor: 'pointer' },
}));

// ----------------------------------------------------------------------

UploadMultiFile.propTypes = {
    error: PropTypes.bool,
    showPreview: PropTypes.bool,
    files: PropTypes.array,
    onRemove: PropTypes.func,
    onRemoveAll: PropTypes.func,
    onCapture: PropTypes.func,
    helperText: PropTypes.node,
    sx: PropTypes.object,
};

export default function UploadMultiFile({
    error,
    showPreview = false,
    files,
    onRemove,
    onRemoveAll,
    onCapture,
    helperText,
    sx,
    ...other
}) {
    const { getRootProps, getInputProps, isDragActive, isDragReject, fileRejections } = useDropzone({
        ...other,
    });

    return (
        <Box sx={{ width: '100%', ...sx }}>
            <DropZoneStyle
                {...getRootProps()}
                sx={{
                    ...(isDragActive && { opacity: 0.72 }),
                    ...((isDragReject || error) && {
                        color: 'error.main',
                        borderColor: 'error.light',
                        bgcolor: 'error.lighter',
                    }),
                }}
            >
                <input {...getInputProps()} />

                <BlockContent />
            </DropZoneStyle>

            {fileRejections.length > 0 && <RejectionFiles fileRejections={fileRejections} />}

            <MultiFilePreview files={files} showPreview={showPreview} onRemove={onRemove} onRemoveAll={onRemoveAll} />

            {helperText && helperText}

            {/* 카메라 캡처 버튼 추가 */}
            <Box mt={2} textAlign="center">
                <CameraCapture onCapture={onCapture} />
            </Box>
        </Box>
    );
}
