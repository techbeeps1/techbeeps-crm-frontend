import React, { useState, useRef, useEffect } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CloseIcon from '@mui/icons-material/Close';

const SearchableClientSelect = ({ customerList = [], value, onChange, disabled, error }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedCustomer = customerList.find((item) => item._id === value);

  const filteredCustomers = customerList.filter((item) => {
    const fullName = `${item.firstName || ''} ${item.lastName || ''}`.toLowerCase();
    const email = (item.email || '').toLowerCase();
    const term = searchTerm.toLowerCase();
    return fullName.includes(term) || email.includes(term);
  });

  return (
    <div className="relative w-full" ref={wrapperRef}>
      {/* Trigger Input Box */}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full rounded-xl border ${
          error ? 'border-rose-500 ring-2 ring-rose-500/10' : 'border-slate-300 dark:border-slate-600'
        } bg-white dark:bg-boxdark px-3.5 py-2.5 text-sm flex items-center justify-between cursor-pointer transition-all font-medium ${
          disabled ? 'opacity-60 cursor-not-allowed bg-slate-100 dark:bg-slate-800' : 'hover:border-primary'
        }`}
      >
        <span className={selectedCustomer ? 'text-slate-900 dark:text-white font-semibold' : 'text-slate-400'}>
          {selectedCustomer
            ? `${selectedCustomer.firstName} ${selectedCustomer.lastName} ${selectedCustomer.email ? `(${selectedCustomer.email})` : ''}`
            : 'Select Client...'}
        </span>
        <div className="flex items-center gap-1">
          {selectedCustomer && !disabled && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
              }}
              className="p-0.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
              title="Clear selection"
            >
              <CloseIcon style={{ fontSize: 16 }} />
            </button>
          )}
          <KeyboardArrowDownIcon
            className={`text-slate-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-primary' : ''
            }`}
          />
        </div>
      </div>

      {/* Dropdown Menu Popover */}
      {isOpen && !disabled && (
        <div className="absolute z-50 left-0 top-full mt-1.5 w-full bg-white dark:bg-boxdark border border-slate-200 dark:border-strokedark rounded-2xl shadow-xl overflow-hidden p-2.5 space-y-2 max-h-72 flex flex-col transition-all">
          {/* Search Bar Input */}
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" style={{ fontSize: 18 }} />
            <input
              type="text"
              autoFocus
              placeholder="Search client by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-meta-4 border border-slate-200 dark:border-strokedark rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          {/* Customer Options List */}
          <div className="overflow-y-auto flex-1 divide-y divide-slate-100 dark:divide-strokedark scrollbar-thin">
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map((item) => {
                const isSelected = item._id === value;
                return (
                  <div
                    key={item._id}
                    onClick={() => {
                      onChange(item._id);
                      setIsOpen(false);
                      setSearchTerm('');
                    }}
                    className={`p-2.5 text-xs rounded-xl cursor-pointer transition-colors flex items-center justify-between ${
                      isSelected
                        ? 'bg-primary/10 text-primary font-bold'
                        : 'hover:bg-slate-100 dark:hover:bg-meta-4/70 text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    <div>
                      <span className="block font-semibold text-sm">
                        {item.firstName} {item.lastName}
                      </span>
                      {item.email && (
                        <span className="block text-[11px] text-slate-400 font-normal mt-0.5">
                          {item.email}
                        </span>
                      )}
                    </div>
                    {isSelected && (
                      <span className="text-[10px] bg-primary text-white font-bold px-2 py-0.5 rounded-full uppercase">
                        Selected
                      </span>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="p-4 text-center text-xs text-slate-400">
                No clients found matching "{searchTerm}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableClientSelect;
