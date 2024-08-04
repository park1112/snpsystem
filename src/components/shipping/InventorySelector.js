import React, { useState } from 'react';
import { List, ListItem, ListItemText, Button, TextField, Typography, Box } from '@mui/material';

const InventorySelector = ({ products, onSelect }) => {
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);

    const handleProductSelect = (product) => {
        setSelectedProduct(product);
        setQuantity(1);
        console.log('product');
        console.log(product);
    };

    const handleQuantityChange = (change) => {
        const newQuantity = Math.max(1, Math.min(selectedProduct.count, quantity + change));
        setQuantity(newQuantity);
    };

    const handleAddToSelection = () => {
        onSelect(selectedProduct, quantity);
        setSelectedProduct(null);
        setQuantity(1);
    };

    return (
        <Box>
            <List>
                {products.map((product) => (

                    <ListItem
                        key={`${product.warehouseId}-${product.productId}`}
                        button
                        onClick={() => handleProductSelect(product)}
                        selected={selectedProduct && selectedProduct.productId === product.productId}
                    >
                        <ListItemText
                            primary={product.productName}
                            secondary={`창고: ${product.warehouseName}, 상태: ${product.status}, 물류기기 수량 : ${product.inventoryUids.length}개, 총수량: ${product.count}`}
                        />
                    </ListItem>
                ))}
            </List>
            {selectedProduct && (
                <Box mt={2} p={2} border={1} borderColor="grey.300" borderRadius={1}>
                    <Typography variant="h6">{selectedProduct.productName}</Typography>
                    <Typography variant="body2">재고: {selectedProduct.count}</Typography>
                    <Box display="flex" alignItems="center" mt={1}>
                        <Button onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1}>-</Button>
                        <TextField
                            value={quantity}
                            onChange={(e) => setQuantity(Math.max(1, Math.min(selectedProduct.count, parseInt(e.target.value) || 0)))}
                            type="number"
                            inputProps={{ min: 1, max: selectedProduct.count }}
                            style={{ width: '60px', margin: '0 10px' }}
                        />
                        <Button onClick={() => handleQuantityChange(1)} disabled={quantity >= selectedProduct.count}>+</Button>
                    </Box>
                    <Button variant="contained" color="primary" onClick={handleAddToSelection} fullWidth sx={{ mt: 2 }}>
                        추가
                    </Button>
                </Box>
            )}
        </Box>
    );
};

export default InventorySelector;