import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  MdManageAccounts, 
  MdOutlineAccountTree, 
  MdOutlineDesignServices 
} from 'react-icons/md';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const links = [
    { 
      name: 'Account Settings', 
      path: '/settings', 
      icon: MdManageAccounts,
    },
    { 
      name: 'Workflows & Methods', 
      path: '/settings/workflows', 
      icon: MdOutlineAccountTree,
    },
    { 
      name: 'Services & Products', 
      path: '/settings/services', 
      icon: MdOutlineDesignServices,
    }
  ];

  return (
    <div className="bg-white dark:bg-boxdark rounded-2xl border border-stroke dark:border-strokedark p-2 shadow-xs mb-6">
      <div className="flex items-center overflow-x-auto scrollbar-none gap-2">
        {links.map((link) => {
          const isActive = location.pathname === link.path;
          const Icon = link.icon;
          return (
            <button
              key={link.path}
              type="button"
              onClick={() => navigate(link.path)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon style={{ fontSize: 18 }} />
              <span>{link.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Header;


