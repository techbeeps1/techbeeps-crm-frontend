import axios from 'axios';
import { useEffect, useState } from 'react';
import { apiPath } from '../../../apiPath.tsx';
import { useParams, useNavigate } from 'react-router-dom';
import Loader from '../../common/Loader/index.tsx';
import CustomerData from './CustomerData.jsx';
import DocumentSeleted from './DocumentSelected.jsx';
import CommunicationLog from '../InvoicePage/Communication.jsx';
import QuoteList from '../QuoteforCustomer/QuoteList.jsx';
import InvoiceList from '../InvoicePage/InvoiceList.jsx';
import JobDetailPage from '../Jobpage/JobDetailPage.tsx';
import EmailLayout from '../Emailpage/EmailComponent.tsx';
import StorageList from '../Resources/StorageList.tsx';
import {
    MdPersonOutline,
    MdInsertDriveFile,
    MdChatBubbleOutline,
    MdMailOutline,
    MdLocalOffer,
    MdReceiptLong,
    MdWorkOutline,
    MdInventory2
} from 'react-icons/md';

const tabs = [
    {
        label: 'Detail',
        icon: MdPersonOutline,
    },
    {
        label: 'Documents',
        icon: MdInsertDriveFile,
    },
    {
        label: 'Communication',
        icon: MdChatBubbleOutline,
    },
    {
        label: 'Email',
        icon: MdMailOutline,
    },
    {
        label: 'Offered',
        icon: MdLocalOffer,
    },
    {
        label: 'Invoices',
        icon: MdReceiptLong,
    },
    {
        label: 'Job',
        icon: MdWorkOutline,
    },
    {
        label: 'Storage',
        icon: MdInventory2,
    },
];

const CustomerDetail = () => {
    const [customerData, setcustomerData] = useState<any>(null);
    const [selectedTab, setSelectedTab] = useState(0);
    const navigate = useNavigate();

    const { id } = useParams();

    const handleCustomer = async () => {
        let response = await axios.post(apiPath + "/customer/customerdetial", { id });
        setcustomerData(response.data.customer);
    };

    useEffect(() => {
        handleCustomer();
    }, []);

    if (customerData == null) {
        return <Loader />;
    }

    const displayTabs = tabs.map((t, i) =>
        i === 0 ? { ...t, label: `${customerData?.type || 'Customer'} Detail` } : t
    );

    return (
        <div className="bg-slate-50/60 min-h-[calc(100vh-84px)] flex flex-col text-slate-700">
            {/* Top Navigation Bar */}
            <div className="bg-white border-b border-slate-200 px-4 sm:px-6 pt-3 shadow-xs sticky top-0 z-30">
                <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto no-scrollbar pb-2">
                    {displayTabs.map((tab, index) => {
                        const Icon = tab.icon;
                        const isActive = selectedTab === index;
                        return (
                            <button
                                key={index}
                                onClick={() => setSelectedTab(index)}
                                className={`group flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 whitespace-nowrap cursor-pointer ${
                                    isActive
                                        ? "bg-primary text-white shadow-md shadow-primary/20"
                                        : "text-slate-600 hover:text-primary hover:bg-primary/5"
                                }`}
                            >
                                <Icon className={`text-lg transition-transform duration-200 ${isActive ? "text-white" : "text-slate-400 group-hover:text-primary"}`} />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Content Area */}
            <div className="w-full bg-white p-5 flex-1 overflow-auto">
                {selectedTab === 0 && (
                    <CustomerData customerData={customerData} handleCustomer={handleCustomer} />
                )}
                {selectedTab === 1 && (
                    <DocumentSeleted id={id} />
                )}
                {selectedTab === 2 && (
                    <CommunicationLog id={id} />
                )}
                {selectedTab === 3 && (
                    <EmailLayout customerId={id} />
                )}
                {selectedTab === 4 && (
                    <QuoteList customerId={id} />
                )}
                {selectedTab === 5 && (
                    <InvoiceList customerId={id} />
                )}
                {selectedTab === 6 && (
                    <JobDetailPage customerId={id} />
                )}
                {selectedTab === 7 && (
                    <StorageList customerId={id} />
                )}
            </div>
        </div>
    );
};

export default CustomerDetail;