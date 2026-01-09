import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import NextLink from 'next/link';
// @mui
import { alpha } from '@mui/material/styles';
import { Box, Divider, Typography, Stack, MenuItem, Avatar, Skeleton } from '@mui/material';
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
  const { user, loading: authLoading, logout, updateUserProfile, checkAuth } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      const isAuthenticated = await checkAuth();
      if (!isAuthenticated) {
        router.push('/login');
      } else if (user && !user.profileChecked) {
        router.push('/profile');
      }
      setIsLoading(false);
    };
    initAuth();
  }, [checkAuth, user, router]);

  const handleOpen = (event) => {
    setOpen(event.currentTarget);
  };

  const handleClose = () => {
    setOpen(null);
  };

  const handleLogout = async () => {
    setIsLoading(true);
    const success = await logout();
    if (success) {
      router.push('/login');
    } else {
      console.error('로그아웃 실패');
      setIsLoading(false);
    }
  };

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
        {isLoading ? (
          <Skeleton variant="circular" width={40} height={40} />
        ) : (
          <Avatar src={user?.photoURL || "https://firebasestorage.googleapis.com/v0/b/agri-flow-398dd.appspot.com/o/avatar.png?alt=media&token=ae236c34-bf37-4059-8706-660e4b27355c"} alt="" />
        )}
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
          {isLoading ? (
            <>
              <Skeleton variant="text" width={100} />
              <Skeleton variant="text" width={150} />
            </>
          ) : (
            <>
              <Typography variant="subtitle2" noWrap>
                {user?.name || 'Guest'}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
                {user?.email || ''}
              </Typography>
            </>
          )}
        </Box>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Stack sx={{ p: 1 }}>
          {MENU_OPTIONS.filter(option => !user || option.role === 'guest' || option.role === user.role).map((option) => (
            <NextLink key={option.label} href={option.linkTo} passHref legacyBehavior>
              <MenuItem component="a" onClick={handleClose} sx={{ textDecoration: 'none', color: 'inherit' }}>
                {option.label}
              </MenuItem>
            </NextLink>
          ))}
        </Stack>

        <Divider sx={{ borderStyle: 'dashed' }} />

        {!isLoading && user && (
          <MenuItem onClick={handleLogout} sx={{ m: 1 }}>
            {isLoading ? <Skeleton variant="text" width={50} /> : 'Logout'}
          </MenuItem>
        )}
      </MenuPopover>
    </>
  );
}

// 유저정보변경