import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { doc, getDoc } from 'firebase/firestore';
import { Box, Typography, CircularProgress, Paper } from '@mui/material';
import { db } from '../../utils/firebase';

const ShippingDetails = () => {
    const [shipping, setShipping] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const router = useRouter();
    const { id } = router.query;

    useEffect(() => {
        const fetchShipping = async () => {
            if (!id) return;

            try {
                console.log('Fetching shipping details...');
                const shippingDoc = await getDoc(doc(db, 'shipping', id));
                if (shippingDoc.exists()) {
                    setShipping({ id: shippingDoc.id, ...shippingDoc.data() });
                    setLoading(false);
                } else {
                    throw new Error('Shipping not found');
                }
            } catch (error) {
                console.error('Error fetching shipping details:', error);
                setError('Failed to load shipping details');
                setLoading(false);
            }
        };

        fetchShipping();
    }, [id]);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <Typography variant="h6" color="error">
                    {error}
                </Typography>
            </Box>
        );
    }

    return (
        <Box mt={5}>
            <Typography variant="h4" gutterBottom>
                출고 상세
            </Typography>
            {shipping && (
                <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        거래처: {shipping.partnerName}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        날짜: {shipping.shippingDate}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        창고 이름: {shipping.warehouseName || 'N/A'}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        총 수량: {shipping.totalQuantity}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        총 카운트: {shipping.totalCount}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        비고: {shipping.note || 'N/A'}
                    </Typography>
                    <Typography variant="h6" gutterBottom>
                        기사 정보
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        차량 번호: {shipping.transportInfo.vehicleNumber}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        이름: {shipping.transportInfo.name}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        전화 번호: {shipping.transportInfo.phone}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        운송료: {shipping.transportInfo.transportFee}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        운임지급주체: {shipping.transportInfo.paymentResponsible}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        계좌번호: {shipping.transportInfo.accountNumber}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        예금주: {shipping.transportInfo.accountHolder}
                    </Typography>
                </Paper>
            )}
        </Box>
    );
};

export default ShippingDetails;
