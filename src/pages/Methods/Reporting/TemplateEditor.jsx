import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Button, Tabs, Tab, Box, TextField, Typography,
 Select, FormControl, InputLabel, MenuItem } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import EmailEditor from 'react-email-editor';
import { apiPath } from '../../../../apiPath';
import PropTypes from 'prop-types';
import { useForm, Controller } from 'react-hook-form';

const TabPanel = ({ children, value, index, ...other }) => (
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

const TemplateEditor = ({ open, onClose, templateId }) => {
    const emailEditorRef = useRef(null);
    const [isLoading, setIsLoading] = useState(true);
    const [designJson, setDesignJson] = useState(null);
    const [isEditorLoaded, setIsEditorLoaded] = useState(false);
    const [tabIndex, setTabIndex] = useState(0);
    const [data, setData] = useState("");
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const { control, handleSubmit, reset } = useForm();

    const fetchTemplate = async () => {
        try {
            const response = await axios.get(`${apiPath}/api/templates/${templateId}`);
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
        emailEditorRef.current.editor.exportHtml((data) => {
            const { design, html } = data;
            axios.put(`${apiPath}/api/templates/${templateId}`, { htmlDesign: design, htmlContent: html })
                .then(response => {
                    console.log('Template saved successfully:', response.data);
                    onClose();
                })
                .catch(error => {
                    console.error('Error saving template:', error);
                });
        });
    };

    const handleTabChange = (event, newValue) => {
        setTabIndex(newValue);
    };

    const handleEditDetailOpen = () => {
        setIsEditDialogOpen(true);
    };

    const handleEditDetailClose = () => {
        setIsEditDialogOpen(false);
    };

    const onSubmit = (formData) => {
        axios.put(`${apiPath}/api/templates/${templateId}`, formData)
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
                            <span>{data && data.name}</span>
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
                                <p><strong>Name:</strong> {data && data.name}</p>
                                <p><strong>Linked email template:</strong> {data && data.link_template || "Not Linked"}</p>
                                <p><strong>Expiration period:</strong> {data && data.expiryPeriod}</p>
                                <p><strong>Type document:</strong> {data && data.documentType}</p>
                                <p><strong>Type template:</strong> {data && data.templateType}</p>
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
                        <div className='p-4 flex gap-3'>
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
                <div className='p-4'>
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
                                        margin="dense"
                                        label="Name"
                                        type="text"
                                        fullWidth
                                        variant="outlined"
                                        required
                                    />
                                )}
                            />
                            <Controller
                                name="expiryPeriod"
                                control={control}
                                defaultValue=""
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        margin="dense"
                                        label="Expiration period"
                                        type="text"
                                        fullWidth
                                        variant="outlined"
                                    />
                                )}
                            />
                            {/* <Controller
                                name="documentType"
                                control={control}
                                defaultValue=""
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        margin="dense"
                                        label="Type document"
                                        type="text"
                                        fullWidth
                                        variant="outlined"
                                    />
                                )}
                            /> */}
                            <Controller
                             name="documentType"
                             control={control}
                             defaultValue=""
                             render={({ field }) => (
                               <FormControl fullWidth margin="dense" 
                               >
                                 <InputLabel id="document-type-label">Document Type*</InputLabel>
                                 <Select
                                   labelId="document-type-label"
                                   id="document-type-select"
                                   label="Document Type*"
                                   {...field}
                                   required
                                 >
                                   <MenuItem value="invoice">Invoice</MenuItem>
                                   <MenuItem value="quote">Quote</MenuItem>
                                   <MenuItem value="contract">Contract</MenuItem>
                                 </Select>
                               </FormControl>
                             )}
                           />

                           <Controller
                             name="templateType"
                             control={control}
                             defaultValue=""
                             render={({ field }) => (
                               <FormControl fullWidth margin="dense" 
                               >
                                 <InputLabel id="template-type-label">Template Type*</InputLabel>
                                 <Select
                                   labelId="template-type-label"
                                   id="template-type-select"
                                   label="Template Type*"
                                   {...field}
                                   required
                                 >
                                   <MenuItem value="basic">Basic</MenuItem>
                                    <MenuItem value="detailed">Detailed</MenuItem>
                                    <MenuItem value="custom">Custom</MenuItem>
                                 </Select>
                               </FormControl>
                             )}
                           />

                            {/* <Controller
                                name="templateType"
                                control={control}
                                defaultValue=""
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        margin="dense"
                                        label="Type template"
                                        type="text"
                                        fullWidth
                                        variant="outlined"
                                    />
                                )}
                            /> */}
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

export default TemplateEditor;
