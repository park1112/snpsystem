// src/components/CustomTextField.js
import React from 'react';
import TextField from '@mui/material/TextField';

const CustomTextField = ({ label, name, value, onChange, type = 'text', required = true }) => (
        <TextField
            label={label}
            name={name}
            value={value}
            onChange={onChange}
            fullWidth
            required={required}
            margin="normal"
            type={type}
        />
    );

export default CustomTextField;
