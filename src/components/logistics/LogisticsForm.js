import { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography } from '@mui/material';

const LogisticsForm = ({ initialData = {}, onSubmit }) => {
    const [formState, setFormState] = useState({
        name: '',
        category: '',
        company: '',
        contactPerson: '',
        phone: '',
        price: '',
        quantity: '',
        accountNumber: '',
        createdAt: '',
        updatedAt: ''
    });

    useEffect(() => {
        if (initialData && Object.keys(initialData).length > 0) {
            setFormState({
                name: initialData.name || '',
                category: initialData.category || '',
                company: initialData.company || '',
                contactPerson: initialData.contactPerson || '',
                phone: initialData.phone || '',
                price: initialData.price || '',
                quantity: initialData.quantity || '',
                accountNumber: initialData.accountNumber || '',
                createdAt: initialData.createdAt || '',
                updatedAt: initialData.updatedAt || ''
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
        const now = new Date().toISOString();
        const formData = {
            ...formState,
            createdAt: formState.createdAt || now,
            updatedAt: now,
        };
        onSubmit(formData);
    };

    return (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" mt={5}>
            <Typography variant="h4">{initialData.id ? 'Edit Logistics Equipment' : 'Add Logistics Equipment'}</Typography>
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
                label="Company"
                name="company"
                value={formState.company}
                onChange={handleChange}
                margin="normal"
                fullWidth
            />
            <TextField
                label="Contact Person"
                name="contactPerson"
                value={formState.contactPerson}
                onChange={handleChange}
                margin="normal"
                fullWidth
            />
            <TextField
                label="Phone"
                name="phone"
                value={formState.phone}
                onChange={handleChange}
                margin="normal"
                fullWidth
            />
            <TextField
                label="Price"
                name="price"
                value={formState.price}
                onChange={handleChange}
                margin="normal"
                fullWidth
            />
            <TextField
                label="Quantity"
                name="quantity"
                value={formState.quantity}
                onChange={handleChange}
                margin="normal"
                fullWidth
            />
            <TextField
                label="Account Number"
                name="accountNumber"
                value={formState.accountNumber}
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
                {initialData.id ? 'Update Logistics Equipment' : 'Add Logistics Equipment'}
            </Button>
        </Box>
    );
};

export default LogisticsForm;
