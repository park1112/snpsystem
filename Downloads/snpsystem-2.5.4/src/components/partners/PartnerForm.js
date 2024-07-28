import { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography } from '@mui/material';

const PartnerForm = ({ initialData = {}, onSubmit }) => {
    const [formState, setFormState] = useState({
        name: '',
        category: '',
        master: '',
        phone: '',
        paymentMethod: '',
        createdAt: '',
        updatedAt: ''
    });

    useEffect(() => {
        if (initialData && Object.keys(initialData).length > 0) {
            setFormState({
                name: initialData.name || '',
                category: initialData.category || '',
                master: initialData.master || '',
                phone: initialData.phone || '',
                paymentMethod: initialData.paymentMethod || '',
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
            <Typography variant="h4">{initialData.id ? 'Edit Partner' : 'Add Partner'}</Typography>
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
                label="Master"
                name="master"
                value={formState.master}
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
                label="Payment Method"
                name="paymentMethod"
                value={formState.paymentMethod}
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
                {initialData.id ? 'Update Partner' : 'Add Partner'}
            </Button>
        </Box>
    );
};

export default PartnerForm;
