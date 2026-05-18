import { useEffect, useRef, useState, useContext } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { UserContext } from '../UserContext';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (arg: boolean) => void;
}

const Sidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
  const location = useLocation();
  const { pathname } = location;
  const { userData }: any = useContext(UserContext);
  // console.log("userData", userData)
  const trigger = useRef<any>(null);
  const sidebar = useRef<any>(null);

  const storedSidebarExpanded = localStorage.getItem('sidebar-expanded');
  const [sidebarExpanded, setSidebarExpanded] = useState(
    storedSidebarExpanded === null ? false : storedSidebarExpanded === 'true',
  );
  const menuItems = [
  { label: 'Dashboard', path: '/', access: 'Dashboard', icon: '🏠' },
  { label: 'Tasks', path: '/tasks', access: 'Tasks', icon: '📋' },
  { label: 'Lead Manager', path: '/leads', access: 'Leads', icon: '👥' },
  { label: 'To do', path: '/jobs', access: 'To do', icon: '📝' },
  { label: 'Customers', path: '/customers', access: 'Customer', icon: '👤' },
  { label: 'Planning', path: '/calendar', access: 'Planning', icon: '📅' },
  { label: 'Finance', path: '/finance', access: 'Finance', icon: '💰' },
  { label: 'Resources', path: '/resources', access: 'Resources', icon: '💼' },
  { label: 'HRM', path: '/HRM', access: 'HRM', icon: '🕴️🕴️' },
  { label: 'Communication', path: '/communication', access: 'Communication', icon: '💬' },
  { label: 'Profile', path: '/profile', access: 'Profile', icon: '🙍' },
  { label: 'Features', path: '/data', access: 'Features', icon: '🛠' },
  { label: 'Settings', path: '/settings', access: 'Settings', icon: '⚙️' },
  { label: 'Notifications', path: '/dropdownNotification', access: 'Notifications', icon: '🔔' },
  ];

  // close on click outside
  useEffect(() => {
    const clickHandler = ({ target }: MouseEvent) => {
      if (!sidebar.current || !trigger.current) return;
      if (
        !sidebarOpen ||
        sidebar.current.contains(target) ||
        trigger.current.contains(target)
      )
        return;
      setSidebarOpen(false);
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  });

  useEffect(() => {
    const keyHandler = ({ keyCode }: KeyboardEvent) => {
      if (!sidebarOpen || keyCode !== 27) return;
      setSidebarOpen(false);
    };
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  });

  useEffect(() => {
    localStorage.setItem('sidebar-expanded', sidebarExpanded.toString());
    if (sidebarExpanded) {
      document.querySelector('body')?.classList.add('sidebar-expanded');
    } else {
      document.querySelector('body')?.classList.remove('sidebar-expanded');
    }
  }, [sidebarExpanded]);

  return (
    <aside
      ref={sidebar}
      className={`absolute left-0 top-0 z-50 flex h-screen w-62.5 flex-col overflow-y-hidden bg-black duration-300 ease-linear dark:bg-boxdark lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
    >
      <div className="flex items-center justify-between gap-2 px-6 py-5.5 lg:py-6.5">
        <NavLink to="/">
          <h1 className="flex items-center text-5xl font-extrabold dark:text-white">
            {/* <img src={`${imageUrl}/uploads/logo.png`} alt="Logo" /> */}
            CRM
          </h1>
        </NavLink>

        <button
          ref={trigger}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-controls="sidebar"
          aria-expanded={sidebarOpen}
          className="block lg:hidden"
        >
          <svg
            className="fill-current"
            width="20"
            height="18"
            viewBox="0 0 20 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M19 8.175H2.98748L9.36248 1.6875C9.69998 1.35 9.69998 0.825 9.36248 0.4875C9.02498 0.15 8.49998 0.15 8.16248 0.4875L0.399976 8.3625C0.0624756 8.7 0.0624756 9.225 0.399976 9.5625L8.16248 17.4375C8.31248 17.5875 8.53748 17.7 8.76248 17.7C8.98748 17.7 9.17498 17.625 9.36248 17.475C9.69998 17.1375 9.69998 16.6125 9.36248 16.275L3.02498 9.8625H19C19.45 9.8625 19.825 9.4875 19.825 9.0375C19.825 8.55 19.45 8.175 19 8.175Z"
              fill=""
            />
          </svg>
        </button>
      </div>
      <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
        <nav className="px-4 lg:px-3">
          <div>
            {/* <ul className="mb-6 flex flex-col gap-1.5">
              <li>
                <NavLink
                  to="/"
                  className={`group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${(pathname === '/' ||
                      pathname.includes('dashboard')) &&
                    'bg-graydark dark:bg-meta-4'
                    }`}
                > <svg
                  className="fill-current"
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                      d="M6.10322 0.956299H2.53135C1.5751 0.956299 0.787598 1.7438 0.787598 2.70005V6.27192C0.787598 7.22817 1.5751 8.01567 2.53135 8.01567H6.10322C7.05947 8.01567 7.84697 7.22817 7.84697 6.27192V2.72817C7.8751 1.7438 7.0876 0.956299 6.10322 0.956299ZM6.60947 6.30005C6.60947 6.5813 6.38447 6.8063 6.10322 6.8063H2.53135C2.2501 6.8063 2.0251 6.5813 2.0251 6.30005V2.72817C2.0251 2.44692 2.2501 2.22192 2.53135 2.22192H6.10322C6.38447 2.22192 6.60947 2.44692 6.60947 2.72817V6.30005Z"
                      fill=""
                    />
                    <path
                      d="M15.4689 0.956299H11.8971C10.9408 0.956299 10.1533 1.7438 10.1533 2.70005V6.27192C10.1533 7.22817 10.9408 8.01567 11.8971 8.01567H15.4689C16.4252 8.01567 17.2127 7.22817 17.2127 6.27192V2.72817C17.2127 1.7438 16.4252 0.956299 15.4689 0.956299ZM15.9752 6.30005C15.9752 6.5813 15.7502 6.8063 15.4689 6.8063H11.8971C11.6158 6.8063 11.3908 6.5813 11.3908 6.30005V2.72817C11.3908 2.44692 11.6158 2.22192 11.8971 2.22192H15.4689C15.7502 2.22192 15.9752 2.44692 15.9752 2.72817V6.30005Z"
                      fill=""
                    />
                    <path
                      d="M6.10322 9.92822H2.53135C1.5751 9.92822 0.787598 10.7157 0.787598 11.672V15.2438C0.787598 16.2001 1.5751 16.9876 2.53135 16.9876H6.10322C7.05947 16.9876 7.84697 16.2001 7.84697 15.2438V11.7001C7.8751 10.7157 7.0876 9.92822 6.10322 9.92822ZM6.60947 15.272C6.60947 15.5532 6.38447 15.7782 6.10322 15.7782H2.53135C2.2501 15.7782 2.0251 15.5532 2.0251 15.272V11.7001C2.0251 11.4188 2.2501 11.1938 2.53135 11.1938H6.10322C6.38447 11.1938 6.60947 11.4188 6.60947 11.7001V15.272Z"
                      fill=""
                    />
                    <path
                      d="M15.4689 9.92822H11.8971C10.9408 9.92822 10.1533 10.7157 10.1533 11.672V15.2438C10.1533 16.2001 10.9408 16.9876 11.8971 16.9876H15.4689C16.4252 16.9876 17.2127 16.2001 17.2127 15.2438V11.7001C17.2127 10.7157 16.4252 9.92822 15.4689 9.92822ZM15.9752 15.272C15.9752 15.5532 15.7502 15.7782 15.4689 15.7782H11.8971C11.6158 15.7782 11.3908 15.5532 11.3908 15.272V11.7001C11.3908 11.4188 11.6158 11.1938 11.8971 11.1938H15.4689C15.7502 11.1938 15.9752 11.4188 15.9752 11.7001V15.272Z"
                      fill=""
                    />
                  </svg>
                  Dashboard

                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/tasks"
                  className={`group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${pathname.includes('tasks') &&
                    'bg-graydark dark:bg-meta-4'
                    }`}
                >
                 📋 Tasks
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/leads"
                  className={`group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${pathname.includes('leads') &&
                    'bg-graydark dark:bg-meta-4'
                    }`}
                >
                  👥 Lead Manager
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/jobs"
                  className={`group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${pathname.includes('jobs') && 'bg-graydark dark:bg-meta-4'
                    }`}
                >
                  📝 To do
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/customers"
                  className={`group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${pathname.includes('customers') &&
                    'bg-graydark dark:bg-meta-4'
                    }`}
                >
                  👤 Customers
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/calendar"
                  className={`group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${pathname.includes('calendar') &&
                    'bg-graydark dark:bg-meta-4'
                    }`}
                >
                  📅 Planning
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/finance"
                  className={`group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${pathname.includes('finance') && 'bg-graydark dark:bg-meta-4'
                    }`}
                >
                  💰 Finance
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/resources"
                  className={`group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${pathname.includes('resources') &&
                    'bg-graydark dark:bg-meta-4'
                    }`}
                >
                  ‍💼 Resources
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/HRM"
                  className={`group relative flex items-center rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${pathname.includes('HRM') && 'bg-graydark dark:bg-meta-4'
                    }`}
                >
                  ‍
                  <svg
                    aria-hidden="true"
                    focusable="false"
                    data-prefix="fal"
                    data-icon="people-carry-box"
                    width="25"
                    height="25"
                    className="svg-inline--fa fa-people-carry-box"
                    role="img"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 640 512"
                  >
                    <path
                      fill="currentColor"
                      d="M136 80a24 24 0 1 0 0-48 24 24 0 1 0 0 48zm0-80a56 56 0 1 1 0 112A56 56 0 1 1 136 0zM67.8 343.4l25.9 20.3L30.6 502.6c-3.7 8-13.1 11.6-21.2 7.9s-11.6-13.1-7.9-21.2l66.4-146zM96 193.2v87c0 5 2.3 9.7 6.2 12.7L128 312.7V179.4c-4.5-2.2-9.6-3.4-14.8-3.4c-9.5 0-17.2 7.7-17.2 17.2zm87.8 82.1L160 227.8V337.3l29 22.3c6.1 4.7 10.4 11.5 11.9 19.1l22.8 114.1c1.7 8.7-3.9 17.1-12.6 18.8s-17.1-3.9-18.8-12.6L169.5 385 82.7 318.3c-11.8-9.1-18.7-23.1-18.7-38v-87C64 166 86 144 113.2 144c24.9 0 47.7 14.1 58.9 36.4L212.4 261l11.6 7.7V160c0-17.7 14.3-32 32-32H384c17.7 0 32 14.3 32 32V268.8l11.6-7.7 40.3-80.7c11.1-22.3 33.9-36.4 58.9-36.4c27.2 0 49.2 22 49.2 49.2v87c0 14.9-6.9 29-18.7 38L470.5 385 447.7 499.1c-1.7 8.7-10.2 14.3-18.8 12.6s-14.3-10.2-12.6-18.8l22.8-114.1c1.5-7.6 5.7-14.4 11.9-19.1l29-22.3V227.8l-23.8 47.6c-2.5 5-6.2 9.2-10.9 12.3l-44.5 29.6c-3.7 2.5-8.1 3.2-12.2 2.3c-1.5 .2-3.1 .3-4.7 .3H256c-1.6 0-3.2-.1-4.7-.3c-4.1 .9-8.4 .1-12.2-2.3l-44.5-29.6c-4.6-3.1-8.4-7.3-10.9-12.3zM504 80a24 24 0 1 0 0-48 24 24 0 1 0 0 48zm0-80a56 56 0 1 1 0 112A56 56 0 1 1 504 0zm68.2 343.4l66.4 146c3.7 8 .1 17.5-7.9 21.2s-17.5 .1-21.2-7.9L546.3 363.7l25.9-20.3zM544 193.2c0-9.5-7.7-17.2-17.2-17.2c-5.2 0-10.3 1.2-14.8 3.4V312.7l25.8-19.8c3.9-3 6.2-7.7 6.2-12.7v-87zM256 160V288H384V160H256z"
                    ></path>
                  </svg>{' '}
                  &nbsp; HRM
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/communication"
                  className={`group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${pathname.includes('communication') &&
                    'bg-graydark dark:bg-meta-4'
                    }`}
                >
                  💬 Communication
                </NavLink>
              </li>
              
              <li>
                <NavLink
                  to="/profile"
                  className={`group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${pathname.includes('profile') && 'bg-graydark dark:bg-meta-4'
                    }`}
                >
                  <svg
                    className="fill-current"
                    width="18"
                    height="18"
                    viewBox="0 0 18 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9.0002 7.79065C11.0814 7.79065 12.7689 6.1594 12.7689 4.1344C12.7689 2.1094 11.0814 0.478149 9.0002 0.478149C6.91895 0.478149 5.23145 2.1094 5.23145 4.1344C5.23145 6.1594 6.91895 7.79065 9.0002 7.79065ZM9.0002 1.7719C10.3783 1.7719 11.5033 2.84065 11.5033 4.16252C11.5033 5.4844 10.3783 6.55315 9.0002 6.55315C7.62207 6.55315 6.49707 5.4844 6.49707 4.16252C6.49707 2.84065 7.62207 1.7719 9.0002 1.7719Z"
                      fill=""
                    />
                    <path
                      d="M10.8283 9.05627H7.17207C4.16269 9.05627 1.71582 11.5313 1.71582 14.5406V16.875C1.71582 17.2125 1.99707 17.5219 2.3627 17.5219C2.72832 17.5219 3.00957 17.2407 3.00957 16.875V14.5406C3.00957 12.2344 4.89394 10.3219 7.22832 10.3219H10.8564C13.1627 10.3219 15.0752 12.2063 15.0752 14.5406V16.875C15.0752 17.2125 15.3564 17.5219 15.7221 17.5219C16.0877 17.5219 16.3689 17.2407 16.3689 16.875V14.5406C16.2846 11.5313 13.8377 9.05627 10.8283 9.05627Z"
                      fill=""
                    />
                  </svg>
                  Profile
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/data"
                  className={`group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${pathname.includes('data') &&
                    'bg-graydark dark:bg-meta-4'
                    }`}
                >
                  🛠 Features
                </NavLink>
              </li>
              
              <li>
                <NavLink
                  to="/settings"
                  className={`group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${pathname.includes('settings') &&
                    'bg-graydark dark:bg-meta-4'
                    }`}
                >
                  ⚙️ Settings
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/dropdownNotification"
                  className={`group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${pathname.includes('dropdownNotification') &&
                    'bg-graydark dark:bg-meta-4'
                    }`}
                >
                  🔔 Notifications
                </NavLink>
              </li>
            </ul> */}
            <ul className="mb-6 flex flex-col gap-1.5">
              {userData?.access?.length > 0 &&
                menuItems
                  .filter((item) => userData.access.includes(item.access))
                  .map((item) => (
                    <li key={item.path}>
                      <NavLink
                        to={item.path}
                        className={`group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${
                          pathname === item.path || pathname.includes(item.path)
                            ? 'bg-graydark dark:bg-meta-4'
                            : ''
                        }`}
                      >
                        {item.icon} {item.label}
                      </NavLink>
                    </li>
                  ))}
            </ul>
          </div>
          
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
