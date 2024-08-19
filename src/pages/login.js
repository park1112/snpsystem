import { useState } from 'react';
import { useRouter } from 'next/router';
import NextLink from 'next/link'; // NextLink를 import
// @mui
import { styled } from '@mui/material/styles';
import { Box, Card, Stack, Link, Alert, Tooltip, Container, Typography, TextField, Button } from '@mui/material';
// hooks
import useAuthState from '../hooks/useAuthState'; // 커스텀 훅 가져오기
import useResponsive from '../hooks/useResponsive';
// guards
import GuestGuard from '../guards/GuestGuard';
// components
import Page from '../components/Page';
import Logo from '../components/Logo';
import Image from '../components/Image';

import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';


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

// 메인 컴포넌트
export default function Login() {
    // 모든 훅은 컴포넌트의 최상위에서 실행되어야 합니다.
    const [user, loading, authError] = useAuthState();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(''); // 폼의 에러 상태

    const smUp = useResponsive('up', 'sm');
    const mdUp = useResponsive('up', 'md');
    const router = useRouter();
    const method = "email"; // 임시로 method 변수를 email로 설정
    const auth = getAuth();

    // 로딩 상태 처리
    if (loading) {
        return <div>Loading...</div>;
    }

    // 인증 에러 처리
    if (authError) {
        return <div>Error: {authError.message}</div>;
    }

    // 사용자가 이미 로그인한 경우 대시보드로 리다이렉트 (추가적으로 사용할 수 있습니다)
    if (user) {
        router.push('/dashboard'); // 로그인된 사용자는 대시보드로 이동
        return null;
    }

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
        <GuestGuard>
            <Page title="Login">
                <RootStyle>
                    <HeaderStyle>
                        <Logo />
                        {smUp && (
                            <Typography variant="body2" sx={{ mt: { md: -2 } }}>
                                계정이 없으세요?{' '}
                                <NextLink href="/signup" passHref>
                                    <Link variant="subtitle2">회원가입 이동</Link>
                                </NextLink>
                            </Typography>
                        )}
                    </HeaderStyle>

                    {mdUp && (
                        <SectionStyle>
                            <Typography variant="h3" sx={{ px: 5, mt: 10, mb: 5 }}>
                                SNP SYSTEM
                            </Typography>
                            <Image
                                visibleByDefault
                                disabledEffect
                                src="https://firebasestorage.googleapis.com/v0/b/agri-flow-398dd.appspot.com/o/0_3%20(1).jpeg?alt=media&token=a5f536f8-0270-468f-9481-51f50c94bafd"
                                alt="login"
                            />
                        </SectionStyle>
                    )}

                    <Container maxWidth="sm">
                        <ContentStyle>
                            <Stack direction="row" alignItems="center" sx={{ mb: 5 }}>
                                <Box sx={{ flexGrow: 1 }}>
                                    <Typography variant="h4" gutterBottom>
                                        로그인
                                    </Typography>
                                    <Typography sx={{ color: 'text.secondary' }}>이메일과 비밀번호를 입력하세요.</Typography>
                                </Box>

                                <Tooltip title={method} placement="right">
                                    <>
                                        <Image
                                            disabledEffect
                                            alt={method}
                                            src={`https://firebasestorage.googleapis.com/v0/b/agri-flow-398dd.appspot.com/o/avatar.png?alt=media&token=0f82626d-d84f-4c08-ac87-3765577b87bf`}
                                            sx={{ width: 32, height: 32 }}
                                        />
                                    </>
                                </Tooltip>
                            </Stack>

                            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

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
                                <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>로그인</Button>
                            </form>

                            {!smUp && (
                                <Typography variant="body2" align="center" sx={{ mt: 3 }}>
                                    Don’t have an account?{' '}
                                    <NextLink href="/signup" passHref>
                                        <Link variant="subtitle2">Get started</Link>
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
