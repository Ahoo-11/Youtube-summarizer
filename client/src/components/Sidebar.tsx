import React from 'react';
import { Drawer, List, ListItemButton, Typography, Box } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import ArchiveIcon from '@mui/icons-material/Archive';

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentTab, onTabChange }) => {
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 280,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 280,
          boxSizing: 'border-box',
          backgroundColor: '#1a1a1a',
          color: '#ffffff',
          borderRight: '1px solid rgba(255, 255, 255, 0.12)',
        },
      }}
    >
      <Box sx={{ overflow: 'auto', mt: 8 }}>
        <List>
          <ListItemButton
            onClick={() => onTabChange('home')}
            selected={currentTab === 'home'}
            sx={{
              mb: 1,
              '&.Mui-selected': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
              },
            }}
          >
            <HomeIcon sx={{ mr: 2, color: 'rgba(255, 255, 255, 0.7)' }} />
            <Typography sx={{ color: '#ffffff' }}>Home</Typography>
          </ListItemButton>
          
          <ListItemButton
            onClick={() => onTabChange('archives')}
            selected={currentTab === 'archives'}
            sx={{
              '&.Mui-selected': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
              },
            }}
          >
            <ArchiveIcon sx={{ mr: 2, color: 'rgba(255, 255, 255, 0.7)' }} />
            <Typography sx={{ color: '#ffffff' }}>All Archives</Typography>
          </ListItemButton>
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
