import React, { useState, useEffect } from "react";
import { Tabs, Tab, Box } from "@mui/material";
import { useSearchParams } from "react-router-dom";
import AppointmentType from "./DynamicInputs/Inputslist";
import AppSettingsForm from "./DynamicInputs/AppSetting";
import FeaturePage from "./FeaturePage";

const DataComponent: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = parseInt(searchParams.get("tab") || "0", 10); // Default to 0 if no query string is found
  const [activeTab, setActiveTab] = useState<number>(initialTab);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    event.preventDefault();
    setActiveTab(newValue);
    setSearchParams({ tab: newValue.toString() }); // Update query string
  };

  useEffect(() => {
    const queryTab = parseInt(searchParams.get("tab") || "0", 10);
    if (queryTab !== activeTab) {
      setActiveTab(queryTab);
    }
  }, [searchParams, activeTab]);

  return (
    <div className="flex flex-col">
      <Box className="bg-white shadow-md p-2">
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Features" />
          <Tab label="Appointment Inputs" />
          <Tab label="Template Inputs" />
          <Tab label="Email Settings" />
        </Tabs>
      </Box>
      <div className="flex-grow">
        {activeTab === 0 && <FeaturePage />}
        {activeTab === 1 && <AppointmentType inputFor="Appointment" />}
        {activeTab === 2 && <AppointmentType inputFor="Template" />}
        {activeTab === 3 && <AppSettingsForm />}
      </div>
    </div>
  );
};

export default DataComponent;
