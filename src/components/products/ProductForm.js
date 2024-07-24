import { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography } from '@mui/material';

const ProductForm = ({ initialData = {}, onSubmit }) => {
    const [formState, setFormState] = useState({
        name: '',
        category: '',
        typeName: '',
        variantName: '',
        price: '',
        stock: ''
    });

    useEffect(() => {
        if (initialData && Object.keys(initialData).length > 0) {
            setFormState({
                name: initialData.name || '',
                category: initialData.category || '',
                typeName: initialData.types?.[0]?.typeName || '',
                variantName: initialData.types?.[0]?.variants?.[0]?.variantName || '',
                price: initialData.types?.[0]?.variants?.[0]?.price || '',
                stock: initialData.types?.[0]?.variants?.[0]?.stock || ''
            });
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormState((prevState) => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = () => {
        const productData = {
            name: formState.name,
            category: formState.category,
            types: [
                {
                    typeName: formState.typeName,
                    variants: [
                        {
                            variantName: formState.variantName,
                            price: parseFloat(formState.price),
                            stock: parseInt(formState.stock)
                        }
                    ]
                }
            ]
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
                onChange={handleChange}
                margin="normal"
                fullWidth
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
                label="Type Name"
                name="typeName"
                value={formState.typeName}
                onChange={handleChange}
                margin="normal"
                fullWidth
            />
            <TextField
                label="Variant Name"
                name="variantName"
                value={formState.variantName}
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
            <Button variant="contained" color="primary" onClick={handleSubmit}>
                {initialData.id ? 'Update Product' : 'Add Product'}
            </Button>
        </Box>
    );
};

export default ProductForm;
