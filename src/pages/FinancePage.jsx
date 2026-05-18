import { useState, useEffect } from "react";
import { Tabs, Tab, Box } from "@mui/material";
import { MdPeopleOutline } from "react-icons/md";
import { useLocation, useNavigate } from "react-router-dom"; // React Router hooks
import InvoiceList from "./InvoicePage/InvoiceList";
import QuoteList from "./QuoteforCustomer/QuoteList";

const FinancePage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const initialTab = parseInt(queryParams.get("tab"), 10) || 0;

  const [activeTab, setActiveTab] = useState(initialTab);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    navigate(`?tab=${newValue}`); // Update the URL with the new tab value
  };

  useEffect(() => {
    const tab = parseInt(queryParams.get("tab"), 10);
    if (tab !== activeTab) {
      setActiveTab(tab || 0);
    }
  }, [location.search]);

  return (
    <div className="bg-white flex flex-col h-screen">
      <Box className="bg-white shadow-md">
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          scrollButtons="auto"
        >
          <Tab icon={<MdPeopleOutline />} label="Offers" />
          <Tab icon={<MdPeopleOutline />} label="Invoices" />
        </Tabs>
      </Box>
      <div className="flex-grow">
        {activeTab === 0 && <QuoteList />}
        {activeTab === 1 && <InvoiceList />}
      </div>
    </div>
  );
};

export default FinancePage;
