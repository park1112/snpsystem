import { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography } from '@mui/material';

const TeamForm = ({ initialData = {}, onSubmit }) => {
    const [formState, setFormState] = useState({
        name: '',
        master: '',
        phone: '',
        accountNumber: '',
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
                accountNumber: initialData.accountNumber || '',
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
            <Typography variant="h4">{initialData.id ? 'Edit Team' : 'Add Team'}</Typography>
            <TextField
                label="작업팀 이름"
                name="name"
                value={formState.name}
                onChange={handleChange}
                margin="normal"
                fullWidth
            />
            <TextField
                label="담당자"
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
                label="Account Number"
                name="accountNumber"
                value={formState.accountNumber}
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
                {initialData.id ? 'Update Team' : 'Add Team'}
            </Button>
        </Box>
    );
};

export default TeamForm;
