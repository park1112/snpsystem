import { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography } from '@mui/material';

const ProductForm = ({ initialData = {}, onSubmit }) => {
    const [formState, setFormState] = useState({
        name: '',
        category: '',
        weight: '',
        typeName: '',
        price: '',
        stock: '',
        createdAt: '',
        updatedAt: ''
    });

    useEffect(() => {
        if (initialData && Object.keys(initialData).length > 0) {
            setFormState({
                name: initialData.name || '',
                category: initialData.category || '',
                weight: initialData.types?.[0]?.variants?.[0]?.weight.replace('kg', '') || '',
                typeName: initialData.types?.[0]?.typeName || '',
                price: initialData.types?.[0]?.variants?.[0]?.price || '',
                stock: initialData.types?.[0]?.variants?.[0]?.stock || '',
                createdAt: initialData.createdAt || '',
                updatedAt: initialData.updatedAt || ''
            });
        }
    }, [initialData]);

    useEffect(() => {
        if (formState.category && formState.weight && formState.typeName) {
            const generatedName = `${formState.category}-${formState.weight}kg-${formState.typeName}`;
            setFormState(prevState => ({
                ...prevState,
                name: generatedName
            }));
        }
    }, [formState.category, formState.weight, formState.typeName]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormState((prevState) => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = () => {
        const now = new Date().toISOString();
        const productData = {
            name: formState.name,
            category: formState.category,
            types: [
                {
                    typeName: formState.typeName,
                    variants: [
                        {
                            weight: `${formState.weight}kg`,
                            price: parseFloat(formState.price),
                            stock: parseInt(formState.stock)
                        }
                    ]
                }
            ],
            createdAt: formState.createdAt || now,
            updatedAt: now
        };
        onSubmit(productData);
    };

    return (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" mt={5}>
            <Typography variant="h4">{initialData.id ? 'Edit Product' : 'Add Product'}</Typography>
            <TextField
                label="Name"
                name="name"
                value={formState.name}
                margin="normal"
                fullWidth
                disabled
            />
            <TextField
                label="Category"
                name="category"
                value={formState.category}
                onChange={handleChange}
                margin="normal"
                fullWidth
            />
            <TextField
                label="Weight"
                name="weight"
                type="number"
                value={formState.weight}
                onChange={handleChange}
                margin="normal"
                fullWidth
            />
            <TextField
                label="Type Name"
                name="typeName"
                value={formState.typeName}
                onChange={handleChange}
                margin="normal"
                fullWidth
            />
            <TextField
                label="Price"
                name="price"
                type="number"
                value={formState.price}
                onChange={handleChange}
                margin="normal"
                fullWidth
            />
            <TextField
                label="Stock"
                name="stock"
                type="number"
                value={formState.stock}
                onChange={handleChange}
                margin="normal"
                fullWidth
            />
            {initialData.id && (
                <TextField
                    label="Created At"
                    name="createdAt"
                    value={formState.createdAt}
                    margin="normal"
                    fullWidth
                    disabled
                />
            )}
            <Button variant="contained" color="primary" onClick={handleSubmit}>
                {initialData.id ? 'Update Product' : 'Add Product'}
            </Button>
        </Box>
    );
};

export default ProductForm;
