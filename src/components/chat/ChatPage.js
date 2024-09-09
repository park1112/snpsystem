import React, { useState, useEffect } from 'react';
import { Box, Grid, Paper, Typography, Button, useTheme, useMediaQuery } from '@mui/material';
import { styled } from '@mui/material/styles';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';
import NewChatDialog from './NewChatDialog';
import { collection, query, where, onSnapshot, orderBy, addDoc, serverTimestamp, getDocs } from 'firebase/firestore'; // getDocs 추가
import { db } from '../../utils/firebase';
import { useUser } from '../../contexts/UserContext';
import AddIcon from '@mui/icons-material/Add';
import { fToNow } from '../../utils/formatTime';

const ChatPageContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    height: 'calc(100vh - 200px)',
    overflow: 'hidden',
    padding: theme.spacing(3),
    [theme.breakpoints.down('md')]: {
        padding: theme.spacing(2),
        height: 'calc(100vh - 56px)',
    },
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
    height: '100%',
    overflow: 'hidden',
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[5],
}));

const ChatListContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    borderRight: `1px solid ${theme.palette.divider}`,
}));

const ChatListHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(2),
    borderBottom: `1px solid ${theme.palette.divider}`,
}));

const StyledButton = styled(Button)(({ theme }) => ({
    borderRadius: theme.shape.borderRadius,
}));

export default function ChatPage() {
    const { user, allUsers, onlineUsers } = useUser();
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [isNewChatDialogOpen, setIsNewChatDialogOpen] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    useEffect(() => {
        if (!user) return;

        console.log("Fetching chats for user:", user.uid);

        const q = query(
            collection(db, 'chats'),
            where('participants', 'array-contains', user.uid),
            orderBy('lastMessageTime', 'desc')
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const chatList = querySnapshot.docs.map(doc => {
                const chatData = doc.data();

                const isGroupChat = chatData.isGroupChat;
                let chatName;
                let otherParticipantId = null;
                let userStatus = {};

                if (isGroupChat) {
                    chatName = chatData.name;
                } else {
                    otherParticipantId = chatData.participants.find(id => id !== user.uid);
                    const otherParticipant = allUsers.find(u => u.id === otherParticipantId);
                    chatName = otherParticipant ? otherParticipant.name : 'Unknown User';
                    userStatus = onlineUsers[otherParticipantId] || {};
                }

                return {
                    id: doc.id,
                    ...chatData,
                    name: chatName,
                    isOnline: userStatus.state === 'online',
                    lastSeen: userStatus.lastActivity ? fToNow(userStatus.lastActivity) : null
                };
            });
            setChats(chatList);
        });

        return () => unsubscribe();
    }, [user, allUsers, onlineUsers]);

    const handleNewChat = async (chatInfo) => {
        console.log("Starting new chat:", chatInfo);

        const userUid = user.uid;

        if (chatInfo.isGroupChat) {
            // 그룹 채팅 생성
            const newChatRef = await addDoc(collection(db, 'chats'), {
                name: chatInfo.name, // 그룹 이름
                participants: [...chatInfo.participants, userUid], // 여러 참가자
                isGroupChat: true, // 그룹 채팅 여부 설정
                createdBy: userUid,
                createdAt: serverTimestamp(),
                lastMessageTime: serverTimestamp(),
            });

            console.log("New group chat created with ID:", newChatRef.id);
            setSelectedChat({ id: newChatRef.id, ...chatInfo, isGroupChat: true });

        } else {
            // 1:1 채팅 생성
            const otherParticipantId = chatInfo.participants[0];

            // user.uid와 otherParticipantId가 참가자인 기존 채팅이 있는지 확인
            const q = query(
                collection(db, 'chats'),
                where('participants', 'array-contains', userUid)
            );

            const existingChatSnapshot = await getDocs(q);

            // 클라이언트 측에서 참가자들을 비교하여 기존 채팅이 있는지 확인
            let existingChat = null;
            existingChatSnapshot.forEach((doc) => {
                const chatData = doc.data();
                if (chatData.participants.includes(otherParticipantId) && chatData.participants.length === 2) {
                    existingChat = { id: doc.id, ...chatData };
                }
            });

            if (existingChat) {
                console.log("Chat already exists, selecting it");
                setSelectedChat(existingChat);
            } else {
                const newChatRef = await addDoc(collection(db, 'chats'), {
                    participants: [userUid, otherParticipantId],
                    isGroupChat: false, // 1:1 채팅 여부 설정
                    lastMessageTime: serverTimestamp(),
                });
                console.log("New 1:1 chat created with ID:", newChatRef.id);
                setSelectedChat({ id: newChatRef.id, participants: [userUid, otherParticipantId], isGroupChat: false });
            }
        }

        setIsNewChatDialogOpen(false);
    };



    const handleChatSelect = (chat) => {
        console.log("Selected chat:", chat);
        setSelectedChat(chat);
    };

    const handleStartNewChat = (newChat) => {
        setSelectedChat(newChat);
    };

    if (!user) {
        return <Typography>Please log in to access the chat.</Typography>;
    }

    return (
        <ChatPageContainer>
            <Grid container spacing={3} sx={{ height: '100%' }}>
                <Grid item xs={12} md={4} sx={{ height: isMobile ? 'auto' : '100%' }}>
                    <StyledPaper elevation={3}>
                        <ChatListContainer>
                            <ChatListHeader>
                                <Typography variant="h6" fontWeight="bold">Chats</Typography>
                                <StyledButton
                                    variant="contained"
                                    color="primary"
                                    startIcon={<AddIcon />}
                                    onClick={() => setIsNewChatDialogOpen(true)}
                                    size="small"
                                >
                                    새로운 채팅
                                </StyledButton>
                            </ChatListHeader>
                            <Box sx={{ flexGrow: 1, overflow: 'auto', p: 1 }}>
                                {chats.length === 0 ? (
                                    <Box sx={{ p: 2 }}>
                                        <Typography>채팅이 불가능합니다</Typography>
                                    </Box>
                                ) : (
                                    <ChatList
                                        chats={chats}
                                        onChatSelect={handleChatSelect}
                                        selectedChat={selectedChat}
                                    />
                                )}
                            </Box>
                        </ChatListContainer>
                    </StyledPaper>
                </Grid>
                <Grid item xs={12} md={8} sx={{ height: isMobile ? 'auto' : '100%' }}>
                    <StyledPaper elevation={3}>
                        {selectedChat ? (
                            <ChatWindow
                                selectedChat={selectedChat}
                                currentUser={user}
                                allUsers={allUsers}
                                onStartNewChat={handleStartNewChat}
                            />
                        ) : (
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                <Typography variant="h6" color="text.secondary">채팅을 시작할려면 유저를 선택해주세요.</Typography>
                            </Box>
                        )}
                    </StyledPaper>
                </Grid>
            </Grid>
            <NewChatDialog
                open={isNewChatDialogOpen}
                onClose={() => setIsNewChatDialogOpen(false)}
                onCreateChat={handleNewChat}
                allUsers={allUsers.filter(u => u.id !== user.uid)}
            />
        </ChatPageContainer>
    );
}
