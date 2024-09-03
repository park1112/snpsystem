import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
// @mui
import { alpha } from '@mui/material/styles';
import { Avatar, Typography, ListItemText, ListItemAvatar, MenuItem } from '@mui/material';
// utils
import { fToNow } from '../../../utils/formatTime';
// components
import Iconify from '../../../components/Iconify';
import Scrollbar from '../../../components/Scrollbar';
import MenuPopover from '../../../components/MenuPopover';
import BadgeStatus from '../../../components/BadgeStatus';
import { IconButtonAnimate } from '../../../components/animate';
// context
import { UserContext } from '../../../contexts/UserContext'; // 사용자 Context 경로를 실제 경로로 수정해주세요

// ----------------------------------------------------------------------

const ITEM_HEIGHT = 64;

// ----------------------------------------------------------------------

export default function ContactsPopover() {
  const [open, setOpen] = useState(null);
  const { users } = useContext(UserContext); // UserContext에서 users 데이터를 가져옵니다
  const navigate = useNavigate();

  const handleOpen = (event) => {
    setOpen(event.currentTarget);
  };

  const handleClose = () => {
    setOpen(null);
  };

  const handleChatNavigate = (userId) => {
    navigate(`/chat/${userId}`); // 채팅 페이지 경로를 실제 경로로 수정해주세요
    handleClose();
  };

  return (
    <>
      <IconButtonAnimate
        color={open ? 'primary' : 'default'}
        onClick={handleOpen}
        sx={{
          width: 40,
          height: 40,
          ...(open && {
            bgcolor: (theme) => alpha(theme.palette.primary.main, theme.palette.action.focusOpacity),
          }),
        }}
      >
        <Iconify icon={'eva:people-fill'} width={20} height={20} />
      </IconButtonAnimate>

      <MenuPopover
        open={Boolean(open)}
        anchorEl={open}
        onClose={handleClose}
        sx={{
          mt: 1.5,
          ml: 0.75,
          width: 320,
          '& .MuiMenuItem-root': {
            px: 1.5,
            height: ITEM_HEIGHT,
            borderRadius: 0.75,
          },
        }}
      >
        <Typography variant="h6" sx={{ p: 1.5 }}>
          Contacts <Typography component="span">({users.length})</Typography>
        </Typography>

        <Scrollbar sx={{ height: ITEM_HEIGHT * 6 }}>
          {users.map((user) => (
            <MenuItem key={user.id} onClick={() => handleChatNavigate(user.id)}>
              <ListItemAvatar sx={{ position: 'relative' }}>
                <Avatar src={user.avatar} />
                <BadgeStatus status={user.status} sx={{ position: 'absolute', right: 1, bottom: 1 }} />
              </ListItemAvatar>
              <ListItemText
                primaryTypographyProps={{ typography: 'subtitle2', mb: 0.25 }}
                secondaryTypographyProps={{ typography: 'caption' }}
                primary={user.name}
                secondary={user.status === 'offline' && fToNow(user.lastActivity)}
              />
            </MenuItem>
          ))}
        </Scrollbar>
      </MenuPopover>
    </>
  );
}