// src/components/RecentProducts.js
import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { List, ListItem, ListItemText, Typography } from '@mui/material';

const RecentProducts = () => {
    const [recentProducts, setRecentProducts] = useState([]);

    useEffect(() => {
        const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'), limit(5));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const products = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setRecentProducts(products);
        });

        return () => unsubscribe();
    }, []);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        }).replace(',', '');
    };

    return (
        <div>
            {/* <Typography variant="h6" gutterBottom>
                등록 기록
            </Typography> */}
            <List>
                {recentProducts.map(product => (
                    <ListItem key={product.id}>
                        <ListItemText
                            primary={`제품ID: ${product.id}`}
                            secondary={`내용: ${product.description}  |  쇼핑몰: ${product.shopName}  |  날짜: ${formatDate(product.createdAt)}`}
                        />
                    </ListItem>
                ))}
            </List>
        </div>
    );
};

export default RecentProducts;