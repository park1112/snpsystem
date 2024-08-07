import React, { useState } from 'react';
import { TextField, Button, Typography, Box } from '@mui/material';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../utils/firebase'; // Firebase 설정 파일을 가져옵니다.
import { useRouter } from 'next/router';

const SignupPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSignup = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Firebase Auth를 사용하여 사용자 생성
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Firestore에 사용자 정보 저장
            await setDoc(doc(db, 'users', user.uid), {
                email: user.email,
                createdAt: new Date(),
                // 추가로 저장할 사용자 정보가 있다면 여기에 추가
            });

            // 회원가입 성공 후 리디렉션
            router.push('/welcome'); // 예: 회원가입 후 이동할 페이지
        } catch (error) {
            if (error.code === 'auth/email-already-in-use') {
                setError('이미 사용 중인 이메일입니다. 다른 이메일을 사용하거나 로그인해 주세요.');
            } else {
                setError('회원가입 실패: ' + error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ maxWidth: 400, mx: 'auto', mt: 5 }}>
            <Typography variant="h4" gutterBottom>
                회원가입
            </Typography>
            <form onSubmit={handleSignup}>
                <TextField
                    label="이메일"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    fullWidth
                    required
                    margin="normal"
                />
                <TextField
                    label="비밀번호"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    fullWidth
                    required
                    margin="normal"
                />
                {error && (
                    <Typography color="error" variant="body2" gutterBottom>
                        {error}
                    </Typography>
                )}
                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    disabled={loading}
                    sx={{ mt: 2 }}
                >
                    회원가입
                </Button>
            </form>
            <Box mt={2}>
                <Button onClick={() => router.push('/login')} fullWidth>
                    로그인 페이지로 이동
                </Button>
                <Button onClick={() => router.push('/forgot-password')} fullWidth>
                    비밀번호 찾기
                </Button>
            </Box>
        </Box>
    );
};

export default SignupPage;
