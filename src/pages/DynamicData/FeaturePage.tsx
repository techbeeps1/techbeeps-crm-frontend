import React, { useState, useEffect } from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import Features from './DynamicInputs/Features';
import InputHander from './DynamicInputs/InputHander';

const FeaturePage: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const defaultTab = Number(searchParams.get('active')) || 0;
    const [activeTab, setActiveTab] = useState<number>(defaultTab);

    useEffect(() => {
        setSearchParams({ active: String(activeTab) });
    }, [activeTab, setSearchParams]);

    const renderContent = () => (
        <>
            <Box sx={{ display: activeTab === 0 ? 'block' : 'none' }}>
                <Features />
            </Box>
            <Box sx={{ display: activeTab === 1 ? 'block' : 'none' }}>
                <InputHander type='country' />
            </Box>
            <Box sx={{ display: activeTab === 2 ? 'block' : 'none' }}>
                <InputHander type='Skill' />
            </Box>
            <Box sx={{ display: activeTab === 3 ? 'block' : 'none' }}>
                <InputHander type='Licence' />
            </Box>
            <Box sx={{ display: activeTab === 4 ? 'block' : 'none' }}>
                <InputHander type='tax' />
            </Box>
            <Box sx={{ display: activeTab === 5 ? 'block' : 'none' }}>
                <InputHander type='property' />
            </Box>
        </>
    );

    return (
        <Box className="mt-2 p-2 bg-white flex md:flex-row flex-col" sx={{ minHeight: '80vh' }}>
            <Box sx={{ minWidth: '20%', borderRight: 1, borderColor: 'divider', bgcolor: 'white' }}>
                <Tabs
                    orientation="vertical"
                    value={activeTab}
                    onChange={(e, newValue: number) => setActiveTab(newValue)}
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
                    <Tab label="Features" />
                    <Tab label="Country" />
                    <Tab label="Staff Skills" />
                    <Tab label="Licence" />
                    <Tab label="Tax" />
                    <Tab label="Property" />
                </Tabs>
            </Box>
            <Box sx={{ flexGrow: 1, bgcolor: 'white', p: 2 }}>{renderContent()}</Box>
        </Box>
    );
};

export default FeaturePage;
