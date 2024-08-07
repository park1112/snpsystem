import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, Paper, Typography, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const ShippingSummary = ({ items, inventoryDocs, onRemove }) => {
    const filteredItems = items.filter((item) => item.quantity > 0);

    const totalSelectedQuantity = filteredItems.length; // 선택된 아이템의 개수
    const totalInventoryQuantity = filteredItems.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <Paper sx={{ mt: 2, p: 2 }}>
            <Typography variant="h6" gutterBottom>선택된 상품 요약</Typography>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>상품명</TableCell>
                        <TableCell align="right">선택 수량</TableCell>
                        <TableCell align="right">총 수량</TableCell>
                        <TableCell align="right">창고</TableCell>
                        <TableCell align="right">상태</TableCell>
                        <TableCell align="right">작업</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {filteredItems.map((item, index) => (
                        <TableRow key={index}>
                            <TableCell component="th" scope="row">
                                {item.productName}
                            </TableCell>
                            <TableCell align="right">1</TableCell>
                            <TableCell align="right">{item.quantity}</TableCell>
                            <TableCell align="right">{item.warehouseName}</TableCell>
                            <TableCell align="right">{item.status}</TableCell>
                            <TableCell align="right">
                                <IconButton onClick={() => onRemove(index)} size="small">
                                    <DeleteIcon />
                                </IconButton>
                            </TableCell>
                        </TableRow>
                    ))}
                    <TableRow>
                        <TableCell colSpan={1}><strong>합계</strong></TableCell>
                        <TableCell align="right"><strong>{totalSelectedQuantity}</strong></TableCell>
                        <TableCell align="right"><strong>{totalInventoryQuantity}</strong></TableCell>
                        <TableCell colSpan={3} />
                    </TableRow>
                </TableBody>
            </Table>
        </Paper>
    );
};

export default ShippingSummary;