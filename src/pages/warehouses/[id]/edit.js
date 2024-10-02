import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../utils/firebase';
import Layout from '../../../layouts';
import { CircularProgress, Box, Typography } from '@mui/material';
import WarehouseForm from '../../../components/warehouses/WarehouseForm';

const EditWarehousePage = () => {
    const router = useRouter();
    const [warehouse, setWarehouse] = useState(null);
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

        const fetchWarehouse = async () => {
            try {
                const warehouseDoc = await getDoc(doc(db, 'warehouses', id));
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

        fetchWarehouse();
    }, [router.isReady, router.query]);

    const handleUpdateWarehouse = async (updatedWarehouse) => {
        const { id } = router.query;
        const now = new Date().toISOString();
        try {
            await updateDoc(doc(db, 'warehouses', id), {
                ...updatedWarehouse,
                updatedAt: now,
                createdAt: updatedWarehouse.createdAt || now
            });
            router.push(`/warehouses/${id}`);
        } catch (err) {
            setError('Failed to update warehouse');
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
                <Typography variant="h4">Edit Warehouse</Typography>
                <WarehouseForm initialData={warehouse} onSubmit={handleUpdateWarehouse} />
            </Box>
        </Layout>
    );
};

export default EditWarehousePage;
