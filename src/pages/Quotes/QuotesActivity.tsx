import React, { useState, useEffect } from "react";
import {
  VerticalTimeline,
  VerticalTimelineElement,
} from "react-vertical-timeline-component";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
} from '@mui/material';
import { FaEnvelope, FaTimes, FaChevronDown } from 'react-icons/fa';
import "react-vertical-timeline-component/style.min.css";
import { Email, CheckCircle, Warning } from "@mui/icons-material";
import { Typography } from "@mui/material";
import axios from "axios";
import { apiPath } from "../../../apiPath";
import { toast } from 'react-toastify';
import Loader from "../../common/Loader";

interface Activity {
  type: string;
  title: string;
  comment: string;
  description: string;
  date: string;
  icon: React.ReactNode;
  background: string;
  sender: string;
  email: string;
}

const QuotesActivity: React.FC<{ invoiceData: any }> = ({ invoiceData }) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal open/close
  const [showDetails, setShowDetails] = useState(true);
  const [emailData, setEmailData] = useState<any>()
  const [loading, setLoading] = useState<boolean>(true);


  const notifyError = (message: string) => toast.error(message, {
    autoClose: 2000,
  });

  const handleActivity = async () => {
    setLoading(true);

    if (!invoiceData?._id) {
      setActivities([]);
      setLoading(false);
      return;
    }
    try {
      
      const response = await axios.get(`${apiPath}/api/activities?offer=${invoiceData?._id}`);
      setActivities(response.data)
      const activiteList: Activity[] = response?.data.map((item: any) => ({
        ...item,
        icon: getIconByType(item.status),
      }));
      setActivities(activiteList)
    } catch (error) {
   
      notifyError(`Error ${error}`);
      setActivities([])
    } finally {
      setLoading(false);
    }
  };

  const fetchEmail = async (emailId: string) => {
    setLoading(true);
    setIsModalOpen(true)
    try {
      let response = await axios.get(`${apiPath}/api/emails/${emailId}`);
      setEmailData(response.data)
    } catch (error: any) {
      notifyError(`Error deleting email : ${error.message}`);
    } finally {
      setLoading(false);
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

  useEffect(() => {
    handleActivity()
  }, [])

  const getIconByType = (type: string): React.ReactNode => {
    switch (type) {
      case "error":
        return <Warning className="text-danger" />;
      case "success":
        return <CheckCircle className="text-primary" />;
      case "info":
        return <Email className="text-blue" />;
      default:
        return <Email />;
    }
  };

  return (
    <div className="overflow-y-auto min-h-[400px] max-h-[85vh] w-full px-4">
      {loading && <Loader />}
      {!activities && "No activity found"}
      <div style={{ maxWidth: "1000px", margin: 'auto' }}>
        <VerticalTimeline>
          {activities && activities.map((activity, index) => (
            <VerticalTimelineElement
              key={index}
              contentStyle={{
                background: "white",
                boxShadow: "0 0px 20px rgba(0, 0, 0, 0.2)",
                borderRadius: "8px",
                padding: "20px",
              }}
              contentArrowStyle={{ borderRight: "8px solid white" }}
              iconStyle={{
                background: "#ffffff",
                color: "#000000",
                boxShadow: "0 0px 6px rgba(0, 0, 0, 0.5)",
                border: "4px solid gray",
              }}
              icon={activity.icon}
            >
              <div className="w-full max-w-lg overflow-auto break-words">
                <div className="font-bold text-md text-black mb-1">
                  {activity.title}
                </div>
                <div className="font-semibold text-sm mb-1">
                  {activity.description}
                </div>
                <div className="font-semibold mb-1 text-black">
                  {activity.comment}
                </div>
                <div className="font-semibold mb-1">
                  {activity.sender}
                </div>
                {activity.email && (
                  <div
                    onClick={() => fetchEmail(activity.email)}
                    className="font-semibold mb-1 cursor-pointer"
                  >
                    view Email
                  </div>
                )}
              </div>

              <Typography
                variant="caption"
                className="block mt-4"
                style={{
                  borderTop: "1px solid #E5E7EB",
                  paddingTop: "8px",
                  fontSize: ".9rem",
                }}
              >
                {new Date(activity.date).toLocaleString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit", // Optional: include seconds if needed
                  hour12: true, // Use 12-hour format (true) or 24-hour format (false)
                })}
              </Typography>
            </VerticalTimelineElement>
          ))}


        </VerticalTimeline>
               { activities.length === 0 && (
            <div className="text-center text-gray-500 mt-4">
              No activities found.
            </div>
          )}
      </div>
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
            <span className="text-md">{emailData?.subject}</span>
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
                  <span className="font-medium">From: </span>{emailData?.from}
                </div>
                <div className="date text-gray-500 text-base">
                  <span className="font-medium">Received at: </span>{`${emailData && formatDate(emailData?.sentAt)}`}
                </div>
              </div>
              <div color="inherit" >
                <FaChevronDown className={`m-3 transform ${showDetails ? 'rotate-180' : ''}`} />
              </div>
            </div>
            {showDetails && (
              <div className="pb-3 flex flex-col md:flex-row justify-between w-full">
                <div className=" date text-gray-500 text-base">
                  <span className="font-medium">Received to: </span>{`${emailData?.recipient}`}
                </div>
              </div>
            )}
          </div>
          <Typography variant="body1" className="mt-4 text-gray-800">
            <span dangerouslySetInnerHTML={{ __html: emailData?.htmlContent }} />
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
    </div>
  );
};

export default QuotesActivity;
