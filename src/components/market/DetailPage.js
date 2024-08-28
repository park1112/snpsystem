import React, { useEffect, useState, useRef } from 'react';
import {
    Container, Typography, Grid, Card, CardHeader, CardContent, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button
} from '@mui/material';
import { useRouter } from 'next/router';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import dayjs from 'dayjs';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx'; // XLSX 라이브러리를 임포트

const DetailPage = () => {
    const router = useRouter();
    const { id } = router.query;
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const contentRef = useRef(null);

    useEffect(() => {
        if (id) {
            fetchData(id);
        }
    }, [id]);

    const fetchData = async (docId) => {
        setLoading(true);
        try {
            const docRef = doc(db, 'daily_summaries', docId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                setData(docSnap.data());
            } else {
                setError('No such document!');
            }
        } catch (err) {
            setError('Error fetching data');
        } finally {
            setLoading(false);
        }
    };

    const downloadPDF = async () => {
        const content = contentRef.current;

        // 버튼을 숨깁니다.
        const buttons = content.querySelectorAll('button');
        buttons.forEach(button => button.style.display = 'none');

        const canvas = await html2canvas(content, {
            useCORS: true,
            scale: 2, // 해상도를 높이기 위해 스케일 조정
        });

        // 버튼을 다시 표시합니다.
        buttons.forEach(button => button.style.display = '');

        const imgData = canvas.toDataURL('image/png');

        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210; // A4 기준 너비
        const pageHeight = 297; // A4 기준 높이
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        const date = data?.date ? dayjs(data.date.toDate()).format('YYYY-MM-DD') : 'Unknown_Date';
        const fileName = `${data?.markets || 'Unknown Market'}_${date}.pdf`;

        pdf.save(fileName);
    };


    const downloadExcel = () => {
        const worksheetData = [
            ["상품명", "총 수량", "박스 타입", "상품가격", "합계가격"]
        ];

        data?.summary?.forEach(item => {
            const row = [
                item.productName,
                item.totalQuantity,
                item.boxType,
                item.productPrice,
                item.totalPrice
            ];
            worksheetData.push(row);
        });

        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Detail');

        const date = data?.date ? dayjs(data.date.toDate()).format('YYYY-MM-DD') : 'Unknown_Date';
        const fileName = `${data?.markets || 'Unknown Market'}_${date}.xlsx`;

        XLSX.writeFile(workbook, fileName);
    };

    if (loading) return <CircularProgress />;
    if (error) return <Typography color="error">{error}</Typography>;

    return (
        <Container maxWidth="md">
            <Card>
                <CardHeader title={`상세보기 - ${data?.markets || 'Unknown Market'}`} />
                <CardContent ref={contentRef}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Typography variant="h6">날짜: {data?.date ? dayjs(data.date.toDate()).format('YYYY-MM-DD HH:mm') : 'N/A'}</Typography>
                            <Typography variant="h6">총 수량: {data?.totalQuantity}</Typography>
                            <Typography variant="h6">총 합계가격: {data?.totalPrice} 원</Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <TableContainer component={Paper} style={{ borderRadius: '12px', overflow: 'hidden' }}>
                                <Table>
                                    <TableHead>
                                        <TableRow style={{ backgroundColor: '#f0f0f0' }}>
                                            <TableCell style={{ padding: '16px', fontWeight: 'bold' }}>상품명</TableCell>
                                            <TableCell align="right" style={{ padding: '16px', fontWeight: 'bold' }}>총 수량</TableCell>
                                            <TableCell style={{ padding: '16px', fontWeight: 'bold' }}>박스 타입</TableCell>
                                            <TableCell align="right" style={{ padding: '16px', fontWeight: 'bold' }}>상품가격</TableCell>
                                            <TableCell align="right" style={{ padding: '16px', fontWeight: 'bold' }}>합계가격</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {data?.summary?.map((item, index) => (
                                            <TableRow
                                                key={index}
                                                style={{
                                                    backgroundColor: index % 2 !== 0 ? '#f9f9f9' : 'inherit',
                                                    borderRadius: index === data.summary.length - 1 ? '0 0 12px 12px' : '0',
                                                    overflow: 'hidden'
                                                }}
                                            >
                                                <TableCell style={{ padding: '16px' }}>{item.productName}</TableCell>
                                                <TableCell align="right" style={{ padding: '16px' }}>{item.totalQuantity}</TableCell>
                                                <TableCell style={{ padding: '16px' }}>{item.boxType}</TableCell>
                                                <TableCell align="right" style={{ padding: '16px' }}>{item.productPrice} 원</TableCell>
                                                <TableCell align="right" style={{ padding: '16px' }}>{item.totalPrice} 원</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Grid>
                        <Grid item xs={12} container justifyContent="flex-end" spacing={2} style={{ marginTop: '16px' }}>
                            <Grid item>
                                <Button variant="contained" color="primary" onClick={downloadPDF}>
                                    PDF 다운로드
                                </Button>
                            </Grid>
                            <Grid item>
                                <Button variant="contained" color="secondary" onClick={downloadExcel}>
                                    Excel 다운로드
                                </Button>
                            </Grid>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        </Container>
    );
};

export default DetailPage;
