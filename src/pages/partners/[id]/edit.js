import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../utils/firebase';
import Layout from '../../../layouts';
import { CircularProgress, Box, Typography } from '@mui/material';
import PartnerForm from '../../../components/partners/PartnerForm';

const EditPartnerPage = () => {
    const router = useRouter();
    const [partner, setPartner] = useState(null);
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

        const fetchPartner = async () => {
            try {
                const partnerDoc = await getDoc(doc(db, 'partners', id));
                if (partnerDoc.exists()) {
                    setPartner(partnerDoc.data());
                } else {
                    setError('Partner not found');
                }
            } catch (err) {
                setError('Failed to fetch partner');
            } finally {
                setLoading(false);
            }
        };

        fetchPartner();
    }, [router.isReady, router.query]);

    const handleUpdatePartner = async (updatedPartner) => {
        const { id } = router.query;
        const now = new Date().toISOString();
        try {
            await updateDoc(doc(db, 'partners', id), {
                ...updatedPartner,
                updatedAt: now,
                createdAt: updatedPartner.createdAt || now
            });
            router.push(`/partners/${id}`);
        } catch (err) {
            setError('Failed to update partner');
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
                <Typography variant="h4">Edit Partner</Typography>
                <PartnerForm initialData={partner} onSubmit={handleUpdatePartner} />
            </Box>
        </Layout>
    );
};

export default EditPartnerPage;
