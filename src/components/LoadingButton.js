import React from 'react';
import { Button, CircularProgress } from '@mui/material';

const LoadingButton = ({ isLoading, onClick, buttonText, sx, disabled }) => (
  <Button
    variant="contained"
    color="primary"
    onClick={onClick}
    disabled={isLoading || disabled} // 로딩 중이거나 비활성화 조건일 때 버튼 비활성화
    sx={sx}
  >
    {isLoading ? <CircularProgress size={24} /> : buttonText}
  </Button>
);

export default LoadingButton;
