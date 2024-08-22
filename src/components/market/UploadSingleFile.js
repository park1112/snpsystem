import React from 'react';
import PropTypes from 'prop-types';
import isString from 'lodash/isString';
import { useDropzone } from 'react-dropzone';
import { styled } from '@mui/material/styles';
import { Box, Typography, Button } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';

const DropZoneStyle = styled('div')(({ theme }) => ({
    outline: 'none',
    overflow: 'hidden',
    position: 'relative',
    padding: theme.spacing(5, 1),
    borderRadius: theme.shape.borderRadius,
    transition: theme.transitions.create('padding'),
    backgroundColor: theme.palette.background.neutral,
    border: `1px dashed ${theme.palette.grey[500_32]}`,
    '&:hover': { opacity: 0.72, cursor: 'pointer' },
}));

UploadSingleFile.propTypes = {
    error: PropTypes.bool,
    file: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    onDelete: PropTypes.func,
    helperText: PropTypes.node,
    sx: PropTypes.object,
};

export default function UploadSingleFile({ error = false, file, onDelete, helperText, sx, ...other }) {
    const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
        multiple: false,
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
                    ...(file && {
                        padding: '12% 0',
                    }),
                }}
            >
                <input {...getInputProps()} />
                {!file && (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                        <CloudUploadIcon sx={{ width: 48, height: 48, mb: 1 }} />
                        <Typography variant="body1">Drop or Select file</Typography>
                    </Box>
                )}
                {file && (
                    <Box sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="body1">{isString(file) ? file : file.name}</Typography>
                    </Box>
                )}
            </DropZoneStyle>
            {file && (
                <Button
                    variant="outlined"
                    color="secondary"
                    startIcon={<DeleteIcon />}
                    onClick={onDelete}
                    sx={{ mt: 2 }}
                >
                    Delete
                </Button>
            )}
            {helperText && helperText}
        </Box>
    );
}