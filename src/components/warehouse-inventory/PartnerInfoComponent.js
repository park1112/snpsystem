import React, { useState, useCallback } from 'react';
import { Paper, Typography, TextField, Card, CardContent, CardActions, Box, List, ListItem, ListItemText, ListItemAvatar, Avatar, Button } from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import CategoryIcon from '@mui/icons-material/Category';
import PersonIcon from '@mui/icons-material/Person';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import debounce from 'lodash/debounce';

const PartnerInfoComponent = ({ formState, handlePartnerSelect, handleFormChange }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    const debouncedSearch = useCallback(
        debounce(async (term) => {
            if (term.trim() === '') {
                setSearchResults([]);
                return;
            }

            const partnersRef = collection(db, 'partners');
            const q = query(
                partnersRef,
                where('name', '>=', term),
                where('name', '<=', term + '\uf8ff'),
                orderBy('name'),
                limit(5)
            );

            try {
                const querySnapshot = await getDocs(q);
                const results = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setSearchResults(results);
            } catch (error) {
                console.error("Error searching partners:", error);
            }
        }, 300),
        []
    );

    const handleSearchChange = (event) => {
        const value = event.target.value;
        setSearchTerm(value);
        debouncedSearch(value);
    };

    const handlePartnerClick = (partner) => {
        handlePartnerSelect(partner);
        setSearchResults([]);
        setSearchTerm('');
    };

    return (
        <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>거래처 정보</Typography>
            {!formState.partnerUid ? (
                <>
                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="거래처 이름 검색"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        sx={{ mb: 2 }}
                    />
                    {searchResults.length > 0 && (
                        <List sx={{ width: '100%', bgcolor: 'background.paper', maxHeight: 300, overflow: 'auto' }}>
                            {searchResults.map((partner) => (
                                <ListItem
                                    key={partner.id}
                                    button
                                    onClick={() => handlePartnerClick(partner)}
                                    alignItems="flex-start"
                                >
                                    <ListItemAvatar>
                                        <Avatar>
                                            <PersonIcon />
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={partner.name}
                                        secondary={
                                            <React.Fragment>
                                                <Typography
                                                    sx={{ display: 'inline' }}
                                                    component="span"
                                                    variant="body2"
                                                    color="text.primary"
                                                >
                                                    {partner.category}
                                                </Typography>
                                            </React.Fragment>
                                        }
                                    />
                                </ListItem>
                            ))}
                        </List>
                    )}
                    {searchTerm && searchResults.length === 0 && (
                        <Typography color="textSecondary">
                            검색 결과가 없습니다.
                        </Typography>
                    )}
                </>
            ) : (
                <Card elevation={4} sx={{ mt: 2, backgroundColor: '#f5f5f5' }}>
                    <CardContent>
                        <Box display="flex" alignItems="center" mb={2}>
                            <Avatar sx={{ mr: 2 }}>
                                <BusinessIcon />
                            </Avatar>
                            <Typography variant="h5" component="div">
                                {formState.partnerName}
                            </Typography>
                        </Box>
                        <Box display="flex" alignItems="center">
                            <CategoryIcon color="action" sx={{ mr: 1 }} />
                            <Typography variant="body1" color="text.secondary">
                                {formState.partnerCategory}
                            </Typography>
                        </Box>
                    </CardContent>
                    <CardActions>
                        <Button
                            variant="outlined"
                            color="secondary"
                            onClick={() => handleFormChange('partnerUid', '')}
                            fullWidth
                        >
                            거래처 변경
                        </Button>
                    </CardActions>
                </Card>
            )}
        </Paper>
    );
};

export default PartnerInfoComponent;