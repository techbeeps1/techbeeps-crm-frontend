import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppBar, Tabs, Tab, Box, Fade } from '@mui/material';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const links = [
    { name: 'Account', path: '/settings' },
    { name: 'Method', path: '/settings/workflows' },
    { name: 'Services', path: '/settings/services' }
  ];

  const activeTabIndex = links.findIndex(link => link.path === location.pathname);

  const handleTabChange = (event, newValue) => {
    navigate(links[newValue].path);
  };

  return (
    <AppBar position="static" color="default" sx={{ boxShadow: 1, marginBottom: 1 }}>
      <Box sx={{ bgcolor: 'background.paper', borderBottom: 0}}>
        <Tabs
          value={activeTabIndex}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{
            '.MuiTab-root': {
              textTransform: 'none',
              fontSize: '17px',
              fontWeight: '600',
              padding: '20px 20px',
              '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.08)' },
              '&.Mui-selected': { color: 'primary.main', fontWeight: 'bold' },
              transition: 'all 0.3s ease',
            },
            '.MuiTabs-indicator': {
              transition: 'transform 0.3s ease-in-out', // Smooth tab indicator transition
            },
          }}
        >
          {links.map((link, index) => (
            <Tab key={index} label={link.name} />
          ))}
        </Tabs>
      </Box>
    </AppBar>
  );
};

export default Header;
