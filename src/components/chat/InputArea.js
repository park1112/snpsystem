import React from 'react';
import { Box, TextField, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import SendIcon from '@mui/icons-material/Send';

const InputAreaContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(2),
    borderTop: `1px solid ${theme.palette.divider}`,
}));

const InputArea = ({ newMessage, setNewMessage, handleSendMessage, handleKeyPress, isLoading, uploadedImages }) => {
    const onSubmit = (e) => {
        e.preventDefault();
        handleSendMessage(e);
        setNewMessage(''); // 메시지 전송 후 텍스트 필드를 이곳에서도 다시 초기화
    };


    return (
        <InputAreaContainer component="form" onSubmit={onSubmit}>
            <Box sx={{ display: 'flex', mt: 1 }}>
                <TextField
                    fullWidth
                    multiline
                    maxRows={4}
                    variant="outlined"
                    placeholder="메시지를 입력해주세요."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    sx={{ mr: 1 }}
                />
                <Button
                    type="submit"
                    variant="contained"
                    endIcon={<SendIcon />}
                    disabled={(!newMessage.trim() && uploadedImages.length === 0) || isLoading}
                >
                    Send
                </Button>
            </Box>
        </InputAreaContainer>
    );
};

export default InputArea;