import { useState, useEffect } from 'react';
import { db } from '../firebaseConfig'; // Firebase 설정 파일 경로에 맞게 수정
import { collection, query, onSnapshot } from 'firebase/firestore';

const useFirestore = (collectionName) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!collectionName) {
            setError('Collection name is required.');
            setLoading(false);
            return;
        }

        const q = query(collection(db, collectionName));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setData(items);
            setLoading(false);
        }, (err) => {
            setError(err.message);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [collectionName]);

    return { data, loading, error };
};

export default useFirestore;
