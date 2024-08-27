import React, { useMemo, useState } from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Typography, Button, CircularProgress
} from '@mui/material';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import Iconify from '../Iconify';

const ProductSummary = ({ itemList, productMappings }) => {
    const [saving, setSaving] = useState(false);

    const summary = useMemo(() => {
        console.log("ItemList in ProductSummary:", itemList);
        const result = {};
        Object.entries(itemList).forEach(([marketId, items]) => {
            console.log(`Processing market ${marketId}, items:`, items);
            if (Array.isArray(items)) {
                items.forEach(item => {
                    console.log("Processing item:", item);
                    const matchedProduct = item.matchedProduct;
                    console.log("Matched product:", matchedProduct);
                    if (matchedProduct) {
                        const { deliveryProductName, boxType, price, productPrice, UID, count } = matchedProduct;
                        if (!result[deliveryProductName]) {
                            result[deliveryProductName] = {
                                totalQuantity: 0,
                                boxType: boxType || 'N/A',
                                price: parseFloat(price) || 0,
                                totalPrice: 0,
                                productPrice: parseFloat(productPrice) || 0,
                                UID: UID || 'N/A',
                            };
                        }
                        const quantity = parseInt(item['구매수(수량)'] || item.수량 || item.구매수량, 10) || 0;
                        const productCount = parseInt(count, 10) || 1; // count가 없는 경우 기본값 1 사용
                        const totalQuantity = quantity * productCount;
                        console.log(`Adding quantity ${totalQuantity} to ${deliveryProductName}`);
                        result[deliveryProductName].totalQuantity += totalQuantity;
                        result[deliveryProductName].totalPrice += totalQuantity * result[deliveryProductName].productPrice;
                    }
                });
            }
        });
        console.log("Final summary:", result);
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
            const saveData = {
                date: new Date(),
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
                totalPrice
            };
            await addDoc(collection(db, 'daily_summaries'), saveData);
            alert('데이터가 성공적으로 저장되었습니다.');
        } catch (error) {
            console.error("Error saving data:", error);
            alert('데이터 저장 중 오류가 발생했습니다.');
        } finally {
            setSaving(false);
        }
    };

    const formatNumber = (number) => {
        return typeof number === 'number' ? number.toLocaleString() : 'N/A';
    };

    return (
        <TableContainer component={Paper}>
            <Typography variant="h6" gutterBottom component="div" style={{ padding: '16px' }}>
                오픈마켓 판매현황판
            </Typography>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>상품명 (배송용)</TableCell>
                        <TableCell align="right">총 수량</TableCell>
                        <TableCell>박스 타입</TableCell>
                        <TableCell align="right">상품가격</TableCell>
                        <TableCell align="right">합계가격</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {Object.entries(summary).map(([productName, data]) => (
                        <TableRow key={productName}>
                            <TableCell component="th" scope="row">
                                {productName}
                            </TableCell>
                            <TableCell align="right">{formatNumber(data.totalQuantity)}</TableCell>
                            <TableCell>{data.boxType}</TableCell>
                            <TableCell align="right">{formatNumber(data.productPrice)} 원</TableCell>
                            <TableCell align="right">{formatNumber(data.totalPrice)} 원</TableCell>
                        </TableRow>
                    ))}
                    <TableRow>
                        <TableCell colSpan={1} align="right" style={{ fontWeight: 'bold' }}>전체 총계</TableCell>
                        <TableCell align="right" style={{ fontWeight: 'bold' }}>{formatNumber(totalQuantity)}</TableCell>
                        <TableCell colSpan={2} />
                        <TableCell align="right" style={{ fontWeight: 'bold' }}>{formatNumber(totalPrice)} 원</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
            {Object.keys(summary).length === 0 && (
                <Typography variant="body1" style={{ padding: '16px' }}>
                    데이터가 없습니다. 파일을 업로드하고 데이터를 집계해주세요.
                </Typography>
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

export default ProductSummary;