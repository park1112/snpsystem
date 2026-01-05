import React, { useState, useEffect } from 'react';
import {
    Container, Typography, Button, Grid, Paper, CircularProgress, Snackbar,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField
} from '@mui/material';
import * as XLSX from 'xlsx';
import { collection, addDoc, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import Iconify from '../Iconify';

const ExcelHandler = ({ onUpload, markets }) => {
    const downloadTemplate = () => {
        const template = [
            {
                '오픈마켓 이름': '',
                '등록된 상품명': '',
                '택배 상품명': '',
                '상품 가격': '',
                '박스타입': '',
                '가격': '',
                '마진': '',
                ...Object.fromEntries(markets.map(market => [`${market.name} 옵션ID 1`, '']))
            }
        ];

        const ws = XLSX.utils.json_to_sheet(template);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Template");
        XLSX.writeFile(wb, "product_template.xlsx");
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
            const bstr = event.target.result;
            const wb = XLSX.read(bstr, { type: 'binary' });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const data = XLSX.utils.sheet_to_json(ws);
            onUpload(data);
        };
        reader.readAsBinaryString(file);
    };

    return (
        <>
            <Button variant="contained"
                color="primary"
                onClick={downloadTemplate}
                style={{ marginRight: '10px' }}
                size="large"
                startIcon={<Iconify icon="ic:round-download" />}
            >
                템플릿 다운로드
            </Button>
            <input
                accept=".xlsx, .xls"
                style={{ display: 'none' }}
                id="raised-button-file"
                type="file"
                onChange={handleFileUpload}
            />
            <label htmlFor="raised-button-file">
                <Button
                    variant="contained"
                    component="span"
                    size="large"
                    startIcon={<Iconify icon="ic:round-upload" />}>
                    엑셀 업로드
                </Button>
            </label>
        </>
    );
};