import { useEffect, useState } from "react";
import {
    Tabs,
    Tab, Box,
} from '@mui/material';
import { MdPeopleOutline } from "react-icons/md";
import Invoice from "./InvoiceDetail";
import RecordPayment from './Recordpayment';
import { useParams } from "react-router-dom";
import axios from "axios";
import { apiPath } from "../../../apiPath";
import CommunicationLog from './Communication';
import QuotesActivity from "../Quotes/QuotesActivity";
import Loader from "../../common/Loader";
import TaskPage from "../Taskcomponent/TaskPage";
import JobDetailPage from "../Jobpage/JobDetailPage";


const InvoiceDetailpage = () => {
    const { Id } = useParams()
    const [activeTab, setActiveTab] = useState(0);
    const [data, setData] = useState('')
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(false)

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const fetchInvoice = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${apiPath}/invoice/invoice/${Id}`);
            const invoiceData = response.data.invoice;
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

    return (
        <div className="flex flex-col min-h-[88vh]">
            {loading && <Loader />}
            <Box className="bg-white shadow border-b border-gray">
                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    indicatorColor="primary"
                    textColor="primary"
                    scrollButtons="auto"
                >
                    <Tab icon={<MdPeopleOutline />} label="Invoice" />
                    <Tab icon={<MdPeopleOutline />} label="Payments" />
                    <Tab icon={<MdPeopleOutline />} label="Activity" />
                    {data?.job && <Tab icon={<MdPeopleOutline />} label="Job" />}
                    {data?.job && <Tab icon={<MdPeopleOutline />} label="Taken" />}
                    <Tab icon={<MdPeopleOutline />} label="Communication" />
                </Tabs>
            </Box>
            <div className="flex-grow">
                {activeTab === 0 && (
                    <Invoice fetchInvoice={fetchInvoice} data={data} notes={notes} />
                )}
                {activeTab === 1 && (
                    <RecordPayment />
                )}
                {activeTab === 2 && (
                    <QuotesActivity invoiceData={data} />
                )}
                {activeTab === 3 && (
                    <>
                        {data?.job ?
                            <JobDetailPage invoice={data?._id} /> : <div className="" style={{ minHeight: '75vh' }}>
                                <CommunicationLog id={data?._id} />
                            </div>}
                    </>
                )}
                {activeTab === 4 && (
                    <div className="relative bg-white" style={{ minHeight: '79vh' }}>
                        <TaskPage jobId={data?.job?._id} />
                    </div>
                )}
                {activeTab === 5 && (
                    <div className="" style={{ minHeight: '75vh' }}>
                        <CommunicationLog id={data?._id} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default InvoiceDetailpage;