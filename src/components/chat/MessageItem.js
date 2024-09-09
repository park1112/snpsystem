import React from 'react';
import { Box, Typography, Avatar } from '@mui/material';
import { styled } from '@mui/material/styles';

// 왼쪽 버블 (타인 메시지)
const LeftBubble = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'flex-start',
    flexDirection: 'row',
    marginBottom: theme.spacing(1),
    maxWidth: '70%',
    backgroundColor: theme.palette.grey[300],
    padding: theme.spacing(1),
    borderRadius: '15px',
    color: theme.palette.text.primary,
    wordBreak: 'break-word', // 긴 단어가 있을 경우 줄바꿈
    whiteSpace: 'pre-wrap',  // 여러 줄 텍스트가 있을 경우 줄바꿈
}));

// 오른쪽 버블 (자신 메시지)
const RightBubble = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'flex-end',
    flexDirection: 'row-reverse',
    marginBottom: theme.spacing(1),
    maxWidth: '70%',
    backgroundColor: theme.palette.primary.main,
    padding: theme.spacing(1),
    borderRadius: '15px',
    color: theme.palette.primary.contrastText,
    wordBreak: 'break-word', // 텍스트 자동 줄바꿈
}));

// 메시지 내용 및 이미지를 표시하는 컴포넌트 (시간 제외)
const MessageContent = ({ message }) => (
    <Box>
        <Typography variant="body2" style={{ whiteSpace: 'pre-wrap' }}>
            {message.text}
        </Typography>
        {message.images?.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, marginTop: 0.5 }}>
                {message.images.map((imageUrl, idx) => (
                    <img key={idx} src={imageUrl} alt="이미지" style={{ width: 100, height: 100, borderRadius: 8 }} />
                ))}
            </Box>
        )}
    </Box>
);

// MessageItem 컴포넌트
const MessageItem = ({ message, isOwnMessage, sender, formatTime, formatReadStatus }) => (
    <Box
        sx={{
            display: 'flex',
            flexDirection: 'column', // 시간과 메시지를 수직으로 배치
            alignItems: isOwnMessage ? 'flex-end' : 'flex-start', // 자신이면 오른쪽 정렬, 타인이면 왼쪽 정렬
            marginBottom: 2,
        }}
    >
        <Box
            sx={{
                display: 'flex',
                justifyContent: isOwnMessage ? 'flex-end' : 'flex-start', // 버블의 정렬
                alignItems: 'flex-start',
                width: '100%',
            }}
        >
            {!isOwnMessage && (
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <Avatar alt={sender.name} src={sender.photoURL} sx={{ marginRight: 1 }} />
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        {/* 닉네임을 메시지 버블 위로 이동 */}
                        <Typography variant="caption" color="textSecondary" sx={{ marginBottom: 0.5 }}>
                            {sender.name}
                        </Typography>
                        <LeftBubble>
                            <MessageContent message={message} />
                        </LeftBubble>
                    </Box>
                </Box>
            )}

            {isOwnMessage && (
                <RightBubble>
                    <MessageContent message={message} />
                </RightBubble>
            )}
        </Box>

        {/* 시간과 몇 명 읽음 표시 */}
        <Typography variant="caption" color="textSecondary" sx={{ marginTop: 0.5 }}>
            {formatTime(message.timestamp)}{' '}
            {formatReadStatus && (
                <Typography component="span" variant="caption" color="textSecondary">
                    {formatReadStatus(message)} {/* 몇 명 읽음 표시 */}
                </Typography>
            )}
        </Typography>
    </Box>
);

export default MessageItem;
