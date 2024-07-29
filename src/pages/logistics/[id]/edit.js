import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../utils/firebase';
import Layout from '../../../layouts';
import { CircularProgress, Box, Typography } from '@mui/material';
import LogisticsForm from '../../../components/logistics/LogisticsForm';

const EditLogisticsPage = () => {
    const router = useRouter();
    const [logistics, setLogistics] = useState(null);
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

        const fetchLogistics = async () => {
            try {
                const logisticsDoc = await getDoc(doc(db, 'logistics', id));
                if (logisticsDoc.exists()) {
                    setLogistics(logisticsDoc.data());
                } else {
                    setError('Logistics equipment not found');
                }
            } catch (err) {
                setError('Failed to fetch logistics equipment');
            } finally {
                setLoading(false);
            }
        };

        fetchLogistics();
    }, [router.isReady, router.query]);

    const handleUpdateLogistics = async (updatedLogistics) => {
        const { id } = router.query;
        const now = new Date().toISOString();
        try {
            await updateDoc(doc(db, 'logistics', id), {
                ...updatedLogistics,
                updatedAt: now,
                createdAt: updatedLogistics.createdAt || now
            });
            router.push(`/logistics/${id}`);
        } catch (err) {
            setError('Failed to update logistics equipment');
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
                <Typography variant="h4">Edit Logistics Equipment</Typography>
                <LogisticsForm initialData={logistics} onSubmit={handleUpdateLogistics} />
            </Box>
        </Layout>
    );
};

export default EditLogisticsPage;
