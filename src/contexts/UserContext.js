// contexts/UserContext.js
import { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../utils/firebase';

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                const docRef = doc(db, 'users', firebaseUser.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setUser({ ...firebaseUser, ...docSnap.data(), profileChecked: true });
                } else {
                    setUser({ ...firebaseUser, profileChecked: false });
                }
                // 토큰을 localStorage에 저장
                const token = await firebaseUser.getIdToken();
                localStorage.setItem('authToken', token);
            } else {
                setUser(null);
                // 사용자가 없으면 토큰 제거
                localStorage.removeItem('authToken');
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const updateUserProfile = async (profileData) => {
        if (user) {
            try {
                await setDoc(doc(db, 'users', user.uid), profileData, { merge: true });
                setUser((prevUser) => ({ ...prevUser, ...profileData, profileChecked: true }));
                return true;
            } catch (error) {
                console.error("Error updating user profile:", error);
                return false;
            }
        }
        return false;
    };

    const logout = async () => {
        try {
            await auth.signOut();
            setUser(null);
            // 로그아웃 시 토큰 제거
            localStorage.removeItem('authToken');
            return true;
        } catch (error) {
            console.error("Error signing out:", error);
            return false;
        }
    };

    const value = {
        user,
        setUser,
        loading,
        updateUserProfile,
        logout
    };

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};