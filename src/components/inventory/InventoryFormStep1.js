import { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Button } from '@mui/material';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import ReusableButton from '../ReusableButton';

const InventoryFormStep1 = ({ onSelect }) => {
    const [data, setData] = useState({
        warehouses: [],
        teams: [],
        logistics: [],
        loading: true,
        error: null,
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [warehousesSnapshot, teamsSnapshot, logisticsSnapshot] = await Promise.all([
                    getDocs(collection(db, 'warehouses')),
                    getDocs(collection(db, 'teams')),
                    getDocs(collection(db, 'logistics')),
                ]);

                setData({
                    warehouses: warehousesSnapshot.docs.map((doc) => doc.data()),
                    teams: teamsSnapshot.docs.map((doc) => doc.data()),
                    logistics: logisticsSnapshot.docs.map((doc) => doc.data()),
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
        const selectedData = {
            warehouseName: data.selectedWarehouse,
            teamName: data.selectedTeam,
            logisticsName: data.selectedLogistics,
        };
        onSelect(selectedData);
    };

    return (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" mt={5}>
            <Typography variant="h4">Select Warehouse and Team</Typography>

            <Typography variant="h6" mt={2}>Select Warehouse</Typography>
            <ReusableButton
                label="Select Warehouse"
                options={data.warehouses.map((warehouse) => warehouse.name)}
                onSelect={(option) => setData((prevState) => ({ ...prevState, selectedWarehouse: option }))}
            />

            <Typography variant="h6" mt={2}>Select Team</Typography>
            <ReusableButton
                label="Select Team"
                options={data.teams.map((team) => team.name)}
                onSelect={(option) => setData((prevState) => ({ ...prevState, selectedTeam: option }))}
            />

            <Typography variant="h6" mt={2}>Select Logistics</Typography>
            <ReusableButton
                label="Select Logistics"
                options={data.logistics.map((logistic) => logistic.name)}
                onSelect={(option) => setData((prevState) => ({ ...prevState, selectedLogistics: option }))}
            />

            <Button variant="contained" color="primary" onClick={handleSubmit} sx={{ mt: 3 }}>
                Next
            </Button>
        </Box>
    );
};

export default InventoryFormStep1;
