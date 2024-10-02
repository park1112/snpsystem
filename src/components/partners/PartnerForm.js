import { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography } from '@mui/material';

const PartnerForm = ({ initialData = {}, onSubmit }) => {
  const [formState, setFormState] = useState({
    name: '',
    category: '',
    master: '',
    address: '',
    phone: '',
    paymentMethod: '',
    createdAt: '',
    updatedAt: '',
  });

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormState({
        name: initialData.name || '',
        category: initialData.category || '',
        master: initialData.master || '',
        address: initialData.address || '',
        phone: initialData.phone || '',
        paymentMethod: initialData.paymentMethod || '',
        createdAt: initialData.createdAt || '',
        updatedAt: initialData.updatedAt || '',
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState((prevState) => ({
      ...prevState,
      [name]: value,
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
      <Typography variant="h4">{initialData.id ? '거래처 수정' : '거래처 생성'}</Typography>
      <TextField label="Name" name="name" value={formState.name} onChange={handleChange} margin="normal" fullWidth />
      <TextField
        label="카테고리(시장,개인상회,이마트,푸드엔,법인,농가)"
        name="category"
        value={formState.category}
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
      <TextField label="전화번호" name="phone" value={formState.phone} onChange={handleChange} margin="normal" fullWidth />
      <TextField
        label="주소"
        name="address"
        value={formState.address}
        onChange={handleChange}
        margin="normal"
        fullWidth
      />
      <TextField
        label="계좌정보 작성방법 =  농협:(김광인)841816-52-070861 "
        name="paymentMethod"
        value={formState.paymentMethod}
        onChange={handleChange}
        margin="normal"
        fullWidth
      />
      {initialData.id && (
        <TextField label="Created At" name="createdAt" value={formState.createdAt} margin="normal" fullWidth disabled />
      )}
      <Button variant="contained" color="primary" onClick={handleSubmit}>
        {initialData.id ? '거래처 업데이트' : '거래처 생성'}
      </Button>
    </Box>
  );
};

export default PartnerForm;
