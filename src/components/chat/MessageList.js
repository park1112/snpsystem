import React, { useEffect, useRef } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import MessageItem from './MessageItem';

const MessagesBox = styled(Box)(({ theme }) => ({
    flexGrow: 1,
    overflowY: 'auto',
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.default,
}));

const MessageList = ({ messages, currentUser, allUsers, formatTime, formatReadStatus, isLoading, onImageClick, updateMessageReadStatus }) => {
    const messagesEndRef = useRef(null);

    // 스크롤을 최신 메시지로 내리는 함수
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        messages.forEach(message => {
            const readByArray = Array.isArray(message.readBy)
                ? message.readBy
                : Object.keys(message.readBy || {});

            // 사용자가 메시지를 읽지 않은 경우
            if (!readByArray.includes(currentUser.uid)) {
                updateMessageReadStatus(message.id);  // 읽음 상태 업데이트
            }
        });

        // 메시지가 추가될 때마다 스크롤을 최신 메시지로 이동
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'auto' });
        }
    }, []);



    return (
        <MessagesBox>
            {isLoading && <CircularProgress />}
            {messages.map((message) => {
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
            {/* 항상 스크롤이 이곳으로 오도록 함 */}
            <div ref={messagesEndRef} />
        </MessagesBox>
    );
};

export default MessageList;
