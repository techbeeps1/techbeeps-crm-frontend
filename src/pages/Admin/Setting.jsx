import React, { useState,useContext } from 'react';
import { Box, Tabs, Tab, Typography, TextField, MenuItem, Button } from '@mui/material';
import CompanySettings from './CompanyDetail';
import MoneyFormatSettings from './CurrencySetting';
import LogoUploadForm from './Logo';
import Header from './Header';
import RoleSettings from './RoleSetting';
import { UserContext } from '../../UserContext';

const AppSettings = () => {
    const [activeTab, setActiveTab] = useState(0);
    const { userData } = useContext(UserContext);

    const renderContent = () => {
        switch (activeTab) {
            case 0:
                return (
                    <Box>
                        <Typography variant="h5" gutterBottom>
                            General Settings
                        </Typography>
                        <Box component="form" sx={{ mt: 3 }} noValidate autoComplete="off">
                            <Box sx={{ mb: 3 }}>
                                <TextField
                                    select
                                    fullWidth
                                    label="Language"
                                    defaultValue="US English"
                                    variant="standard"
                                >
                                    <MenuItem value="US English">US English</MenuItem>
                                    <MenuItem value="UK English">UK English</MenuItem>
                                </TextField>
                            </Box>
                            <Box sx={{ mb: 3 }}>
                                <TextField
                                    select
                                    fullWidth
                                    label="Country"
                                    defaultValue="IN India"
                                    variant="standard"
                                >
                                    <MenuItem value="IN India">IN India</MenuItem>
                                    <MenuItem value="US United States">US United States</MenuItem>
                                </TextField>
                            </Box>
                            <Box sx={{ mb: 3 }}>
                                <TextField
                                    fullWidth
                                    label="Email"
                                    type="email"
                                    defaultValue={userData?.email}
                                    variant="standard"
                                    // disabled
                                />
                            </Box>
                            <Button variant="contained" color="primary">
                                Save
                            </Button>
                        </Box>
                    </Box>
                );
            case 1:
                return (
                    <Box>
                        <CompanySettings />
                    </Box>
                )
            case 2:
                return <MoneyFormatSettings />;
            case 3:
                return (
                    <Box>
                        <Typography variant="h5" gutterBottom>
                            Company Logo
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 2 }}>
                            Update your company logo below.
                        </Typography>
                        <LogoUploadForm />
                    </Box>
                );
                case 4:
                return <RoleSettings />;
            default:
                return null;
        }
    };

    return (
        <>
            <Header />
            <Box className="flex md:flex-row flex-col" sx={{ minHeight: '78vh', boxShadow: 3 }}>
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
                        <Tab label="General Settings" />
                        <Tab label="Company Settings" />
                        <Tab label="Currency Settings" />
                        <Tab label="Company Logo" />
                        <Tab label="Role Settings" />
                    </Tabs>
                </Box>
                <Box sx={{ flexGrow: 1, bgcolor: 'white', p: 3 }}>{renderContent()}</Box>
            </Box>
        </>
    );
};

export default AppSettings;
