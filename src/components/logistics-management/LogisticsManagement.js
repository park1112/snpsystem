import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, TextField, Button, Select, MenuItem, FormControl, InputLabel, Grid, Stack } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';
import { collection, addDoc, query, orderBy, getDocs, Timestamp, deleteDoc, doc, docRef, getDoc } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import { useData } from '../../contexts/DataContext';
import { getKoreaTime, formatKoreaTime, parseKoreaTime } from '../../models/time';
import { updateWarehouseInventory, updateOrDeleteMovement, updateMovement } from '../WarehouseInventoryManager';
import EditIcon from '@mui/icons-material/Edit';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';


const LogisticsManagement = () => {
    const { warehouses, logisticsItems, partners, loading, error, refreshData } = useData();
    const [movements, setMovements] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [newMovement, setNewMovement] = useState({
        state: '',
        warehouseUid: '',
        warehouseName: '',
        logistics_uid: '',
        logistics_name: '',
        quantity: 0,
        unit_price: 0,
        partner_uid: '',
        partner_name: '',
        date: formatKoreaTime(getKoreaTime()),
    });
    const [editMovement, setEditMovement] = useState(null);
    const [originalWarehouseUid, setOriginalWarehouseUid] = useState('');
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

    useEffect(() => {
        fetchMovements();
    }, []);

    const fetchMovements = async () => {
        const q = query(collection(db, 'logistics_movements'), orderBy('date', 'desc'));
        const querySnapshot = await getDocs(q);
        const movementsData = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                date: data.date instanceof Timestamp
                    ? formatKoreaTime(data.date.toDate())
                    : formatKoreaTime(new Date(data.date)),
            };
        });
        setMovements(movementsData);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'warehouseUid') {
            const selectedWarehouse = warehouses.find(w => w.id === value);
            setNewMovement(prev => ({
                ...prev,
                warehouseUid: value,
                warehouseName: selectedWarehouse ? selectedWarehouse.name : ''
            }));
        } else if (name === 'logistics_uid') {
            const selectedLogistics = logisticsItems.find(item => item.id === value);
            setNewMovement(prev => ({
                ...prev,
                logistics_uid: value,
                logistics_name: selectedLogistics ? selectedLogistics.name : '',
                unit_price: selectedLogistics ? selectedLogistics.price || 0 : 0
            }));
        } else {
            setNewMovement(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (!newMovement.warehouseUid || !newMovement.logistics_uid) {
                throw new Error('창고와 물류기기를 선택해주세요.');
            }
            console.log(newMovement);


            const docRef = await addDoc(collection(db, 'logistics_movements'), {
                ...newMovement,
                quantity: Number(newMovement.quantity),
                unit_price: Number(newMovement.unit_price),
                date: Timestamp.fromDate(parseKoreaTime(newMovement.date)),
            });
            await updateWarehouseInventory(
                newMovement.warehouseUid,
                newMovement.logistics_uid,
                newMovement.logistics_name,  // 물류기기 이름 추가
                Number(newMovement.quantity),
                newMovement.state,
                docRef.id
            );
            alert('물류기기 이동이 성공적으로 기록되었습니다.');
            setNewMovement({
                state: '',
                warehouseUid: '',
                warehouseName: '',
                logistics_uid: '',
                logistics_name: '',
                quantity: 0,
                unit_price: 0,
                partner_uid: '',
                partner_name: '',
                date: formatKoreaTime(getKoreaTime()),
            });
            fetchMovements();
        } catch (error) {
            console.error('Error adding movement: ', error);
            alert('물류기기 이동 기록 중 오류가 발생했습니다.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('정말로 이 항목을 삭제하시겠습니까?')) {
            try {
                const movementDocRef = doc(db, 'logistics_movements', id);
                const movementDocSnap = await getDoc(movementDocRef);


                if (movementDocSnap.exists()) {
                    const movementData = movementDocSnap.data();

                    await updateOrDeleteMovement(
                        movementData.warehouseUid,
                        movementData.logistics_uid,
                        {
                            state: movementData.state,
                            quantity: movementData.quantity,
                            movementId: id
                        },
                        null  // 삭제 작업이므로 newMovement는 null
                    );

                    await deleteDoc(movementDocRef);
                    alert('항목이 성공적으로 삭제되었습니다.');
                    fetchMovements();
                } else {
                    throw new Error('문서를 찾을 수 없습니다.');
                }
            } catch (error) {
                console.error('Error deleting document: ', error);
                alert(`항목 삭제 중 오류가 발생했습니다: ${error.message}`);
            }
        }
    };
    const handleEdit = (movement) => {
        setEditMovement(
            movement
        );
        setOriginalWarehouseUid(movement.warehouseUid);
        setIsEditDialogOpen(true);
    };
    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditMovement((prev) => ({ ...prev, [name]: value }));
    };
    const handleEditSubmit = async () => {
        setIsLoading(true);



        try {
            const oldMovement = {
                state: editMovement.state,
                quantity: editMovement.quantity,
                movementId: editMovement.id
            };


            const newMovement = {
                movementId: editMovement.id,
                state: editMovement.state,
                quantity: editMovement.quantity,
                date: new Date(editMovement.date)
            };

            if (editMovement.warehouseUid !== originalWarehouseUid) {
                // 창고가 변경된 경우
                await updateOrDeleteMovement(originalWarehouseUid, editMovement.logistics_uid, oldMovement, null);
                await updateWarehouseInventory(
                    editMovement.warehouseUid,
                    editMovement.logistics_uid,
                    editMovement.logistics_name,
                    newMovement.quantity,
                    newMovement.state,
                    newMovement.movementId
                );
            } else {
                // 창고가 변경되지 않은 경우
                await updateMovement(
                    editMovement.warehouseUid,
                    editMovement.logistics_uid,
                    oldMovement,
                    newMovement
                );
            }

            alert('물류기기 이동이 성공적으로 수정되었습니다.');
            setIsEditDialogOpen(false);
            fetchMovements();
        } catch (error) {
            console.error('Error updating movement: ', error);
            alert('물류기기 이동 수정 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };


    const columns = [
        { field: 'state', headerName: '상태', width: 70 },
        { field: 'warehouseName', headerName: '창고', width: 120 },
        { field: 'logistics_name', headerName: '물류기기', width: 120 },
        { field: 'quantity', headerName: '수량', width: 70, type: 'number' },
        { field: 'unit_price', headerName: '단가', width: 70, type: 'number' },
        { field: 'partner_name', headerName: '거래처', width: 120 },
        { field: 'date', headerName: '날짜', width: 150 },
        {
            field: 'actions',
            headerName: '작업',
            width: 180,
            sortable: false,
            renderCell: (params) => (
                <>
                    <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => handleEdit(params.row)}
                        startIcon={<EditIcon />}
                        sx={{ ml: 1 }}
                    >
                        수정
                    </Button>

                    <Button
                        variant="contained"
                        color="error"
                        size="small"
                        onClick={() => handleDelete(params.row.id)}
                        startIcon={<DeleteIcon />}
                    >
                        삭제
                    </Button>


                </>
            ),
        },
    ];

    if (loading) return <Typography>Loading...</Typography>;
    if (error) return <Typography color="error">{error}</Typography>;

    return (
        <Container maxWidth="lg">
            <Typography variant="h4" component="h1" gutterBottom>
                물류기기 입출고 관리
            </Typography>
            <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <InputLabel>상태</InputLabel>
                            <Select
                                name="state"
                                value={newMovement.state}
                                onChange={handleInputChange}
                                required
                            >
                                <MenuItem value="inbound">입고</MenuItem>
                                <MenuItem value="outbound">출고</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <InputLabel>창고</InputLabel>
                            <Select
                                name="warehouseUid"
                                value={newMovement.warehouseUid}
                                onChange={handleInputChange}
                                required
                            >
                                {warehouses.map((warehouse) => (
                                    <MenuItem key={warehouse.id} value={warehouse.id}>
                                        {warehouse.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <InputLabel>물류기기</InputLabel>
                            <FormControl fullWidth>
                                <InputLabel>물류기기</InputLabel>
                                <Select
                                    name="logistics_uid"
                                    value={newMovement.logistics_uid}
                                    onChange={handleInputChange}
                                    required
                                >
                                    {logisticsItems.map(item => (
                                        <MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="수량"
                            name="quantity"
                            type="number"
                            value={newMovement.quantity}
                            onChange={handleInputChange}
                            required
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="단가"
                            name="unit_price"
                            type="number"
                            value={newMovement.unit_price}
                            onChange={handleInputChange}
                            disabled
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <InputLabel>거래처</InputLabel>
                            <Select
                                name="partner_uid"
                                value={newMovement.partner_uid}
                                onChange={(e) => {
                                    const selectedPartner = partners.find(partner => partner.id === e.target.value);
                                    setNewMovement(prev => ({
                                        ...prev,
                                        partner_uid: e.target.value,
                                        partner_name: selectedPartner.name
                                    }));
                                }}
                            >
                                {partners.map(partner => (
                                    <MenuItem key={partner.id} value={partner.id}>{partner.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="날짜"
                            name="date"
                            type="date"
                            value={newMovement.date}
                            onChange={handleInputChange}
                            InputLabelProps={{
                                shrink: true,
                            }}
                            required
                        />
                    </Grid>
                </Grid>
                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{ mt: 3, mb: 2 }}
                >
                    물류기기 이동 기록
                </Button>
            </Box>
            <Box sx={{ height: 400, width: '100%', mt: 4 }}>
                <DataGrid
                    rows={movements}
                    columns={columns}
                    pageSize={5}
                    rowsPerPageOptions={[5, 10, 20]}
                    disableSelectionOnClick
                    autoHeight
                    components={{
                        NoRowsOverlay: () => (
                            <Stack height="100%" alignItems="center" justifyContent="center">
                                데이터가 없습니다
                            </Stack>
                        ),
                    }}
                />
            </Box>

            <Dialog open={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)}>
                <DialogTitle>물류기기 이동 수정</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel>상태</InputLabel>
                        <Select
                            name="state"
                            value={editMovement?.state || ''}
                            onChange={handleEditChange}
                            required
                        >
                            <MenuItem value="inbound">입고</MenuItem>
                            <MenuItem value="outbound">출고</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel>창고</InputLabel>
                        <Select
                            name="warehouseUid"
                            value={editMovement?.warehouseUid || ''}
                            onChange={handleEditChange}
                            required
                        >
                            {warehouses.map((warehouse) => (
                                <MenuItem key={warehouse.id} value={warehouse.id}>
                                    {warehouse.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel>물류기기</InputLabel>
                        <Select
                            name="logistics_uid"
                            value={editMovement?.logistics_uid || ''}
                            onChange={handleEditChange}
                            required
                        >
                            {logisticsItems.map(item => (
                                <MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField
                        fullWidth
                        label="수량"
                        name="quantity"
                        type="number"
                        value={editMovement?.quantity || ''}
                        onChange={handleEditChange}
                        required
                        sx={{ mt: 2 }}
                    />
                    <TextField
                        fullWidth
                        label="단가"
                        name="unit_price"
                        type="number"
                        value={editMovement?.unit_price || ''}
                        onChange={handleEditChange}
                        disabled
                        sx={{ mt: 2 }}
                    />
                    <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel>거래처</InputLabel>
                        <Select
                            name="partner_uid"
                            value={editMovement?.partner_uid || ''}
                            onChange={(e) => {
                                const selectedPartner = partners.find(partner => partner.id === e.target.value);
                                setEditMovement(prev => ({
                                    ...prev,
                                    partner_uid: e.target.value,
                                    partner_name: selectedPartner.name
                                }));
                            }}
                        >
                            {partners.map(partner => (
                                <MenuItem key={partner.id} value={partner.id}>{partner.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField
                        fullWidth
                        label="날짜"
                        name="date"
                        type="date"
                        value={editMovement?.date || ''}
                        onChange={handleEditChange}
                        InputLabelProps={{
                            shrink: true,
                        }}
                        required
                        sx={{ mt: 2 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsEditDialogOpen(false)} color="secondary">
                        취소
                    </Button>
                    <Button onClick={handleEditSubmit} color="primary">
                        수정
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default LogisticsManagement;


