import React, { useMemo, useState } from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Typography, Button, CircularProgress, Divider
} from '@mui/material';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import Iconify from '../Iconify';
import PropTypes from 'prop-types';


const ProductSummary = ({ itemList, productMappings, marketName }) => {
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
                                UID: matchedProduct?.UID || productKey, // 매칭 실패 시 원래 ID를 사용
                                isError: !matchedProduct // 매칭 실패 시 true
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
                totalPrice,
                marketName

            };
            await addDoc(collection(db, 'daily_summaries'), saveData);
            alert('데이터가 성공적으로 저장되었습니다.');
        } catch (error) {
            console.error("Error saving data:", error);
            alert('데이터 저장 중 오류가 발생했습니다.');
        } finally {
            setSaving(false);
        } 12
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
                    {/* <TableRow>
                        <TableCell colSpan={5} align="right" style={{ fontWeight: 'bold', borderBottom: '1px solid #e0e0e0', padding: '16px' }}>
                            총 아이템 수량: {Object.values(itemList).flat().length}
                        </TableCell>
                    </TableRow> */}
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