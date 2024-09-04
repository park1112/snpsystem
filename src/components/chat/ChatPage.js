import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Container, Typography, Paper, Box, TextField, Button, List, ListItem, ListItemText } from '@mui/material';
import { useAuthState } from '../../../hooks/useAuthState';

export default function ChatPage() {
    const router = useRouter();
    const { id: chatId } = router.query;
    const [user] = useAuthState();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');

    useEffect(() => {
        if (chatId && user) {
            // Fetch chat messages
            // This is where you'd implement real-time updates with Firebase
        }
    }, [chatId, user]);

    const handleSendMessage = () => {
        // Implement send message logic
        console.log('Sending message:', newMessage);
        setNewMessage('');
    };

    return (
        <Container>
            <Paper elevation={3}>
                <Box p={3}>
                    <Typography variant="h4" gutterBottom>
                        Chat
                    </Typography>
                    <List>
                        {messages.map((message, index) => (
                            <ListItem key={index}>
                                <ListItemText
                                    primary={message.text}
                                    secondary={`${message.user} - ${message.timestamp}`}
                                />
                            </ListItem>
                        ))}
                    </List>
                    <Box display="flex" mt={2}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message"
                        />
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleSendMessage}
                            disabled={!newMessage.trim()}
                        >
                            Send
                        </Button>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
}