import React, { useState, useEffect, useRef } from 'react';
import {
    Dialog, DialogActions, DialogContent, DialogTitle,
    IconButton, Button, Tabs, Tab, Box, TextField, Typography, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import EmailEditor from 'react-email-editor';
import { apiPath } from '../../../../apiPath';
import PropTypes from 'prop-types';
import { useForm, Controller } from 'react-hook-form';

interface TabPanelProps {
    children?: React.ReactNode;
    value: number;
    index: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => (
    <div
        role="tabpanel"
        hidden={value !== index}
        id={`tabpanel-${index}`}
        aria-labelledby={`tab-${index}`}
        {...other}
    >
        {value === index && <Box p={3}>{children}</Box>}
    </div>
);

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.any.isRequired,
    value: PropTypes.any.isRequired,
};

interface TemplateData {
    name: string;
    link_template: string;
    status: string;
    documentType: string;
    templateType: string;
    htmlDesign?: object;
}

interface TemplateEditorProps {
    open: boolean;
    onClose: () => void;
    templateId: string;
}

const EmailTemplateEditor: React.FC<TemplateEditorProps> = ({ open, onClose, templateId }) => {
    const emailEditorRef = useRef<any>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [designJson, setDesignJson] = useState<object | null>(null);
    const [isEditorLoaded, setIsEditorLoaded] = useState<boolean>(false);
    const [tabIndex, setTabIndex] = useState<number>(0);
    const [data, setData] = useState<TemplateData | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);

    const { control, handleSubmit, formState: { errors }, reset } = useForm<TemplateData>();

    const fetchTemplate = async () => {
        try {
            const response = await axios.get(`${apiPath}/api/reporting/${templateId}`);
            setDesignJson(response.data.htmlDesign);
            setData(response.data);
            reset(response.data); // Reset form with fetched data
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching template:', error);
            setIsLoading(false);
        }
    };


    const loadDesign = () => {
        if (emailEditorRef.current && designJson && isEditorLoaded) {
            emailEditorRef.current.editor.loadDesign(designJson);
        }
    };

    useEffect(() => {
        if (open && templateId) {
            fetchTemplate();
        }
    }, [open, templateId]);

    useEffect(() => {
        loadDesign(); // Load the design after the data is set
    }, [designJson, isEditorLoaded]);

    const handleSave = () => {
        emailEditorRef.current.editor.exportHtml((data: any) => {
            const { design, html } = data;
            axios.put(`${apiPath}/api/reporting/${templateId}`, { htmlDesign: design, htmlContent: html })
                .then(response => {
                    console.log('Template saved successfully:', response.data);
                    onClose();
                })
                .catch(error => {
                    console.error('Error saving template:', error);
                });
        });
    };

    const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
        setTabIndex(newValue);
    };

    const handleEditDetailOpen = () => {
        setIsEditDialogOpen(true);
    };

    const handleEditDetailClose = () => {
        setIsEditDialogOpen(false);
    };

    const onSubmit = (formData: TemplateData) => {
        axios.put(`${apiPath}/api/reporting/${templateId}`, formData)
            .then(response => {
                console.log('Template details updated successfully:', response.data);
                setData(formData);
                handleEditDetailClose();
            })
            .catch(error => {
                console.error('Error updating template details:', error);
            });
    };

    return (
        <>
            <Dialog open={open} onClose={onClose} fullScreen>
                <div className="flex flex-col h-full">
                    <DialogTitle>
                        <div className="flex justify-between items-center">
                            <span>{data?.name}</span>
                            <IconButton onClick={onClose}>
                                <CloseIcon />
                            </IconButton>
                        </div>
                    </DialogTitle>

                    <DialogContent className="flex-grow px-4 py-4 overflow-auto">
                        <Tabs value={tabIndex} onChange={handleTabChange} aria-label="template editor tabs">
                            <Tab label="Template details" />
                            <Tab label="English" />
                        </Tabs>

                        <TabPanel value={tabIndex} index={0}>
                            <div>
                                <Typography variant="h6" gutterBottom>
                                    Details
                                </Typography>
                                <p><strong>Name:</strong> {data?.name}</p>
                                <p><strong>Status:</strong> {data?.status}</p>
                                <Button variant="outlined" onClick={handleEditDetailOpen} sx={{ marginTop: 2 }}>
                                    Edit Details
                                </Button>
                                <Typography variant="h6" gutterBottom sx={{ marginTop: 2 }}>
                                    Languages
                                </Typography>
                                <p>English</p>
                            </div>
                        </TabPanel>

                        <TabPanel value={tabIndex} index={1}>
                            {isLoading ? (
                                <p>Loading template...</p>
                            ) : (
                                <EmailEditor
                                    ref={emailEditorRef}
                                    onLoad={() => setIsEditorLoaded(true)}
                                />
                            )}
                        </TabPanel>
                    </DialogContent>

                    <DialogActions>
                        <div className="p-4 flex gap-3">
                            {tabIndex === 1 && (
                                <Button onClick={handleSave} color="primary" variant="contained">
                                    Save Template
                                </Button>
                            )}
                            <Button onClick={onClose} color="secondary" variant="outlined">
                                Close
                            </Button>
                        </div>
                    </DialogActions>
                </div>
            </Dialog>

            {/* Edit Details Dialog */}
            <Dialog open={isEditDialogOpen} onClose={handleEditDetailClose} maxWidth="sm" fullWidth>
                <div className="p-4">
                    <DialogTitle>Edit Template Details</DialogTitle>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <DialogContent>
                            <Controller
                                name="name"
                                control={control}
                                defaultValue=""
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        margin="normal"
                                        label="Name"
                                        type="text"
                                        fullWidth
                                        variant="standard"
                                        required
                                    />
                                )}
                            />
                            <div className="mb-4">
                                <FormControl fullWidth variant="standard">
                                    <InputLabel id="template-type-label">Status</InputLabel>
                                    <Controller
                                        name="status"
                                        control={control}
                                        render={({ field }) => (
                                            <Select
                                                {...field}
                                                labelId="template-type-label"
                                                id="template-type-select"
                                                error={!!errors.status} // Make sure to check for errors in the correct field
                                            >
                                                <MenuItem value="Enable">Enable</MenuItem>
                                                <MenuItem value="Disable">Disable</MenuItem>
                                            </Select>
                                        )}
                                    />
                                    {errors.status && (
                                        <p className="text-red text-sm mt-1">{errors.status.message}</p>
                                    )}
                                </FormControl>
                            </div>

                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleEditDetailClose} variant="outlined" color="secondary">
                                Cancel
                            </Button>
                            <Button type="submit" variant="outlined" color="primary">
                                Save
                            </Button>
                        </DialogActions>
                    </form>
                </div>
            </Dialog>
        </>
    );
};

export default EmailTemplateEditor;
