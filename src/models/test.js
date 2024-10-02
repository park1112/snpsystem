
// import React, { useEffect } from 'react';
// import { Box, CircularProgress } from '@mui/material';
// import { styled } from '@mui/material/styles';
// import MessageItem from './MessageItem';

// const MessagesBox = styled(Box)(({ theme }) => ({
//     flexGrow: 1,
//     overflow: 'auto',
//     padding: theme.spacing(2),
//     backgroundColor: theme.palette.background.default,
// }));

// const MessageList = ({ messages, currentUser, allUsers, formatTime, formatReadStatus, isLoading, onImageClick, updateMessageReadStatus }) => {

//     useEffect(() => {
//         messages.forEach(message => {
//             // 사용자가 메시지를 읽지 않은 경우
//             if (!message.readBy || !message.readBy[currentUser.uid]) {
//                 updateMessageReadStatus(message.id);  // 읽음 상태 업데이트
//             }
//         });
//     }, [messages]);



//     return (
//         <MessagesBox>
//             {isLoading && <CircularProgress />}
//             {messages.map((message) => {
//                 const isOwnMessage = message.senderId === currentUser.uid;
//                 const sender = allUsers.find(user => user.id === message.senderId) || { name: 'Unknown User' };
//                 return (
//                     <MessageItem
//                         key={message.id}
//                         message={message}
//                         isOwnMessage={message.senderId === currentUser.uid}
//                         sender={allUsers.find(user => user.id === message.senderId)}
//                         formatTime={formatTime}
//                         formatReadStatus={formatReadStatus}
//                         onImageClick={onImageClick}
//                     />
//                 );
//             })}
//         </MessagesBox>
//     );
// };

// export default MessageList;