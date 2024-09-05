// pages/chat.js
import React, { useState, useEffect } from 'react';
import { Box, Grid, Paper, Typography, Button, useTheme, useMediaQuery } from '@mui/material';
import { styled } from '@mui/material/styles';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';
import NewChatDialog from './NewChatDialog';
import { collection, query, where, onSnapshot, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import { useUser } from '../../contexts/UserContext';
import AddIcon from '@mui/icons-material/Add';
import { fToNow } from '../../utils/formatTime';


const ChatPageContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflow: 'hidden',
    padding: theme.spacing(3),
    [theme.breakpoints.down('md')]: {
        padding: theme.spacing(2),
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
            console.log("Chat snapshot received, document count:", querySnapshot.docs.length);
            const chatList = querySnapshot.docs.map(doc => {
                const chatData = doc.data();
                console.log("Chat data:", chatData);
                const otherParticipantId = chatData.participants.find(id => id !== user.uid);
                const otherParticipant = allUsers.find(u => u.id === otherParticipantId);
                const userStatus = onlineUsers[otherParticipantId] || {};
                return {
                    id: doc.id,
                    ...chatData,
                    name: otherParticipant ? otherParticipant.name : 'Unknown User',
                    isOnline: userStatus.state === 'online',
                    lastSeen: userStatus.lastActivity ? fToNow(userStatus.lastActivity) : null
                };
            });
            console.log("Processed chat list:", chatList);
            setChats(chatList);
        }, (error) => {
            console.error("Error fetching chats:", error);
        });

        return () => unsubscribe();
    }, [user, allUsers, onlineUsers]);

    const handleChatSelect = (chat) => {
        console.log("Selected chat:", chat);
        setSelectedChat(chat);
    };

    const handleNewChat = async (selectedUser) => {
        console.log("Starting new chat with user:", selectedUser);

        // Check if a chat already exists with this user
        const existingChat = chats.find(chat =>
            chat.participants.includes(selectedUser.id)
        );

        if (existingChat) {
            console.log("Chat already exists, selecting it");
            setSelectedChat(existingChat);
        } else {
            // Create a new chat document
            const newChatRef = await addDoc(collection(db, 'chats'), {
                participants: [user.uid, selectedUser.id],
                lastMessageTime: serverTimestamp(),
            });

            console.log("New chat created with ID:", newChatRef.id);

            // The new chat will be added to the list automatically via the snapshot listener
        }

        setIsNewChatDialogOpen(false);
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
                            <ChatWindow selectedChat={selectedChat} currentUser={user} />
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
                onSelectUser={handleNewChat}
                allUsers={allUsers.filter(u => u.id !== user.uid)}
            />
        </ChatPageContainer>
    );
}