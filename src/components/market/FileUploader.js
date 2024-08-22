import React from 'react';
import { Button } from '@mui/material';
import * as XLSX from 'xlsx';

const FileUploader = ({ marketId, marketName, onFileUpload, disabled }) => {
    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const data = await readExcelFile(file);
                console.log("Raw Excel data:", data);
                onFileUpload(data);
            } catch (error) {
                console.error("Error reading file:", error);
                alert('파일을 읽는 중 오류가 발생했습니다.');
            }
        }
    };

    const readExcelFile = (file) => {
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
    };

    return (
        <div>
            <input
                accept=".xlsx, .xls"
                style={{ display: 'none' }}
                id={`file-input-${marketId}`}
                type="file"
                onChange={handleFileChange}
                disabled={disabled}
            />
            <label htmlFor={`file-input-${marketId}`}>
                <Button variant="contained" component="span" disabled={disabled}>
                    {marketName} 파일 업로드
                </Button>
            </label>
        </div>
    );
};

export default FileUploader;