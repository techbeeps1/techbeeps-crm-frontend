import React, { useState } from 'react';
import {
    Dialog,
    IconButton,
} from '@mui/material';
import { 
    MdEmail, 
    MdDeleteOutline, 
    MdKeyboardArrowDown, 
    MdClose, 
    MdAccessTime, 
    MdPerson, 
    MdAlternateEmail,
    MdCalendarToday
} from 'react-icons/md';
import axios from 'axios';
import { apiPath } from '../../apiPath';

interface EmailItemProps {
    fetchEmails: any;
    id: string;
    recived_from: string;
    subject: string;
    message: string;
    time: string;
    recipient: string;
}

const EmailItem: React.FC<EmailItemProps> = ({ 
    fetchEmails, 
    id, 
    recived_from, 
    subject, 
    message, 
    time, 
    recipient 
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showDetails, setShowDetails] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);

    const timeAgo = (timestamp: string) => {
        if (!timestamp) return '';
        const now = new Date();
        const givenDate = new Date(timestamp);
        if (isNaN(givenDate.getTime())) return '';
        const diffInSeconds = Math.floor((now.getTime() - givenDate.getTime()) / 1000);

        if (diffInSeconds < 60) {
            return 'just now';
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `${minutes}m ago`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${hours}h ago`;
        } else {
            const days = Math.floor(diffInSeconds / 86400);
            return `${days}d ago`;
        }
    };

    function formatDate(dateString: string): string {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return 'Invalid Date';
        }
        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
        const formattedDate: string = date.toLocaleDateString('en-US', options).replace(',', '');
        let hours: number = date.getUTCHours();
        const minutes: number = date.getUTCMinutes();
        const ampm: string = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        const formattedTime: string = `${hours}:${minutes < 10 ? '0' + minutes : minutes} ${ampm}`;
        return `${formattedDate}, ${formattedTime}`;
    }

    const extractBodyTextFromHTML = (htmlContent: string): string => {
        if (!htmlContent) return '';
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
        const firstWords = words.slice(0, 18).join(' ');
        return firstWords;
    };

    const deleteEmail = async (emailId: string) => {
        const isConfirmed = window.confirm('Are you sure you want to delete this email?');
        if (isConfirmed) {
            try {
                setIsDeleting(true);
                await axios.delete(`${apiPath}/api/emails/${emailId}`);
                setIsModalOpen(false);
                if (typeof fetchEmails === 'function') {
                    fetchEmails();
                }
            } catch (error) {
                console.error('Error deleting email', error);
            } finally {
                setIsDeleting(false);
            }
        }
    };

    const bodyText = extractBodyTextFromHTML(message);
    const senderInitials = (recived_from || 'U').substring(0, 2).toUpperCase();

    return (
        <>
            {/* Email Row Item */}
            <div
                onClick={() => setIsModalOpen(true)}
                className="grid grid-cols-12 gap-3 px-6 py-4 items-center hover:bg-indigo-50/30 cursor-pointer transition-colors duration-150 group"
            >
                {/* Icon / Avatar */}
                <div className="col-span-1 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center font-bold text-xs transition-colors duration-200">
                        <MdEmail className="w-4 h-4" />
                    </div>
                </div>

                {/* Subject & Preview */}
                <div className="col-span-8 sm:col-span-8 pr-2">
                    <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-bold text-slate-900 truncate">
                            {subject || "(No Subject)"}
                        </span>
                        {recived_from && (
                            <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600 truncate max-w-[150px]">
                                {recived_from}
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-1 group-hover:text-slate-700 transition-colors">
                        {bodyText ? `${bodyText}...` : 'No preview available'}
                    </p>
                </div>

                {/* Date / Time */}
                <div className="col-span-3 text-right">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 bg-slate-100/70 px-2.5 py-1 rounded-lg">
                        <MdAccessTime className="w-3 h-3" />
                        {timeAgo(time) || formatDate(time)}
                    </span>
                </div>
            </div>

            {/* Modern Email Reader Modal */}
            <Dialog
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: '24px',
                        overflow: 'hidden',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                    }
                }}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-indigo-50/20">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
                            <MdEmail className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base sm:text-lg font-bold text-slate-900 line-clamp-1">
                                {subject || "(No Subject)"}
                            </h3>
                            <span className="text-xs text-slate-400 font-medium">Email Conversation</span>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(false)}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                        <MdClose className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
                    {/* Metadata Card */}
                    <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-4">
                        <div 
                            className="flex items-center justify-between cursor-pointer select-none"
                            onClick={() => setShowDetails(!showDetails)}
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-2 pr-2">
                                <div className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                                    <span className="text-slate-400 font-medium">From:</span>
                                    <span className="text-slate-900 bg-white px-2 py-1 rounded-md border border-slate-200/80">{recived_from || 'N/A'}</span>
                                </div>
                                <div className="text-xs text-slate-500 flex items-center gap-1">
                                    <MdCalendarToday className="w-3.5 h-3.5 text-slate-400" />
                                    <span>{formatDate(time)}</span>
                                </div>
                            </div>
                            <div className="text-slate-400 hover:text-slate-600">
                                <MdKeyboardArrowDown className={`w-5 h-5 transform transition-transform duration-200 ${showDetails ? 'rotate-180' : ''}`} />
                            </div>
                        </div>

                        {showDetails && (
                            <div className="pt-4 mt-4 border-t border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                                    <span className="text-slate-400 font-medium">To:</span>
                                    <span className="text-slate-900 bg-white px-2 py-1 rounded-md border border-slate-200/80">{recipient || 'N/A'}</span>
                                </div>
                                <div>
                                    <button
                                        onClick={() => deleteEmail(id)}
                                        disabled={isDeleting}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors disabled:opacity-50"
                                    >
                                        <MdDeleteOutline className="w-4 h-4" />
                                        <span>{isDeleting ? "Deleting..." : "Delete Email"}</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Email Body Content */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm min-h-[160px]">
                        <div 
                            className="text-slate-800 text-sm leading-relaxed prose max-w-none break-words"
                            dangerouslySetInnerHTML={{ __html: message }}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-100 bg-slate-50/50">
                    <button
                        onClick={() => setIsModalOpen(false)}
                        className="px-5 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-200/80 border border-slate-300 bg-white transition-colors shadow-sm"
                    >
                        Close
                    </button>
                </div>
            </Dialog>
        </>
    );
};

export default EmailItem;
