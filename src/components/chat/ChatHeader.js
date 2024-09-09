import React from 'react';
import { Box, Typography, Avatar, IconButton, Badge, Tooltip, AvatarGroup } from '@mui/material';
import { styled } from '@mui/material/styles';
import InfoIcon from '@mui/icons-material/Info';

const ChatHeaderContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing(2),
    borderBottom: `1px solid ${theme.palette.divider}`,
}));

const ChatInfo = styled(Box)({
    display: 'flex',
    alignItems: 'center',
});

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

const GroupMembersPreview = styled(AvatarGroup)(({ theme }) => ({
    marginLeft: theme.spacing(2),
}));

const ChatHeader = ({ selectedChat, groupMembers, handleOpenGroupInfo }) => (
    <ChatHeaderContainer>
        <ChatInfo>
            <OnlineBadge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                variant="dot"
                invisible={selectedChat.isGroupChat || !selectedChat.isOnline}
                sx={{ mr: 2 }}
            >
                <Avatar src={selectedChat.avatar} sx={{ width: 48, height: 48 }} />
            </OnlineBadge>
            <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {selectedChat.name}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                    {selectedChat.isGroupChat
                        ? `${groupMembers.length} members`
                        : selectedChat.isOnline ? 'Online' : 'Offline'
                    }
                </Typography>
            </Box>
        </ChatInfo>
        {selectedChat.isGroupChat && (
            <>
                <GroupMembersPreview max={3}>
                    {groupMembers.map((member) => (
                        <Tooltip title={member.name} key={member.id}>
                            <Avatar alt={member.name} src={member.photoURL} />
                        </Tooltip>
                    ))}
                </GroupMembersPreview>
                <IconButton onClick={handleOpenGroupInfo}>
                    <InfoIcon />
                </IconButton>
            </>
        )}
    </ChatHeaderContainer>
);

export default ChatHeader;