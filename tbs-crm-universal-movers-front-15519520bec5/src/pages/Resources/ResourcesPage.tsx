import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PilotsList from "./PilotsList";
import BoxList from "./BoxList";
import Vehicles from "./Vehicles";
import StorageLocation from "./StorageLocation";
import StorageList from "./StorageList";

const tabs = [
    { label: "storage" },
    { label: "Warehouse" },
    { label: "storage Locations" },
    { label: "Boxes" },
    { label: "Materials" },
    { label: "Vehicles" },
];

const ResourcesPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const initialTab = parseInt(queryParams.get("tab") || "0", 10);
    const [activeTab, setActiveTab] = useState<number>(initialTab);
    const handleTabChange = (newValue: number) => {
        setActiveTab(newValue);
        navigate(`?tab=${newValue}`); // Update the URL with the new tab value
    };

    useEffect(() => {
        const tab = parseInt(queryParams.get("tab") || "0", 10);
        if (tab !== activeTab) {
            setActiveTab(tab || 0);
        }
    }, [location.search]);

    return (
        <div className="bg-white flex flex-col min-h-[88vh] text-slate-700">
            <div className="bg-white shadow">
                <div className="flex">
                    {tabs.map((tab, index) => (
                        <button
                            key={index}
                            onClick={() => handleTabChange(index)}
                            className={`text-center py-3 px-3 text-lg font-medium cursor-pointer transition-colors ${activeTab === index
                                ? "border-primary border-b-2 text-primary"
                                : "text-gray-500 hover:text-primary"
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>
            <div className="flex-grow">
                {activeTab === 0 && <StorageList />}
                {activeTab === 1 && <PilotsList />}
                {activeTab === 2 && <StorageLocation type='storage' />}
                {activeTab === 3 && <BoxList type='Box' />}
                {activeTab === 4 && <BoxList type='Material' />}
                {activeTab === 5 && <Vehicles type='Vehicle' />}
            </div>
        </div>
    );
};

export default ResourcesPage;
