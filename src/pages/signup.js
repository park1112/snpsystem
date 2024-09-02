import React, { useState } from 'react';
import { useRouter } from 'next/router';
import NextLink from 'next/link';
// @mui
import { styled } from '@mui/material/styles';
import { Box, Card, Link, Container, Typography, Tooltip, TextField, Button, Alert } from '@mui/material';
// hooks
import useResponsive from '../hooks/useResponsive';
// guards
import GuestGuard from '../guards/GuestGuard';
// components
import Page from '../components/Page';
import Logo from '../components/Logo';
import Image from '../components/Image';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../utils/firebase'; // Firebase 설정 파일을 가져옵니다.

// 스타일 정의
const RootStyle = styled('div')(({ theme }) => ({
    [theme.breakpoints.up('md')]: {
        display: 'flex',
    },
}));

const HeaderStyle = styled('header')(({ theme }) => ({
    top: 0,
    zIndex: 9,
    lineHeight: 0,
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    position: 'absolute',
    padding: theme.spacing(3),
    justifyContent: 'space-between',
    [theme.breakpoints.up('md')]: {
        alignItems: 'flex-start',
        padding: theme.spacing(7, 5, 0, 7),
    },
}));

const SectionStyle = styled(Card)(({ theme }) => ({
    width: '100%',
    maxWidth: 464,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    margin: theme.spacing(2, 0, 2, 2),
}));

const ContentStyle = styled('div')(({ theme }) => ({
    maxWidth: 480,
    margin: 'auto',
    display: 'flex',
    minHeight: '100vh',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: theme.spacing(12, 0),
}));

export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const smUp = useResponsive('up', 'sm');
    const mdUp = useResponsive('up', 'md');
    const router = useRouter();
    const method = "email"; // 임시로 method 변수를 email로 설정

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
            router.push('/'); // 예: 회원가입 후 이동할 페이지
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
        <GuestGuard>
            <Page title="Register">
                <RootStyle>
                    <HeaderStyle>
                        <Logo />
                        {smUp && (
                            <Typography variant="body2" sx={{ mt: { md: -2 } }}>
                                이미 계정이 있으신가요?{' '}
                                <NextLink href="/login" passHref>
                                    <Link variant="subtitle2">로그인</Link>
                                </NextLink>
                            </Typography>
                        )}
                    </HeaderStyle>

                    {mdUp && (
                        <SectionStyle>
                            <Typography variant="h3" sx={{ px: 5, mt: 10, mb: 5 }}>
                                간편하게 가입하고 더 많은 기능을 활용하세요
                            </Typography>
                            <Image
                                visibleByDefault
                                disabledEffect
                                alt="register"
                                src="https://firebasestorage.googleapis.com/v0/b/agri-flow-398dd.appspot.com/o/0_3%20(3).jpeg?alt=media&token=a8aa7f64-bd98-4236-acee-92f371be4d2f"
                            />
                        </SectionStyle>
                    )}

                    <Container>
                        <ContentStyle>
                            <Box sx={{ mb: 5, display: 'flex', alignItems: 'center' }}>
                                <Box sx={{ flexGrow: 1 }}>
                                    <Typography variant="h4" gutterBottom>
                                        지금 바로 시작하세요.
                                    </Typography>
                                    <Typography sx={{ color: 'text.secondary' }}>무료로 시작할 수 있습니다.</Typography>
                                </Box>
                                <Tooltip title={method}>
                                    <>
                                        <Image
                                            disabledEffect
                                            alt={method}
                                            src={`https://firebasestorage.googleapis.com/v0/b/agri-flow-398dd.appspot.com/o/avatar.png?alt=media&token=0f82626d-d84f-4c08-ac87-3765577b87bf`}
                                            sx={{ width: 32, height: 32 }}
                                        />
                                    </>
                                </Tooltip>
                            </Box>

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
                                    <Alert severity="error" sx={{ mb: 3 }}>
                                        {error}
                                    </Alert>
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

                            <Typography variant="body2" align="center" sx={{ color: 'text.secondary', mt: 3 }}>
                                가입함으로써 SYP SYSTEM의&nbsp;
                                <Link underline="always" color="text.primary" href="#">
                                    서비스 약관
                                </Link>
                                {' '}및{' '}
                                <Link underline="always" color="text.primary" href="#">
                                    개인정보 처리방침
                                </Link>
                                에 동의하게 됩니다.
                            </Typography>

                            {!smUp && (
                                <Typography variant="body2" sx={{ mt: 3, textAlign: 'center' }}>
                                    이미 계정이 있으신가요?{' '}
                                    <NextLink href="/login" passHref>
                                        <Link variant="subtitle2">로그인</Link>
                                    </NextLink>
                                </Typography>
                            )}
                        </ContentStyle>
                    </Container>
                </RootStyle>
            </Page>
        </GuestGuard>
    );
}
