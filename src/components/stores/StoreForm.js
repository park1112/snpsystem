// components/stores/StoreForm.js
import React, { useState } from 'react';
import {
  TextField,
  Button,
  Box,
  Typography,
  Grid,
  Paper,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import PropTypes from 'prop-types';
import { Store, LocationOn, Phone, Category } from '@mui/icons-material';

const StoreForm = ({ onSubmit, initialData = {} }) => {
  const [name, setName] = useState(initialData.name || '');
  const [location, setLocation] = useState(initialData.location || '');
  const [contactInfo, setContactInfo] = useState(initialData.contactInfo || '');
  const [type, setType] = useState(initialData.type || '');
  const [otherType, setOtherType] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ name, location, contactInfo, type: type === '기타' ? otherType : type });
  };

  return (
    <Paper elevation={3} sx={{ mt: 4, p: 4, borderRadius: '12px' }}>
      <Typography variant="h4" gutterBottom color="primary" fontWeight="bold">
        {initialData.id ? '마트 수정' : '마트 등록'}
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              label="마트 이름"
              variant="outlined"
              fullWidth
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: VinEco, HAGL 등"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Store color="primary" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="위치"
              variant="outlined"
              fullWidth
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="예: 서울 강남구, 부산 해운대 등"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationOn color="primary" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="연락처 정보"
              variant="outlined"
              fullWidth
              required
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              placeholder="예: 010-1234-5678"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Phone color="primary" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth variant="outlined" required>
              <InputLabel id="store-type-label">유형</InputLabel>
              <Select labelId="store-type-label" value={type} onChange={(e) => setType(e.target.value)} label="유형">
                <MenuItem value="대형마트">대형마트</MenuItem>
                <MenuItem value="식자제마트">식자제마트</MenuItem>
                <MenuItem value="창고형소매점">창고형소매점</MenuItem>
                <MenuItem value="마트">마트</MenuItem>
                <MenuItem value="기타">기타</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          {type === '기타' && (
            <Grid item xs={12}>
              <TextField
                label="기타 유형"
                variant="outlined"
                fullWidth
                required
                value={otherType}
                onChange={(e) => setOtherType(e.target.value)}
                placeholder="기타 유형을 입력하세요"
              />
            </Grid>
          )}
          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              sx={{ mt: 2, py: 1.5, fontWeight: 'bold' }}
            >
              저장
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

StoreForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  initialData: PropTypes.shape({
    name: PropTypes.string,
    location: PropTypes.string,
  }),
};

export default StoreForm;
