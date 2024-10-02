import React, { createContext, useState, useContext, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../utils/firebase';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
    const [warehouses, setWarehouses] = useState([]);
    const [logisticsItems, setLogisticsItems] = useState([]);
    const [partners, setPartners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [warehousesSnapshot, logisticsSnapshot, partnersSnapshot] = await Promise.all([
                getDocs(collection(db, 'warehouses')),
                getDocs(collection(db, 'logistics')),
                getDocs(collection(db, 'partners'))
            ]);

            setWarehouses(warehousesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLogisticsItems(logisticsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setPartners(partnersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Failed to load data');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const refreshData = () => {
        fetchData();
    };

    return (
        <DataContext.Provider value={{ warehouses, logisticsItems, partners, loading, error, refreshData }}>
            {children}
        </DataContext.Provider>
    );
};