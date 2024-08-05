import React, { useState, useEffect } from 'react';
import {
    Box,
    TextField,
    List,
    ListItem,
    ListItemText,
    Typography,
} from '@mui/material';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../utils/firebase';

const PartnerSearch = ({ onSelect }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [partners, setPartners] = useState([]);
    const [filteredPartners, setFilteredPartners] = useState([]);
    const [selectedPartner, setSelectedPartner] = useState(null);

    useEffect(() => {
        const fetchPartners = async () => {
            const partnersCollection = collection(db, 'partners');
            const partnersSnapshot = await getDocs(partnersCollection);
            const partnersList = partnersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setPartners(partnersList);
        };

        fetchPartners();
    }, []);

    useEffect(() => {
        if (searchTerm) {
            const results = partners.filter(partner =>
                partner.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredPartners(results);
        } else {
            setFilteredPartners([]);
        }
    }, [searchTerm, partners]);

    const handleSelectPartner = (partner) => {
        setSelectedPartner(partner);
        setSearchTerm(partner.name); // 선택된 파트너의 이름을 검색창에 표시
        setFilteredPartners([]); // 선택 후 검색 결과 목록 숨김
        onSelect(partner);
    };

    return (
        <Box sx={{ width: '100%', maxWidth: 500 }}>
            <TextField
                fullWidth
                label="거래처 검색"
                variant="outlined"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            {selectedPartner && (
                <Box sx={{ mt: 2, mb: 1 }}>
                    <Typography variant="h6">선택된 거래처:</Typography>
                    <Typography variant="body1">{selectedPartner.name}</Typography>
                </Box>
            )}
            {filteredPartners.length > 0 && (
                <List>
                    {filteredPartners.map((partner) => (
                        <ListItem
                            key={partner.id}
                            button
                            onClick={() => handleSelectPartner(partner)}
                        >
                            <ListItemText primary={partner.name} />
                        </ListItem>
                    ))}
                </List>
            )}
        </Box>
    );
};

export default PartnerSearch;
