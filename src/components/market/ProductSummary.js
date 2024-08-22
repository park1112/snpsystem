import React, { useMemo } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from '@mui/material';

const ProductSummary = ({ itemList, productMappings }) => {
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
                        const { deliveryProductName, boxType } = matchedProduct;
                        if (!result[deliveryProductName]) {
                            result[deliveryProductName] = { totalQuantity: 0, boxType };
                        }
                        const quantity = parseInt(item['구매수(수량)'], 10) || 0;
                        console.log(`Adding quantity ${quantity} to ${deliveryProductName}`);
                        result[deliveryProductName].totalQuantity += quantity;
                    }
                });
            }
        });
        console.log("Final summary:", result);
        return result;
    }, [itemList, productMappings]);

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
                    </TableRow>
                </TableHead>
                <TableBody>
                    {Object.entries(summary).map(([productName, data]) => (
                        <TableRow key={productName}>
                            <TableCell component="th" scope="row">
                                {productName}
                            </TableCell>
                            <TableCell align="right">{data.totalQuantity}</TableCell>
                            <TableCell>{data.boxType}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            {Object.keys(summary).length === 0 && (
                <Typography variant="body1" style={{ padding: '16px' }}>
                    데이터가 없습니다. 파일을 업로드하고 데이터를 집계해주세요.
                </Typography>
            )}
        </TableContainer>
    );
};

export default ProductSummary;