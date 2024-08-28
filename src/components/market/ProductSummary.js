import React, { useMemo, useState } from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Typography, Button, CircularProgress, Divider
} from '@mui/material';
import { collection, addDoc, getDoc, getDocs, query, where, updateDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import Iconify from '../Iconify';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';

const ProductSummary = ({ itemList, productMappings, marketName }) => {
    const [saving, setSaving] = useState(false);
    const [savedData, setSavedData] = useState(null);

    const summary = useMemo(() => {
        const result = {};
        Object.entries(itemList).forEach(([marketId, items]) => {
            if (Array.isArray(items)) {
                items.forEach(item => {
                    const matchedProduct = item.matchedProduct;
                    let productKey = matchedProduct?.deliveryProductName || `${item.옵션ID || item.옵션정보 || item.상품번호 || item.옵션 || item.옵션번호}`;
                    if (matchedProduct) {
                        const { deliveryProductName, boxType, price, productPrice, UID, count } = matchedProduct;
                        if (!result[deliveryProductName]) {
                            result[deliveryProductName] = {
                                totalQuantity: 0,
                                boxType: boxType || 'N/A',
                                price: parseFloat(price) || 0,
                                totalPrice: 0,
                                productPrice: parseFloat(productPrice) || 0,
                                UID: matchedProduct?.UID || productKey,
                                isError: !matchedProduct
                            };
                        }
                        const quantity = parseInt(item['구매수(수량)'] || item.수량 || item.구매수량, 10) || 0;
                        const productCount = parseInt(count, 10) || 1;
                        const totalQuantity = quantity * productCount;
                        result[deliveryProductName].totalQuantity += totalQuantity;
                        result[deliveryProductName].totalPrice += totalQuantity * result[deliveryProductName].productPrice;
                    }
                });
            }
        });
        return result;
    }, [itemList, productMappings]);

    const totalQuantity = useMemo(() => {
        return Object.values(summary).reduce((total, item) => total + item.totalQuantity, 0);
    }, [summary]);

    const totalPrice = useMemo(() => {
        return Object.values(summary).reduce((total, item) => total + item.totalPrice, 0);
    }, [summary]);

    const handleSaveData = async () => {
        setSaving(true);
        try {
            const today = dayjs().startOf('day');
            const todayTimestamp = Timestamp.fromDate(today.toDate());

            const q = query(
                collection(db, 'daily_summaries'),
                where('date', '==', todayTimestamp),
                where('marketName', '==', marketName)
            );

            const querySnapshot = await getDocs(q);

            const saveData = {
                summary: Object.entries(summary).map(([productName, data]) => ({
                    productName,
                    totalQuantity: data.totalQuantity,
                    boxType: data.boxType,
                    price: data.price,
                    totalPrice: data.totalPrice,
                    productPrice: data.productPrice,
                    UID: data.UID
                })),
                totalQuantity,
                totalPrice,
                marketName,
                addDate: [Timestamp.now()], // 처음에는 새 배열로 시작
                updatedAt: Timestamp.now() // 처음 저장이므로 현재 시간 사용
            };

            let docRef;
            if (querySnapshot.empty) {
                const newDocData = {
                    ...saveData,
                    date: todayTimestamp, // 오늘 날짜 (시간 포함 X)
                    updatedAt: Timestamp.now()
                };
                docRef = await addDoc(collection(db, 'daily_summaries'), newDocData);
                console.log('새 문서 ID:', docRef.id);
            } else {
                docRef = doc(db, 'daily_summaries', querySnapshot.docs[0].id);
                const existingData = querySnapshot.docs[0].data();
                await updateDoc(docRef, {
                    summary: [...existingData.summary, ...saveData.summary],
                    totalQuantity: existingData.totalQuantity + saveData.totalQuantity,
                    totalPrice: existingData.totalPrice + saveData.totalPrice,
                    addDate: [...(existingData.addDate || []), Timestamp.now()], // 추가된 시간을 배열로 기록
                    updatedAt: existingData.updatedAt || Timestamp.now() // 기존의 업데이트 시간을 유지
                });

                console.log('업데이트된 문서 ID:', docRef.id);
            }

            const savedDocSnap = await getDoc(doc(db, 'daily_summaries', docRef.id));
            if (savedDocSnap.exists()) {
                setSavedData(savedDocSnap.data());
                console.log('저장된 데이터:', savedDocSnap.data());
                alert('데이터가 성공적으로 저장/업데이트되었습니다. 콘솔에서 자세한 내용을 확인하세요.');

                // 데이터를 저장한 후 itemList를 초기화합니다.
                setSavedData(null);
            } else {
                console.error('저장된 문서를 찾을 수 없습니다.');
                alert('데이터 저장은 성공했지만, 저장된 데이터를 확인할 수 없습니다.');
            }
        } catch (error) {
            console.error("데이터 저장 중 오류:", error);
            if (error.code === 'failed-precondition') {
                const indexUrl = error.message.match(/https:\/\/console\.firebase\.google\.com[^"]*/);
                alert(`데이터베이스 색인이 필요합니다. 다음 링크에서 색인을 생성해주세요:\n${indexUrl}`);
            } else {
                alert('데이터 저장 중 오류가 발생했습니다. 콘솔을 확인해주세요.');
            }
        } finally {
            setSaving(false);
        }
    };

    const formatNumber = (number) => {
        return typeof number === 'number' ? number.toLocaleString() : 'N/A';
    };

    return (
        <TableContainer component={Paper} style={{ padding: 0 }}>
            <Typography variant="h6" gutterBottom component="div" style={{ padding: '16px' }}>
                오픈마켓 판매현황판
            </Typography>
            <Divider style={{ marginBottom: '16px', backgroundColor: '#e0e0e0' }} />
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell style={{ borderBottom: '1px solid #e0e0e0', padding: '16px' }}>상품명 (배송용)</TableCell>
                        <TableCell align="right" style={{ borderBottom: '1px solid #e0e0e0', padding: '16px' }}>총 수량</TableCell>
                        <TableCell style={{ borderBottom: '1px solid #e0e0e0', padding: '16px' }}>박스 타입</TableCell>
                        <TableCell align="right" style={{ borderBottom: '1px solid #e0e0e0', padding: '16px' }}>상품가격</TableCell>
                        <TableCell align="right" style={{ borderBottom: '1px solid #e0e0e0', padding: '16px' }}>합계가격</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {Object.entries(summary).map(([productName, data]) => {
                        const displayName = productName !== 'undefined' ? productName : `${data.UID || 'N/A'} (미등록 상품번호)`; // UID가 있으면 사용, 없으면 'N/A'로 대체
                        const isError = productName === 'undefined' || data.isError;

                        return (
                            <TableRow key={displayName}>
                                <TableCell
                                    component="th"
                                    scope="row"
                                    style={{
                                        borderBottom: '1px solid #f0f0f0',
                                        padding: '16px',
                                        color: isError ? 'red' : 'inherit'
                                    }}
                                >
                                    {displayName}
                                </TableCell>
                                <TableCell
                                    align="right"
                                    style={{
                                        borderBottom: '1px solid #f0f0f0',
                                        padding: '16px',
                                        color: isError ? 'red' : 'inherit'
                                    }}
                                >
                                    {formatNumber(data.totalQuantity)}
                                </TableCell>
                                <TableCell
                                    style={{
                                        borderBottom: '1px solid #f0f0f0',
                                        padding: '16px',
                                        color: isError ? 'red' : 'inherit'
                                    }}
                                >
                                    {data.boxType}
                                </TableCell>
                                <TableCell
                                    align="right"
                                    style={{
                                        borderBottom: '1px solid #f0f0f0',
                                        padding: '16px',
                                        color: isError ? 'red' : 'inherit'
                                    }}
                                >
                                    {formatNumber(data.productPrice)} 원
                                </TableCell>
                                <TableCell
                                    align="right"
                                    style={{
                                        borderBottom: '1px solid #f0f0f0',
                                        padding: '16px',
                                        color: isError ? 'red' : 'inherit'
                                    }}
                                >
                                    {formatNumber(data.totalPrice)} 원
                                </TableCell>
                            </TableRow>
                        );
                    })}
                    <TableRow>
                        <TableCell colSpan={1} align="right" style={{ fontWeight: 'bold', borderBottom: '1px solid #e0e0e0', padding: '16px' }}>
                            전체 총계
                        </TableCell>
                        <TableCell align="right" style={{ fontWeight: 'bold', borderBottom: '1px solid #e0e0e0', padding: '16px' }}>
                            {formatNumber(totalQuantity)}
                        </TableCell>
                        <TableCell colSpan={2} style={{ borderBottom: '1px solid #e0e0e0', padding: '16px' }} />
                        <TableCell align="right" style={{ fontWeight: 'bold', borderBottom: '1px solid #e0e0e0', padding: '16px' }}>
                            {formatNumber(totalPrice)} 원
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell colSpan={5} align="right" style={{ fontWeight: 'bold', borderBottom: '1px solid #e0e0e0', padding: '16px' }}>
                            총 아이템 수량: {Object.keys(itemList).reduce((total, marketId) => {
                                return itemList[marketId].length;
                            }, 0)}
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
            {Object.keys(summary).length === 0 && (
                <Typography variant="body1" style={{ padding: '16px', color: '#757575' }}>
                    데이터가 없습니다. 파일을 업로드하고 데이터를 집계해주세요.
                </Typography>
            )}
            {savedData && (
                <div style={{ margin: '16px', padding: '16px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
                    <Typography variant="h6">최근 저장된 데이터</Typography>
                    <Typography>총 수량: {savedData.totalQuantity}</Typography>
                    <Typography>총 가격: {savedData.totalPrice}</Typography>
                    <Typography>업데이트 시간: {savedData.updatedAt.toDate().toString()}</Typography>
                    <Typography>추가된 시간: {savedData.addDate ? savedData.addDate.toDate().toString() : 'N/A'}</Typography>
                </div>
            )}
            <Button
                variant="contained"
                color="primary"
                onClick={handleSaveData}
                disabled={saving || Object.keys(summary).length === 0}
                style={{ margin: '16px' }}
                size="large"
                startIcon={<Iconify icon="ic:round-save" />}
            >
                {saving ? <CircularProgress size={24} /> : '데이터 저장'}
            </Button>
        </TableContainer>
    );
};

ProductSummary.propTypes = {
    itemList: PropTypes.object.isRequired,
    productMappings: PropTypes.object.isRequired,
    marketName: PropTypes.string.isRequired,
};

export default ProductSummary;
