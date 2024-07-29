import { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../utils/firebase';

const LogisticsDetail = ({ logisticsId }) => {
    const [logistics, setLogistics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLogistics = async () => {
            setLoading(true);
            try {
                const logisticsDoc = await getDoc(doc(db, 'logistics', logisticsId));
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

        if (logisticsId) {
            fetchLogistics();
        }
    }, [logisticsId]);

    if (loading) {
        return <Typography variant="h6">Loading...</Typography>;
    }

    if (error) {
        return <Typography variant="h6" color="error">{error}</Typography>;
    }

    return (
        <Box mt={5}>
            {logistics ? (
                <>
                    <Typography variant="h4">{logistics.name}</Typography>
                    <Typography variant="h6">Category: {logistics.category}</Typography>
                    <Typography variant="h6">Company: {logistics.company}</Typography>
                    <Typography variant="h6">Contact Person: {logistics.contactPerson}</Typography>
                    <Typography variant="h6">Phone: {logistics.phone}</Typography>
                    <Typography variant="h6">Price: {logistics.price}</Typography>
                    <Typography variant="h6">Quantity: {logistics.quantity}</Typography>
                    <Typography variant="h6">Account Number: {logistics.accountNumber}</Typography>
                </>
            ) : (
                <Typography variant="h6">No logistics equipment data available</Typography>
            )}
        </Box>
    );
};

export default LogisticsDetail;
