// useAuthState.js
import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../utils/firebase';

export const useAuthState = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(
            auth,
            (user) => {
                setUser(user);
                setLoading(false);
            },
            (error) => {
                setError(error);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, []);

    return [user, loading, error];
};


