import React, { useState, useEffect, useMemo } from 'react';
import { onSnapshot, collection, query, where, orderBy } from 'firebase/firestore';
import { db } from '../../../utils/firebase'; // Firebase 설정 파일 경로에 맞게 수정해주세요
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
  Skeleton,
} from '@mui/material';
import { fToNow } from '../../../utils/formatTime';
import Iconify from '../../../components/Iconify';
import Scrollbar from '../../../components/Scrollbar';
import MenuPopover from '../../../components/MenuPopover';
import { IconButtonAnimate } from '../../../components/animate';
import { useAuthState } from '../../../hooks/useAuthState';
import { useRouter } from 'next/router';
import { useNotification } from '../../../components/NotificationManager';

export default function NotificationsPopover() {
  const [user] = useAuthState();
  const [open, setOpen] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { markNotificationAsRead } = useNotification();
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (user) {
      const notificationsRef = collection(db, 'notifications');
      const q = query(
        notificationsRef,
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const newNotifications = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setNotifications(newNotifications);
        setLoading(false);
      }, (err) => {
        console.error("Error fetching notifications: ", err);
        setError(err);
        setLoading(false);
      });

      return () => unsubscribe();
    }
  }, [user]);

  const handleNotificationClick = async (notification) => {
    if (notification.isUnRead) {
      await markNotificationAsRead(notification.id);
    }
    handleClose();

    switch (notification.type) {
      case 'todo_assigned':
        router.push(`/todo`);
        break;
      case 'admin_message':
        router.push(`/notifications/${notification.id}`);
        break;
      case 'system':
        router.push(`/notifications/${notification.id}`);
        break;
      case 'chat':
        router.push(`/chat/${notification.chatId}`);
        break;
      default:
        console.log('Unknown notification type');
    }
  };

  const totalUnRead = useMemo(() => notifications.filter((item) => item.isUnRead === true).length, [notifications]);

  const handleOpen = (event) => {
    setOpen(event.currentTarget);
  };

  const handleClose = () => {
    setOpen(null);
  };

  const handleMarkAllAsRead = async () => {
    const unreadNotifications = notifications.filter(n => n.isUnRead);
    for (let notification of unreadNotifications) {
      await markNotificationAsRead(notification.id);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <List disablePadding>
          {[...Array(3)].map((_, index) => (
            <ListItemButton key={index} sx={{ py: 1.5, px: 2.5, mt: '1px' }}>
              <ListItemAvatar>
                <Skeleton variant="circular" width={40} height={40} />
              </ListItemAvatar>
              <ListItemText
                primary={<Skeleton variant="text" width="80%" />}
                secondary={<Skeleton variant="text" width="60%" />}
              />
            </ListItemButton>
          ))}
        </List>
      );
    }

    if (error) {
      return <Typography color="error" sx={{ p: 2 }}>Error: {error.message}</Typography>;
    }

    if (notifications.length === 0) {
      return <Typography sx={{ p: 2 }}>No notifications</Typography>;
    }

    return (
      <List disablePadding>
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onClick={() => handleNotificationClick(notification)}
          />
        ))}
      </List>
    );
  };

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
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onClick={() => handleNotificationClick(notification)}
              />
            ))}
          </List>
        </Scrollbar>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Box sx={{ p: 1 }}>
          <Button fullWidth disableRipple onClick={() => router.push('/notifications')}>
            전체보기
          </Button>
        </Box>
      </MenuPopover>
    </>
  );
}

function NotificationItem({ notification, onClick }) {
  const { title, description, createdAt, type } = notification;

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
      onClick={onClick}
    >
      <ListItemAvatar>
        <Avatar sx={{ bgcolor: 'background.neutral' }}>
          {type === 'todo_assigned' && <Iconify icon="eva:file-text-fill" />}
          {type === 'system' && <Iconify icon="eva:alert-triangle-fill" />}
          {type === 'chat' && <Iconify icon="eva:message-square-fill" />}
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={title}
        secondary={
          <>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
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

// 실시간 알림 