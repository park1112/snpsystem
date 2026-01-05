import { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../utils/firebase';

const WarehouseDetail = ({ warehouseId }) => {
    const [warehouse, setWarehouse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchWarehouse = async () => {
            setLoading(true);
            try {
                const warehouseDoc = await getDoc(doc(db, 'warehouses', warehouseId));
                if (warehouseDoc.exists()) {
                    setWarehouse(warehouseDoc.data());
                } else {
                    setError('Warehouse not found');
                }
            } catch (err) {
                setError('Failed to fetch warehouse');
            } finally {
                setLoading(false);
            }
        };

        if (warehouseId) {
            fetchWarehouse();
        }
    }, [warehouseId]);

    if (loading) {
        return <Typography variant="h6">Loading...</Typography>;
    }

    if (error) {
        return <Typography variant="h6" color="error">{error}</Typography>;
    }

    return (
        <Box mt={5}>
            {warehouse ? (
                <>
                    <Typography variant="h4">{warehouse.name}</Typography>
                    <Typography variant="h6">master: {warehouse.master}</Typography>
                    <Typography variant="h6">Phone: {warehouse.phone}</Typography>
                    <Typography variant="h6">Registration Number: {warehouse.registrationNumber}</Typography>
                    <Typography variant="h6">Created By: {warehouse.createdBy}</Typography>
                    <Typography variant="h6">Updated By: {warehouse.updatedBy}</Typography>
                </>
            ) : (
                <Typography variant="h6">No warehouse data available</Typography>
            )}
        </Box>
    );
};

export default WarehouseDetail;
