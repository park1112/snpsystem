import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, FormControlLabel, Switch, MenuItem, Select, FormControl, InputLabel } from '@mui/material';

const TeamForm = ({ initialData = {}, onSubmit }) => {
    const [formState, setFormState] = useState({
        name: '',
        master: '',
        phone: '',
        accountNumber: '',
        registrationImage: '',
        status: true, // 기본값을 활성화(true)로 설정
        createdBy: '',
        updatedBy: '',
        createdAt: '',
        updatedAt: '',
        division: ''
    });

    useEffect(() => {
        if (initialData && Object.keys(initialData).length > 0) {
            setFormState({
                name: initialData.name || '',
                master: initialData.master || '',
                phone: initialData.phone || '',
                accountNumber: initialData.accountNumber || '',
                registrationImage: initialData.registrationImage || '',
                status: initialData.status !== undefined ? initialData.status : true,
                createdBy: initialData.createdBy || '',
                updatedBy: initialData.updatedBy || '',
                createdAt: initialData.createdAt || '',
                updatedAt: initialData.updatedAt || '',
                division: initialData.division || ''
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

    const handleDivisionChange = (e) => {
        const divisionMap = {
            '상차': 'car',
            '망담기': 'save',
        };

        setFormState((prevState) => ({
            ...prevState,
            division: divisionMap[e.target.value] || ''
        }));
    };

    const handleStatusChange = (e) => {
        setFormState((prevState) => ({
            ...prevState,
            status: e.target.checked
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
            <FormControl fullWidth margin="normal">
                <InputLabel>주요업무</InputLabel>
                <Select
                    name="division"
                    value={formState.division}
                    onChange={handleDivisionChange}
                >
                    <MenuItem value="상차">상차</MenuItem>
                    <MenuItem value="망담기">망담기</MenuItem>
                </Select>
            </FormControl>
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
            <FormControlLabel
                control={
                    <Switch
                        checked={formState.status}
                        onChange={handleStatusChange}
                        name="status"
                        color="primary"
                    />
                }
                label={formState.status ? "활성화" : "비활성화"}
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
