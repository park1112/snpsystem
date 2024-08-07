import { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Button } from '@mui/material';
import { collection, getDocs, where, query } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import ReusableButton from '../ReusableButton';
import { INVENTORY_STATUS_KOREAN, getEnglishStatus } from '../../utils/inventoryStatus';

const InventoryFormStep1 = ({ onSelect }) => {
  const [data, setData] = useState({
    warehouses: [],
    categories: [],
    teams: [], // 작업팀 상태 추가
    loading: true,
    error: null,
  });
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedTeam, setSelectedTeam] = useState(null); // 선택된 팀 상태 추가


  useEffect(() => {
    const fetchData = async () => {
      try {
        const [warehousesSnapshot, productsSnapshot] = await Promise.all([
          getDocs(collection(db, 'warehouses')),
          getDocs(collection(db, 'products')),
        ]);

        // 팀 데이터를 가져올 때 status가 true인 팀만 가져옵니다.
        const teamsQuery = query(collection(db, 'teams'), where("status", "==", true));
        const teamsSnapshot = await getDocs(teamsQuery);
        // 팀 데이터를 가져올 때 status가 true인 팀만 가져옵니다.

        const categories = [...new Set(productsSnapshot.docs.map((doc) => doc.data().category))];
        const teams = teamsSnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
        }));

        setData({
          warehouses: warehousesSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })),
          categories: categories,
          teams: teams,
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
      warehouseName: selectedWarehouse,
      category: selectedCategory,
      status: getEnglishStatus(selectedStatus),
      teamUid: selectedTeam.id, // 선택된 팀의 uid 추가
      teamName: selectedTeam.name, // 선택된 팀의 이름 추가
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
        options={Object.values(INVENTORY_STATUS_KOREAN)}
        onSelect={(option) => setSelectedStatus(option)}
      />

      <Typography variant="h6" mt={2}>
        Select Work Team
      </Typography>
      <ReusableButton
        label="Select Work Team"
        options={data.teams.map((team) => team.name)}
        onSelect={(selectedName) => {
          const selectedTeam = data.teams.find((team) => team.name === selectedName);
          setSelectedTeam(selectedTeam);
        }}
      />

      <Button variant="contained" color="primary" onClick={handleSubmit} sx={{ mt: 3 }}>
        Next
      </Button>
    </Box>
  );
};

export default InventoryFormStep1;
