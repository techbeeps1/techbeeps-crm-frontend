import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Features from './DynamicInputs/Features';
import InputHander from './DynamicInputs/InputHander';
import {
  MdTune,
  MdPublic,
  MdPsychology,
  MdBadge,
  MdReceipt,
  MdHomeWork,
  MdChevronRight,
} from 'react-icons/md';

const FeaturePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const defaultTab = Number(searchParams.get('active')) || 0;
  const [activeTab, setActiveTab] = useState<number>(defaultTab);

  useEffect(() => {
    setSearchParams({ active: String(activeTab) });
  }, [activeTab, setSearchParams]);

  const navItems = [
    {
      id: 0,
      label: 'Pricing & Surcharges',
      shortLabel: 'Features',
      icon: MdTune,
      desc: 'Standard rates, calculation & billing',
    },
    {
      id: 1,
      label: 'Country List',
      shortLabel: 'Country',
      icon: MdPublic,
      desc: 'Country directory & dialing codes',
    },
    {
      id: 2,
      label: 'Staff Skills',
      shortLabel: 'Staff Skills',
      icon: MdPsychology,
      desc: 'Workforce capabilities & expertise',
    },
    {
      id: 3,
      label: 'Driving Licences',
      shortLabel: 'Licence',
      icon: MdBadge,
      desc: 'Vehicle authorization categories',
    },
    {
      id: 4,
      label: 'Tax (VAT) Rates',
      shortLabel: 'Tax',
      icon: MdReceipt,
      desc: 'Applicable percentage brackets',
    },
    {
      id: 5,
      label: 'Property Types',
      shortLabel: 'Property',
      icon: MdHomeWork,
      desc: 'Residential & commercial classifications',
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 0:
        return <Features />;
      case 1:
        return <InputHander type="country" />;
      case 2:
        return <InputHander type="Skill" />;
      case 3:
        return <InputHander type="Licence" />;
      case 4:
        return <InputHander type="tax" />;
      case 5:
        return <InputHander type="property" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white dark:bg-boxdark rounded-2xl border border-stroke dark:border-strokedark shadow-xs overflow-hidden flex flex-col md:flex-row min-h-[750px]">
      {/* Left Vertical Sub-Navigation */}
      <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-stroke dark:border-strokedark bg-gray-2/40 dark:bg-boxdark-2/40 p-3 sm:p-4 shrink-0">
        <div className="mb-3 px-3 py-2">
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            System Parameters
          </p>
        </div>

        <div className="space-y-1.5">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all cursor-pointer group ${isActive
                    ? 'bg-primary text-white shadow-md shadow-primary/20 scale-[1.01]'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-strokedark/60'
                  }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0 transition-colors ${isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-white dark:bg-meta-4 text-primary group-hover:bg-primary group-hover:text-white shadow-xs'
                      }`}
                  >
                    <Icon />
                  </div>
                  <div className="truncate">
                    <p className="text-sm font-bold truncate">{item.label}</p>
                    <p
                      className={`text-[11px] truncate ${isActive ? 'text-white/80' : 'text-body dark:text-bodydark'
                        }`}
                    >
                      {item.desc}
                    </p>
                  </div>
                </div>
                <MdChevronRight
                  className={`text-lg shrink-0 transition-transform ${isActive ? 'text-white translate-x-0.5' : 'text-slate-400 group-hover:translate-x-0.5'
                    }`}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Content Viewport */}
      <div className="flex-1 p-5 sm:p-7 md:p-8 overflow-y-auto">
        {renderContent()}
      </div>
    </div>
  );
};

export default FeaturePage;

