import React from 'react';
import DropdownNotification from './DropdownNotification';
import DropdownUser from './DropdownUser';
import Chat from '../Chat';

const Header = (props: {
  sidebarOpen: string | boolean | undefined;
  setSidebarOpen: (arg0: boolean) => void;
}) => {
  return (
    <header className="sticky top-0 z-40 flex w-full bg-white/90 dark:bg-boxdark/90 backdrop-blur-md border-b border-slate-200/80 dark:border-strokedark shadow-xs transition-all">
      <div className="flex flex-grow items-center justify-between py-3 px-4 md:px-6 2xl:px-8">
        {/* Left Side: Mobile Hamburger & Search/Title */}
        <div className="flex items-center gap-3">
          <button
            aria-controls="sidebar"
            onClick={(e) => {
              e.stopPropagation();
              props.setSidebarOpen(!props.sidebarOpen);
            }}
            className="block rounded-xl border border-slate-200 bg-white p-2 text-slate-600 shadow-xs hover:bg-slate-50 dark:border-strokedark dark:bg-boxdark dark:text-slate-200 lg:hidden focus:outline-none"
          >
            <svg
              className="w-5 h-5 fill-current"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {/* Right Side: Toolbar Icons & User Profile */}
        <div className="flex items-center gap-3 sm:gap-4">
          <ul className="flex items-center gap-2">
            <DropdownNotification />
          </ul>

          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block" />

          <DropdownUser />
        </div>
      </div>

      {window.location.pathname !== '/communication' && (
        <div style={{ display: 'none' }}>
          <Chat />
        </div>
      )}
    </header>
  );
};

export default Header;

