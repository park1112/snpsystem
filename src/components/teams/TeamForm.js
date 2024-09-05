import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, FormControlLabel, Switch, MenuItem, Select, FormControl, InputLabel } from '@mui/material';

const DIVISION_MAP = {
    '상차': 'car',
    '망담기': 'save',
    '전체업무': 'staff'
};

const REVERSE_DIVISION_MAP = Object.fromEntries(
    Object.entries(DIVISION_MAP).map(([key, value]) => [value, key])
);

const TeamForm = ({ initialData = {}, onSubmit }) => {
    const [formState, setFormState] = useState({
        name: '',
        master: '',
        phone: '',
        accountNumber: '',
        registrationImage: '',
        status: true,
        division: '',
        createdAt: '',
        updatedAt: '',
    });

    useEffect(() => {
        if (Object.keys(initialData).length > 0) {
            setFormState(prevState => ({
                ...prevState,
                ...initialData,
                status: initialData.status !== undefined ? initialData.status : true,
            }));
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormState(prevState => ({
            ...prevState,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleDivisionChange = (e) => {
        const { value } = e.target;
        setFormState(prevState => ({
            ...prevState,
            division: DIVISION_MAP[value] || value
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
            <Typography variant="h4">{initialData.id ? '작업팀 수정' : '작업팀 추가'}</Typography>
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
                    value={REVERSE_DIVISION_MAP[formState.division] || formState.division}
                    onChange={handleDivisionChange}
                >
                    {Object.keys(DIVISION_MAP).map((key) => (
                        <MenuItem key={key} value={key}>{key}</MenuItem>
                    ))}
                </Select>
            </FormControl>
            <TextField
                label="전화번호"
                name="phone"
                value={formState.phone}
                onChange={handleChange}
                margin="normal"
                fullWidth
            />
            <TextField
                label="계좌번호"
                name="accountNumber"
                value={formState.accountNumber}
                onChange={handleChange}
                margin="normal"
                fullWidth
            />
            <TextField
                label="등록증 이미지 URL"
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
                        onChange={handleChange}
                        name="status"
                        color="primary"
                    />
                }
                label={formState.status ? "활성화" : "비활성화"}
            />
            {initialData.id && (
                <TextField
                    label="생성일"
                    name="createdAt"
                    value={formState.createdAt}
                    margin="normal"
                    fullWidth
                    disabled
                />
            )}
            <Button variant="contained" color="primary" onClick={handleSubmit}>
                {initialData.id ? '작업팀 수정' : '작업팀 추가'}
            </Button>
        </Box>
    );
};

export default TeamForm;