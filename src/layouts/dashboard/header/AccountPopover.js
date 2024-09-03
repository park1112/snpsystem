// layouts/dashboard/header/AccountPopover.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import NextLink from 'next/link';
// @mui
import { alpha } from '@mui/material/styles';
import { Box, Divider, Typography, Stack, MenuItem, Avatar, CircularProgress } from '@mui/material';
// components
import MenuPopover from '../../../components/MenuPopover';
import { IconButtonAnimate } from '../../../components/animate';
// Context
import { useUser } from '../../../contexts/UserContext';

const MENU_OPTIONS = [
  { label: 'Home', linkTo: '/', role: 'guest' },
  { label: 'Profile', linkTo: '/user/profile', role: 'guest' },
  { label: 'Admin Panel', linkTo: '/admin', role: 'admin' },
];

export default function AccountPopover() {
  const [open, setOpen] = useState(null);
  const { user, loading: authLoading, logout, updateUserProfile } = useUser();
  const router = useRouter();

  const handleOpen = (event) => {
    setOpen(event.currentTarget);
  };

  const handleClose = () => {
    setOpen(null);
  };

  const handleLogout = async () => {
    const success = await logout();
    if (success) {
      // 로그아웃 성공 시 로그인 페이지로 리다이렉트
      router.push('/login');
    } else {
      // 에러 처리 (예: 사용자에게 알림)
      console.error('로그아웃 실패');
      // 여기에 사용자에게 알림을 주는 로직을 추가할 수 있습니다.
    }
  };

  useEffect(() => {
    if (user && !user.profileChecked) {
      router.push('/profile');
    }
  }, [user, router]);

  if (authLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <IconButtonAnimate
        onClick={handleOpen}
        sx={{
          p: 0,
          ...(open && {
            '&:before': {
              zIndex: 1,
              content: "''",
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              position: 'absolute',
              bgcolor: (theme) => alpha(theme.palette.grey[900], 0.8),
            },
          }),
        }}
      >
        <Avatar src={user?.photoURL || "https://firebasestorage.googleapis.com/v0/b/agri-flow-398dd.appspot.com/o/avatar.png?alt=media&token=ae236c34-bf37-4059-8706-660e4b27355c"} alt="" />
      </IconButtonAnimate>

      <MenuPopover
        open={Boolean(open)}
        anchorEl={open}
        onClose={handleClose}
        sx={{
          p: 0,
          mt: 1.5,
          ml: 0.75,
          '& .MuiMenuItem-root': {
            typography: 'body2',
            borderRadius: 0.75,
          },
        }}
      >
        <Box sx={{ my: 1.5, px: 2.5 }}>
          <Typography variant="subtitle2" noWrap>
            {user?.name || 'Guest'}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
            {user?.email || ''}
          </Typography>
        </Box>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Stack sx={{ p: 1 }}>
          {MENU_OPTIONS.filter(option => !user || option.role === 'guest' || option.role === user.role).map((option) => (
            <NextLink key={option.label} href={option.linkTo} passHref>
              <MenuItem key={option.label} onClick={handleClose}>
                {option.label}
              </MenuItem>
            </NextLink>
          ))}
        </Stack>

        <Divider sx={{ borderStyle: 'dashed' }} />

        {user && <MenuItem onClick={handleLogout} sx={{ m: 1 }}>Logout</MenuItem>}
      </MenuPopover>
    </>
  );
}