import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { onAuthStateChanged, getAuth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../utils/firebase';

const useUserData = () => {
    const [user, setUser] = useState(null);
    const auth = getAuth(); // Firebase 인증 인스턴스를 가져옴
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const docRef = doc(db, 'users', user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setUser({ ...user, ...docSnap.data() });
                }
            } else {
                setUser(null);
                router.push('/login'); // 로그인하지 않은 경우 로그인 페이지로 리디렉션
            }
        });

        return () => unsubscribe();
    }, [router]);

    return user;
};

export default useUserData;
