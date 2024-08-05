import { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography } from '@mui/material';

const WarehouseForm = ({ initialData = {}, onSubmit }) => {
    const [formState, setFormState] = useState({
        name: '',
        master: '',
        phone: '',
        registrationNumber: '',
        registrationImage: '',
        createdBy: '',
        updatedBy: '',
        createdAt: '',
        updatedAt: ''
    });

    useEffect(() => {
        if (initialData && Object.keys(initialData).length > 0) {
            setFormState({
                name: initialData.name || '',
                master: initialData.master || '',
                phone: initialData.phone || '',
                registrationNumber: initialData.registrationNumber || '',
                registrationImage: initialData.registrationImage || '',
                createdBy: initialData.createdBy || '',
                updatedBy: initialData.updatedBy || '',
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
            <Typography variant="h4">{initialData.id ? 'Edit Warehouse' : 'Add Warehouse'}</Typography>
            <TextField
                label="Warehouse Name"
                name="name"
                value={formState.name}
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
                label="Registration Number"
                name="registrationNumber"
                value={formState.registrationNumber}
                onChange={handleChange}
                margin="normal"
                fullWidth
            />
            <TextField
                label="Registration Image URL"
                name="registrationImage"
                value={formState.registrationImage}
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
                {initialData.id ? 'Update Warehouse' : 'Add Warehouse'}
            </Button>
        </Box>
    );
};

export default WarehouseForm;
