import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  List,
  Badge,
  Button,
  Avatar,
  Tooltip,
  Divider,
  Typography,
  ListItemText,
  ListItemAvatar,
  ListItemButton,
  CircularProgress,
} from '@mui/material';
import { fToNow } from '../../../utils/formatTime';
import Iconify from '../../../components/Iconify';
import Scrollbar from '../../../components/Scrollbar';
import MenuPopover from '../../../components/MenuPopover';
import { IconButtonAnimate } from '../../../components/animate';
import { useAuthState } from '../../../hooks/useAuthState';
import { query, where, orderBy, limit, collection, getDocs } from 'firebase/firestore';
import { db } from '../../../utils/firebase';
import { useRouter } from 'next/router';

export default function NotificationsPopover() {
  const [user, userLoading] = useAuthState();
  const [open, setOpen] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  const notificationsQuery = useMemo(() => {
    if (user?.uid) {
      return query(
        collection(db, 'notifications'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(5)
      );
    }
    return null;
  }, [user]);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!notificationsQuery) {
        setNotifications([]);
        setLoading(false);
        return;
      }

      try {
        const querySnapshot = await getDocs(notificationsQuery);
        console.log('Query snapshot:', querySnapshot);
        console.log('Number of documents:', querySnapshot.size);

        const notificationsData = querySnapshot.docs.map(doc => {
          console.log('Document data:', doc.data());
          return {
            id: doc.id,
            ...doc.data()
          };
        });

        setNotifications(notificationsData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching notifications:', err);
        setError(err);
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [notificationsQuery]);

  const totalUnRead = notifications.filter((item) => item.isUnRead === true).length || 0;

  const handleOpen = (event) => {
    setOpen(event.currentTarget);
  };

  const handleClose = () => {
    setOpen(null);
  };

  const handleMarkAllAsRead = () => {
    // 여기에 모든 알림을 읽음 처리하는 로직을 추가합니다.
  };

  if (userLoading) {
    return <CircularProgress />;
  }

  if (!user) {
    return null; // 로그인하지 않은 사용자에게는 알림을 표시하지 않습니다.
  }

  return (
    <>
      <IconButtonAnimate color={open ? 'primary' : 'default'} onClick={handleOpen} sx={{ width: 40, height: 40 }}>
        <Badge badgeContent={totalUnRead} color="error">
          <Iconify icon="eva:bell-fill" width={20} height={20} />
        </Badge>
      </IconButtonAnimate>

      <MenuPopover
        open={Boolean(open)}
        anchorEl={open}
        onClose={handleClose}
        sx={{ width: 360, p: 0, mt: 1.5, ml: 0.75 }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', py: 2, px: 2.5 }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle1">알림</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              You have {totalUnRead} unread messages
            </Typography>
          </Box>

          {totalUnRead > 0 && (
            <Tooltip title="Mark all as read">
              <IconButtonAnimate color="primary" onClick={handleMarkAllAsRead}>
                <Iconify icon="eva:done-all-fill" width={20} height={20} />
              </IconButtonAnimate>
            </Tooltip>
          )}
        </Box>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Scrollbar sx={{ height: { xs: 340, sm: 'auto' } }}>
          <List disablePadding>
            {loading ? (
              <CircularProgress />
            ) : error ? (
              <Typography color="error" sx={{ p: 2 }}>Error: {error.message}</Typography>
            ) : notifications.length > 0 ? (
              notifications.map((notification) => (
                <NotificationItem key={notification.id} notification={notification} />
              ))
            ) : (
              <Typography sx={{ p: 2 }}>No notifications</Typography>
            )}
          </List>
        </Scrollbar>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Box sx={{ p: 1 }}>
          <Button fullWidth disableRipple
            onClick={(e) => {

              router.push(`/dashboard/notifications`);
            }}>
            View All
          </Button>
        </Box>
      </MenuPopover>
    </>
  );
}

function NotificationItem({ notification }) {
  const { title, description, createdAt } = notification;
  const [relativeTime, setRelativeTime] = useState('');

  useEffect(() => {
    setRelativeTime(fToNow(createdAt)); // 생성 시간을 상대적 시간으로 변환하여 설정
  }, [createdAt]);



  return (
    <ListItemButton
      sx={{
        py: 1.5,
        px: 2.5,
        mt: '1px',
        ...(notification.isUnRead && {
          bgcolor: 'action.selected',
        }),
      }}
    >
      <ListItemAvatar>
        <Avatar sx={{ bgcolor: 'background.neutral' }}>{/* Add avatar content here */}</Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={title}
        secondary={  // `secondary`에 알림 내용과 시간 추가
          <>
            <Typography variant="body4" color="text.primary" component="span">
              {description}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                mt: 0.5,
                display: 'flex',
                alignItems: 'center',
                color: 'text.disabled',
              }}
            >
              <Iconify icon="eva:clock-outline" sx={{ mr: 0.5, width: 16, height: 16 }} />
              {fToNow(createdAt.toDate())}
            </Typography>
          </>
        }
      />
    </ListItemButton>
  );
}