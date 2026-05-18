import React, { useState } from 'react';
import { Box, Tabs, Tab, Typography } from '@mui/material';
import Header from '../Admin/Header';
import Packages from './Package';
import Salesgroup from './Salegroup/Salesgroup';
import Reporting from './Reporting/Reporting';
import EmailTemplateList from './EmailTemplates/EmailTemplateList';

const Method = () => {
    const [activeTab, setActiveTab] = useState(0);

    const renderContent = () => {
        switch (activeTab) {
            case 0:
                return <Packages />;
            case 1:
                return <Reporting />;
            case 2:
                return <EmailTemplateList />;
            case 3:
                return <Salesgroup />;
            default:
                return null;
        }
    };

    return (
        <>
            <Header />
            <Box sx={{ display: 'flex', minHeight: '78vh' ,boxShadow:'3'}}>
                <Box sx={{ minWidth: '20%', borderRight: 1, borderColor: 'divider', bgcolor: 'white' }}>
                    <Tabs
                        orientation="vertical"
                        value={activeTab}
                        onChange={(e, newValue) => setActiveTab(newValue)}
                        sx={{
                            '.MuiTab-root': {
                                alignItems: 'flex-start',
                                padding: '15px 16px',
                                textTransform: 'none',
                                fontWeight: '500',
                                fontSize: '17px',
                                borderBottom: 1,
                                borderColor: 'divider',
                                '&.Mui-selected': { bgcolor: 'primary.dark', color: 'white' },
                                '&:hover': { bgcolor: 'action.hover', color: 'black' },
                            },
                        }}
                    >
                        <Tab label="Packages" />
                        <Tab label="Document Templates" />
                        <Tab label="Customer Reporting" />
                        <Tab label="Sales Groups" />
                    </Tabs>
                </Box>
                <Box sx={{ flexGrow: 1, bgcolor: 'white', p: 3 }}>{renderContent()}</Box>
            </Box>
        </>
    );
};

export default Method;
