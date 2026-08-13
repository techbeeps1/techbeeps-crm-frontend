import React, { useState } from 'react';
import PersonIcon from '@mui/icons-material/Person';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ConstructionIcon from '@mui/icons-material/Construction';
import ArchitectureIcon from '@mui/icons-material/Architecture';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import NewCustomer from '../customerDetails/NewCustomer';
import { useNavigate } from 'react-router-dom';

const Shortcuts: React.FC = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const shortcutItems = [
    {
      title: 'New Valuation',
      subtitle: 'Create property intake',
      icon: <ArchitectureIcon style={{ fontSize: 28, color: '#ffffff' }} />,
      bgStyle: { background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)', color: '#ffffff' },
      bgGlow: 'bg-blue-500/10',
      action: () => navigate('/intake'),
    },
    {
      title: 'New Customer',
      subtitle: 'Add customer account',
      icon: <PersonIcon style={{ fontSize: 28, color: '#ffffff' }} />,
      bgStyle: { background: 'linear-gradient(135deg, #9333ea 0%, #ec4899 100%)', color: '#ffffff' },
      bgGlow: 'bg-purple-500/10',
      action: () => setOpen(true),
    },
    {
      title: 'New Job',
      subtitle: 'Schedule logistics job',
      icon: <LocalShippingIcon style={{ fontSize: 28, color: '#ffffff' }} />,
      bgStyle: { background: 'linear-gradient(135deg, #059669 0%, #14b8a6 100%)', color: '#ffffff' },
      bgGlow: 'bg-emerald-500/10',
      action: () => navigate('/jobs'),
    },
    {
      title: 'Moving Lift Job',
      subtitle: 'Lift equipment request',
      icon: <ConstructionIcon style={{ fontSize: 28, color: '#ffffff' }} />,
      bgStyle: { background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)', color: '#ffffff' },
      bgGlow: 'bg-amber-500/10',
      action: () => navigate('/jobs'),
    },
    {
      title: 'New Offer',
      subtitle: 'Generate client quote',
      icon: <AddCircleIcon style={{ fontSize: 28, color: '#ffffff' }} />,
      bgStyle: { background: 'linear-gradient(135deg, #e11d48 0%, #db2777 100%)', color: '#ffffff' },
      bgGlow: 'bg-rose-500/10',
      action: () => navigate('/new_offer'),
    },
  ];

  return (
    <div className="w-full space-y-4 font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">
            Quick Actions
          </h3>

        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {shortcutItems.map((item, index) => (
          <div
            key={index}
            onClick={item.action}
            className="group relative overflow-hidden bg-white dark:bg-boxdark rounded-2xl p-5 border border-slate-200/80 dark:border-strokedark shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer"
          >
            {/* Ambient Background Glow */}
            <div
              className={`absolute -top-10 -right-10 w-32 h-32 ${item.bgGlow} rounded-full blur-2xl group-hover:scale-150 transition-all duration-500`}
            />

            <div className="relative z-10 flex flex-col items-center text-center space-y-3">
              {/* Dynamic Gradient Icon Badge with Inline Guarantee */}
              <div
                style={item.bgStyle}
                className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-md shadow-slate-900/10 group-hover:scale-110 transition-transform duration-300"
              >
                {item.icon}
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-white group-hover:text-primary transition-colors">
                  {item.title}
                </h4>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                  {item.subtitle}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Hidden New Customer Modal Handler */}
      <NewCustomer setOpen={setOpen} open={open} handler={() => { }} type="Customer" />
    </div>
  );
};

export default Shortcuts;



