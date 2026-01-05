import { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../utils/firebase';

const PartnerDetail = ({ partnerId }) => {
    const [partner, setPartner] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPartner = async () => {
            setLoading(true);
            try {
                const partnerDoc = await getDoc(doc(db, 'partners', partnerId));
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

        if (partnerId) {
            fetchPartner();
        }
    }, [partnerId]);

    if (loading) {
        return <Typography variant="h6">Loading...</Typography>;
    }

    if (error) {
        return <Typography variant="h6" color="error">{error}</Typography>;
    }

    return (
        <Box mt={5}>
            {partner ? (
                <>
                    <Typography variant="h4">{partner.name}</Typography>
                    <Typography variant="h6">Category: {partner.category}</Typography>
                    <Typography variant="h6">Master: {partner.master}</Typography>
                    <Typography variant="h6">Phone: {partner.phone}</Typography>
                    <Typography variant="h6">Payment Method: {partner.paymentMethod}</Typography>
                </>
            ) : (
                <Typography variant="h6">No partner data available</Typography>
            )}
        </Box>
    );
};

export default PartnerDetail;
