import { useContext, useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { UserContext } from '../UserContext';

import { LiaFileInvoiceSolid } from "react-icons/lia";
import { HiOutlineDocumentAdd } from "react-icons/hi";
import {
  Dashboard,
  People,
  Settings,
  Notifications,
  AttachMoney,
  CalendarMonth,
  Task,
  KeyboardArrowDown,
  KeyboardArrowRight,
  Menu,
  MenuOpen,
} from '@mui/icons-material';

import {
  UserGroupIcon,
  ClipboardDocumentListIcon,
  ChatBubbleLeftRightIcon,
  BriefcaseIcon,
} from '@heroicons/react/24/outline';

import { FaUsersCog, FaUserCircle } from 'react-icons/fa';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (arg: boolean) => void;
}

interface MenuItem {
  label: string;
  path?: string;
  access?: string;
  icon?: React.ReactNode;
  children?: MenuItem[];
}

const Sidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
 const location = useLocation();

const { pathname, search } = location;
  const { userData }: any = useContext(UserContext);

  const trigger = useRef<any>(null);
  const sidebar = useRef<any>(null);

  const [openMenus, setOpenMenus] = useState<string[]>([]);

  // collapse state
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('sidebar-collapsed') === 'true';
  });

  // hover expand state
  const [hovered, setHovered] = useState(false);

  // final sidebar state
  const isExpanded = !sidebarCollapsed || hovered;

  // save collapse state
  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  // close outside click
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
  }, [sidebarOpen]);

  const isRouteActive = (
  path?: string
) => {
  if (!path) return false;

  // split query string
  const [routePath, query] =
    path.split('?');

  // path match
  if (pathname !== routePath) {
    return false;
  }

  // if no query param
  if (!query) {
    return search === '';
  }

  // compare query string
  return search === `?${query}`;
};

  const menuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      path: '/',
      access: 'Dashboard',
      icon: <Dashboard />,
    },
    {
      label: 'Task',
      path: '/tasks',
      access: 'Tasks',
      icon: <Task />,
    },

    {
      label: 'Customers & Leads',
      icon: <People />,
      children: [
        {
          label: 'Customers List',
          path: '/customers',
          access: 'Customer',
          icon: <FaUsersCog />,
        },
        {
          label: 'Lead Manager',
          path: '/leads',
          access: 'Leads',
          icon: <UserGroupIcon className="h-5 w-5" />,
        },
      ],
    },

    {
      label: 'Planning',
      path: '/calendar',
      access: 'Planning',
      icon: <CalendarMonth />,
    },

    {
      label: 'Jobs',
      path: '/jobs',
      access: 'To do',
      icon: <ClipboardDocumentListIcon className="h-5 w-5" />,
    },
    {
      label: 'Finance',
      icon: <AttachMoney />,
      children: [
        {
          label: 'Offers List',
          path: '/finance',
          access: 'Finance',
          icon: <AttachMoney />,
        },
        {
          label: 'Add Offers',
          path: '/new_offer',
          access: 'Finance',
          icon: <HiOutlineDocumentAdd />,
        },
        {
          label: 'Invoices List',
          path: '/finance?tab=1',
          access: 'Finance',
          icon: <LiaFileInvoiceSolid  className="h-5 w-5"  />,
        },
        {
          label: 'Add Invoices',
          path: '/newinvoice',
          access: 'Finance',
          icon: <HiOutlineDocumentAdd  />,
        }
      ],
    },

    {
      label: 'Resources',
      path: '/resources',
      access: 'Resources',
      icon: <BriefcaseIcon className="h-5 w-5" />,
    },

    {
      label: 'HRM',
      path: '/HRM',
      access: 'HRM',
      icon: <FaUsersCog />,
    },

    {
      label: 'Communication',
      path: '/communication',
      access: 'Communication',
      icon: <ChatBubbleLeftRightIcon className="h-5 w-5" />,
    },

   

    {
      label: 'Settings',
      icon: <Settings />,
      children: [
        {
          label: 'Settings',
          path: '/settings',
          access: 'Settings',
          icon: <Settings />,
        },
         {
      label: 'Profile',
      path: '/profile',
      access: 'Profile',
      icon: <FaUserCircle />,
    }
      
      ],
    },
      {
          label: 'Notifications',
          path: '/dropdownNotification',
          access: 'Notifications',
          icon: <Notifications />,
        },
  ];

  const toggleMenu = (label: string) => {
    setOpenMenus((prev) =>
      prev.includes(label) ? prev.filter((x) => x !== label) : [...prev, label],
    );
  };

  const isParentActive = (children?: MenuItem[]) => {
    return children?.some((child) => pathname === child.path);
  };

  return (
    <aside
      ref={sidebar}
      onMouseEnter={() => {
        if (sidebarCollapsed) {
          setHovered(true);
        }
      }}
      onMouseLeave={() => {
        if (sidebarCollapsed) {
          setHovered(false);
        }
      }}
      className={`
      absolute top-0 left-0 z-50
      h-screen bg-slate-950
      border-r border-slate-800
      shadow-2xl overflow-y-hidden
      transition-all duration-300 ease-in-out
       flex  flex-col  bg-black   lg:static lg:translate-x-0 -translate-x-full
      ${isExpanded ? 'w-[280px]' : 'w-[80px]'}

      ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
    `}
    >
      {/* Header */}
      <div className="h-[75px] border-b border-slate-800 px-4 flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          {isExpanded && (
            <>
              {' '}
              <div className="h-12 w-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-lg font-bold shrink-0">
                C
              </div>
              <div>
                <h1 className="text-white text-lg font-bold">CRM</h1>
                <p className="text-xs text-slate-400">Dashboard</p>
              </div>
            </>
          )}
        </div>

        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="h-10 w-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          {sidebarCollapsed ? <Menu /> : <MenuOpen />}
        </button>
      </div>

      {/* Menu */}
      <div className="p-3 overflow-y-auto h-[calc(100vh-75px)] [&::-webkit-scrollbar]:w-1
  [&::-webkit-scrollbar-track]:bg-primary/20
  [&::-webkit-scrollbar-thumb]:bg-primary">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const hasChildren = item.children?.length;

            const parentActive = isParentActive(item.children);

            if (item.access && !userData?.access?.includes(item.access))
              return null;

            return (
              <li key={item.label}>
                {hasChildren ? (
                  <>
                    {/* Parent */}
                    <button
                      onClick={() => toggleMenu(item.label)}
                      className={`
                      group w-full flex items-center
                      ${isExpanded ? 'justify-between px-4' : 'justify-center'}
                      py-3 rounded-2xl transition-all duration-300
                      
                      ${
                        parentActive
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                      }
                    `}
                    >
                      <div className="flex items-center gap-3">
                        {item.icon}

                        {isExpanded && (
                          <span className="font-medium whitespace-nowrap">
                            {item.label}
                          </span>
                        )}
                      </div>

                      {isExpanded &&
                        (openMenus.includes(item.label) ? (
                          <KeyboardArrowDown />
                        ) : (
                          <KeyboardArrowRight />
                        ))}
                    </button>

                    {/* Child Menu */}
                    {isExpanded && (
                      <div
                        className={`overflow-hidden transition-all duration-300 ${
                          openMenus.includes(item.label)
                            ? 'max-h-[500px] mt-2'
                            : 'max-h-0'
                        }`}
                      >
                        <ul className="ml-4 border-l border-slate-700 pl-3 space-y-2">
                          {item.children
                            ?.filter(
                              (child) =>
                                !child.access ||
                                userData?.access?.includes(child.access),
                            )
                            .map((child) => (
                              <li key={child.path}>
                                <NavLink
                                  to={child.path!}
                               className={() => {
  const isActive =
    isRouteActive(child.path);

  return `
    flex items-center gap-3
    px-4 py-2.5 rounded-xl
    transition-all duration-300

    ${
      isActive
        ? 'bg-indigo-600 text-white shadow-md'
        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    }
  `;
}}
                                >
                                  {child.icon}
                                  {child.label}
                                </NavLink>
                              </li>
                            ))}
                        </ul>
                      </div>
                    )}
                  </>
                ) : (
                  <NavLink
                    to={item.path!}
                    className={({ isActive }) =>
                      `
                      flex items-center
                      ${
                        isExpanded
                          ? 'gap-3 px-4 justify-start'
                          : 'justify-center'
                      }
                      py-3 rounded-2xl transition-all duration-300
                      
                      ${
                        isActive
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                      }
                    `
                    }
                  >
                    {item.icon}

                    {isExpanded && (
                      <span className="font-medium whitespace-nowrap">
                        {item.label}
                      </span>
                    )}
                  </NavLink>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
