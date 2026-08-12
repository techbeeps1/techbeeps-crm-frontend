import axios from 'axios';
import { useEffect, useState } from 'react'
import { apiPath } from '../../../apiPath.tsx';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import CustomerData from "./CustomerData.jsx"
import DocumentSeleted from "./DocumentSelected.jsx"
import { Tab, Tabs } from '@mui/material';
import Loader from '../../common/Loader/index.tsx';
import CommunicationLog from '../InvoicePage/Communication.jsx';
import QuoteList from '../QuoteforCustomer/QuoteList.jsx';
import InvoiceList from '../InvoicePage/InvoiceList.jsx';
import JobDetailPage from '../Jobpage/JobDetailPage.tsx';
import EmailLayout from '../Emailpage/EmailComponent.tsx';
import StorageList from '../Resources/StorageList.tsx';


const CustomerDetail = () => {
    const [customerData, setcustomerData] = useState<any>(null)
    const [selectedTab, setSelectedTab] = useState(0);
    let navigate = useNavigate()

    const handleTabChange = (event: any, newValue: any) => {
        setSelectedTab(newValue);
    };


    const { id } = useParams();

    const handleCustomer = async () => {
        let response = await axios.post(apiPath + "/customer/customerdetial", { id })
        setcustomerData(response.data.customer)
    }
    useEffect(() => {
        handleCustomer()
    }, [])

    if (customerData == null) {
        return (<Loader />)
    }
    return (
        <>
            <div style={{ height: 'calc(100vh - 84px)' }} className="flex flex-col gap-1">
                <div className="flex items-center justify-between gap-2 uppercase shadow p-2 bg-white">
                    <div className='flex items-center gap-2'>
                        <KeyboardBackspaceIcon
                            onClick={() => navigate(-1)}
                            className='shadow bg-slate-200 hover:bg-blue hover:text-white p-1'
                            style={{ fontSize: '40px', borderRadius: '50%' }}
                        />
                        <h1 className="text-xl font-extrabold whitespace-nowrap">
                            {customerData?.firstName} {customerData?.lastName}
                        </h1>
                    </div>
                    <Tabs
                        value={selectedTab}
                        onChange={handleTabChange}
                        indicatorColor="primary"
                        textColor="primary"
                        variant="scrollable"
                        aria-label="tabs"
                    >
                        <Tab sx={{ fontSize: '15px', fontWeight: 'bold' }} label={`${customerData?.type} Detail`} />
                        <Tab sx={{ fontSize: '15px', fontWeight: 'bold' }} label="Documents" />
                        <Tab sx={{ fontSize: '15px', fontWeight: 'bold' }} label="Communication" />
                        <Tab sx={{ fontSize: '15px', fontWeight: 'bold' }} label="Email" />
                        <Tab sx={{ fontSize: '15px', fontWeight: 'bold' }} label="Offered" />
                        <Tab sx={{ fontSize: '15px', fontWeight: 'bold' }} label="Invoices" />
                        <Tab sx={{ fontSize: '15px', fontWeight: 'bold' }} label="Job" />
                        <Tab sx={{ fontSize: '15px', fontWeight: 'bold' }} label="storage" />
                    </Tabs>
                </div>
                <div className="w-full bg-white p-5 h-full">
                    {/*customer data */}
                    {selectedTab === 0 && (
                        <CustomerData customerData={customerData} handleCustomer={handleCustomer} />
                    )}

                    {/* Documents */}
                    {selectedTab === 1 && (
                        <DocumentSeleted id={id} />
                    )}

                    {/* Communication */}
                    {selectedTab === 2 && (
                        <CommunicationLog id={id} />
                    )}

                    {/* Email */}
                    {selectedTab === 3 && (
                        <EmailLayout customerId={id} />
                    )}

                    {/* Offered */}
                    {selectedTab === 4 && (
                        <QuoteList customerId={id} />
                    )}

                    {/* Invoices */}
                    {selectedTab === 5 && (
                        <InvoiceList customerId={id} />
                    )}

                    {/* To do odd jobs */}
                    {selectedTab === 6 && (
                        <JobDetailPage customerId={id} />
                    )}

                    {/* Storage */}
                    {selectedTab === 7 && (
                        <StorageList customerId={id} />
                    )}
                </div>
            </div>

        </>
    )
}

export default CustomerDetail