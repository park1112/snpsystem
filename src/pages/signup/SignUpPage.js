import React, { useState } from 'react';
import { TextField, Button, Typography, Box } from '@mui/material';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { db } from '../../utils/firebase'; // Firebase 설정 파일
import { doc, setDoc } from 'firebase/firestore';

const SignUpPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState(null);
    const auth = getAuth();

    const handleSignUp = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Firestore에 사용자 정보 저장
            await setDoc(doc(db, 'users', user.uid), {
                email,
                name,
                role: 'user', // 기본 등급 설정
                createdAt: new Date(),
            });

            alert('회원가입이 완료되었습니다!');
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <Box mt={5} maxWidth="400px" mx="auto">
            <Typography variant="h4" gutterBottom>
                회원가입
            </Typography>
            {error && <Typography color="error">{error}</Typography>}
            <form onSubmit={handleSignUp}>
                <TextField
                    label="이메일"
                    fullWidth
                    margin="normal"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <TextField
                    label="이름"
                    fullWidth
                    margin="normal"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
                <TextField
                    label="비밀번호"
                    type="password"
                    fullWidth
                    margin="normal"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
                    회원가입
                </Button>
            </form>
        </Box>
    );
};

export default SignUpPage;
