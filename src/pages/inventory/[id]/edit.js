import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../utils/firebase';
import Layout from '../../../layouts';
import { CircularProgress, Box, Typography } from '@mui/material';
import InventoryForm from '../../../components/inventory/InventoryForm';

const EditInventoryPage = () => {
    const router = useRouter();
    const [inventory, setInventory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!router.isReady) {
            return;
        }

        const { id } = router.query;

        if (!id) {
            setError('No ID found in query');
            setLoading(false);
            return;
        }

        const fetchInventory = async () => {
            try {
                const inventoryDoc = await getDoc(doc(db, 'inventory', id));
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

        fetchInventory();
    }, [router.isReady, router.query]);

    const handleUpdateInventory = async (updatedInventory) => {
        const { id } = router.query;
        const now = new Date().toISOString();
        try {
            await updateDoc(doc(db, 'inventory', id), {
                ...updatedInventory,
                updatedAt: now,
                createdAt: updatedInventory.createdAt || now
            });
            router.push(`/inventory/${id}`);
        } catch (err) {
            setError('Failed to update inventory');
        }
    };

    if (loading) {
        return (
            <Layout>
                <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                    <CircularProgress />
                </Box>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout>
                <Typography variant="h6" color="error">
                    {error}
                </Typography>
            </Layout>
        );
    }

    return (
        <Layout>
            <Box mt={5}>
                <Typography variant="h4">Edit Inventory</Typography>
                <InventoryForm initialData={inventory} onSubmit={handleUpdateInventory} />
            </Box>
        </Layout>
    );
};

export default EditInventoryPage;
