import { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../utils/firebase';
import { TextField, Button, Typography, Box } from '@mui/material';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleResetPassword = async (e) => {
        e.preventDefault();
        try {
            await sendPasswordResetEmail(auth, email);
            setMessage('비밀번호 재설정 링크가 이메일로 전송되었습니다.');
        } catch (error) {
            setError('비밀번호 재설정 실패: ' + error.message);
        }
    };

    return (
        <Box sx={{ maxWidth: 400, mx: 'auto', mt: 10, p: 3, boxShadow: 3 }}>
            <Typography variant="h4" gutterBottom>비밀번호 찾기</Typography>
            <form onSubmit={handleResetPassword}>
                <TextField
                    label="이메일"
                    fullWidth
                    margin="normal"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                {message && <Typography color="success" sx={{ mb: 2 }}>{message}</Typography>}
                {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
                <Button type="submit" variant="contained" fullWidth>비밀번호 재설정</Button>
            </form>
        </Box>
    );
};

export default ForgotPassword;
