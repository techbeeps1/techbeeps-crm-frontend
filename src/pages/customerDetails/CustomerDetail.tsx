import axios from 'axios';
import { useEffect, useState } from 'react'
import { apiPath } from '../../../apiPath.tsx';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import Loader from '../../common/Loader/index.tsx';
import CustomerData from "./CustomerData.jsx"
import DocumentSeleted from "./DocumentSelected.jsx"
import CommunicationLog from '../InvoicePage/Communication.jsx';
import QuoteList from '../QuoteforCustomer/QuoteList.jsx';
import InvoiceList from '../InvoicePage/InvoiceList.jsx';
import JobDetailPage from '../Jobpage/JobDetailPage.tsx';
import EmailLayout from '../Emailpage/EmailComponent.tsx';
import StorageList from '../Resources/StorageList.tsx';

const tabs = [
    {
        label: 'Detail',
        icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
        )
    },
    {
        label: 'Documents',
        icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
        )
    },
    {
        label: 'Communication',
        icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
        )
    },
    {
        label: 'Email',
        icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
            </svg>
        )
    },
    {
        label: 'Offered',
        icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
        )
    },
    {
        label: 'Invoices',
        icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
        )
    },
    {
        label: 'Job',
        icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
            </svg>
        )
    },
    {
        label: 'Storage',
        icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
            </svg>
        )
    },
];

const CustomerDetail = () => {
    const [customerData, setcustomerData] = useState<any>(null)
    const [selectedTab, setSelectedTab] = useState(0);
    let navigate = useNavigate()

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

    const displayTabs = tabs.map((t, i) =>
        i === 0 ? { ...t, label: `${customerData?.type || 'Customer'} Detail` } : t
    );

    return (
        <>
            <style>{`
                .cd-navbar {
                    background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
                    border-bottom: 1px solid rgba(99, 102, 241, 0.3);
                    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.25), 0 1px 0 rgba(255,255,255,0.05) inset;
                    display: flex;
                    align-items: center;
                    padding: 0 16px;
                    gap: 16px;
                    min-height: 60px;
                    position: relative;
                    z-index: 10;
                }
                .cd-back-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 36px;
                    height: 36px;
                    border-radius: 10px;
                    background: rgba(255,255,255,0.07);
                    border: 1px solid rgba(255,255,255,0.12);
                    cursor: pointer;
                    color: #94a3b8;
                    transition: all 0.2s ease;
                    flex-shrink: 0;
                }
                .cd-back-btn:hover {
                    background: rgba(99,102,241,0.25);
                    border-color: rgba(99,102,241,0.5);
                    color: #fff;
                    transform: translateX(-2px);
                }
                .cd-customer-name {
                    font-size: 15px;
                    font-weight: 700;
                    color: #f1f5f9;
                    letter-spacing: 0.04em;
                    text-transform: uppercase;
                    white-space: nowrap;
                    padding-right: 8px;
                    border-right: 1px solid rgba(255,255,255,0.12);
                    flex-shrink: 0;
                }
                .cd-tabs-container {
                    display: flex;
                    align-items: center;
                    gap: 2px;
                    overflow-x: auto;
                    flex: 1;
                    scrollbar-width: none;
                }
                .cd-tabs-container::-webkit-scrollbar { display: none; }
                .cd-tab {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 7px 14px;
                    border-radius: 8px;
                    cursor: pointer;
                    color: #94a3b8;
                    font-size: 12.5px;
                    font-weight: 600;
                    letter-spacing: 0.03em;
                    text-transform: uppercase;
                    white-space: nowrap;
                    transition: all 0.22s cubic-bezier(0.4,0,0.2,1);
                    border: 1px solid transparent;
                    position: relative;
                    user-select: none;
                }
                .cd-tab:hover {
                    color: #e2e8f0;
                    background: rgba(255,255,255,0.07);
                    border-color: rgba(255,255,255,0.1);
                }
                .cd-tab.active {
                    color: #fff;
                    background: linear-gradient(135deg, rgba(99,102,241,0.35) 0%, rgba(139,92,246,0.25) 100%);
                    border-color: rgba(99,102,241,0.55);
                    box-shadow: 0 0 16px rgba(99,102,241,0.25), 0 2px 8px rgba(0,0,0,0.2);
                }
                .cd-tab.active::after {
                    content: '';
                    position: absolute;
                    bottom: -2px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 60%;
                    height: 2px;
                    background: linear-gradient(90deg, #6366f1, #a78bfa);
                    border-radius: 2px;
                    box-shadow: 0 0 8px rgba(99,102,241,0.6);
                }
                .cd-tab-icon {
                    opacity: 0.8;
                    flex-shrink: 0;
                }
                .cd-tab.active .cd-tab-icon { opacity: 1; }
            `}</style>

            <div style={{ height: 'calc(100vh - 84px)' }} className="flex flex-col gap-1">
                {/* ── Premium Top Navigation Bar ── */}
                <div className="cd-navbar">
                    {/* Back button */}
                    <button className="cd-back-btn" onClick={() => navigate(-1)} title="Go Back">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="15 18 9 12 15 6"/>
                        </svg>
                    </button>

                    {/* Customer name */}
                    <span className="cd-customer-name">
                        {customerData?.firstName} {customerData?.lastName}
                    </span>

                    {/* Tabs */}
                    <div className="cd-tabs-container">
                        {displayTabs.map((tab, index) => (
                            <button
                                key={index}
                                className={`cd-tab${selectedTab === index ? ' active' : ''}`}
                                onClick={() => setSelectedTab(index)}
                            >
                                <span className="cd-tab-icon">{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Content Area ── */}
                <div className="w-full bg-white p-5 h-full overflow-auto">
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
        </>
    )
}

export default CustomerDetail