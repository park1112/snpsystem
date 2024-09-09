import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Typography, Popover, List, ListItem, ListItemAvatar, ListItemText, ListItemSecondaryAction, IconButton, Avatar } from '@mui/material';
import { styled } from '@mui/material/styles';
import { collection, query, orderBy, limit, onSnapshot, addDoc, serverTimestamp, updateDoc, doc, where, getDocs } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import { format } from 'date-fns';
import ChatIcon from '@mui/icons-material/Chat';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import ImageModal from './ImageModal';
import InputArea from './InputArea';
import ImageUpload from './ImageUpload';


const ChatWindowContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: theme.palette.background.paper,
}));

export default function ChatWindow({ selectedChat, currentUser, allUsers, onStartNewChat }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [uploadedImages, setUploadedImages] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [modalImages, setModalImages] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (!selectedChat) return;
        const unsubscribe = loadMessages();
        return () => unsubscribe();
    }, [selectedChat]);

    const loadMessages = useCallback(() => {
        if (!selectedChat) return;
        setIsLoading(true);

        const q = query(
            collection(db, `chats/${selectedChat.id}/messages`),
            orderBy('timestamp', 'desc'),
            limit(50)
        );

        return onSnapshot(q, (querySnapshot) => {
            const messageList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })).reverse();
            setMessages(messageList);
            setIsLoading(false);
        });
    }, [selectedChat]);


    useEffect(() => {
        console.log('dfdfdf')
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 0);
    }, [messages]);



    const handleSendMessage = async (e) => {
        e.preventDefault();
        if ((!newMessage.trim() && uploadedImages.length === 0) || isLoading) return;

        try {
            const messageData = {
                text: newMessage.trim(),
                images: uploadedImages,
                senderId: currentUser.uid,
                timestamp: serverTimestamp(),
                readBy: [currentUser.uid],  // 송신자는 이미 읽은 상태로 배열에 추가
                totalParticipants: selectedChat.participants.length  // 전체 참가자 수
            };

            // 메시지 추가
            await addDoc(collection(db, `chats/${selectedChat.id}/messages`), messageData);
            await updateDoc(doc(db, 'chats', selectedChat.id), {
                lastMessage: newMessage.trim() || '이미지',
                lastMessageTime: serverTimestamp(),
            });

            // 메시지를 전송한 후, 입력 필드 및 이미지 초기화
            setNewMessage('');
            setUploadedImages([]);
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };


    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage(e);
        }
    };

    const handleImageUpload = (imageUrl) => {
        setUploadedImages((prevImages) => [...prevImages, imageUrl]);
    };

    const handleImageDelete = (deletedImageUrl) => {
        setUploadedImages((prevImages) => prevImages.filter(url => url !== deletedImageUrl));
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp.toDate();
        return format(date, 'HH:mm');
    };

    // 1:1 및 그룹 채팅에서 '읽지 않은 사람' 계산
    const calculateUnreadCount = (message) => {
        const totalParticipants = message.totalParticipants || selectedChat.participants.length;
        const readCount = Object.keys(message.readBy || {}).length;

        const unreadCount = totalParticipants - readCount;

        if (selectedChat.participants.length === 2) {
            // 1:1 채팅일 경우
            return unreadCount === 1 ? '1명 안읽음' : '';
        } else {
            // 단체 채팅일 경우
            return unreadCount > 0 ? `${unreadCount}명 안읽음` : '모두 읽음';
        }
    };
    const handleOpenGroupInfo = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleCloseGroupInfo = () => {
        setAnchorEl(null);
    };

    const handleStartDirectChat = async (member) => {
        if (member.id === currentUser.uid) return;

        const existingChatQuery = query(
            collection(db, 'chats'),
            where('participants', '==', [currentUser.uid, member.id].sort())
        );
        const existingChatSnapshot = await getDocs(existingChatQuery);

        if (!existingChatSnapshot.empty) {
            const existingChat = existingChatSnapshot.docs[0].data();
            onStartNewChat({ id: existingChatSnapshot.docs[0].id, ...existingChat });
        } else {
            const newChatRef = await addDoc(collection(db, 'chats'), {
                participants: [currentUser.uid, member.id].sort(),
                isGroupChat: false,
                createdAt: serverTimestamp(),
                lastMessageTime: serverTimestamp(),
            });

            const newChat = {
                id: newChatRef.id,
                participants: [currentUser.uid, member.id].sort(),
                isGroupChat: false,
                name: member.name,
            };

            onStartNewChat(newChat);
        }

        handleCloseGroupInfo();
    };

    const updateMessageReadStatus = async (messageId) => {
        const messageDocRef = doc(db, `chats/${selectedChat.id}/messages`, messageId);
        try {
            await updateDoc(messageDocRef, {
                [`readBy.${currentUser.uid}`]: true,  // 현재 사용자를 읽음으로 업데이트
            });
        } catch (error) {
            console.error("Error updating read status: ", error);
        }
    };

    const groupMembers = selectedChat?.participants?.map(userId =>
        allUsers.find(user => user.id === userId)
    ).filter(Boolean) || [];

    const formatReadStatus = (message) => {
        if (!message.readBy) return ''; // readBy가 없는 경우 처리
        const readCount = Object.keys(message.readBy).length;
        const totalParticipants = message.totalParticipants || selectedChat.participants.length;
        if (readCount === totalParticipants) {
            return "모두 읽음";
        } else if (readCount > 1) {
            return `${readCount}명 읽음`;
        } else {
            return "1명 읽음";
        }
    };
    // 그룹채팅 관련 


    const handleImageClick = (images, index) => {
        setUploadedImages(images);
        setCurrentImageIndex(index);
        setModalOpen(true);
    };

    const showPreviousImage = () => {
        setCurrentImageIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : uploadedImages.length - 1));
    };

    const showNextImage = () => {
        setCurrentImageIndex((prevIndex) => (prevIndex < uploadedImages.length - 1 ? prevIndex + 1 : 0));
    };

    const handleCloseModal = () => {
        setModalOpen(false);
    };

    return (
        <ChatWindowContainer>
            <ChatHeader
                selectedChat={selectedChat}
                groupMembers={groupMembers}
                handleOpenGroupInfo={handleOpenGroupInfo}
            />
            <MessageList
                updateMessageReadStatus={updateMessageReadStatus}
                messages={messages}
                currentUser={currentUser}
                allUsers={allUsers}
                formatTime={formatTime}
                formatReadStatus={calculateUnreadCount} // 읽지 않은 사람 수 계산 함수 적용
                isLoading={isLoading}
                onImageClick={handleImageClick}
            />
            <div ref={messagesEndRef} />
            <ImageModal
                modalOpen={modalOpen}
                handleCloseModal={handleCloseModal}
                images={modalImages}
                currentImageIndex={currentImageIndex}
                showPreviousImage={showPreviousImage}
                showNextImage={showNextImage}
            />
            <InputArea
                newMessage={newMessage}
                setNewMessage={setNewMessage}
                handleSendMessage={handleSendMessage}
                handleKeyPress={handleKeyPress}
                isLoading={isLoading}
                uploadedImages={uploadedImages}
            />
            <ImageUpload
                chatId={selectedChat.id}
            />

            <Popover
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                onClose={handleCloseGroupInfo}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
            >
                <List sx={{ p: 2, maxWidth: 300 }}>
                    <Typography variant="h6" sx={{ mb: 1 }}>Group Members</Typography>
                    {groupMembers.map((member) => (
                        <ListItem key={member.id}>
                            <ListItemAvatar>
                                <Avatar alt={member.name} src={member.photoURL} />
                            </ListItemAvatar>
                            <ListItemText primary={member.name} secondary={member.email} />
                            <ListItemSecondaryAction>
                                <IconButton edge="end" onClick={() => handleStartDirectChat(member)}>
                                    <ChatIcon />
                                </IconButton>
                            </ListItemSecondaryAction>
                        </ListItem>
                    ))}
                </List>
            </Popover>
        </ChatWindowContainer>
    );
}
