// components/ChatItem.js
import React from 'react';
import { ListItemButton, ListItemText, ListItemAvatar, Avatar, Badge, Typography } from '@mui/material';
import Iconify from './Iconify';
import { fToNow } from '../utils/formatTime';

function ChatItem({ chat, onClick, unreadCount, user }) {
    const chatTitle = chat.name || chat.otherParticipant?.name || 'Unknown User';

    return (
        <ListItemButton
            sx={{
                py: 1.5,
                px: 2.5,
                mt: '1px',
                ...(unreadCount > 0 && {
                    bgcolor: 'action.selected',
                }),
            }}
            onClick={onClick}
        >
            <ListItemAvatar>
                <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    variant="dot"
                    color={chat.isOnline ? 'success' : 'error'}
                >
                    <Avatar alt={chatTitle} src={chat.otherParticipant?.photoURL} />
                </Badge>
            </ListItemAvatar>
            <ListItemText
                primary={chatTitle}
                secondary={
                    <>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
                            {chat.lastMessage}
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
                            {fToNow(chat.lastMessageTime.toDate())}
                        </Typography>
                    </>
                }
            />
            {/* 각 채팅방마다 읽지 않은 메시지 수 배지 표시 */}
            {unreadCount > 0 && (
                <Badge badgeContent={unreadCount} color="error" />
            )}
        </ListItemButton>
    );
}

export default ChatItem;
