// src/pages/calendar/index.js
import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import dayjs from 'dayjs';
import {
    Box,
    Typography,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import { useRouter } from 'next/router';
import PartnerSearch from "../PartnerSearch";
import CalendarList from "./CalendarList";

const Calendar = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [events, setEvents] = useState([]);
    const [newContent, setNewContent] = useState('');
    const [partners, setPartners] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [selectedWarehouse, setSelectedWarehouse] = useState('');
    const [selectedPartner, setSelectedPartner] = useState(null);
    const router = useRouter();

    const fetchEvents = async () => {
        const eventsCollection = collection(db, 'events');
        const eventsSnapshot = await getDocs(eventsCollection);
        const eventsList = eventsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
        setEvents(eventsList);
    };

    useEffect(() => {
        fetchEvents();

        const fetchPartners = async () => {
            const partnersCollection = collection(db, 'partners');
            const partnersSnapshot = await getDocs(partnersCollection);
            const partnersList = partnersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setPartners(partnersList);
        };

        const fetchWarehouses = async () => {
            const warehousesCollection = collection(db, 'warehouses');
            const warehousesSnapshot = await getDocs(warehousesCollection);
            const warehousesList = warehousesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setWarehouses(warehousesList);
        };

        fetchPartners();
        fetchWarehouses();
    }, []);

    const addEvent = async () => {
        if (newContent && selectedDate && selectedWarehouse && selectedPartner) {
            const eventDate = dayjs(selectedDate).format('YYYY-MM-DD');
            await addDoc(collection(db, 'events'), {
                date: eventDate,
                content: newContent,
                warehouseId: selectedWarehouse,
                partnerId: selectedPartner.id,
            });
            setNewContent('');
            setSelectedDate(new Date());
            setSelectedWarehouse('');
            setSelectedPartner(null);
            fetchEvents(); // 이벤트를 새로고침
        }
    };

    return (
        <Box sx={{ p: 4 }}>
            <Typography variant="h4" gutterBottom>
                Event Calendar
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <DatePicker
                    selected={selectedDate}
                    onChange={(date) => setSelectedDate(date)}
                    inline
                />
                <Box sx={{ ml: 3, flex: 1 }}>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>출고 장소</InputLabel>
                        <Select
                            value={selectedWarehouse}
                            onChange={(e) => setSelectedWarehouse(e.target.value)}
                            label="출고 장소"
                        >
                            {warehouses.map((warehouse) => (
                                <MenuItem key={warehouse.id} value={warehouse.id}>
                                    {warehouse.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <PartnerSearch onSelect={(partner) => setSelectedPartner(partner)} />
                    <TextField
                        label="내용"
                        variant="outlined"
                        value={newContent}
                        onChange={(e) => setNewContent(e.target.value)}
                        multiline
                        rows={3}
                        fullWidth
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={addEvent}
                        sx={{ mt: 2 }}
                        fullWidth
                    >
                        Add Event
                    </Button>
                </Box>
            </Box>
            <Typography variant="h5" gutterBottom>
                Upcoming Events
            </Typography>
            <CalendarList
                events={events}
                fetchEvents={fetchEvents}
                warehouses={warehouses}
                partners={partners}
                selectedDate={selectedDate} // 추가된 부분
            />
        </Box>
    );
};

export default Calendar;
