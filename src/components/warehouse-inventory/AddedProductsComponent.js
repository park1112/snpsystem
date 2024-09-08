// AddedProductsComponent.js
import React from 'react';
import { Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button } from '@mui/material';

const AddedProductsComponent = ({ products, handleDeleteProduct }) => {
    return (
        <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>추가된 제품</Typography>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>제품명</TableCell>
                            <TableCell>무게</TableCell>
                            <TableCell>타입</TableCell>
                            <TableCell align="right">수량</TableCell>
                            <TableCell align="right">작업</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {products.map((product, index) => (
                            <TableRow key={index}>
                                <TableCell>{product.productName}</TableCell>
                                <TableCell>{product.productWeight}kg</TableCell>
                                <TableCell>{product.productType}</TableCell>
                                <TableCell align="right">{product.quantity}</TableCell>
                                <TableCell align="right">
                                    <Button
                                        variant="contained"
                                        color="secondary"
                                        onClick={() => handleDeleteProduct(index)}
                                        size="small"
                                    >
                                        삭제
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
};

export default AddedProductsComponent;