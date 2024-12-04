import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Grid, Card, CardContent, Typography, Box, CircularProgress, TableCell } from '@mui/material';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import Layout from '../../layouts';

function WarehouseInventorySelectList() {
    const [warehouses, setWarehouses] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchWarehouses = async () => {
            setLoading(true);
            try {
                const warehouseSnapshot = await getDocs(collection(db, 'warehouses'));
                let warehouseData = warehouseSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                // 이름순으로 정렬
                warehouseData = warehouseData.sort((a, b) => a.name.localeCompare(b.name));

                setWarehouses(warehouseData);
            } catch (error) {
                console.error('창고 데이터를 불러오는 데 실패했습니다.', error);
            } finally {
                setLoading(false);
            }
        };

        fetchWarehouses();
    }, []);

    const handleClick = (id) => {
        router.push(`/warehouse-inventory-select/${id}`);
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
            </Box>
        );
    }

    return (


        <Box sx={{ flexGrow: 1, p: 3 }}>
            <Typography variant="h3" gutterBottom>
                투입 창고 선택
            </Typography>
            <Box mb={6}>
                <Typography variant="h4" gutterBottom>
                    창고를 선택해주세요
                </Typography>
            </Box>
            <Grid container spacing={3} justifyContent="center">
                {warehouses.map((warehouse) => (
                    <Grid item xs={12} sm={6} md={4} key={warehouse.id} display="flex" justifyContent="center">
                        <Card
                            onClick={() => handleClick(warehouse.id)}
                            sx={{
                                cursor: 'pointer',
                                borderRadius: 2,
                                boxShadow: 3,
                                width: '100%', // 카드 넓이를 100%로 설정
                                height: '150px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                '&:hover': {
                                    boxShadow: 6,
                                }
                            }}
                        >
                            <CardContent sx={{ textAlign: 'center' }}>
                                <Typography variant="h6" component="div">
                                    {warehouse.name}
                                </Typography>
                                <Typography color="text.secondary">
                                    {warehouse.location}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {warehouse.managerName}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}

export default WarehouseInventorySelectList;
