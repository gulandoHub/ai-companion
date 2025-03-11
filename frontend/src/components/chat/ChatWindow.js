import React, { useState, useEffect, useRef } from 'react';
import { Box, TextField, IconButton, Paper, Typography, Button } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { chat } from '../../services/api';

const Message = ({ content, isAi }) => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: isAi ? 'flex-start' : 'flex-end',
      mb: 2,
    }}
  >
    <Paper
      sx={{
        p: 2,
        maxWidth: '70%',
        backgroundColor: isAi ? '#f5f5f5' : '#e3f2fd',
        borderRadius: isAi ? '20px 20px 20px 5px' : '20px 20px 5px 20px',
      }}
    >
      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
        {content}
      </Typography>
    </Paper>
  </Box>
);

const ChatWindow = ({ conversationId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    if (!conversationId) return;
    try {
      const data = await chat.getMessages(conversationId);
      setMessages(data);
      scrollToBottom();
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !conversationId || isLoading) return;

    setIsLoading(true);
    const userMessage = {
      content: newMessage,
      is_ai: false,
      id: Date.now(), // temporary ID
      created_at: new Date().toISOString()
    };
    
    // Immediately add user's message to the UI
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setNewMessage('');
    
    try {
      const response = await chat.sendMessage(conversationId, userMessage.content);
      // Keep the user's message and add the AI's response
      setMessages(prevMessages => [...prevMessages, response]);
      scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove the temporary message if there was an error
      setMessages(prevMessages => prevMessages.filter(msg => msg.id !== userMessage.id));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 3 }}>
        {messages.map((message) => (
          <Message
            key={message.id}
            content={message.content}
            isAi={message.is_ai}
          />
        ))}
        <div ref={messagesEndRef} />
      </Box>
      <Box
        component="form"
        onSubmit={handleSendMessage}
        sx={{
          p: 2,
          borderTop: 1,
          borderColor: 'divider',
          backgroundColor: 'background.paper',
        }}
      >
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            size="medium"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={isLoading}
            sx={{ backgroundColor: 'white' }}
          />
          <Button
            variant="contained"
            type="submit"
            disabled={isLoading}
            endIcon={<SendIcon />}
          >
            Send
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default ChatWindow;
