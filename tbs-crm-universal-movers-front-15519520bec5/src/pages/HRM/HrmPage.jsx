import React, { useState } from "react";
import { Tabs, Tab, Box } from "@mui/material";
import { AiOutlineFileSearch, AiOutlineClockCircle, AiOutlineSetting } from "react-icons/ai";
import { MdAttachMoney, MdInsertInvitation, MdPeopleOutline } from "react-icons/md";
import Agentslist from "../../agents/Agentslist";
import Team from "./Team";

const HrmPage = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <div className="flex flex-col text-slate-700">
      <Box className="bg-white shadow-md">
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab icon={<MdPeopleOutline />} label="Staff" />
          <Tab icon={<MdPeopleOutline />} label="Teams for tasks" />
          <Tab icon={<AiOutlineFileSearch />} label="Approve hours" />
          <Tab icon={<AiOutlineClockCircle />} label="Hours overview" />
          <Tab icon={<MdAttachMoney />} label="Leave requests" />
          <Tab icon={<MdInsertInvitation />} label="Leave cards" />
          <Tab icon={<AiOutlineSetting />} label="Declarations" />
        </Tabs>
      </Box>

      {/* Render Content Based on Active Tab */}
      <div className="flex-grow">
        {activeTab === 0 && (
          <Agentslist />
        )}
        {activeTab === 1 && (
          <Team />
        )}
        {activeTab === 2 && (
          <div className="p-4 bg-gray-100 rounded-md">
            <h2 className="text-xl font-semibold mb-4">Approve Hours</h2>
            <p>This is the approve hours section.</p>
            {/* Add approval hours related content */}
          </div>
        )}
        {activeTab === 3 && (
          <div className="p-4 bg-gray-100 rounded-md">
            <h2 className="text-xl font-semibold mb-4">Hours Overview</h2>
            <p>This is the hours overview section.</p>
            {/* Add hours overview related content */}
          </div>
        )}
        {activeTab === 4 && (
          <div className="p-4 bg-gray-100 rounded-md">
            <h2 className="text-xl font-semibold mb-4">Leave Requests</h2>
            <p>This is the leave requests section.</p>
            {/* Add leave requests related content */}
          </div>
        )}
        {activeTab === 5 && (
          <div className="p-4 bg-gray-100 rounded-md">
            <h2 className="text-xl font-semibold mb-4">Leave Cards</h2>
            <p>This is the leave cards section.</p>
            {/* Add leave cards related content */}
          </div>
        )}
        {activeTab === 6 && (
          <div className="p-4 bg-gray-100 rounded-md">
            <h2 className="text-xl font-semibold mb-4">Declarations</h2>
            <p>This is the declarations section.</p>
            {/* Add declarations related content */}
          </div>
        )}
      </div>
    </div>
  );
};

export default HrmPage;
