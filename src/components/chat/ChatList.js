// components/chat/ChatList.js
import React from 'react';
import { List, ListItem, ListItemText, ListItemAvatar, Avatar, Typography, Divider, Badge, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useUser } from '../../contexts/UserContext';

const StyledListItem = styled(ListItem)(({ theme, selected }) => ({
    '&:hover': {
        backgroundColor: theme.palette.action.hover,
    },
    backgroundColor: selected ? theme.palette.action.selected : 'inherit',
    borderRadius: theme.shape.borderRadius,
    marginBottom: theme.spacing(1),
}));

const OnlineBadge = styled(Badge)(({ theme }) => ({
    '& .MuiBadge-badge': {
        backgroundColor: '#44b700',
        color: '#44b700',
        boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
        '&::after': {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            animation: 'ripple 1.2s infinite ease-in-out',
            border: '1px solid currentColor',
            content: '""',
        },
    },
    '@keyframes ripple': {
        '0%': {
            transform: 'scale(.8)',
            opacity: 1,
        },
        '100%': {
            transform: 'scale(2.4)',
            opacity: 0,
        },
    },
}));

export default function ChatList({ chats, onChatSelect, selectedChat }) {
    const { user, onlineUsers } = useUser();

    const getUserStatus = (userId) => {
        const status = onlineUsers[userId];
        return status?.state === 'online' ? 'online' : 'offline';
    };

    if (!user) {
        return null;
    }

    return (
        <List sx={{ overflow: 'auto', height: '100%', p: 2 }}>
            {chats.map((chat) => {
                const otherParticipantId = chat.participants?.find(id => id !== user.uid);
                const status = otherParticipantId ? getUserStatus(otherParticipantId) : 'offline';

                return (
                    <React.Fragment key={chat.id}>
                        <StyledListItem
                            button
                            onClick={() => onChatSelect(chat)}
                            selected={selectedChat && selectedChat.id === chat.id}
                        >
                            <ListItemAvatar>
                                <OnlineBadge
                                    overlap="circular"
                                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                    variant="dot"
                                    invisible={status !== 'online'}
                                >
                                    <Avatar alt={chat.name} src={chat.avatar} />
                                </OnlineBadge>
                            </ListItemAvatar>
                            <ListItemText
                                primary={
                                    <Box display="flex" justifyContent="space-between" alignItems="center">
                                        <Typography variant="subtitle2" noWrap>
                                            {chat.name}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {chat.lastMessageTime ? new Date(chat.lastMessageTime.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                        </Typography>
                                    </Box>
                                }
                                secondary={
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        noWrap
                                    >
                                        {chat.lastMessage}
                                    </Typography>
                                }
                            />
                        </StyledListItem>
                    </React.Fragment>
                );
            })}
        </List>
    );
}
