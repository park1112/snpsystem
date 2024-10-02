// pages/profile.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import {
    Container,
    Typography,
    TextField,
    Button,
    Box,
    CircularProgress,
    Snackbar,
    Alert,
    Paper
} from '@mui/material';

export default function Profile() {
    const [user, setUser] = useState(null);
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const router = useRouter();
    const auth = getAuth();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                fetchUserProfile(currentUser.uid);
            } else {
                setLoading(false);
                // 로그인 페이지로 리다이렉트하는 대신 상태만 업데이트
                setUser(null);
            }
        });

        return () => unsubscribe();
    }, [auth]);

    useEffect(() => {
        // 사용자가 없고 로딩이 완료된 경우에만 로그인 페이지로 리다이렉트
        if (!user && !loading) {
            router.push('/login');
        }
    }, [user, loading, router]);

    const fetchUserProfile = async (uid) => {
        try {
            const userDoc = await getDoc(doc(db, 'users', uid));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                setName(userData.name || '');
                setPhone(userData.phone || '');
            }
        } catch (err) {
            console.error("Error fetching user profile:", err);
            setError("프로필을 불러오는데 실패했습니다. 다시 시도해 주세요.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !phone) {
            setError("모든 필드를 입력해주세요.");
            return;
        }
        setSaving(true);
        setError('');
        try {
            await setDoc(doc(db, 'users', user.uid), {
                name,
                phone,
            }, { merge: true });
            setSuccess(true);
            // 프로필 저장 후 메인 페이지로 리다이렉트
            setTimeout(() => router.push('/'), 2000);
        } catch (err) {
            console.error("Error saving profile:", err);
            setError("프로필 저장에 실패했습니다. 다시 시도해 주세요.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Container maxWidth="sm" sx={{ mt: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Paper elevation={3} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <CircularProgress size={60} />
                    <Typography variant="h6" sx={{ mt: 2 }}>프로필 정보를 불러오는 중...</Typography>
                </Paper>
            </Container>
        );
    }

    if (!user) {
        return null; // 사용자가 없는 경우 아무것도 렌더링하지 않음 (리다이렉트 처리는 useEffect에서 함)
    }

    return (
        <Container maxWidth="sm">
            <Paper elevation={3} sx={{ mt: 4, p: 4 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        프로필 설정
                    </Typography>
                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="name"
                            label="이름"
                            name="name"
                            autoComplete="name"
                            autoFocus
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            error={!name && !!error}
                            helperText={!name && !!error ? "이름을 입력해주세요" : ""}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="phone"
                            label="전화번호"
                            type="tel"
                            id="phone"
                            autoComplete="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            error={!phone && !!error}
                            helperText={!phone && !!error ? "전화번호를 입력해주세요" : ""}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2, height: 56 }}
                            disabled={saving}
                        >
                            {saving ? <CircularProgress size={24} /> : "프로필 저장"}
                        </Button>
                    </Box>
                </Box>
            </Paper>
            <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')}>
                <Alert onClose={() => setError('')} severity="error" sx={{ width: '100%' }}>
                    {error}
                </Alert>
            </Snackbar>
            <Snackbar open={success} autoHideDuration={6000} onClose={() => setSuccess(false)}>
                <Alert onClose={() => setSuccess(false)} severity="success" sx={{ width: '100%' }}>
                    프로필이 성공적으로 저장되었습니다. 메인 페이지로 이동합니다.
                </Alert>
            </Snackbar>
        </Container>
    );
}