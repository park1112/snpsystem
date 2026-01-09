// components/ChatPopover.js
import React, { useState, useEffect } from 'react';
import { onSnapshot, collection, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../../../utils/firebase';
import {
    Box,
    List,
    Badge,
    Divider,
    Typography,
    Button,
} from '@mui/material';
import Iconify from '../../../components/Iconify';
import Scrollbar from '../../../components/Scrollbar';
import MenuPopover from '../../../components/MenuPopover';
import { IconButtonAnimate } from '../../../components/animate';
import { useUser } from '../../../contexts/UserContext';
import { useRouter } from 'next/router';
import ChatItem from '../../../components/ChatItem'; // 공통 컴포넌트 ChatItem 가져오기
import useUnreadMessages from '../../../components/useUnreadMessages'; // 수정된 훅 가져오기

const INITIAL_DISPLAY_COUNT = 5;

export default function ChatPopover() {
    const { user, allUsers, onlineUsers } = useUser();
    const [open, setOpen] = useState(null);
    const [chats, setChats] = useState([]);
    const [displayCount, setDisplayCount] = useState(INITIAL_DISPLAY_COUNT);
    const router = useRouter();

    // 모든 채팅의 unreadCount를 가져옴
    const unreadCounts = useUnreadMessages(chats, user?.uid);

    useEffect(() => {
        if (user) {
            const chatsRef = collection(db, 'chats');
            const q = query(
                chatsRef,
                where('participants', 'array-contains', user.uid),
                orderBy('lastMessageTime', 'desc'),
                limit(20)
            );

            const unsubscribe = onSnapshot(q, (snapshot) => {
                const newChats = snapshot.docs.map(doc => {
                    const chatData = doc.data();
                    const otherParticipantId = chatData.participants.find(id => id !== user.uid);
                    const otherParticipant = allUsers.find(u => u.id === otherParticipantId);

                    return {
                        id: doc.id,
                        ...chatData,
                        otherParticipant,
                        isOnline: onlineUsers[otherParticipantId]?.state === 'online'
                    };
                });
                setChats(newChats);
            });

            return () => unsubscribe();
        }
    }, [user, allUsers, onlineUsers]);

    // 모든 채팅방의 unreadCount를 합산하여 전체 읽지 않은 메시지 수 계산
    const totalUnread = Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);

    const handleOpen = (event) => {
        setOpen(event.currentTarget);
    };

    const handleClose = () => {
        setOpen(null);
        setDisplayCount(INITIAL_DISPLAY_COUNT);
    };

    const handleLoadMore = () => {
        setDisplayCount(prev => prev + 5);
    };

    // 표시할 채팅 목록
    const displayedChats = chats.slice(0, displayCount);
    const hasMore = chats.length > displayCount;

    const handleChatClick = (chatId) => {
        // router.push(`/chat/${chatId}`);
        router.push(`/chat`);
        handleClose();
    };

    return (
        <>
            <IconButtonAnimate color={open ? 'primary' : 'default'} onClick={handleOpen} sx={{ width: 40, height: 40 }}>
                <Badge badgeContent={totalUnread} color="error"> {/* 전체 읽지 않은 메시지 수 표시 */}
                    <Iconify icon="eva:message-square-fill" width={20} height={20} />
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
                        <Typography variant="subtitle1">채팅</Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {totalUnread}개의 읽지 않은 메시지가 있습니다
                        </Typography>
                    </Box>
                </Box>

                <Divider sx={{ borderStyle: 'dashed' }} />

                <Scrollbar sx={{ height: { xs: 340, sm: 'auto' }, maxHeight: 400 }}>
                    <List disablePadding>
                        {displayedChats.map((chat) => (
                            <ChatItem
                                key={chat.id}
                                chat={chat}
                                onClick={() => handleChatClick(chat.id)}
                                user={user}
                                unreadCount={unreadCounts[chat.id] || 0}
                            />
                        ))}
                    </List>

                    {hasMore && (
                        <Box sx={{ p: 1, textAlign: 'center' }}>
                            <Button
                                size="small"
                                onClick={handleLoadMore}
                                sx={{ color: 'text.secondary' }}
                            >
                                더보기 ({chats.length - displayCount}개 더)
                            </Button>
                        </Box>
                    )}
                </Scrollbar>

                <Divider sx={{ borderStyle: 'dashed' }} />

                <Box sx={{ p: 1 }}>
                    <Button fullWidth disableRipple onClick={() => router.push('/chat')}>
                        모든 채팅 보기 ({chats.length})
                    </Button>
                </Box>
            </MenuPopover>
        </>
    );
}
