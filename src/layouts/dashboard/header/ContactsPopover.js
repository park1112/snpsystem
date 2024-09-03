import React, { useState, useEffect } from 'react';
import { alpha } from '@mui/material/styles';
import { Avatar, Typography, ListItemText, ListItemAvatar, MenuItem, Badge } from '@mui/material';
import { fToNow } from '../../../utils/formatTime';
import Iconify from '../../../components/Iconify';
import Scrollbar from '../../../components/Scrollbar';
import MenuPopover from '../../../components/MenuPopover';
import { IconButtonAnimate } from '../../../components/animate';
import { useUser } from '../../../contexts/UserContext';

const ITEM_HEIGHT = 64;

export default function ContactsPopover() {
    const [open, setOpen] = useState(null);
    const { user, allUsers, onlineUsers } = useUser();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log('Current user:', user?.uid);
        console.log('All users:', allUsers.length);
        console.log('Online users:', Object.keys(onlineUsers).length);

        if (Object.keys(onlineUsers).length > 0) {
            setLoading(false);
        }
    }, [user, allUsers, onlineUsers]);

    const handleOpen = (event) => {
        setOpen(event.currentTarget);
    };

    const handleClose = () => {
        setOpen(null);
    };

    if (!user) {
        return null;
    }

    if (loading) {
        return <div>Loading users...</div>;
    }

    const getUserName = (user) => user.name || user.email || 'Unknown User';

    const getUserStatus = (userId) => {
        console.log('Checking status for user:', userId);
        console.log('onlineUsers:', onlineUsers);
        const status = onlineUsers[userId];
        console.log('User status:', status);
        if (!status) {
            console.log('User status not found, returning offline');
            return 'offline';
        }
        const result = status.state === 'online' ? 'online' : 'offline';
        console.log('Returning status:', result);
        return result;
    };

    const getLastActivity = (userId) => {
        const status = onlineUsers[userId];
        if (!status || status.state === 'online') return null;
        return status.lastActivity;
    };

    const sortedUsers = [...allUsers].sort((a, b) => {
        const statusA = getUserStatus(a.id);
        const statusB = getUserStatus(b.id);
        if (statusA === 'online' && statusB !== 'online') return -1;
        if (statusA !== 'online' && statusB === 'online') return 1;
        return getUserName(a).localeCompare(getUserName(b));
    });

    console.log('Sorted users:', sortedUsers.map(u => ({ id: u.id, name: getUserName(u), status: getUserStatus(u.id) })));

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
                    Users <Typography component="span">({sortedUsers.length})</Typography>
                </Typography>

                <Scrollbar sx={{ height: ITEM_HEIGHT * 6 }}>
                    {sortedUsers.map((contact) => {
                        const status = getUserStatus(contact.id);
                        const lastActivity = getLastActivity(contact.id);
                        console.log('Rendering user:', contact.id, getUserName(contact), status);
                        return (
                            <MenuItem key={contact.id}>
                                <ListItemAvatar sx={{ position: 'relative' }}>
                                    <Badge
                                        overlap="circular"
                                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                        variant="dot"
                                        color={status === 'online' ? 'success' : 'error'}
                                    >
                                        <Avatar src={contact.avatar} alt={getUserName(contact)} />
                                    </Badge>
                                </ListItemAvatar>
                                <ListItemText
                                    primaryTypographyProps={{ typography: 'subtitle2', mb: 0.25 }}
                                    secondaryTypographyProps={{ typography: 'caption' }}
                                    primary={getUserName(contact)}
                                    secondary={status === 'offline' ? (lastActivity ? fToNow(lastActivity) : 'Offline') : 'Online'}
                                />
                            </MenuItem>
                        );
                    })}
                </Scrollbar>
            </MenuPopover>
        </>
    );
}