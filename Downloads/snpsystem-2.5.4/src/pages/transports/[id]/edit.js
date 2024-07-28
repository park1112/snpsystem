import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../utils/firebase';
import Layout from '../../../layouts';
import { CircularProgress, Box, Typography } from '@mui/material';
import TransportForm from '../../../components/transports/TransportForm';

const EditTransportPage = () => {
    const router = useRouter();
    const [transport, setTransport] = useState(null);
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

        const fetchTransport = async () => {
            try {
                const transportDoc = await getDoc(doc(db, 'transports', id));
                if (transportDoc.exists()) {
                    setTransport(transportDoc.data());
                } else {
                    setError('Transport company not found');
                }
            } catch (err) {
                setError('Failed to fetch transport company');
            } finally {
                setLoading(false);
            }
        };

        fetchTransport();
    }, [router.isReady, router.query]);

    const handleUpdateTransport = async (updatedTransport) => {
        const { id } = router.query;
        const now = new Date().toISOString();
        try {
            await updateDoc(doc(db, 'transports', id), {
                ...updatedTransport,
                updatedAt: now,
                createdAt: updatedTransport.createdAt || now
            });
            router.push(`/transports/${id}`);
        } catch (err) {
            setError('Failed to update transport company');
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
                <Typography variant="h4">Edit Transport Company</Typography>
                <TransportForm initialData={transport} onSubmit={handleUpdateTransport} />
            </Box>
        </Layout>
    );
};

export default EditTransportPage;
