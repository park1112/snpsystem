import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { doc, getDoc } from 'firebase/firestore';
import {
    Box, Typography, CircularProgress, Paper, Grid, Divider, Table,
    TableBody, TableCell, TableContainer, TableHead, TableRow, Modal
} from '@mui/material';
import { db } from '../../utils/firebase';

const InboundInventoryDetails = () => {
    const [inboundInventory, setInboundInventory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openImage, setOpenImage] = useState(null);
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

    const handleOpenImage = (imageUrl) => setOpenImage(imageUrl);
    const handleCloseImage = () => setOpenImage(null);

    if (loading) return <Box display="flex" justifyContent="center" alignItems="center" height="100vh"><CircularProgress /></Box>;
    if (error) return <Box display="flex" justifyContent="center" alignItems="center" height="100vh"><Typography variant="h6" color="error">{error}</Typography></Box>;

    return (
        <Box sx={{ height: '100vh', overflow: 'auto', py: 5 }}>
            <Typography variant="h4" gutterBottom align="center">입고 인보이스</Typography>
            {inboundInventory && (
                <Paper sx={{ p: 4, boxShadow: 3, maxWidth: '900px', margin: 'auto' }}>
                    {/* Header Section */}
                    <Grid container spacing={2} mb={4}>
                        <Grid item xs={6}>
                            <Typography variant="h6" gutterBottom>입고 코드</Typography>
                            <Typography>{inboundInventory.itemCode || 'N/A'}</Typography>
                        </Grid>
                        <Grid item xs={6} textAlign="right">
                            <Typography variant="h6" gutterBottom>작성자</Typography>
                            <Typography>{inboundInventory.userName || 'N/A'}</Typography>
                        </Grid>

                    </Grid>

                    {/* 작성자 및 상태 정보 */}
                    <Grid container spacing={2} mb={4}>
                        <Grid item xs={6}>
                            <Typography variant="h6" gutterBottom>상태</Typography>
                            <Typography>{inboundInventory.status || 'N/A'}</Typography>
                        </Grid>

                        <Grid item xs={6} textAlign="right">
                            <Typography variant="h6" gutterBottom>창고 정보</Typography>
                            <Typography>{inboundInventory.warehouseName || 'N/A'}</Typography>
                            <Typography>
                                {inboundInventory.createdAt?.toDate().toLocaleString('ko-KR', {
                                    year: 'numeric', month: 'long', day: 'numeric',
                                    hour: '2-digit', minute: '2-digit'
                                }) || 'N/A'}
                            </Typography>
                        </Grid>
                    </Grid>

                    <Divider sx={{ mb: 4 }} />

                    {/* 작업팀 정보 */}
                    <Typography variant="h6" gutterBottom>작업팀 정보</Typography>
                    <Typography>{inboundInventory.teamName || '없음'}</Typography>

                    <Divider sx={{ my: 4 }} />

                    {/* 운송사 정보 */}
                    <Typography variant="h6" gutterBottom>운송사 정보</Typography>
                    {inboundInventory.transportInfo ? (
                        <>
                            <Typography>차량 번호: {inboundInventory.transportInfo.vehicleNumber || 'N/A'}</Typography>
                            <Typography>기사 이름: {inboundInventory.transportInfo.name || 'N/A'}</Typography>
                            <Typography>연락처: {inboundInventory.transportInfo.phone || 'N/A'}</Typography>
                            <Typography>운송료: {inboundInventory.transportInfo.transportFee || 'N/A'}</Typography>
                            <Typography>운임지급주체: {inboundInventory.transportInfo.paymentResponsible || 'N/A'}</Typography>
                        </>
                    ) : (
                        <Typography>운송사 정보가 없습니다.</Typography>
                    )}

                    <Divider sx={{ my: 4 }} />

                    {/* Image Gallery Section */}
                    {inboundInventory.images && inboundInventory.images.length > 0 && (
                        <>
                            <Typography variant="h6" gutterBottom>등록된 사진</Typography>
                            <Grid container spacing={2}>
                                {inboundInventory.images.map((image, index) => (
                                    <Grid item xs={6} sm={4} md={3} key={index}>
                                        <Box
                                            sx={{
                                                width: '100%',
                                                paddingTop: '100%',
                                                position: 'relative',
                                                cursor: 'pointer',
                                                '&:hover': { opacity: 0.8 },
                                            }}
                                            onClick={() => handleOpenImage(image)}
                                        >
                                            <img
                                                src={image}
                                                alt={`Uploaded image ${index + 1}`}
                                                loading="lazy"
                                                style={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover',
                                                }}
                                            />
                                        </Box>
                                    </Grid>
                                ))}
                            </Grid>
                            <Divider sx={{ my: 4 }} />
                        </>
                    )}

                    {/* Product Information Table */}
                    <Typography variant="h6" gutterBottom>상품 정보</Typography>
                    <TableContainer component={Paper} sx={{ boxShadow: 1, mb: 4 }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>상품명</TableCell>
                                    <TableCell align="right">중량 (kg)</TableCell>
                                    <TableCell align="right">타입</TableCell>
                                    <TableCell align="right">수량</TableCell>
                                    <TableCell>거래처</TableCell>
                                    <TableCell>거래처 종류</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {inboundInventory.products && inboundInventory.products.length > 0 ? (
                                    inboundInventory.products.map((product, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{product.productName}</TableCell>
                                            <TableCell align="right">{product.productWeight}</TableCell>
                                            <TableCell align="right">{product.productType}</TableCell>
                                            <TableCell align="right">{product.quantity}</TableCell>
                                            <TableCell>{product.partnerName || 'N/A'}</TableCell>
                                            <TableCell>{product.partnerCategory || 'N/A'}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center">상품 정보가 없습니다.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <Divider sx={{ mb: 4 }} />

                    {/* Pallet Information Section */}
                    <Typography variant="h6" gutterBottom>파렛트 정보</Typography>
                    {inboundInventory.pallet ? (
                        <Paper sx={{ p: 3, mb: 4 }}>
                            <Typography variant="body1" gutterBottom>파렛트 이름: {inboundInventory.pallet.name || 'N/A'}</Typography>
                            <Typography variant="body1" gutterBottom>파렛트 수량: {inboundInventory.pallet.quantity || 'N/A'}</Typography>
                        </Paper>
                    ) : (
                        <Typography variant="body2">파렛트 정보가 없습니다.</Typography>
                    )}

                    {/* Footer Section */}
                    <Box mt={3}>
                        <Typography variant="body2" color="textSecondary">이 인보이스는 자동 생성되었습니다.</Typography>
                    </Box>
                </Paper>
            )}

            {/* Image Modal */}
            <Modal
                open={!!openImage}
                onClose={handleCloseImage}
                aria-labelledby="image-modal"
                aria-describedby="fullscreen image view"
            >
                <Box sx={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    bgcolor: 'rgba(0, 0, 0, 0.9)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>
                    <img
                        src={openImage}
                        alt="Fullscreen view"
                        style={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            objectFit: 'contain',
                        }}
                        onClick={handleCloseImage}
                    />
                </Box>
            </Modal>
        </Box>
    );
};

export default InboundInventoryDetails;