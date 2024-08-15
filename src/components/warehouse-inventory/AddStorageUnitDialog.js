import React, { useState } from 'react';
import { Box, Typography, TextField, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { collection, addDoc, setDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import { useSnackbar } from 'notistack';

const AddStorageUnitDialog = ({ open, onClose, warehouseId, onStorageUnitAdded }) => {
    const [unitName, setUnitName] = useState('');
    const [width, setWidth] = useState('');
    const [height, setHeight] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { enqueueSnackbar } = useSnackbar();

    const resetFields = () => {
        setUnitName('');
        setWidth('');
        setHeight('');
        setError(null);
    };

    const handleAddStorageUnit = async () => {
        if (!unitName || !width || !height) {
            setError('모든 필드를 입력해주세요.');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const storageUnitRef = collection(db, `warehouses/${warehouseId}/storage_units`);
            const newDocRef = doc(storageUnitRef); // 새 문서 참조 생성
            await setDoc(newDocRef, {
                id: newDocRef.id,  // 문서 ID를 데이터에 포함
                unitName,
                width,
                height,
                createdAt: Timestamp.now(),
            });

            enqueueSnackbar('저장공간 추가에 성공했습니다!', { variant: 'success' });
            onStorageUnitAdded(); // 저장 후 상위 컴포넌트에 알림
            resetFields(); // 필드 초기화
            setLoading(false);
            onClose(); // 다이얼로그 닫기

            console.log("Created storage unit with ID: ", newDocRef.id);
        } catch (error) {
            console.error('Error adding storage unit: ', error);
            enqueueSnackbar('저장공간 추가에 실패했습니다.', { variant: 'error' });
            setError('저장공간 추가에 실패했습니다.');
            setLoading(false);
        }
    };

    const handleDialogClose = () => {
        resetFields(); // 다이얼로그 닫을 때 필드 초기화
        onClose(); // 다이얼로그 닫기
    };

    return (
        <Dialog open={open} onClose={handleDialogClose} maxWidth="sm" fullWidth>
            <DialogTitle>저장공간 추가</DialogTitle>
            <DialogContent>
                <TextField
                    label="창고 이름"
                    value={unitName}
                    onChange={(e) => setUnitName(e.target.value)}
                    margin="normal"
                    fullWidth
                />
                <TextField
                    label="가로칸 수량"
                    type="number"
                    value={width}
                    onChange={(e) => setWidth(e.target.value)}
                    margin="normal"
                    fullWidth
                />
                <TextField
                    label="세로칸 크기"
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    margin="normal"
                    fullWidth
                />
                {error && (
                    <Typography variant="body2" color="error" gutterBottom>
                        {error}
                    </Typography>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleDialogClose} color="secondary">
                    취소
                </Button>
                <Button
                    onClick={handleAddStorageUnit}
                    color="primary"
                    variant="contained"
                    disabled={loading}
                >
                    {loading ? <CircularProgress size={24} /> : '저장공간 추가'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddStorageUnitDialog;
