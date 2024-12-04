import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography,
    Grid, Divider, IconButton, Paper, Box, styled, CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import dayjs from 'dayjs';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../utils/firebase';

const StyledDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(3),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    padding: theme.spacing(2),
}));

const InfoSection = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    backgroundColor: theme.palette.background.default,
}));

const InfoItem = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(1, 0),
}));

const InfoLabel = styled(Typography)(({ theme }) => ({
    fontWeight: 'bold',
    color: theme.palette.text.secondary,
}));

const InfoValue = styled(Typography)(({ theme }) => ({
    color: theme.palette.text.primary,
}));

const ActionButton = styled(Button)(({ theme }) => ({
    marginTop: theme.spacing(2),
}));
const ReturnDetailDialog = ({ open, handleClose, selectedReturn, markets, members, onStatusUpdate }) => {
    const [isUpdating, setIsUpdating] = useState(false);
    const [localReturn, setLocalReturn] = useState(selectedReturn);

    useEffect(() => {
        setLocalReturn(selectedReturn);
    }, [selectedReturn]);

    if (!localReturn) return null;

    const handleStatusUpdate = async (newStatus) => {
        setIsUpdating(true);
        try {
            const returnRef = doc(db, 'returns', localReturn.id);
            await updateDoc(returnRef, {
                receiveStatus: newStatus,
                updatedAt: new Date()
            });
            setLocalReturn(prev => ({ ...prev, receiveStatus: newStatus }));
            if (typeof onStatusUpdate === 'function') {
                onStatusUpdate(localReturn.id, newStatus);
            }
        } catch (error) {
            console.error("상태 업데이트 중 오류 발생:", error);
            alert('상태 업데이트에 실패했습니다. 다시 시도해 주세요.');
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <StyledDialog
            open={open}
            onClose={handleClose}
            aria-labelledby="return-detail-dialog-title"
            maxWidth="sm"
            fullWidth
        >
            <StyledDialogTitle id="return-detail-dialog-title">
                반품 상세 정보
                <IconButton
                    aria-label="close"
                    onClick={handleClose}
                    sx={{ color: 'white' }}
                >
                    <CloseIcon />
                </IconButton>
            </StyledDialogTitle>
            <DialogContent dividers>
                <InfoSection elevation={0}>
                    <Typography variant="h6" gutterBottom>
                        {selectedReturn.productName}
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <InfoItem>
                                <InfoLabel>접수일:</InfoLabel>
                                <InfoValue>{dayjs(selectedReturn.receiptDate).format('YYYY-MM-DD')}</InfoValue>
                            </InfoItem>
                        </Grid>
                        <Grid item xs={6}>
                            <InfoItem>
                                <InfoLabel>반품접수번호:</InfoLabel>
                                <InfoValue>{selectedReturn.returnNumber}</InfoValue>
                            </InfoItem>
                        </Grid>
                    </Grid>
                </InfoSection>

                <InfoSection elevation={0}>
                    <Typography variant="subtitle1" gutterBottom>
                        반품 정보
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <InfoItem>
                                <InfoLabel>수량:</InfoLabel>
                                <InfoValue>{selectedReturn.returnQuantity}</InfoValue>
                            </InfoItem>
                        </Grid>
                        <Grid item xs={6}>
                            <InfoItem>
                                <InfoLabel>금액:</InfoLabel>
                                <InfoValue>{selectedReturn.returnAmount.toLocaleString()}원</InfoValue>
                            </InfoItem>
                        </Grid>
                        <Grid item xs={12}>
                            <InfoItem>
                                <InfoLabel>반품 사유:</InfoLabel>
                                <InfoValue>{selectedReturn.returnReason}</InfoValue>
                            </InfoItem>
                        </Grid>
                    </Grid>
                </InfoSection>

                <InfoSection elevation={0}>
                    <Typography variant="subtitle1" gutterBottom>
                        처리 상태
                    </Typography>
                    <InfoItem>
                        <InfoLabel>상태:</InfoLabel>
                        <InfoValue>{localReturn.receiveStatus}</InfoValue>
                    </InfoItem>
                    {localReturn.receiveStatus === '접수' && (
                        <ActionButton
                            variant="contained"
                            color="primary"
                            onClick={() => handleStatusUpdate('반품완료')}
                            disabled={isUpdating}
                            fullWidth
                        >
                            {isUpdating ? <CircularProgress size={24} /> : '반품완료로 상태 변경'}
                        </ActionButton>
                    )}
                    {localReturn.receiveStatus === '반품완료' && (
                        <ActionButton
                            variant="contained"
                            color="secondary"
                            onClick={() => handleStatusUpdate('접수')}
                            disabled={isUpdating}
                            fullWidth
                        >
                            {isUpdating ? <CircularProgress size={24} /> : '접수 상태로 변경'}
                        </ActionButton>
                    )}
                </InfoSection>


                <InfoSection elevation={0}>
                    <Typography variant="subtitle1" gutterBottom>
                        기타 정보
                    </Typography>
                    <InfoItem>
                        <InfoLabel>오픈마켓:</InfoLabel>
                        <InfoValue>
                            {markets.find(m => m.id === selectedReturn.returnMarket)?.name || '알 수 없음'}
                        </InfoValue>
                    </InfoItem>
                    <InfoItem>
                        <InfoLabel>회원:</InfoLabel>
                        <InfoValue>
                            {members.find(m => m.id === selectedReturn.returnMember)?.name || '알 수 없음'}
                        </InfoValue>
                    </InfoItem>
                </InfoSection>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color="primary">
                    닫기
                </Button>
            </DialogActions>
        </StyledDialog>
    );
};

export default ReturnDetailDialog;