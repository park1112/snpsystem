// useFirestore.js
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';

const useFirestore = (market) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const docRef = doc(db, 'products', market);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                setData(docSnap.data().productMappings);
            } else {
                console.log("No such document!");
            }
            setLoading(false);
        };

        fetchData();
    }, [market]);

    return { data, loading };
};

export default useFirestore;
