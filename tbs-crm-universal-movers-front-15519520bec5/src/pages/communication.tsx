import React, { useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Tabs, Tab, Box, AppBar } from '@mui/material';
import DemoChat from '../DemoChat';
import NewsItems from './communicationModule/newsItems';
import EmailComponent from './Emailpage/EmailComponent';
import { EmailContext } from '../EmailProvider/EmailContext';

const Communication: React.FC = () => {
  const context = useContext(EmailContext);
  if (!context) {
    throw new Error('EmailContext must be used within an EmailProvider');
  }

  const location = useLocation();
  const navigate = useNavigate();

  const getActiveTab = (): number => {
    const queryParams = new URLSearchParams(location.search);
    if (queryParams.get('email') === 'true') return 1;
    if (queryParams.get('news') === 'true') return 2;
    return 0; // Default to Chat
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number): void => {
    if (newValue === 0) navigate('?chat=true');
    if (newValue === 1) navigate('?email=true');
    if (newValue === 2) navigate('?news=true');
  };

  return (
    <>
      <AppBar position="static" sx={{ backgroundColor: 'white'}}>
        <Tabs
          value={getActiveTab()}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Chat" sx={{ fontSize: '15px',fontWeight:'bold' }} />
          <Tab label="Email" sx={{ fontSize: '15px',fontWeight:'bold' }} />
          <Tab label="News Items" sx={{ fontSize: '15px',fontWeight:'bold' }} />
        </Tabs>
      </AppBar>
      <div className='bg-white mt-1'>
        {getActiveTab() === 0 && <DemoChat />}
        {getActiveTab() === 1 && <EmailComponent />}
        {getActiveTab() === 2 && <NewsItems />}
      </div>
    </>
  );
};

export default Communication;
