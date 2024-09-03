import { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, collection } from 'firebase/firestore';
import { ref, onDisconnect, set, serverTimestamp, onValue } from 'firebase/database';
import { auth, db, rtdb } from '../utils/firebase';
import { useRouter } from 'next/router';

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [allUsers, setAllUsers] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState({});
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                console.log('User authenticated:', firebaseUser.uid);
                const docRef = doc(db, 'users', firebaseUser.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setUser({ ...firebaseUser, ...docSnap.data(), profileChecked: true });
                } else {
                    setUser({ ...firebaseUser, profileChecked: false });
                }

                const userStatusDatabaseRef = ref(rtdb, `/status/${firebaseUser.uid}`);

                const updateStatus = (status) => {
                    console.log('Updating user status:', firebaseUser.uid, status);
                    set(userStatusDatabaseRef, {
                        state: status,
                        lastActivity: serverTimestamp(),
                    });
                };

                updateStatus('online');

                onDisconnect(userStatusDatabaseRef).set({
                    state: 'offline',
                    lastActivity: serverTimestamp(),
                });

                const token = await firebaseUser.getIdToken();
                localStorage.setItem('authToken', token);
            } else {
                console.log('User not authenticated');
                setUser(null);
                localStorage.removeItem('authToken');
            }
            setLoading(false);
        });

        // Listen for all users' data
        const usersUnsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
            const users = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setAllUsers(users);
            console.log('All users updated:', users.length);
        });

        // Listen for online users
        const onlineUsersRef = ref(rtdb, 'status');
        const onlineUsersUnsubscribe = onValue(onlineUsersRef, (snapshot) => {
            if (snapshot.exists()) {
                const onlineUsersData = snapshot.val();
                console.log('Raw online users data:', onlineUsersData);
                setOnlineUsers(onlineUsersData);
            } else {
                console.log('No online users data in the database');
            }
        }, (error) => {
            console.error('Error fetching online users:', error);
        });

        return () => {
            unsubscribe();
            usersUnsubscribe();
            onlineUsersUnsubscribe();
        };
    }, []);

    const updateUserProfile = async (profileData) => {
        if (user) {
            try {
                await setDoc(doc(db, 'users', user.uid), profileData, { merge: true });
                setUser((prevUser) => ({ ...prevUser, ...profileData, profileChecked: true }));
                console.log('User profile updated:', user.uid);
                return true;
            } catch (error) {
                console.error("Error updating user profile:", error);
                return false;
            }
        }
        return false;
    };

    const login = async (email, password) => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const token = await userCredential.user.getIdToken();
            localStorage.setItem('authToken', token);
            router.push('/'); // 로그인 성공 시 홈페이지로 리다이렉트
            return true;
        } catch (error) {
            console.error("Login error:", error);
            return false;
        }
    };

    const logout = async () => {
        try {
            if (user) {
                const userStatusDatabaseRef = ref(rtdb, `/status/${user.uid}`);
                console.log('Setting user status to offline:', user.uid);
                await set(userStatusDatabaseRef, {
                    state: 'offline',
                    lastActivity: serverTimestamp(),
                });
            }
            await auth.signOut();
            setUser(null);
            localStorage.removeItem('authToken');
            console.log('User logged out');
            router.push('/login'); // 로그아웃 후 로그인 페이지로 리다이렉트
            return true;
        } catch (error) {
            console.error("Error signing out:", error);
            return false;
        }
    };

    const checkAuth = () => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            router.push('/login');
            return false;
        }
        return true;
    };

    const value = {
        user,
        setUser,
        loading,
        updateUserProfile,
        login,
        logout,
        checkAuth,
        allUsers,
        onlineUsers
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