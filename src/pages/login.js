import { useState } from 'react';
import { useRouter } from 'next/router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../utils/firebase';
import { TextField, Button, Typography, Box, NextLink } from '@mui/material';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.push('/dashboard'); // 로그인 성공 시 대시보드로 이동
        } catch (error) {
            setError('로그인 실패: ' + error.message);
        }
    };

    return (
        <Box sx={{ maxWidth: 400, mx: 'auto', mt: 10, p: 3, boxShadow: 3 }}>
            <Typography variant="h4" gutterBottom>로그인</Typography>
            <form onSubmit={handleLogin}>
                <TextField
                    label="이메일"
                    fullWidth
                    margin="normal"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <TextField
                    label="비밀번호"
                    fullWidth
                    margin="normal"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
                <Button type="submit" variant="contained" fullWidth>로그인</Button>
            </form>
            <Box sx={{ mt: 2 }}>
                <Button component={NextLink} href="/signup" fullWidth>회원가입</Button>
                <Button component={NextLink} href="/forgot-password" fullWidth>비밀번호 찾기</Button>
            </Box>
        </Box>
    );
};

export default Login;
