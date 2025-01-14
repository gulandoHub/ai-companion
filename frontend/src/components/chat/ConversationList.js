import React, { useState } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  IconButton,
  Typography,
  Box,
  Divider,
  Button,
  TextField,
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import { chat } from '../../services/api';

const ConversationList = ({
  conversations,
  setConversations,
  selectedConversation,
  setSelectedConversation,
  onConversationSelect,
}) => {
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');

  console.log('Rendering ConversationList with:', { conversations, selectedConversation });

  const handleNewConversation = async () => {
    try {
      const newConversation = await chat.createConversation();
      setConversations([...conversations, newConversation]);
      setSelectedConversation(newConversation);
      onConversationSelect(newConversation.id);
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  const handleDeleteConversation = async (conversationId, event) => {
    event.stopPropagation();
    try {
      await chat.deleteConversation(conversationId);
      const updatedConversations = conversations.filter(
        (conv) => conv.id !== conversationId
      );
      setConversations(updatedConversations);

      if (selectedConversation?.id === conversationId) {
        const nextConversation = updatedConversations[0];
        setSelectedConversation(nextConversation || null);
        onConversationSelect(nextConversation?.id || null);
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  const handleEditClick = (event, conversation) => {
    event.stopPropagation();
    setEditingId(conversation.id);
    setEditingName(conversation.name || `Chat ${conversation.id}`);
  };

  const handleNameChange = async (event, conversationId) => {
    if (event.key === 'Enter' || event.type === 'blur') {
      event.preventDefault();
      if (!editingName.trim()) return; // Don't save empty names
      
      try {
        const updatedConversation = await chat.updateConversationName(conversationId, editingName.trim());
        setConversations(conversations.map(conv =>
          conv.id === conversationId ? updatedConversation : conv
        ));
        setEditingId(null);
      } catch (error) {
        console.error('Error updating conversation name:', error);
      }
    }
  };

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="h6">Conversations</Typography>
        <Button
          startIcon={<AddCircleOutlineIcon />}
          onClick={handleNewConversation}
          variant="contained"
          size="small"
        >
          New Chat
        </Button>
      </Box>
      <Divider />
      <List sx={{ width: '100%', overflow: 'auto', flex: 1 }}>
        {conversations.map((conversation) => (
          <ListItem
            key={conversation.id}
            onClick={() => {
              setSelectedConversation(conversation);
              onConversationSelect(conversation.id);
            }}
            selected={selectedConversation?.id === conversation.id}
            sx={{
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: 'action.hover',
              },
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              py: 2,
              px: 2,
            }}
          >
            {editingId === conversation.id ? (
              <TextField
                fullWidth
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onKeyPress={(e) => handleNameChange(e, conversation.id)}
                onBlur={(e) => handleNameChange(e, conversation.id)}
                autoFocus
                size="small"
                onClick={(e) => e.stopPropagation()}
                sx={{ mr: 2 }}
              />
            ) : (
              <ListItemText
                primary={conversation.name || `Chat ${conversation.id}`}
                secondary={new Date(conversation.created_at).toLocaleString()}
                sx={{ mr: 2 }}
              />
            )}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton
                onClick={(e) => handleEditClick(e, conversation)}
                size="small"
                sx={{
                  color: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'primary.light',
                    color: 'primary.contrastText',
                  },
                  mr: 1,
                }}
              >
                <EditIcon />
              </IconButton>
              <IconButton
                onClick={(e) => handleDeleteConversation(conversation.id, e)}
                size="small"
                sx={{ 
                  color: 'error.main',
                  '&:hover': {
                    backgroundColor: 'error.light',
                    color: 'error.contrastText',
                  },
                }}
              >
                <ClearIcon />
              </IconButton>
            </Box>
          </ListItem>
        ))}
        {conversations.length === 0 && (
          <ListItem>
            <ListItemText
              primary={
                <Typography align="center" color="textSecondary">
                  No conversations yet
                </Typography>
              }
            />
          </ListItem>
        )}
      </List>
    </Box>
  );
};

export default ConversationList;
