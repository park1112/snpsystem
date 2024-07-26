import { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../utils/firebase';

const InventoryDetail = ({ inventoryId }) => {
    const [inventory, setInventory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchInventory = async () => {
            setLoading(true);
            try {
                const inventoryDoc = await getDoc(doc(db, 'inventory', inventoryId));
                if (inventoryDoc.exists()) {
                    setInventory(inventoryDoc.data());
                } else {
                    setError('Inventory not found');
                }
            } catch (err) {
                setError('Failed to fetch inventory');
            } finally {
                setLoading(false);
            }
        };

        if (inventoryId) {
            fetchInventory();
        }
    }, [inventoryId]);

    if (loading) {
        return <Typography variant="h6">Loading...</Typography>;
    }

    if (error) {
        return <Typography variant="h6" color="error">{error}</Typography>;
    }

    return (
        <Box mt={5}>
            {inventory ? (
                <>
                    <Typography variant="h4">{inventory.productName}</Typography>
                    <Typography variant="h6">Warehouse: {inventory.warehouseName}</Typography>
                    <Typography variant="h6">Team: {inventory.teamName}</Typography>
                    <Typography variant="h6">Grade: {inventory.grade}</Typography>
                    <Typography variant="h6">Unit: {inventory.unit}</Typography>
                    <Typography variant="h6">Quantity: {inventory.quantity}</Typography>
                    <Typography variant="h6">Logistics: {inventory.logisticsName}</Typography>
                    <Typography variant="h6">Logistics Quantity: {inventory.logisticsQuantity}</Typography>
                    <Typography variant="h6">Created At: {inventory.createdAt}</Typography>
                    <Typography variant="h6">Updated At: {inventory.updatedAt}</Typography>
                </>
            ) : (
                <Typography variant="h6">No inventory data available</Typography>
            )}
        </Box>
    );
};

export default InventoryDetail;
