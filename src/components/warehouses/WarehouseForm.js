import { useState, useEffect, useCallback } from 'react';
import { Box, Button, TextField, Typography, Switch, FormControlLabel, Snackbar } from '@mui/material';
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
        updatedAt: '',
        status: true // 기본값을 true(활성)로 설정
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const generateWarehouseCode = useCallback(async () => {
        setLoading(true);
        try {
            console.log('Generating new warehouse code...');
            const newCode = await generateUniqueWarehouseCode();
            console.log('Received new warehouse code:', newCode);
            return newCode;
        } catch (error) {
            console.error('Error generating warehouse code:', error);
            setError('창고 코드 생성 중 오류가 발생했습니다.');
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
                    ...initialData,
                    status: initialData.status ?? true // 기존 데이터의 status가 없으면 true로 설정
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
        if (!formState.name || !formState.master || !formState.phone) {
            setError('필수 필드를 모두 입력해주세요.');
            return;
        }

        const now = new Date().toISOString();
        const formData = {
            ...formState,
            createdAt: formState.createdAt || now,
            updatedAt: now,
            lastItemNumber: formState.lastItemNumber || 0,
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

    const handleStatusChange = (e) => {
        setFormState((prevState) => ({
            ...prevState,
            status: e.target.checked
        }));
    };

    const handleCloseError = () => {
        setError('');
    };

    return (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" mt={5}>
            <Typography variant="h4">{initialData.id ? '창고 수정' : '창고 추가'}</Typography>
            <TextField
                label="창고명"
                name="name"
                value={formState.name}
                onChange={handleChange}
                margin="normal"
                fullWidth
                required
            />
            <TextField
                label="관리자"
                name="master"
                value={formState.master}
                onChange={handleChange}
                margin="normal"
                fullWidth
                required
            />
            <TextField
                label="연락처"
                name="phone"
                value={formState.phone}
                onChange={handleChange}
                margin="normal"
                fullWidth
                required
            />
            <TextField
                label="사업자 등록번호"
                name="registrationNumber"
                value={formState.registrationNumber}
                onChange={handleChange}
                margin="normal"
                fullWidth
            />
            <TextField
                label="사업자 등록증 이미지 URL"
                name="registrationImage"
                value={formState.registrationImage}
                onChange={handleChange}
                margin="normal"
                fullWidth
            />
            <TextField
                label="창고 코드"
                name="warehouseCode"
                value={formState.warehouseCode}
                margin="normal"
                fullWidth
                disabled
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
            <FormControlLabel
                control={
                    <Switch
                        checked={formState.status}
                        onChange={handleStatusChange}
                        name="status"
                        color="primary"
                    />
                }
                label={formState.status ? "활성" : "비활성"}
            />
            <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                disabled={loading}
            >
                {initialData.id ? '창고 수정' : '창고 추가'}
            </Button>
            <Snackbar
                open={!!error}
                autoHideDuration={6000}
                onClose={handleCloseError}
                message={error}
            />
        </Box>
    );
};

export default WarehouseForm;