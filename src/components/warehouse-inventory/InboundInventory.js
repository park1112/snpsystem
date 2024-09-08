import { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Button } from '@mui/material';
import { collection, getDocs, where, query } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import ReusableButton from '../ReusableButton';
import { INBOUND_STATUS_KOREAN, getEnglishStatus } from '../../utils/inventoryStatus';

const InboundInventory = ({ onSelect }) => {
    const [data, setData] = useState({
        warehouses: [],
        categories: [],
        loading: true,
        error: null,
    });
    const [selectedWarehouse, setSelectedWarehouse] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');



    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productsSnapshot] = await Promise.all([

                    getDocs(collection(db, 'products')),
                ]);
                // 창고 데이터를 가져올 때 status가 true인 창고만 가져옵니다.
                const warehouseQuery = query(collection(db, 'warehouses'), where("status", "==", true));
                const warehousesSnapshot = await getDocs(warehouseQuery);
                // 창고 데이터를 가져올 때 status가 true인 창고만 가져옵니다.

                const categories = [...new Set(productsSnapshot.docs.map((doc) => doc.data().category))];

                setData({
                    warehouses: warehousesSnapshot.docs.map((doc) => ({
                        id: doc.id,
                        ...doc.data(),
                    })),
                    categories: categories,

                    loading: false,
                    error: null,
                });
            } catch (error) {
                console.error('Error fetching data:', error);
                setData((prevState) => ({ ...prevState, loading: false, error: 'Failed to load data' }));
            }
        };

        fetchData();
    }, []);

    if (data.loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
            </Box>
        );
    }

    if (data.error) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <Typography variant="h6" color="error">
                    {data.error}
                </Typography>
            </Box>
        );
    }

    const handleSubmit = () => {
        const selectedWarehouseData = data.warehouses.find((w) => w.name === selectedWarehouse);

        const selectedData = {
            warehouseUid: selectedWarehouseData.id,
            warehouseCode: selectedWarehouseData.warehouseCode,
            warehouseName: selectedWarehouse,
            category: selectedCategory,
            status: getEnglishStatus(selectedStatus),

        };
        onSelect(selectedData);
    };

    return (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" mt={5}>
            <Typography variant="h4">Select Warehouse, Category, and Status</Typography>

            <Typography variant="h6" mt={2}>
                Select Warehouse
            </Typography>
            <ReusableButton
                label="Select Warehouse"
                options={data.warehouses.map((warehouse) => warehouse.name)}
                onSelect={(option) => setSelectedWarehouse(option)}
            />

            <Typography variant="h6" mt={2}>
                Select Product Category
            </Typography>
            <ReusableButton
                label="Select Category"
                options={data.categories}
                onSelect={(option) => setSelectedCategory(option)}
            />

            <Typography variant="h6" mt={2}>
                Select Status
            </Typography>
            <ReusableButton
                label="Select Status"
                options={Object.values(INBOUND_STATUS_KOREAN)}
                onSelect={(option) => setSelectedStatus(option)}
            />




            <Button variant="contained" color="primary" onClick={handleSubmit} sx={{ mt: 3 }}>
                Next
            </Button>
        </Box>
    );
};

export default InboundInventory;
