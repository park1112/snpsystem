
import { useState } from 'react'; // useEffect는 필요하지 않으므로 제거
import { useRouter } from 'next/router'; // 리디렉션을 위해 useRouter 추가
import NextLink from 'next/link';
// @mui
import { alpha } from '@mui/material/styles';
import { Box, Divider, Typography, Stack, MenuItem, Avatar } from '@mui/material';
// components
import MenuPopover from '../../../components/MenuPopover';
import { IconButtonAnimate } from '../../../components/animate';
// Firebase
import { auth } from '../../../utils/firebase';
import { signOut } from 'firebase/auth';

import { useUser } from '../../../contexts/UserContext';

const MENU_OPTIONS = [
  { label: 'Home', linkTo: '/', role: 'guest' },  // 모든 사용자 접근 가능
  { label: 'Profile', linkTo: '/profile', role: 'user' }, // 로그인된 사용자만
  { label: 'Admin Panel', linkTo: '/admin', role: 'admin' }, // 관리자만
];

export default function AccountPopover() {
  const [open, setOpen] = useState(null);
  const user = useUser();
  const router = useRouter(); // useRouter hook을 사용

  const handleOpen = (event) => {
    setOpen(event.currentTarget);
  };

  const handleClose = () => {
    setOpen(null);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login'); // 로그아웃 후 로그인 페이지로 리디렉션
    } catch (error) {
      console.error('로그아웃 실패:', error);
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
        <Avatar src="https://minimal-assets-api.vercel.app/assets/images/avatars/avatar_5.jpg" alt="" />
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
