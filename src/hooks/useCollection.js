import { useState, useEffect } from 'react';
import { onSnapshot } from 'firebase/firestore';

export const useCollection = (queryOrRef) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!queryOrRef) {
            setData(null);
            setLoading(false);
            return;
        }

        const unsubscribe = onSnapshot(
            queryOrRef,
            (snapshot) => {
                const results = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setData(results);
                setLoading(false);
            },
            (err) => {
                console.error('Error fetching collection:', err);
                setError(err);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [queryOrRef]);

    return [data, loading, error];
};