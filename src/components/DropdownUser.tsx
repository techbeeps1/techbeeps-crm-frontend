import React, { useContext, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import ContactsOutlinedIcon from '@mui/icons-material/ContactsOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { UserContext } from '../UserContext';

const DropdownUser = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { username, role } = useContext(UserContext) as any;

  const trigger = useRef<any>(null);
  const dropdown = useRef<any>(null);

  // close on click outside
  useEffect(() => {
    const clickHandler = ({ target }: MouseEvent) => {
      if (!dropdown.current) return;
      if (
        !dropdownOpen ||
        dropdown.current.contains(target as Node) ||
        trigger.current?.contains(target as Node)
      )
        return;
      setDropdownOpen(false);
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  }, [dropdownOpen]);

  // close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }: KeyboardEvent) => {
      if (!dropdownOpen || keyCode !== 27) return;
      setDropdownOpen(false);
    };
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  }, [dropdownOpen]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('token');
    window.location.href = '/auth/signin';
  };

  const initialLetter = username ? username.charAt(0).toUpperCase() : 'T';
  const displayName = username || 'Techbeeps';
  const displayRole = role || 'Admin';

  return (
    <div className="relative font-sans">
      {/* Dropdown Trigger */}
      <button
        ref={trigger}
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-3 p-1.5 rounded-2xl hover:bg-slate-100/80 dark:hover:bg-slate-800/60 transition-all cursor-pointer focus:outline-none"
      >
        <div
          style={{ background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)' }}
          className="w-10 h-10 rounded-full text-white font-bold text-base flex items-center justify-center shadow-md shadow-blue-500/20 border-2 border-white dark:border-slate-800 flex-shrink-0"
        >
          {initialLetter}
        </div>

        <div className="hidden text-left lg:block">
          <span className="block text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight">
            {displayName}
          </span>
          <span className="block text-[11px] font-medium text-slate-400 capitalize mt-0.5">
            {displayRole}
          </span>
        </div>

        <KeyboardArrowDownIcon
          className={`text-slate-400 transition-transform duration-300 ${dropdownOpen ? 'rotate-180 text-primary' : ''
            }`}
          style={{ fontSize: 20 }}
        />
      </button>

      {/* Dropdown Menu Modal */}
      {dropdownOpen && (
        <div
          ref={dropdown}
          className="absolute right-0 mt-3 w-64 rounded-2xl bg-white dark:bg-boxdark border border-slate-200/80 dark:border-strokedark shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          {/* Header Profile Summary inside Dropdown */}
          <div className="p-4 bg-gradient-to-br from-slate-50 to-blue-50/40 dark:from-slate-800/40 dark:to-slate-800/10 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
            <div
              style={{ background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)' }}
              className="w-11 h-11 rounded-full text-white font-bold text-lg flex items-center justify-center shadow-sm flex-shrink-0"
            >
              {initialLetter}
            </div>
            <div className="overflow-hidden">
              <h4 className="text-sm font-bold text-slate-800 dark:text-white truncate">
                {displayName}
              </h4>
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-blue-100/80 text-blue-700 dark:bg-blue-950 dark:text-blue-300 mt-0.5">
                {displayRole}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <ul className="p-2 space-y-1 text-xs font-semibold">
            <li>
              <Link
                to="/profile"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-primary transition-all"
              >
                <PersonOutlineIcon style={{ fontSize: 18 }} className="text-slate-400 group-hover:text-primary" />
                <span>My Profile</span>
              </Link>
            </li>


          </ul>

          <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

          {/* Logout Button */}
          <div className="p-2">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-bold transition-all text-xs cursor-pointer"
            >
              <LogoutIcon style={{ fontSize: 18 }} />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DropdownUser;

