import React, { useEffect, useState, useRef } from 'react';
import {
    Container, Typography, Grid, Card, CardHeader, CardContent, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button
} from '@mui/material';
import { useRouter } from 'next/router';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import dynamic from 'next/dynamic';



const DetailPage = () => {
    const router = useRouter();
    const { id } = router.query;
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const contentRef = useRef(null);
    const [generatePDF, setGeneratePDF] = useState(null);

    useEffect(() => {
        if (id) {
            fetchData(id);
        }
    }, [id]);

    useEffect(() => {
        import('./SummaryPDF').then(module => {
            setGeneratePDF(() => module.default);
        });
    }, []);

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
        if (data) {
            try {
                const generateSummaryPDF = (await import('./SummaryPDF')).default;
                await generateSummaryPDF(data);
            } catch (error) {
                console.error('PDF 생성 중 오류 발생:', error);
                // 사용자에게 오류 메시지를 표시하는 로직을 여기에 추가할 수 있습니다.
                alert('PDF 생성 중 오류가 발생했습니다. 다시 시도해 주세요.');
            }
        }
    };


    const downloadExcel = () => {
        // 엑셀의 첫 줄에 Market Name과 총 수량을 추가합니다.
        const worksheetData = [
            ["Market Name", `${data?.marketName || 'Unknown Market'}`,],
            ["총 수량", `${data?.totalQuantity || 0}`],
            [], // 빈 줄
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

        const date = data?.updatedAt ? dayjs(data.updatedAt.toDate()).format('YYYY-MM-DD') : 'Unknown_Date';
        const fileName = `${data?.marketName || 'Unknown Market'}_${date}.xlsx`;

        XLSX.writeFile(workbook, fileName);
    };


    if (loading) return <CircularProgress />;
    if (error) return <Typography color="error">{error}</Typography>;

    return (
        <Container maxWidth="md">
            <Card>
                <CardHeader title={`상세보기 - ${data?.marketName || 'Unknown Market'}`} />
                <CardContent ref={contentRef}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Typography variant="h6">
                                날짜: {data?.updatedAt
                                    ? dayjs(data.updatedAt.toDate()).format('YYYY-MM-DD HH:mm')
                                    : 'N/A'}
                            </Typography>
                            {data?.addDate && Array.isArray(data.addDate) && data.addDate.length > 0 && (
                                <Typography variant="h6">
                                    추가된 시간:
                                    <ul>
                                        {data.addDate.map((date, index) => (
                                            <li key={index}>{dayjs(date.toDate()).format('YYYY-MM-DD HH:mm')}</li>
                                        ))}
                                    </ul>
                                </Typography>
                            )}
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
                            <Grid item className="no-print">
                                <Button variant="contained" color="primary" onClick={downloadPDF}>
                                    PDF 다운로드
                                </Button>
                            </Grid>
                            <Grid item className="no-print">
                                <Button variant="contained" color="secondary" onClick={downloadExcel}>
                                    Excel 다운로드
                                </Button>
                            </Grid>

                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
            <style jsx>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    
                    #content, #content * {
                        visibility: visible;
                    }
                    
                    #content {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                }
            `}</style>
        </Container>
    );
};

export default DetailPage;
