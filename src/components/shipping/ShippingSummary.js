import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, Paper, Typography, IconButton } from '@mui/material';
import { Delete } from '@mui/icons-material';

const ShippingSummary = ({ items, inventoryDocs, onRemove }) => {
    const totalLogisticsQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalCount = items.reduce((sum, item) => {
        const inventoryDoc = inventoryDocs[item.inventoryUids[0]];
        return sum + (item.quantity * (inventoryDoc?.quantity || 1));
    }, 0);

    return (
        <Paper sx={{ mt: 2, p: 2 }}>
            <Typography variant="h6" gutterBottom>선택된 상품 요약</Typography>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>상품명</TableCell>
                        <TableCell align="right">물류기기 수량</TableCell>
                        <TableCell align="right">총 수량</TableCell>
                        <TableCell align="right">창고</TableCell>
                        <TableCell align="right">상태</TableCell>
                        <TableCell align="right">삭제</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {items.map((item, index) => {
                        const inventoryDoc = inventoryDocs[item.inventoryUids[0]];
                        const totalCount = item.quantity * (inventoryDoc?.quantity || 1);
                        return (
                            <TableRow key={index}>
                                <TableCell component="th" scope="row">
                                    {item.productName}
                                </TableCell>
                                <TableCell align="right">{item.quantity}</TableCell>
                                <TableCell align="right">{totalCount}</TableCell>
                                <TableCell align="right">{item.warehouseName}</TableCell>
                                <TableCell align="right">{item.status}</TableCell>
                                <TableCell align="right">
                                    <IconButton onClick={() => onRemove(index)}>
                                        <Delete />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                    <TableRow>
                        <TableCell colSpan={1}><strong>총계</strong></TableCell>
                        <TableCell align="right"><strong>{totalLogisticsQuantity}</strong></TableCell>
                        <TableCell align="right"><strong>{totalCount}</strong></TableCell>
                        <TableCell colSpan={3}></TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </Paper>
    );
};

export default ShippingSummary;
