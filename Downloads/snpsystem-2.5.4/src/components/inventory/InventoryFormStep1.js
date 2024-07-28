import { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Button } from '@mui/material';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import ReusableButton from '../ReusableButton';
import { INVENTORY_STATUS, INVENTORY_STATUS_KOREAN, getEnglishStatus } from '../../utils/inventoryStatus';

const InventoryFormStep1 = ({ onSelect }) => {
  const [data, setData] = useState({
    warehouses: [],
    logistics: [],
    loading: true,
    error: null,
  });
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [selectedLogistics, setSelectedLogistics] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [warehousesSnapshot, logisticsSnapshot] = await Promise.all([
          getDocs(collection(db, 'warehouses')),
          getDocs(collection(db, 'logistics')),
        ]);

        setData({
          warehouses: warehousesSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })),
          logistics: logisticsSnapshot.docs
            .map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }))
            .filter((logistic) => logistic.category === '바렛트'),
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
    const selectedLogisticsData = data.logistics.find((l) => l.name === selectedLogistics);

    const selectedData = {
      warehouseUid: selectedWarehouseData.id,
      warehouseName: selectedWarehouse,
      logisticsUid: selectedLogisticsData.id,
      logisticsName: selectedLogistics,
      status: getEnglishStatus(selectedStatus),
    };
    onSelect(selectedData);
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" mt={5}>
      <Typography variant="h4">Select Warehouse, Logistics and Status</Typography>

      <Typography variant="h6" mt={2}>
        Select Warehouse
      </Typography>
      <ReusableButton
        label="Select Warehouse"
        options={data.warehouses.map((warehouse) => warehouse.name)}
        onSelect={(option) => setSelectedWarehouse(option)}
      />

      <Typography variant="h6" mt={2}>
        Select Logistics
      </Typography>
      <ReusableButton
        label="Select Logistics"
        options={data.logistics.map((logistic) => logistic.name)}
        onSelect={(option) => setSelectedLogistics(option)}
      />

      <Typography variant="h6" mt={2}>
        Select Status
      </Typography>
      <ReusableButton
        label="Select Status"
        options={Object.values(INVENTORY_STATUS_KOREAN)}
        onSelect={(option) => setSelectedStatus(option)}
      />

      <Button variant="contained" color="primary" onClick={handleSubmit} sx={{ mt: 3 }}>
        Next
      </Button>
    </Box>
  );
};

export default InventoryFormStep1;
