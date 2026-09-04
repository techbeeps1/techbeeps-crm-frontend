import React, { useEffect } from 'react';
import {
  FiCheck,
  FiShield,
  FiGrid,
  FiUsers,
  FiUserCheck,
  FiTruck,
  FiCalendar,
  FiDollarSign,
  FiCheckSquare,
  FiBox,
  FiBriefcase,
  FiSettings,
  FiSliders,
} from 'react-icons/fi';

export const CRM_MODULES = [
  { id: 'Dashboard', label: 'Dashboard', icon: FiGrid },
  { id: 'Work', label: 'Work', icon: FiCheckSquare },
  { id: 'Leads', label: 'Leads', icon: FiUsers },
  { id: 'Customer', label: 'Customer', icon: FiUserCheck },
  { id: 'Jobs', label: 'Jobs', icon: FiTruck },
  { id: 'Planning', label: 'Planning', icon: FiCalendar },
  { id: 'Finance', label: 'Finance', icon: FiDollarSign },
  { id: 'Tasks', label: 'Tasks', icon: FiCheckSquare },
  { id: 'Resources', label: 'Resources', icon: FiBox },
  { id: 'HRM', label: 'HRM', icon: FiBriefcase },
  { id: 'Settings', label: 'Settings', icon: FiSettings },
  { id: 'Features', label: 'Features', icon: FiSliders },
];

export const ALL_MODULE_IDS = CRM_MODULES.map((m) => m.id);

const ModulePermissionsSelector = ({ value = [], onChange, role = 'Staff' }) => {
  const isAdmin = role === 'Admin';

  useEffect(() => {
    if (isAdmin) {
      if (!value || value.length < ALL_MODULE_IDS.length) {
        onChange?.(ALL_MODULE_IDS);
      }
    }
  }, [isAdmin]);

  const toggleModule = (id) => {
    if (isAdmin) return;
    const current = Array.isArray(value) ? [...value] : [];
    if (current.includes(id)) {
      onChange?.(current.filter((item) => item !== id));
    } else {
      onChange?.([...current, id]);
    }
  };

  const handleSelectAll = () => {
    if (isAdmin) return;
    onChange?.(ALL_MODULE_IDS);
  };

  const handleClearAll = () => {
    if (isAdmin) return;
    onChange?.(['Dashboard']);
  };

  const isChecked = (id) => {
    if (isAdmin) return true;
    return Array.isArray(value) && value.includes(id);
  };

  const selectedCount = isAdmin
    ? ALL_MODULE_IDS.length
    : Array.isArray(value)
    ? value.length
    : 0;

  return (
    <div className="space-y-2.5">
      {/* Clean Minimal Header */}
      <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-primary text-sm">
            <FiShield />
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
            Module Access & Permissions
          </span>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {selectedCount}/{ALL_MODULE_IDS.length}
          </span>
        </div>

        {!isAdmin && (
          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-primary font-bold hover:underline cursor-pointer"
            >
              Select All
            </button>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <button
              type="button"
              onClick={handleClearAll}
              className="text-slate-500 hover:text-rose-500 cursor-pointer"
            >
              Reset
            </button>
          </div>
        )}
      </div>

      {/* Admin Minimal Notice */}
      {isAdmin && (
        <div className="px-3 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/40 flex items-center justify-between text-xs text-purple-800 dark:text-purple-300">
          <span className="font-semibold">
            Admin has full access to all CRM modules
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-200 dark:bg-purple-900 text-purple-900 dark:text-purple-100">
            All Enabled
          </span>
        </div>
      )}

      {/* Minimal Grid of Modules */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {CRM_MODULES.map((module) => {
          const active = isChecked(module.id);
          const Icon = module.icon;

          return (
            <button
              type="button"
              key={module.id}
              disabled={isAdmin}
              onClick={() => toggleModule(module.id)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border text-left transition-all duration-150 cursor-pointer select-none ${
                isAdmin
                  ? 'bg-purple-50/50 dark:bg-purple-950/20 border-purple-200/60 dark:border-purple-800/40 opacity-90 cursor-default'
                  : active
                  ? 'bg-primary/10 dark:bg-primary/20 border-primary text-primary dark:text-white shadow-2xs font-semibold'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              <div
                className={`w-4 h-4 rounded flex items-center justify-center text-[10px] shrink-0 transition-all ${
                  isAdmin
                    ? 'bg-purple-600 text-white'
                    : active
                    ? 'bg-primary text-white'
                    : 'border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-transparent'
                }`}
              >
                <FiCheck className="stroke-[3]" />
              </div>

              <Icon
                className={`text-sm shrink-0 ${
                  isAdmin
                    ? 'text-purple-600 dark:text-purple-400'
                    : active
                    ? 'text-primary'
                    : 'text-slate-400'
                }`}
              />

              <span className="text-xs truncate font-medium">
                {module.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ModulePermissionsSelector;
