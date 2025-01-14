import React, { useState, useEffect } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  IconButton,
  Button,
  Divider,
  TextField,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { chat } from '../services/api';
import ChatWindow from '../components/chat/ChatWindow';

const drawerWidth = 280;

const Chat = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const data = await chat.getConversations();
      setConversations(data);
      if (data.length > 0 && !selectedConversation) {
        setSelectedConversation(data[0].id);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNewChat = async () => {
    try {
      const newConversation = await chat.createConversation();
      setConversations(prev => [newConversation, ...prev]);
      setSelectedConversation(newConversation.id);
    } catch (error) {
      console.error('Error creating new conversation:', error);
    }
  };

  const handleDeleteConversation = async (conversationId, event) => {
    event.stopPropagation();
    try {
      await chat.deleteConversation(conversationId);
      setConversations(prev => prev.filter(conv => conv.id !== conversationId));
      if (selectedConversation === conversationId) {
        const nextConversation = conversations.find(conv => conv.id !== conversationId);
        setSelectedConversation(nextConversation?.id || null);
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleFineTuning = async () => {
    try {
      await chat.startFineTuning();
      alert('Fine-tuning started successfully!');
    } catch (error) {
      console.error('Error starting fine-tuning:', error);
      alert('Failed to start fine-tuning.');
    }
  };

  const handleEditConversation = async (convId, event) => {
    event.stopPropagation();
    setEditingId(convId);
    const conv = conversations.find(c => c.id === convId);
    setEditingName(conv.name || `Chat ${conv.id}`);
  };

  const handleNameChange = async (event, convId) => {
    event.preventDefault();
    if (!editingName.trim()) return;
    
    try {
      const updatedConversation = await chat.updateConversationName(convId, editingName.trim());
      setConversations(conversations.map(conv =>
        conv.id === convId ? updatedConversation : conv
      ));
      setEditingId(null);
    } catch (error) {
      console.error('Error updating conversation name:', error);
    }
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          AI Companion
        </Typography>
      </Toolbar>
      <Divider />
      <Button
        startIcon={<AddIcon />}
        onClick={handleNewChat}
        sx={{ m: 1 }}
        variant="contained"
      >
        New Chat
      </Button>
      <List sx={{ flexGrow: 1, overflow: 'auto' }}>
        {conversations.map((conv) => (
          <ListItem 
            key={conv.id} 
            disablePadding
            secondaryAction={
              <Box sx={{ display: 'flex' }}>
                <IconButton 
                  edge="end" 
                  aria-label="edit"
                  onClick={(e) => handleEditConversation(conv.id, e)}
                  sx={{ 
                    color: 'primary.main',
                    mr: 1 
                  }}
                >
                  <EditIcon />
                </IconButton>
                <IconButton 
                  edge="end" 
                  aria-label="delete"
                  onClick={(e) => handleDeleteConversation(conv.id, e)}
                  sx={{ color: 'error.main' }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            }
          >
            <ListItemButton
              selected={selectedConversation === conv.id}
              onClick={() => setSelectedConversation(conv.id)}
            >
              {editingId === conv.id ? (
                <TextField
                  fullWidth
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleNameChange(e, conv.id);
                    }
                  }}
                  onBlur={(e) => handleNameChange(e, conv.id)}
                  autoFocus
                  size="small"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <ListItemText
                  primary={conv.name || `Chat ${conv.id}`}
                  secondary={new Date(conv.created_at).toLocaleDateString()}
                />
              )}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <Button
        onClick={handleLogout}
        sx={{ m: 1 }}
        variant="outlined"
        color="error"
      >
        Logout
      </Button>
      <Button
        onClick={handleFineTuning}
        sx={{ m: 1 }}
        variant="contained"
        color="primary"
      >
        Start Fine Tuning
      </Button>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Chat
          </Typography>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Toolbar />
        {selectedConversation ? (
          <ChatWindow conversationId={selectedConversation} />
        ) : (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
            }}
          >
            <Typography variant="h6" color="text.secondary">
              Select or start a new conversation
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Chat;
