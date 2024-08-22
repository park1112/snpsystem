import { useState, useEffect, useCallback } from 'react';
import { Box, Button, TextField, Typography } from '@mui/material';
import generateUniqueWarehouseCode from '../../utils/generateUniqueWarehouseCode';
const WarehouseForm = ({ initialData = {}, onSubmit }) => {
    const [formState, setFormState] = useState({
        name: '',
        master: '',
        phone: '',
        registrationNumber: '',
        registrationImage: '',
        warehouseCode: '',
        createdBy: '',
        updatedBy: '',
        createdAt: '',
        updatedAt: ''
    });
    const [loading, setLoading] = useState(false);

    const generateWarehouseCode = useCallback(async () => {
        setLoading(true);
        try {
            console.log('Generating new warehouse code...');
            const newCode = await generateUniqueWarehouseCode();
            console.log('Received new warehouse code:', newCode);
            return newCode;
        } catch (error) {
            console.error('Error generating warehouse code:', error);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const initForm = async () => {
            if (initialData && Object.keys(initialData).length > 0) {
                console.log('Initializing form with existing data:', initialData);
                setFormState(prevState => ({
                    ...prevState,
                    ...initialData
                }));
            } else if (!formState.warehouseCode) {
                console.log('Initializing form for new warehouse');
                const newCode = await generateWarehouseCode();
                if (newCode) {
                    setFormState(prevState => ({
                        ...prevState,
                        warehouseCode: newCode
                    }));
                    console.log('Updated form state with new code:', newCode);
                }
            }
        };

        initForm();
    }, [initialData, generateWarehouseCode]);

    const handleSubmit = () => {
        const now = new Date().toISOString();
        const formData = {
            ...formState,
            createdAt: formState.createdAt || now,
            updatedAt: now,
            lastItemNumber: 0, // Initialize lastItemNumber
        };
        onSubmit(formData);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormState((prevState) => ({
            ...prevState,
            [name]: value
        }));
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
            <TextField
                label="Warehouse Code"
                name="warehouseCode"
                value={formState.warehouseCode}
                margin="normal"
                fullWidth
                disabled
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
