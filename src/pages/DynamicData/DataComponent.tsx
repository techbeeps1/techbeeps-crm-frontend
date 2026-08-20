import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import AppointmentType from './DynamicInputs/Inputslist';
import AppSettingsForm from './DynamicInputs/AppSetting';
import FeaturePage from './FeaturePage';
import {
  MdSettingsSuggest,
  MdCalendarMonth,
  MdDynamicForm,
  MdMarkEmailRead,
} from 'react-icons/md';

const DataComponent: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = parseInt(searchParams.get('tab') || '0', 10);
  const [activeTab, setActiveTab] = useState<number>(initialTab);

  const tabs = [
    {
      id: 0,
      label: 'Features & Pricing',
      shortLabel: 'Features',
      icon: MdSettingsSuggest,
      desc: 'System rates, surcharges & calculations',
    },
    {
      id: 1,
      label: 'Appointment Inputs',
      shortLabel: 'Appointment Inputs',
      icon: MdCalendarMonth,
      desc: 'Dynamic booking input fields',
    },
    {
      id: 2,
      label: 'Template Inputs',
      shortLabel: 'Template Inputs',
      icon: MdDynamicForm,
      desc: 'Financial & document template fields',
    },
    {
      id: 3,
      label: 'Email Settings',
      shortLabel: 'Email Settings',
      icon: MdMarkEmailRead,
      desc: 'Automated notification mappings',
    },
  ];

  const handleTabChange = (tabId: number) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId.toString() });
  };

  useEffect(() => {
    const queryTab = parseInt(searchParams.get('tab') || '0', 10);
    if (queryTab !== activeTab) {
      setActiveTab(queryTab);
    }
  }, [searchParams, activeTab]);

  return (
    <div className="space-y-6">
      {/* Modern Top Navigation Bar */}
      <div className="bg-white dark:bg-boxdark rounded-2xl border border-stroke dark:border-strokedark p-2 shadow-xs mb-6">
        <div className="flex items-center overflow-x-auto scrollbar-none gap-2">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <IconComponent style={{ fontSize: 18 }} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Viewport */}
      <div>
        {activeTab === 0 && <FeaturePage />}
        {activeTab === 1 && <AppointmentType inputFor="Appointment" />}
        {activeTab === 2 && <AppointmentType inputFor="Template" />}
        {activeTab === 3 && <AppSettingsForm />}
      </div>
    </div>
  );
};

export default DataComponent;

