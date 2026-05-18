import { useEffect, useState } from "react";
import {
    Tabs,
    Tab,
    Box,
} from '@mui/material';
import { MdPeopleOutline } from "react-icons/md";
import { useParams } from "react-router-dom";
import axios from "axios";
import { apiPath } from "../../../apiPath";
import Offer from "./Offerdel";
import CommunicationLog from "../InvoicePage/Communication";
import QuotesActivity from "./QuotesActivity";
import Loader from "../../common/Loader";
import TaskPage from "../Taskcomponent/TaskPage";
import JobDetailPage from "../Jobpage/JobDetailPage";

const OfferDetail = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [data, setData] = useState('')
    const [loading, setLoading] = useState(false)
    const { Id } = useParams();
    const [notes, setNotes] = useState([]);

    const fetchInvoice = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${apiPath}/finance/finance/${Id}`);
            const invoiceData = response.data.finance;
            setData(invoiceData)
        } catch (error) {
            console.error('Error fetching invoice data:', error);
            alert('Error fetching invoice data')
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchInvoice();
    }, [])

    const handleNotes = async () => {
        try {
            const response = await axios.get(`${apiPath}/api/notesListByJobId?jobId=${data.job?._id}`);
            setNotes(response.data?.notesListByJobId)
        } catch (error) {
            console.error('Error fetching notes:', error);
        }
    }
    useEffect(() => {
        if (data.job) {
            handleNotes();
        }
    }, [data]);

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    return (
        <div className="flex flex-col bg-white" style={{ height: 'calc(100vh-100px)' }}>
            {loading && <Loader />}
            <Box className="bg-white shadow border-b border-gray">
                <Tabs value={activeTab}
                    onChange={handleTabChange}
                    indicatorColor="primary"
                    textColor="primary"
                    scrollButtons="auto"
                >
                    <Tab icon={<MdPeopleOutline />} label="Offer" />
                    <Tab icon={<MdPeopleOutline />} label="Activity" />
                    {data?.job && <Tab icon={<MdPeopleOutline />} label="Job" />}
                    {data?.job && <Tab icon={<MdPeopleOutline />} label="Taken" />}
                    <Tab icon={<MdPeopleOutline />} label="Communication" />
                </Tabs>
            </Box>
            <div className="flex-grow">
                {activeTab === 0 && (
                    <Offer fetchInvoice={fetchInvoice} data={data} notes={notes} />
                )}
                {activeTab === 1 && (
                    <QuotesActivity invoiceData={data} />
                )}
                {activeTab === 2 && (
                    <>
                        {data?.job ?
                            <JobDetailPage offer={data?._id} /> : <CommunicationLog id={data?._id} />}
                    </>
                )}
                {activeTab === 3 && (
                    <div className="relative bg-white" style={{ minHeight: '79vh' }}>
                        <TaskPage jobId={data?.job?._id} />
                    </div>
                )}
                {activeTab === 4 && (
                    <div className="" style={{ minHeight: '75vh' }}>
                        <CommunicationLog id={data?._id} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default OfferDetail;