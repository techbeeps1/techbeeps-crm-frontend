import React, { useState } from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import Header from './Header';
import ServicePage from '../Services/ServicePage';
import FurnitureType from '../Services/FurnitureType';
import RoomType from '../Services/RoomType';
// import IconList from '../Services/IconList';

const Services: React.FC = () => {
    const [activeTab, setActiveTab] = useState(0);

    const renderContent = () => {
        switch (activeTab) {
            case 0:
                return (
                    <ServicePage />
                );
            case 1:
                return (
                    <RoomType />
                );
            case 2:
                return (
                    <FurnitureType />
                );
            // case 3:
            //     return (
            //         <IconList/>
            //     );
            default:
                return null;
        }
    };

    return (
        <>
            <Header />
            <Box sx={{ display: 'flex', minHeight: '78vh', boxShadow: 3 }}>
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
                        <Tab label="Services" />
                        <Tab label="Rooms" />
                        <Tab label="Furnitures" />
                        {/* <Tab label="Icons" /> */}
                    </Tabs>
                </Box>
                <Box sx={{ flexGrow: 1, bgcolor: 'white', p: 3 }}>{renderContent()}</Box>
            </Box>
        </>
    );
};

export default Services;
