import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../Admin/Header';
import Packages from './Package';
import Salesgroup from './Salegroup/Salesgroup';
import Reporting from './Reporting/Reporting';
import EmailTemplateList from './EmailTemplates/EmailTemplateList';
import {
  MdInventory2,
  MdSummarize,
  MdDescription,
  MdGroups,
  MdChevronRight,
  MdWarningAmber,
  MdArrowForward
} from 'react-icons/md';

const Method = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const navItems = useMemo(
    () => [
      {
        id: 0,
        slug: 'packages',
        title: 'Packages & Bundles',
        shortTitle: 'Packages',
        icon: MdInventory2,
        desc: 'Preconfigured service bundles',
      },
      {
        id: 1,
        slug: 'document-templates',
        title: 'Document Templates',
        shortTitle: 'Doc Templates',
        icon: MdDescription,
        desc: 'Report & document layouts',
      },
      {
        id: 2,
        slug: 'email-templates',
        title: 'Email Templates',
        shortTitle: 'Email Tmpl.',
        icon: MdSummarize,
        desc: 'Quotation and notice emails',
      },
      {
        id: 3,
        slug: 'sales-groups',
        title: 'Sales Groups & Units',
        shortTitle: 'Sales Groups',
        icon: MdGroups,
        desc: 'Agent distribution & teams',
      },
    ],
    []
  );

  const rawTab = (searchParams.get('tab') || '').toLowerCase().trim();

  // Determine active tab or detect safe-state condition
  const { activeTab, isDeprecatedOrInvalid, requestedTab } = useMemo(() => {
    if (!rawTab) {
      return { activeTab: 0, isDeprecatedOrInvalid: false, requestedTab: '' };
    }

    if (rawTab === '0' || rawTab === 'packages' || rawTab === 'bundles') {
      return { activeTab: 0, isDeprecatedOrInvalid: false, requestedTab: rawTab };
    }
    if (
      rawTab === '1' ||
      rawTab === 'document-templates' ||
      rawTab === 'doctemplates' ||
      rawTab === 'templates' ||
      rawTab === 'documents'
    ) {
      return { activeTab: 1, isDeprecatedOrInvalid: false, requestedTab: rawTab };
    }
    if (
      rawTab === '2' ||
      rawTab === 'email-templates' ||
      rawTab === 'emails' ||
      rawTab === 'email'
    ) {
      return { activeTab: 2, isDeprecatedOrInvalid: false, requestedTab: rawTab };
    }
    if (
      rawTab === '3' ||
      rawTab === 'sales-groups' ||
      rawTab === 'sales' ||
      rawTab === 'groups'
    ) {
      return { activeTab: 3, isDeprecatedOrInvalid: false, requestedTab: rawTab };
    }

    // Handled deprecated or unknown tabs (e.g. ?tab=customer-reporting, ?tab=reporting)
    return { activeTab: -1, isDeprecatedOrInvalid: true, requestedTab: rawTab };
  }, [rawTab]);

  const handleSelectTab = (id) => {
    const item = navItems.find((n) => n.id === id);
    if (item) {
      setSearchParams({ tab: item.slug });
    }
  };

  const renderContent = () => {
    if (isDeprecatedOrInvalid) {
      return (
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 rounded-2xl p-6 sm:p-8 max-w-xl mx-auto my-12 text-center shadow-xs">
          <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
            <MdWarningAmber />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">
            Requested Destination Not Found: &ldquo;{requestedTab}&rdquo;
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
            The previously titled <strong>&ldquo;Customer Reporting&rdquo;</strong> menu has been reorganized into{' '}
            <strong>Document Templates</strong> to accurately reflect document and quotation layouts. Real-time audit
            summaries are available in specialized reporting surfaces.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => handleSelectTab(1)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-xs sm:text-sm font-semibold shadow-sm hover:bg-primary/90 transition-all cursor-pointer"
            >
              <span>Open Document Templates</span>
              <MdArrowForward />
            </button>
            <button
              type="button"
              onClick={() => handleSelectTab(0)}
              className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold hover:bg-slate-300 dark:hover:bg-slate-600 transition-all cursor-pointer"
            >
              Back to Packages
            </button>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 0:
        return <Packages />;
      case 1:
        return <Reporting />;
      case 2:
        return <EmailTemplateList />;
      case 3:
        return <Salesgroup />;
      default:
        return <Packages />;
    }
  };

  return (
    <div className="space-y-5">
      <Header />

      {/* Main Container Card */}
      <div className="bg-white dark:bg-boxdark rounded-2xl border border-stroke dark:border-strokedark shadow-xs overflow-hidden flex flex-col md:flex-row min-h-[750px]">
        {/* Left Vertical Navigation */}
        <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-stroke dark:border-strokedark bg-gray-2/40 dark:bg-boxdark-2/40 p-3 sm:p-4 shrink-0">
          <div className="mb-3 px-3 py-2">
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Workflows & Rules
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
                  onClick={() => handleSelectTab(item.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all cursor-pointer group ${
                    isActive
                      ? 'bg-primary text-white shadow-md shadow-primary/20 scale-[1.01]'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-strokedark/60'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0 transition-colors ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-white dark:bg-meta-4 text-primary group-hover:bg-primary group-hover:text-white shadow-xs'
                      }`}
                    >
                      <Icon />
                    </div>
                    <div className="truncate">
                      <p className="text-sm font-bold truncate">{item.title}</p>
                      <p
                        className={`text-[11px] truncate ${
                          isActive ? 'text-white/80' : 'text-body dark:text-bodydark'
                        }`}
                      >
                        {item.desc}
                      </p>
                    </div>
                  </div>
                  <MdChevronRight
                    className={`text-lg shrink-0 transition-transform ${
                      isActive ? 'text-white translate-x-0.5' : 'text-slate-400 group-hover:translate-x-0.5'
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
    </div>
  );
};

export default Method;

