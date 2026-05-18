import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    IconButton,
} from '@mui/material';
import { FaEnvelope, FaTimes, FaChevronDown } from 'react-icons/fa';
import { TableCell, TableRow } from '@mui/material';
import axios from 'axios';
import { apiPath } from '../../apiPath';

interface EmailItemProps {
    fetchEmails:any;
    id:string;
    recived_from: string;
    subject: string;
    message: string;
    time: string;
    recipient: string;
}

const EmailItem: React.FC<EmailItemProps> = ({ fetchEmails,id, recived_from, subject, message, time, recipient }) => {
    const [isModalOpen, setIsModalOpen] = useState(false); // State for modal open/close
    const [showDetails, setShowDetails] = useState(true);

    const timeAgo = (timestamp: string) => {
        const now = new Date();
        const givenDate = new Date(timestamp);
        const diffInSeconds = Math.floor((now.getTime() - givenDate.getTime()) / 1000);

        if (diffInSeconds < 60) {
            return 'just now';
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        } else {
            const days = Math.floor(diffInSeconds / 86400);
            return `${days} day${days > 1 ? 's' : ''} ago`;
        }
    };

    function formatDate(dateString: string): string {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            throw new Error("Invalid date string");
        }
        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
        const formattedDate: string = date.toLocaleDateString('en-US', options).replace(',', '');
        let hours: number = date.getUTCHours(); // Get hours in UTC
        const minutes: number = date.getUTCMinutes(); // Get minutes in UTC
        const ampm: string = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12; // Convert to 12-hour format
        hours = hours ? hours : 12; // Show 12 instead of 0
        const formattedTime: string = `${hours}:${minutes < 10 ? '0' + minutes : minutes} ${ampm}`;
        return `${formattedDate}, ${formattedTime}`;
    }

    const extractBodyTextFromHTML = (htmlContent: string): string => {
        const tempElement = document.createElement('div');
        tempElement.innerHTML = htmlContent;
        const styles = tempElement.getElementsByTagName('style');
        const scripts = tempElement.getElementsByTagName('script');
        while (styles.length > 0) {
            styles[0].parentNode?.removeChild(styles[0]);
        }
        while (scripts.length > 0) {
            scripts[0].parentNode?.removeChild(scripts[0]);
        }
        const extractedText = tempElement.textContent || tempElement.innerText || '';
        const cleanedText = extractedText.replace(/\s+/g, ' ').trim();
        const words = cleanedText.split(' ');
        const firstFifteenWords = words.slice(0, 25).join(' ');
        return firstFifteenWords;
    };

    const deleteEmail = async (emailId: string) => {
        const isConfirmed = window.confirm('Are you sure you want to delete this email?');
        if (isConfirmed) {
            try {
                await axios.delete(`${apiPath}/api/emails/${emailId}`);
                setIsModalOpen(false);
                fetchEmails()
                console.log('Email deleted successfully');
            } catch (error) {
                console.error('Error deleting email', error);
            }
        } else {
            console.log('Email deletion canceled');
        }
    };


    const bodyText = extractBodyTextFromHTML(message);

    return (
        <>
            <TableRow
                className="hover:bg-gray-50"
                onClick={() => setIsModalOpen(true)} // Open modal on click
            >
                <TableCell>
                    <FaEnvelope className="h-6 w-6 text-success" />
                </TableCell>
                <TableCell className="flex flex-col text-sm">
                    <Typography>{subject}</Typography>
                    <Typography>{bodyText}...</Typography>
                </TableCell>
                <TableCell>{timeAgo(time)}</TableCell>
            </TableRow>
            <Dialog
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                maxWidth="lg" // Maximum width for larger screens
                fullWidth // Full width to make the dialog responsive
                TransitionProps={{ onExited: () => setIsModalOpen(false) }} // Animation prop
            >
                <DialogTitle className="flex justify-between items-center">
                    <div className="flex items-center py-2">
                        <FaEnvelope className="h-5 w-5 text-blue-600 mr-2" aria-hidden="true" />
                        <span className="text-md">{subject}</span> {/* Subject Line */}
                    </div>
                    <IconButton onClick={() => setIsModalOpen(false)} edge="end" color="inherit">
                        <FaTimes />
                    </IconButton>
                </DialogTitle>

                <DialogContent dividers>
                    <div className='mb-4 dropdown_email'>
                        <div className="flex items-center justify-between" onClick={() => setShowDetails(!showDetails)} style={{ cursor: 'pointer' }}>
                            <div className="flex flex-col md:flex-row justify-between w-full">
                                <div className="text-gray-500 text-base mb-1 md:mb-0 md:mr-4">
                                    <span className="font-medium">From: </span>{recived_from}
                                </div>
                                <div className="date text-gray-500 text-base">
                                    <span className="font-medium">Received at: </span>{`${formatDate(time)}`}
                                </div>
                            </div>
                            <div color="inherit" >
                                <FaChevronDown className={`m-3 transform ${showDetails ? 'rotate-180' : ''}`} />
                            </div>
                        </div>
                        {showDetails && (
                            <div className="pb-3 flex flex-col md:flex-row justify-between w-full">
                                <div className=" date text-gray-500 text-base">
                                    <span className="font-medium">Received to: </span>{`${recipient}`}
                                </div>
                                <div>
                                    <Button
                                        onClick={() => deleteEmail(id)}
                                        color="primary"
                                        variant="contained"
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                    <Typography variant="body1" className="mt-4 text-gray-800">
                        <span dangerouslySetInnerHTML={{ __html: message }} />
                    </Typography>
                </DialogContent>


                <DialogActions>
                    <div className="p-2">
                        <Button
                            onClick={() => setIsModalOpen(false)}
                            color="primary"
                            variant="outlined"
                        >
                            Close
                        </Button>
                    </div>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default EmailItem;
