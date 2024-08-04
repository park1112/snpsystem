import { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import Logistic from '../../models/Logistic';

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
          // 모델을 사용하여 데이터 매핑
          const logisticsData = new Logistic(logisticsDoc.data());
          setLogistics(logisticsData);
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
    return (
      <Typography variant="h6" color="error">
        {error}
      </Typography>
    );
  }

  return (
    <Box mt={5}>
      {logistics ? (
        <>
          <Typography variant="h4">{logistics.name}</Typography>
          <Typography variant="h6">Category: {logistics.category}</Typography>
          <Typography variant="h6">Quantity: {logistics.quantity}</Typography>
          <Typography variant="h6">partnerName: {logistics.partnerName}</Typography>
          <Typography variant="h6">price: {logistics.price}</Typography>
        </>
      ) : (
        <Typography variant="h6">No logistics equipment data available</Typography>
      )}
    </Box>
  );
};

export default LogisticsDetail;
