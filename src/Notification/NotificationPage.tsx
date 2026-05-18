import React, { useContext } from 'react';
import { AiOutlineClose, AiOutlineClockCircle } from 'react-icons/ai';
import Breadcrumb from '../components/Breadcrumb';
import { EmailContext } from '../EmailProvider/EmailContext'; // Import types from your context
import axios from 'axios';
import { chatApiPath } from '../../apiPath';

interface NotificationPageProps {
  display: string; // Type for the display prop
}

const NotificationPage: React.FC<NotificationPageProps> = ({ display }) => {
  const { notification, setNotification } = useContext(EmailContext);

  // Format the date to 'day month year, hour:minute AM/PM'
  const formatDate = (isoDate: string): string => {
    const date = new Date(isoDate);
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    };
    return date.toLocaleDateString('en-GB', options).replace(',', ' at');
  };

  // Mark the message as read and remove it from the notification list
  const markAsRead = async (messageId: string): Promise<void> => {
    try {
      await axios.put(`${chatApiPath}/messages/${messageId}/markAsRead`, {}, { withCredentials: true });
      setNotification(notification.filter((message: any) => message._id !== messageId));
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  return (
    <>
      <div style={{ display: display }}>
        <Breadcrumb pageName="Notifications" />
      </div>
      <div className="mx-auto bg-gray-50 p-6 rounded-lg shadow-lg">
        <div className="space-y-2">
          {notification.length > 0 ? notification.map((notification, index) => (
            <div
              key={index}
              className="relative flex items-start bg-white p-4 rounded-lg shadow-md"
            >
              <AiOutlineClose
                onClick={() => markAsRead(notification._id)}
                className="absolute top-2 right-2 text-gray-700 hover:text-red-500 cursor-pointer"
              />
              <div
                style={{ width: '40px' }}
                className={`flex items-center justify-center text-xs font-semibold text-white rounded`}
              >
                <img
                  src="https://play-lh.googleusercontent.com/c5HiVEILwq4DqYILPwcDUhRCxId_R53HqV_6rwgJPC0j44IaVlvwASCi23vGQh5G3LIZ"
                  alt=""
                />
              </div>
              <div className="ml-4 flex-grow">
                <h3 className="text-lg font-semibold text-gray-800">
                  {notification.sender['username']} sent new message
                </h3>
                <p className="text-sm text-gray-500 mb-1">
                  {notification.text}
                </p>
              </div>
              <div className="ml-4 mr-4 flex items-center text-gray-400 text-sm">
                <AiOutlineClockCircle className="mr-1" />
                {formatDate(notification.createdAt)}
              </div>
            </div>
          )) : <span>No new Notifications</span>}
        </div>
      </div>
    </>
  );
};

export default NotificationPage;
