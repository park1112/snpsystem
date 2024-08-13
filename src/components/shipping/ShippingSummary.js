// ShippingSummary.js

import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, Paper, Typography, Divider } from '@mui/material';

const ShippingSummary = ({ items }) => {
    const totalSelectedQuantity = items.length;
    const totalInventoryQuantity = items.reduce((sum, item) =>
        sum + item.products.reduce((productSum, product) => productSum + product.quantity, 0), 0);

    return (
        <Paper sx={{ mt: 2, p: 2 }}>
            <Typography variant="h6" gutterBottom>선택된 상품 요약</Typography>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>상품명</TableCell>
                        <TableCell align="right">수량</TableCell>
                        <TableCell align="right">창고</TableCell>
                        <TableCell align="right">상태</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {items.map((item, index) => (
                        <React.Fragment key={index}>
                            {item.products.map((product, productIndex) => (
                                <TableRow key={`${index}-${productIndex}`}>
                                    <TableCell>{product.productName}</TableCell>
                                    <TableCell align="right">{product.quantity}</TableCell>
                                    {productIndex === 0 && (
                                        <>
                                            <TableCell align="right" rowSpan={item.products.length}>
                                                {item.warehouseName}
                                            </TableCell>
                                            <TableCell align="right" rowSpan={item.products.length}>
                                                {item.status}
                                            </TableCell>
                                        </>
                                    )}
                                </TableRow>
                            ))}
                            {index < items.length - 1 && (
                                <TableRow>
                                    <TableCell colSpan={4}>
                                        <Divider />
                                    </TableCell>
                                </TableRow>
                            )}
                        </React.Fragment>
                    ))}
                    <TableRow>
                        <TableCell colSpan={4}>
                            <Divider />
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell><strong>합계</strong></TableCell>
                        <TableCell align="right"><strong>{totalInventoryQuantity}</strong></TableCell>
                        <TableCell align="right"><strong>선택된 인벤토리: {totalSelectedQuantity}</strong></TableCell>
                        <TableCell />
                    </TableRow>
                </TableBody>
            </Table>
        </Paper>
    );
};

export default ShippingSummary;