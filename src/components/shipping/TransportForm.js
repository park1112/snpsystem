import React, { useState, useEffect } from 'react';
import { TextField, Autocomplete, Box } from '@mui/material';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../utils/firebase';

const TransportForm = ({ transportInfo, setTransportInfo, isNewDriver, setIsNewDriver, accountNumber, setAccountNumber, accountHolder, setAccountHolder }) => {
    const [transports, setTransports] = useState([]);

    useEffect(() => {
        const fetchTransports = async () => {
            try {
                const transportsSnapshot = await getDocs(collection(db, 'transports'));
                const transportsData = transportsSnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setTransports(transportsData);
            } catch (error) {
                console.error('Error fetching transports:', error);
            }
        };

        fetchTransports();
    }, []);

    const handleVehicleNumberChange = (event, newValue) => {
        const selectedTransport = transports.find(transport => transport.vehicleNumber === newValue);
        if (selectedTransport) {
            setTransportInfo({
                vehicleNumber: selectedTransport.vehicleNumber,
                name: selectedTransport.name,
                phone: selectedTransport.phone,
                transportFee: selectedTransport.transportFee || '',
                paymentResponsible: selectedTransport.paymentResponsible || ''
            });
            setIsNewDriver(false);
        } else {
            setTransportInfo({
                ...transportInfo,
                vehicleNumber: newValue,
            });
            setIsNewDriver(true);
        }
    };

    return (
        <Box mt={3}>
            <Autocomplete
                freeSolo
                options={transports.map((option) => option.vehicleNumber)}
                value={transportInfo.vehicleNumber}
                onChange={handleVehicleNumberChange}
                onInputChange={(event, newInputValue) => {
                    handleVehicleNumberChange(event, newInputValue);
                }}
                renderInput={(params) => (
                    <TextField {...params} label="차량번호" margin="normal" fullWidth />
                )}
            />
            <TextField
                label="기사이름"
                value={transportInfo.name}
                onChange={(e) => setTransportInfo({ ...transportInfo, name: e.target.value })}
                fullWidth
                margin="normal"
                disabled={!isNewDriver}
            />
            <TextField
                label="전화번호"
                value={transportInfo.phone}
                onChange={(e) => setTransportInfo({ ...transportInfo, phone: e.target.value })}
                fullWidth
                margin="normal"
                disabled={!isNewDriver}
            />
            <TextField
                label="운송료"
                value={transportInfo.transportFee}
                onChange={(e) => setTransportInfo({ ...transportInfo, transportFee: e.target.value })}
                fullWidth
                margin="normal"
            />
            <TextField
                label="운임지급주체"
                value={transportInfo.paymentResponsible}
                onChange={(e) => setTransportInfo({ ...transportInfo, paymentResponsible: e.target.value })}
                fullWidth
                margin="normal"
            />
            {isNewDriver && (
                <>
                    <TextField
                        label="계좌번호"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="예금주"
                        value={accountHolder}
                        onChange={(e) => setAccountHolder(e.target.value)}
                        fullWidth
                        margin="normal"
                    />
                </>
            )}
        </Box>
    );
};

export default TransportForm;
