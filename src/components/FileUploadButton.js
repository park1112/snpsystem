// src/components/FileUploadButton.js
import React from 'react';
import { Button } from '@mui/material';

const FileUploadButton = ({ onChange }) => (
        <Button variant="contained" component="label">
            Upload Excel File
            <input type="file" hidden onChange={onChange} />
        </Button>
    );

export default FileUploadButton;
