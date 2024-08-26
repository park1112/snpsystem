import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useDropzone } from 'react-dropzone';
import { Typography, Box, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import * as XLSX from 'xlsx';

const DropZoneStyle = styled('div')(({ theme }) => ({
    outline: 'none',
    padding: theme.spacing(5, 1),
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.background.neutral,
    border: `1px dashed ${theme.palette.grey[500_32]}`,
    '&:hover': { opacity: 0.72, cursor: 'pointer' },
}));

const FileUploader = ({ marketId, marketName, onFileUpload, disabled }) => {
    const [file, setFile] = useState(null);

    const readExcelFile = useCallback((file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = e.target.result;
                    const workbook = XLSX.read(data, { type: 'array' });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    const json = XLSX.utils.sheet_to_json(worksheet);
                    resolve(json);
                } catch (err) {
                    reject(err);
                }
            };
            reader.onerror = (err) => reject(err);
            reader.readAsArrayBuffer(file);
        });
    }, []);

    const handleFileChange = useCallback(async (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (file) {
            try {
                const data = await readExcelFile(file);
                console.log("Raw Excel data:", data);
                setFile(file);
                onFileUpload(data);
            } catch (error) {
                console.error("Error reading file:", error);
                alert('파일을 읽는 중 오류가 발생했습니다.');
            }
        }
    }, [readExcelFile, onFileUpload]);

    const handleDelete = useCallback(() => {
        setFile(null);
        onFileUpload(null);
    }, [onFileUpload]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: handleFileChange,
        disabled: disabled,
        accept: {
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            'application/vnd.ms-excel': ['.xls']
        },
        multiple: false
    });

    return (
        <Box sx={{ width: '100%', mb: 2 }}>
            <DropZoneStyle
                {...getRootProps()}
                sx={{
                    ...(isDragActive && { opacity: 0.72 }),
                    ...(disabled && { opacity: 0.5, cursor: 'not-allowed' }),
                }}
            >
                <input {...getInputProps()} />
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <CloudUploadIcon sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="body2">{marketName} 파일 업로드</Typography>
                </Box>
            </DropZoneStyle>
            {file && (
                <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="body2">{file.name}</Typography>
                    <IconButton onClick={handleDelete} size="small">
                        <DeleteIcon />
                    </IconButton>
                </Box>
            )}
        </Box>
    );
};

FileUploader.propTypes = {
    marketId: PropTypes.string.isRequired,
    marketName: PropTypes.string.isRequired,
    onFileUpload: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
};

export default FileUploader;