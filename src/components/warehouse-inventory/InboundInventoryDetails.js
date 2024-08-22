import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { doc, getDoc } from 'firebase/firestore';
import { Box, Typography, CircularProgress, Paper } from '@mui/material';
import { db } from '../../utils/firebase';

const InboundInventoryDetails = () => {
    const [inboundInventory, setInboundInventory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const router = useRouter();
    const { id } = router.query;

    useEffect(() => {
        const fetchInboundInventory = async () => {
            if (!id) return;

            try {
                const inboundDoc = await getDoc(doc(db, 'warehouse_inventory', id));
                if (inboundDoc.exists()) {
                    setInboundInventory({ id: inboundDoc.id, ...inboundDoc.data() });
                    setLoading(false);
                } else {
                    throw new Error('Inbound Inventory not found');
                }
            } catch (error) {
                console.error('Error fetching inbound inventory details:', error);
                setError('Failed to load inbound inventory details');
                setLoading(false);
            }
        };

        fetchInboundInventory();
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
                입고 상세
            </Typography>
            {inboundInventory && (
                <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        No : {inboundInventory.itemCode || 'N/A'}
                    </Typography>
                    <Typography variant="h6" gutterBottom>
                        창고 이름: {inboundInventory.warehouseName || 'N/A'}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        날짜: {inboundInventory.createdAt?.toDate().toLocaleDateString() || 'N/A'}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        상태: {inboundInventory.status}
                    </Typography>

                    <Typography variant="body1" gutterBottom>
                        비고: {inboundInventory.note || ''}
                    </Typography>

                    <Typography variant="h6" gutterBottom>
                        상품 정보
                    </Typography>
                    {inboundInventory.products && inboundInventory.products.length > 0 ? (
                        <Box>
                            {inboundInventory.products.map((product, index) => (
                                <Paper key={index} sx={{ p: 2, mb: 2 }}>
                                    {/* 거래처 */}
                                    <Typography variant="body1" >
                                        거래처: {product.partnerName || 'N/A'}
                                    </Typography>
                                    <Typography variant="body2" gutterBottom>
                                        거래처 종류: {product.partnerCategory || 'N/A'}
                                    </Typography>
                                    {/* 거래처 */}
                                    <Typography variant="body2">
                                        상품명: {product.productName}
                                    </Typography>
                                    <Typography variant="body2">
                                        중량: {product.productWeight}kg
                                    </Typography>
                                    <Typography variant="body2">
                                        타입: {product.productType}
                                    </Typography>
                                    <Typography variant="body2" gutterBottom>
                                        수량: {product.quantity}
                                    </Typography>
                                    {/* 작업팀 */}
                                    <Typography variant="body1" >
                                        작업팀: {product.teamName || 'N/A'}
                                    </Typography>
                                    {/* 작업팀 */}
                                </Paper>
                            ))}
                        </Box>
                    ) : (
                        <Typography variant="body2">상품 정보가 없습니다.</Typography>
                    )}
                </Paper>
            )}
        </Box>
    );
};

export default InboundInventoryDetails;
