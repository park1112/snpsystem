import React, { useState, useEffect, useCallback } from 'react';
import { TextField, Autocomplete, Box, CircularProgress, Typography, Paper, Chip } from '@mui/material';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../utils/firebase';
import debounce from 'lodash/debounce';

const TransportForm = ({ transportInfo, setTransportInfo, isNewDriver, setIsNewDriver }) => {
    const [transports, setTransports] = useState([]);
    const [loading, setLoading] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [localCache, setLocalCache] = useState({});

    useEffect(() => {
        const fetchAllTransports = async () => {
            try {
                const transportsSnapshot = await getDocs(collection(db, 'transports'));
                const transportsData = transportsSnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setTransports(transportsData);
                // Cache all transports locally
                const cache = {};
                transportsData.forEach(transport => {
                    cache[transport.vehicleNumber] = transport;
                });
                setLocalCache(cache);
            } catch (error) {
                console.error('Error fetching transports:', error);
            }
        };

        fetchAllTransports();
    }, []);

    const debouncedSearch = useCallback(
        debounce(async (searchValue) => {
            if (searchValue in localCache) {
                // Use cached data if available
                handleVehicleData(localCache[searchValue]);
            } else {
                setLoading(true);
                const vehicleQuery = query(collection(db, 'transports'), where("vehicleNumber", "==", searchValue));
                const vehicleSnapshot = await getDocs(vehicleQuery);

                if (!vehicleSnapshot.empty) {
                    const vehicleData = vehicleSnapshot.docs[0].data();
                    handleVehicleData(vehicleData);
                    // Cache the new data
                    setLocalCache(prev => ({ ...prev, [searchValue]: vehicleData }));
                } else {
                    handleNewDriver(searchValue);
                }
                setLoading(false);
            }
        }, 300),
        [localCache]
    );

    const handleVehicleData = (vehicleData) => {
        setTransportInfo({
            vehicleNumber: vehicleData.vehicleNumber,
            name: vehicleData.name,
            phone: vehicleData.phone,
            transportFee: vehicleData.transportFee || '',
            paymentResponsible: vehicleData.paymentResponsible || '',
            accountNumber: vehicleData.accountNumber || '',
        });
        setIsNewDriver(false);
    };

    const handleNewDriver = (vehicleNumber) => {
        setTransportInfo({
            vehicleNumber,
            name: '',
            phone: '',
            transportFee: '',
            paymentResponsible: '',
            accountNumber: '',
        });
        setIsNewDriver(true);
    };

    const handleInputChange = (event, newInputValue) => {
        setInputValue(newInputValue);
        debouncedSearch(newInputValue);
    };

    const handleBlur = () => {
        // Validate input on blur (for mobile devices)
        if (inputValue && !(inputValue in localCache)) {
            debouncedSearch(inputValue);
        }
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setTransportInfo(prev => ({ ...prev, [name]: value }));
    };

    return (
        <Paper elevation={3} sx={{ p: 3, position: 'relative' }}>
            {isNewDriver && (
                <Chip
                    label="신규 운송기사"
                    color="secondary"
                    sx={{
                        position: 'absolute',
                        top: -10,
                        right: -10,
                        fontSize: '0.9rem',
                        fontWeight: 'bold'
                    }}
                />
            )}
            <Typography variant="h6" gutterBottom>운송 정보</Typography>
            <Autocomplete
                freeSolo
                options={transports.map((option) => option.vehicleNumber)}
                value={transportInfo.vehicleNumber}
                inputValue={inputValue}
                onInputChange={handleInputChange}
                onBlur={handleBlur}
                renderInput={(params) => (
                    <TextField {...params} label="차량번호" margin="normal" fullWidth />
                )}
            />
            {loading ? (
                <CircularProgress />
            ) : (
                <Box>
                    <TextField
                        label="기사이름"
                        name="name"
                        value={transportInfo.name}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="전화번호"
                        name="phone"
                        value={transportInfo.phone}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="운송료"
                        name="transportFee"
                        value={transportInfo.transportFee}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="운임지급주체"
                        name="paymentResponsible"
                        value={transportInfo.paymentResponsible}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="계좌번호"
                        name="accountNumber"
                        value={transportInfo.accountNumber}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                    />
                </Box>
            )}
        </Paper>
    );
};

export default TransportForm;