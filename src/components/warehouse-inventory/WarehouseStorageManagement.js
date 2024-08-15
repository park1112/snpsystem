import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
    Box,
    Typography,
    Button,
    Container,
    Card,
    CardContent,
    Grid,
    Divider,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
} from '@mui/material';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import AddIcon from '@mui/icons-material/Add';
import AddStorageUnitDialog from './AddStorageUnitDialog';


const WarehouseStorageManagement = () => {
    const [warehouses, setWarehouses] = useState([]);
    const [selectedWarehouseId, setSelectedWarehouseId] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const router = useRouter();

    const fetchWarehouses = async () => {
        try {
            const warehousesCollection = collection(db, 'warehouses');
            const q = query(warehousesCollection, orderBy('name')); // 이름 순으로 창고 정렬
            const warehouseSnapshot = await getDocs(q);
            const warehouseList = await Promise.all(
                warehouseSnapshot.docs.map(async (doc) => {
                    const warehouseData = doc.data();

                    // storage_units를 이름순으로 정렬하여 가져오기
                    const storageUnitsCollection = collection(
                        db,
                        'warehouses',
                        doc.id,
                        'storage_units'
                    );
                    const storageUnitsQuery = query(storageUnitsCollection, orderBy('unitName')); // 이름 순으로 정렬
                    const storageUnitsSnapshot = await getDocs(storageUnitsQuery);
                    const storageUnits = storageUnitsSnapshot.docs.map((unitDoc) =>
                        unitDoc.data()
                    );

                    return { id: doc.id, ...warehouseData, storageUnits };
                })
            );
            console.log('Loaded warehouses with storage units:', warehouseList);
            setWarehouses(warehouseList);
        } catch (error) {
            console.error('Error fetching warehouses:', error);
        }
    };

    useEffect(() => {
        fetchWarehouses();
    }, []);

    const handleOpenDialog = (warehouseId) => {
        setSelectedWarehouseId(warehouseId);
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setSelectedWarehouseId(null);
    };

    const handleStorageUnitAdded = () => {
        fetchWarehouses(); // 저장공간 추가 후 다시 데이터를 가져와서 업데이트
    };

    const handleStorageUnitClick = (warehouseId, unitName, subCollectionDocId) => {
        // 상세 페이지로 이동할 때 쿼리 파라미터로 unitName과 subCollectionDocId 전달
        router.push({
            pathname: `/warehouse-inventory/${warehouseId}/storage-index/`,
            query: { unitName: unitName, subCollectionDocId: subCollectionDocId, warehouseId: warehouseId }
        });
    };

    return (
        <Container maxWidth="lg">
            <Box mt={5}>
                <Typography variant="h4" gutterBottom>
                    창고 관리
                </Typography>
                <Grid container spacing={3}>
                    {warehouses.map((warehouse) => (
                        <Grid item xs={12} key={warehouse.id}>
                            <Card>
                                <CardContent>
                                    <Box display="flex" justifyContent="space-between" alignItems="center">
                                        <Box>
                                            <Typography variant="h6">{warehouse.name}</Typography>
                                            <Typography variant="body2" color="textSecondary">
                                                위치: {warehouse.location || 'N/A'}
                                            </Typography>
                                        </Box>
                                        <IconButton
                                            color="primary"
                                            onClick={() => handleOpenDialog(warehouse.id)}
                                        >
                                            <AddIcon />
                                            <Typography variant="body2" color="primary" sx={{ ml: 1 }}>
                                                저장공간 추가
                                            </Typography>
                                        </IconButton>
                                    </Box>
                                    <Divider sx={{ my: 2 }} />
                                    <TableContainer component={Paper}>
                                        <Table>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>저장공간 이름</TableCell>
                                                    <TableCell align="right">가로 (칸)</TableCell>
                                                    <TableCell align="right">세로 (칸)</TableCell>
                                                    <TableCell align="right">총수량</TableCell>
                                                    <TableCell align="right">바렛트수량</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {warehouse.storageUnits.length > 0 ? (
                                                    warehouse.storageUnits.map((unit, index) => (
                                                        < TableRow
                                                            key={index}
                                                            onClick={() =>
                                                                handleStorageUnitClick(
                                                                    warehouse.id,
                                                                    unit.unitName,
                                                                    unit.id
                                                                )
                                                            }
                                                            sx={{
                                                                '&:hover': {
                                                                    backgroundColor:
                                                                        'rgba(200, 200, 200, 0.5)',
                                                                    cursor: 'pointer',
                                                                },
                                                            }}
                                                        >  <TableCell component="th" scope="row">
                                                                {warehouse.unitName}
                                                            </TableCell>
                                                            <TableCell component="th" scope="row">
                                                                {unit.unitName}
                                                            </TableCell>
                                                            <TableCell align="right">
                                                                {unit.width}
                                                            </TableCell>
                                                            <TableCell align="right">
                                                                {unit.height}
                                                            </TableCell>
                                                            <TableCell align="right">
                                                                {unit.totalCapacity}
                                                            </TableCell>
                                                            <TableCell align="right">
                                                                {unit.palletCount}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                ) : (
                                                    <TableRow>
                                                        <TableCell colSpan={5} align="center">
                                                            저장공간이 없습니다.
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Box>

            {/* 저장공간 추가 다이얼로그 */}
            <AddStorageUnitDialog
                open={dialogOpen}
                onClose={handleCloseDialog}
                warehouseId={selectedWarehouseId}
                onStorageUnitAdded={handleStorageUnitAdded}
            />
        </Container >
    );
};

export default WarehouseStorageManagement;
