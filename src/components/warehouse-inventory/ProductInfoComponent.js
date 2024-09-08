// ProductInfoComponent.js
import React from 'react';
import { Paper, Typography, TextField, Button, Grid, Box, IconButton, Select, MenuItem } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import EditIcon from '@mui/icons-material/Edit';
import ReusableButton from '../ReusableButton';

const ProductInfoComponent = ({
    formState,
    products,
    handleSelect,
    handleQuantityChange,
    handleLogisticsChange,
    handleLogisticsIncrement,
    handleLogisticsDecrement,
    filteredWeights,
    filteredTypes,
    selectedPallets,
    handleAddProduct,
    handleRegister,
    resetProductForm,
    isProductInfoComplete,
    warningMessage
}) => {
    return (
        <Paper elevation={3} sx={{ p: 3 }}>

            <Box mt={2}>
                <Typography variant="subtitle1" gutterBottom>바렛트 선택</Typography>
                <Select
                    label="바렛트 선택"
                    value={formState.selectedPalletId}
                    onChange={(e) => handleSelect('selectedPalletId', e.target.value)}
                    fullWidth
                >
                    {selectedPallets.map((pallet) => (
                        <MenuItem key={pallet.id} value={pallet.id}>{pallet.name}</MenuItem>
                    ))}
                </Select>
            </Box>

            <Typography variant="h6" gutterBottom>제품 정보</Typography>
            <Grid container spacing={2} direction="column">
                <Grid item xs={12}>
                    <ReusableButton
                        label="제품 하위 카테고리 선택"
                        options={[...new Set(products.map((product) => product.subCategory))]}  // 수정: products 사용
                        onSelect={(option) => handleSelect('subCategory', option)}
                        fullWidth
                    />
                </Grid>
                <Grid item xs={12}>
                    <ReusableButton
                        label="제품 무게 선택"
                        options={filteredWeights}
                        onSelect={(option) => handleSelect('productWeight', option)}
                        fullWidth
                        disabled={!formState.subCategory}
                    />
                </Grid>
                <Grid item xs={12}>
                    <ReusableButton
                        label="제품 타입 선택"
                        options={filteredTypes}
                        onSelect={(option) => handleSelect('productType', option)}
                        fullWidth
                        disabled={!formState.productWeight}
                    />
                </Grid>
            </Grid>

            <Box mt={2}>
                <Typography variant="subtitle1" gutterBottom>수량</Typography>
                <Grid container spacing={2}>
                    {[50, 75, 85].map((quantity) => (
                        <Grid item xs={4} key={quantity}>
                            <Button
                                variant="outlined"
                                onClick={() => handleQuantityChange(quantity)}
                                fullWidth
                            >
                                {quantity}
                            </Button>
                        </Grid>
                    ))}
                </Grid>
                <TextField
                    label="수량"
                    name="quantity"
                    value={formState.quantity}
                    onChange={(e) => handleSelect('quantity', e.target.value)}
                    margin="normal"
                    fullWidth
                    type="number"
                />
            </Box>

            <Box mt={2}>
                <Typography variant="subtitle1" gutterBottom>물류 정보</Typography>
                {(formState.logistics || []).map((logistic, index) => (
                    <Box key={index} mb={2}>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={6}>
                                <TextField
                                    label="물류 이름"
                                    value={logistic.name}
                                    fullWidth
                                    disabled
                                />
                            </Grid>
                            <Grid item xs={4}>
                                <TextField
                                    label="물류 단위"
                                    value={logistic.multiply ? formState.quantity : logistic.unit}
                                    onChange={(e) => handleLogisticsChange(index, 'unit', e.target.value)}
                                    fullWidth
                                    disabled={!logistic.isDefault}
                                    type="number"
                                    InputProps={{
                                        endAdornment: logistic.isDefault ? <EditIcon style={{ color: 'green' }} /> : null,
                                        style: {
                                            backgroundColor: logistic.isDefault ? '#E3F2FD' : '#E0E0E0'
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={2}>
                                <IconButton onClick={() => handleLogisticsIncrement(index)} color="primary">
                                    <AddIcon />
                                </IconButton>
                                <IconButton onClick={() => handleLogisticsDecrement(index)} color="secondary">
                                    <RemoveIcon />
                                </IconButton>
                            </Grid>
                        </Grid>
                    </Box>
                ))}
            </Box>



            {warningMessage && (
                <Typography color="error" sx={{ mt: 2 }}>
                    {warningMessage}
                </Typography>
            )}

            <Box mt={2}>
                <Grid container spacing={2}>
                    <Grid item xs={4}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleAddProduct}
                            disabled={!isProductInfoComplete}
                            fullWidth
                        >
                            추가
                        </Button>
                    </Grid>
                    <Grid item xs={4}>
                        <Button
                            variant="contained"
                            color="secondary"
                            onClick={handleRegister}
                            fullWidth
                        >
                            등록
                        </Button>
                    </Grid>
                    <Grid item xs={4}>
                        <Button
                            variant="outlined"
                            onClick={resetProductForm}
                            fullWidth
                        >
                            리셋
                        </Button>
                    </Grid>
                </Grid>
            </Box>
        </Paper>
    );
};

export default ProductInfoComponent;