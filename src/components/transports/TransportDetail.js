import { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../utils/firebase';

const TransportDetail = ({ transportId }) => {
    const [transport, setTransport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTransport = async () => {
            setLoading(true);
            try {
                const transportDoc = await getDoc(doc(db, 'transports', transportId));
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

        if (transportId) {
            fetchTransport();
        }
    }, [transportId]);

    if (loading) {
        return <Typography variant="h6">Loading...</Typography>;
    }

    if (error) {
        return <Typography variant="h6" color="error">{error}</Typography>;
    }

    return (
        <Box mt={5}>
            {transport ? (
                <>
                    <Typography variant="h4">{transport.name}</Typography>
                    <Typography variant="h6">Vehicle Number: {transport.vehicleNumber}</Typography>
                    <Typography variant="h6">Phone: {transport.phone}</Typography>
                    <Typography variant="h6">Affiliation: {transport.affiliation}</Typography>
                    <Typography variant="h6">Account Number: {transport.accountNumber}</Typography>
                </>
            ) : (
                <Typography variant="h6">No transport company data available</Typography>
            )}
        </Box>
    );
};

export default TransportDetail;
