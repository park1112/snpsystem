import React, { useEffect, useRef } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import MessageItem from './MessageItem';

const MessagesBox = styled(Box)(({ theme }) => ({
    flexGrow: 1,
    overflowY: 'auto',
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.default,
    display: 'flex',
    flexDirection: 'column-reverse', // 메시지를 역순으로 배치
}));

const MessageList = ({ messages, currentUser, allUsers, formatTime, formatReadStatus, isLoading, onImageClick, updateMessageReadStatus }) => {
    const messagesStartRef = useRef(null);

    useEffect(() => {
        messages.forEach(message => {
            const readByArray = Array.isArray(message.readBy)
                ? message.readBy
                : Object.keys(message.readBy || {});

            if (!readByArray.includes(currentUser.uid)) {
                updateMessageReadStatus(message.id);
            }
        });
    }, [messages, currentUser.uid, updateMessageReadStatus]);

    return (
        <MessagesBox>
            {isLoading && <CircularProgress />}
            <div ref={messagesStartRef} />
            {[...messages].reverse().map((message) => {
                const isOwnMessage = message.senderId === currentUser.uid;
                const sender = allUsers.find(user => user.id === message.senderId) || { name: 'Unknown User' };
                return (
                    <MessageItem
                        key={message.id}
                        message={message}
                        isOwnMessage={isOwnMessage}
                        sender={sender}
                        formatTime={formatTime}
                        formatReadStatus={formatReadStatus}
                        onImageClick={onImageClick}
                    />
                );
            })}
        </MessagesBox>
    );
};

export default MessageList;