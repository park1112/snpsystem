import React, { useState, useEffect, useRef } from 'react';
import { Box, TextField, Button, Typography, Avatar, IconButton, Badge } from '@mui/material';
import { styled } from '@mui/material/styles';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { collection, query, orderBy, limit, onSnapshot, addDoc, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { ref, onValue } from 'firebase/database';
import { db, rtdb } from '../../utils/firebase';  // rtdb는 실시간 데이터베이스 참조입니다
import { format, formatDistanceToNow } from 'date-fns';


const ChatWindowContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: theme.palette.background.paper,
}));

const ChatHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(2),
    borderBottom: `1px solid ${theme.palette.divider}`,
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

const MessagesBox = styled(Box)(({ theme }) => ({
    flexGrow: 1,
    overflow: 'auto',
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.default,
}));

const MessageContainer = styled(Box)(({ theme, isOwnMessage }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: isOwnMessage ? 'flex-end' : 'flex-start',
    marginBottom: theme.spacing(1),
}));

const MessageBubble = styled(Box)(({ theme, isOwnMessage }) => ({
    maxWidth: '70%',
    padding: theme.spacing(1, 2),
    borderRadius: 20,
    backgroundColor: isOwnMessage ? theme.palette.primary.main : theme.palette.grey[300],
    color: isOwnMessage ? theme.palette.primary.contrastText : theme.palette.text.primary,
}));

const MessageTime = styled(Typography)(({ theme }) => ({
    fontSize: '0.75rem',
    color: theme.palette.text.secondary,
    marginTop: theme.spacing(0.5),
}));

const InputArea = styled(Box)(({ theme }) => ({
    display: 'flex',
    padding: theme.spacing(2),
    borderTop: `1px solid ${theme.palette.divider}`,
}));

export default function ChatWindow({ selectedChat, currentUser }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);


    useEffect(() => {
        if (!selectedChat) return;

        const q = query(
            collection(db, `chats/${selectedChat.id}/messages`),
            orderBy('timestamp', 'asc'),
            limit(50)
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const messageList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setMessages(messageList);
        });



        return () => {
            unsubscribe();
        };
    }, [selectedChat]);



    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);


    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedChat) return;

        const messageData = {
            text: newMessage,
            senderId: currentUser.uid,
            timestamp: serverTimestamp(),
        };

        await addDoc(collection(db, `chats/${selectedChat.id}/messages`), messageData);

        // Update last message in chat document
        await updateDoc(doc(db, 'chats', selectedChat.id), {
            lastMessage: newMessage,
            lastMessageTime: serverTimestamp()
        });

        setNewMessage('');
    };

    if (!selectedChat) {
        return <Typography variant="h6">메시지를 시작하려면 유저를 선택하세요</Typography>;
    }

    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp.toDate();
        return format(date, 'HH:mm');
    };

    const formatLastSeen = (lastSeen) => {
        if (!lastSeen) return '마지막접속 : 알수없음';

        // 콘솔에 출력된 그대로 lastSeen 값을 반환
        return `마지막접속 : ${lastSeen}`;
    };


    if (!selectedChat) {
        return <Typography variant="h6">메시지를 시작하려면 유저를 선택하세요</Typography>;
    }

    return (
        <ChatWindowContainer>
            <ChatHeader>
                <OnlineBadge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    variant="dot"
                    invisible={!selectedChat.isOnline}
                >
                    <Avatar sx={{ width: 40, height: 40, mr: 2 }} src={selectedChat.avatar} />
                </OnlineBadge>
                <Box>
                    <Typography variant="h6">{selectedChat.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                        {selectedChat.isOnline ? (
                            <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                                {/* <FiberManualRecordIcon sx={{ fontSize: 12, color: 'success.main', mr: 0.5 }} /> */}
                                Online
                            </Box>
                        ) : (
                            <FiberManualRecordIcon sx={{ fontSize: 12, color: 'success.main', mr: 0.5 }} />,
                            formatLastSeen(selectedChat.lastSeen)
                        )}
                    </Typography>
                </Box>
            </ChatHeader>
            <MessagesBox>
                {messages.map((message) => (
                    <MessageContainer key={message.id} isOwnMessage={message.senderId === currentUser.uid}>
                        <MessageBubble isOwnMessage={message.senderId === currentUser.uid}>
                            <Typography variant="body2">{message.text}</Typography>
                        </MessageBubble>
                        <MessageTime>{formatTime(message.timestamp)}</MessageTime>
                    </MessageContainer>
                ))}
                <div ref={messagesEndRef} />
            </MessagesBox>
            <InputArea component="form" onSubmit={handleSendMessage}>
                <IconButton color="primary" sx={{ mr: 1 }}>
                    <AttachFileIcon />
                </IconButton>
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="메시지를 입력해주세요."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    sx={{ mr: 1 }}
                />
                <Button type="submit" color="primary" variant="contained" endIcon={<SendIcon />}>
                    Send
                </Button>
            </InputArea>
        </ChatWindowContainer>
    );
}