import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PilotsList from "./PilotsList";
import BoxList from "./BoxList";
import Vehicles from "./Vehicles";
import StorageLocation from "./StorageLocation";
import StorageList from "./StorageList";
import { 
    MdInventory2, 
    MdWarehouse, 
    MdPlace, 
    MdAllInbox, 
    MdLayers, 
    MdDirectionsCar 
} from "react-icons/md";

const tabs = [
    { label: "Storage", icon: MdInventory2 },
    { label: "Warehouse", icon: MdWarehouse },
    { label: "Storage Locations", icon: MdPlace },
    { label: "Boxes", icon: MdAllInbox },
    { label: "Materials", icon: MdLayers },
    { label: "Vehicles", icon: MdDirectionsCar },
];

const ResourcesPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const initialTab = parseInt(queryParams.get("tab") || "0", 10);
    const [activeTab, setActiveTab] = useState<number>(initialTab);
    const handleTabChange = (newValue: number) => {
        setActiveTab(newValue);
        navigate(`?tab=${newValue}`);
    };

    useEffect(() => {
        const tab = parseInt(queryParams.get("tab") || "0", 10);
        if (tab !== activeTab) {
            setActiveTab(tab || 0);
        }
    }, [location.search]);

    return (
        <div className="bg-slate-50/60 min-h-[90vh] flex flex-col text-slate-700">
            {/* Top Navigation Bar */}
            <div className="bg-white border-b border-slate-200 px-4 sm:px-6 pt-3 shadow-xs sticky top-0 z-30">
                <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto no-scrollbar pb-2">
                    {tabs.map((tab, index) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === index;
                        return (
                            <button
                                key={index}
                                onClick={() => handleTabChange(index)}
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

            {/* Tab Contents */}
            <div className="flex-grow p-4 sm:p-6">
                {activeTab === 0 && <StorageList />}
                {activeTab === 1 && <PilotsList />}
                {activeTab === 2 && <StorageLocation type="storage" />}
                {activeTab === 3 && <BoxList type="Box" />}
                {activeTab === 4 && <BoxList type="Material" />}
                {activeTab === 5 && <Vehicles type="Vehicle" />}
            </div>
        </div>
    );
};

export default ResourcesPage;

