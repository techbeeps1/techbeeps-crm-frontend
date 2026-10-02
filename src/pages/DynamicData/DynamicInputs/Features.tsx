import React, { useContext, useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { EmailContext } from '../../../EmailProvider/EmailContext';
import axios from 'axios';
import { apiPath } from '../../../../apiPath';
import {
  MdPayments,
  MdCalculate,
  MdLocalOffer,
  MdReceipt,
  MdHandyman,
  MdHomeWork,
  MdMiscellaneousServices,
  MdSave,
  MdInfoOutline,
  MdAdd,
  MdOutlineLaunch,
} from 'react-icons/md';
import { useCurrency } from '../../../utils/currencyUtil';
import { formatLabel } from '../../../utils/labelUtil';

interface FeaturesProps {
  onNavigateToPropertyTypes?: () => void;
}

const Features: React.FC<FeaturesProps> = ({ onNavigateToPropertyTypes }) => {
  const navigate = useNavigate();
  const { symbol: currencySymbol } = useCurrency();
  const { settings, fetchTemplates } = useContext(EmailContext) as any;
  const [loading, setLoading] = useState<boolean>(false);
  const [propertySurcharges, setPropertySurcharges] = useState<Record<string, number>>(
    settings?.standardPrice?.propertySurcharges || {}
  );
  const [servicesData, setServicesData] = useState<any[]>([]);
  const [propertiesList, setPropertiesList] = useState<any[]>([]);

  React.useEffect(() => {
    if (settings?.standardPrice?.propertySurcharges) {
      setPropertySurcharges(settings.standardPrice.propertySurcharges);
    }
  }, [settings]);

  useEffect(() => {
    axios
      .get(`${apiPath}/api/services`)
      .then((res) => {
        setServicesData(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => console.error('Failed to load services in Features:', err));

    axios
      .get(`${apiPath}/api/sale_group?type=property`)
      .then((res) => {
        if (Array.isArray(res.data)) {
          setPropertiesList(res.data);
          // Seed surcharges from property records if not already in settings
          setPropertySurcharges((prev) => {
            const updated = { ...prev };
            res.data.forEach((p: any) => {
              if (p.name && (updated[p.name] === undefined || updated[p.name] === 0) && p.surcharge !== undefined && p.surcharge !== 0) {
                updated[p.name] = Number(p.surcharge) || 0;
              }
            });
            return updated;
          });
        }
      })
      .catch((err) => console.error('Failed to load property types in Features:', err));
  }, []);

  const [prices, setPrices] = useState<any>([
    { label: 'Price per cubic meter', value: settings.standardPrice?.pricePerMeterCubic || 0, unit: `${currencySymbol} / m³` },
    { label: 'Price per hour for travel time', value: settings.standardPrice?.pricePerHour || 0, unit: `${currencySymbol} / hr` },
    { label: 'Price per kilometer', value: settings.standardPrice?.pricePerKilometer || 0, unit: `${currencySymbol} / km` },
    { label: 'QUOTATION CALCULATION', type: 'heading' },
    { label: 'Cubic meters per employee per hour (average)', value: settings.standardPrice?.cubicMeterPerHourPerEmployee || 0, unit: 'm³ / hr' },
    { label: 'Packing boxes per hour', value: settings.standardPrice?.packingBoxPerHour || 10, unit: 'boxes / hr' },
    { label: 'Unpacking boxes per hour', value: settings.standardPrice?.unPackagingBoxPerHour || 10, unit: 'boxes / hr' },
    { label: 'Minutes of assembly time per piece of furniture (or per door)', value: settings.standardPrice?.assemblingTimePerfurniture || 15, unit: 'minutes' },
    { label: 'Minutes to disassemble per piece of furniture (or per door)', value: settings.standardPrice?.disassemblingTimePerfurniture || 15, unit: 'minutes' },
  ]);

  const handlePriceChange = (index: number, value: string) => {
    const updatedPrices = [...prices];
    updatedPrices[index].value = value === '' ? '' : parseFloat(value) || 0;
    setPrices(updatedPrices);
  };

  const handleSurchargeChange = (key: string, value: string) => {
    const num = value === '' ? 0 : parseFloat(value) || 0;
    setPropertySurcharges((prev) => ({
      ...prev,
      [key]: num,
    }));
  };

  const handleServicePriceChange = (id: string, value: string) => {
    const num = value === '' ? 0 : parseFloat(value) || 0;
    setServicesData((prev) =>
      prev.map((s) => (s._id === id ? { ...s, price: num } : s))
    );
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      await axios.post(`${apiPath}/api/save-settings`, {
        standardPrice: {
          pricePerMeterCubic: prices[0].value,
          pricePerHour: prices[1].value,
          pricePerKilometer: prices[2].value,
          cubicMeterPerHourPerEmployee: prices[4].value,
          packingBoxPerHour: prices[5].value,
          unPackagingBoxPerHour: prices[6].value,
          assemblingTimePerfurniture: prices[7].value,
          disassemblingTimePerfurniture: prices[8].value,
          propertySurcharges: propertySurcharges,
        },
      });

      // Also persist updated service prices to /api/services
      for (const service of servicesData) {
        if (service._id && service.price !== undefined) {
          try {
            await axios.put(`${apiPath}/api/services/${service._id}`, {
              price: Number(service.price) || 0,
            });
          } catch (sErr) {
            console.error(`Failed to update service ${service.serviceName}:`, sErr);
          }
        }
      }

      toast.success('Settings & surcharges saved successfully!');
      fetchTemplates();
    } catch (error: any) {
      toast.error(`Failed to save settings: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const dynamicSurchargesList = useMemo(() => {
    if (propertiesList.length === 0) {
      return Object.keys(propertySurcharges).map((key) => ({
        key,
        label: key,
        surcharge: propertySurcharges[key] || 0,
      }));
    }
    return propertiesList.map((p) => ({
      key: p.name,
      label: p.name,
      surcharge: p.surcharge,
    }));
  }, [propertiesList, propertySurcharges]);

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Top Header with Save Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stroke dark:border-strokedark">
        <div>
          <h3 className="text-lg font-bold text-black dark:text-white">
            System Rates & Feature Parameters
          </h3>
          <p className="text-xs text-body dark:text-bodydark">
            Manage volume pricing, labour rates, surcharges, and workflow toggles
          </p>
        </div>
        <button
          onClick={handleSaveSettings}
          disabled={loading}
          className="flex items-center gap-2 bg-primary hover:bg-opacity-90 text-white font-semibold py-2.5 px-6 rounded-xl shadow-md shadow-primary/25 transition-all cursor-pointer disabled:opacity-50 text-xs sm:text-sm self-start sm:self-auto"
        >
          <MdSave className="text-base" />
          {loading ? 'Saving Parameters...' : 'Save All Settings'}
        </button>
      </div>

      {/* 1. Base Prices */}
      <div className="bg-white dark:bg-boxdark rounded-2xl border border-stroke dark:border-strokedark p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-stroke dark:border-strokedark">
          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-lg shrink-0">
            <MdPayments />
          </div>
          <div>
            <h4 className="text-sm font-bold text-black dark:text-white">
              Standard Base Rates & Transport
            </h4>
            <p className="text-[11px] text-body dark:text-bodydark">
              Core volumetric and distance multipliers used in automated quotations
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-1">
          {prices.slice(0, 3).map((item: any, index: number) => (
            <div
              key={index}
              className="bg-gray-2/40 dark:bg-meta-4/20 p-4 rounded-xl border border-stroke dark:border-strokedark"
            >
              <label className="block text-xs font-bold text-black dark:text-white mb-2">
                {item.label}
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={item.value}
                  onChange={(e) => handlePriceChange(index, e.target.value)}
                  className="w-full bg-white dark:bg-form-input text-black dark:text-white rounded-xl border border-stroke dark:border-strokedark py-2 px-3.5 pr-14 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm font-semibold"
                />
                <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">
                  {item.unit}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Quotation Calculation Parameters */}
      <div className="bg-white dark:bg-boxdark rounded-2xl border border-stroke dark:border-strokedark p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-stroke dark:border-strokedark">
          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-lg shrink-0">
            <MdCalculate />
          </div>
          <div>
            <h4 className="text-sm font-bold text-black dark:text-white">
              Quotation & Productivity Metrics
            </h4>
            <p className="text-[11px] text-body dark:text-bodydark">
              Standard labour estimation speeds and handling averages
            </p>
          </div>
        </div>

        <div className="bg-gray-2/40 dark:bg-meta-4/20 p-4 rounded-xl border border-stroke dark:border-strokedark flex items-center justify-between">
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-black dark:text-white cursor-pointer">
              Include company address in km calculation
            </label>
            <span
              className="text-slate-400 hover:text-primary cursor-help"
              title="Calculates round-trip distance starting from company headquarters"
            >
              <MdInfoOutline className="text-sm" />
            </span>
          </div>
          <input
            type="checkbox"
            defaultChecked
            className="w-4 h-4 rounded text-primary focus:ring-primary border-stroke cursor-pointer"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-1">
          {prices.slice(4).map((item: any, relIndex: number) => {
            const index = relIndex + 4;
            return (
              <div
                key={index}
                className="bg-gray-2/40 dark:bg-meta-4/20 p-4 rounded-xl border border-stroke dark:border-strokedark"
              >
                <label className="block text-xs font-bold text-black dark:text-white mb-2 line-clamp-2 h-8">
                  {item.label}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    step="0.1"
                    value={item.value}
                    onChange={(e) => handlePriceChange(index, e.target.value)}
                    className="w-full bg-white dark:bg-form-input text-black dark:text-white rounded-xl border border-stroke dark:border-strokedark py-2 px-3.5 pr-14 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm font-semibold"
                  />
                  <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">
                    {item.unit}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Offers & Acceptance Behavior */}
      <div className="bg-white dark:bg-boxdark rounded-2xl border border-stroke dark:border-strokedark p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-stroke dark:border-strokedark">
          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-lg shrink-0">
            <MdLocalOffer />
          </div>
          <div>
            <h4 className="text-sm font-bold text-black dark:text-white">
              Offers & Acceptance Behavior
            </h4>
            <p className="text-[11px] text-body dark:text-bodydark">
              Quotation display rules and client acceptance page toggles
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-2/40 dark:bg-meta-4/20 p-4 rounded-xl border border-stroke dark:border-strokedark">
            <label className="block text-xs font-bold text-black dark:text-white mb-2">
              Send Inventory List with Quotation
            </label>
            <select
              defaultValue="always"
              className="w-full bg-white dark:bg-form-input text-black dark:text-white rounded-xl border border-stroke dark:border-strokedark py-2 px-3.5 outline-none focus:border-primary text-xs font-semibold"
            >
              <option value="always">Always Include Inventory</option>
              <option value="sometimes">Optional / On Demand</option>
            </select>
          </div>

          <div className="space-y-3">
            <div className="bg-gray-2/40 dark:bg-meta-4/20 p-3.5 rounded-xl border border-stroke dark:border-strokedark flex items-center justify-between">
              <span className="text-xs font-bold text-black dark:text-white">
                Hide the PDF on acceptance page
              </span>
              <input
                type="checkbox"
                className="w-4 h-4 rounded text-primary focus:ring-primary border-stroke cursor-pointer"
              />
            </div>

            <div className="bg-gray-2/40 dark:bg-meta-4/20 p-3.5 rounded-xl border border-stroke dark:border-strokedark flex items-center justify-between">
              <span className="text-xs font-bold text-black dark:text-white">
                Force full PDF review before acceptance
              </span>
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 rounded text-primary focus:ring-primary border-stroke cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 4. Billing & Invoicing Automation */}
      <div className="bg-white dark:bg-boxdark rounded-2xl border border-stroke dark:border-strokedark p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-stroke dark:border-strokedark">
          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-lg shrink-0">
            <MdReceipt />
          </div>
          <div>
            <h4 className="text-sm font-bold text-black dark:text-white">
              Billing & Invoicing Rules
            </h4>
            <p className="text-[11px] text-body dark:text-bodydark">
              Breakdown display preferences, storage schedule, and auto-reminders
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {[
            'Show totals per line for hourly rates',
            'Show numbers per line for hourly rates',
            'Show totals on invoice summary',
            'Enable pre-billing for storage items',
            'Send invoice reminders automatically',
          ].map((label, idx) => (
            <div
              key={idx}
              className="bg-gray-2/40 dark:bg-meta-4/20 p-3.5 rounded-xl border border-stroke dark:border-strokedark flex items-center justify-between gap-2"
            >
              <span className="text-xs font-semibold text-black dark:text-white">
                {label}
              </span>
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 rounded text-primary focus:ring-primary border-stroke cursor-pointer shrink-0"
              />
            </div>
          ))}

          <div className="bg-gray-2/40 dark:bg-meta-4/20 p-3.5 rounded-xl border border-stroke dark:border-strokedark">
            <label className="block text-xs font-bold text-black dark:text-white mb-1.5">
              Prepare storage invoices days in advance
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                defaultValue={7}
                className="w-20 bg-white dark:bg-form-input text-black dark:text-white rounded-lg border border-stroke dark:border-strokedark py-1.5 px-2.5 text-xs font-semibold outline-none focus:border-primary"
              />
              <span className="text-xs text-slate-400 font-medium">Days</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Job Planning & Odd Jobs */}
      <div className="bg-white dark:bg-boxdark rounded-2xl border border-stroke dark:border-strokedark p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-stroke dark:border-strokedark">
          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-lg shrink-0">
            <MdHandyman />
          </div>
          <div>
            <h4 className="text-sm font-bold text-black dark:text-white">
              Operations & Job Execution
            </h4>
            <p className="text-[11px] text-body dark:text-bodydark">
              Planning intake defaults and operational assumptions
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-gray-2/40 dark:bg-meta-4/20 p-3.5 rounded-xl border border-stroke dark:border-strokedark flex items-center justify-between">
            <span className="text-xs font-semibold text-black dark:text-white">
              Start planning intake for a new job
            </span>
            <input
              type="checkbox"
              defaultChecked
              className="w-4 h-4 rounded text-primary focus:ring-primary border-stroke cursor-pointer"
            />
          </div>

          <div className="bg-gray-2/40 dark:bg-meta-4/20 p-3.5 rounded-xl border border-stroke dark:border-strokedark flex items-center justify-between">
            <span className="text-xs font-semibold text-black dark:text-white">
              Description always as first tab
            </span>
            <input
              type="checkbox"
              defaultChecked
              className="w-4 h-4 rounded text-primary focus:ring-primary border-stroke cursor-pointer"
            />
          </div>

          <div className="bg-gray-2/40 dark:bg-meta-4/20 p-3.5 rounded-xl border border-stroke dark:border-strokedark flex items-center justify-between">
            <span className="text-xs font-semibold text-black dark:text-white">
              No boxes supplied as standard
            </span>
            <input
              type="checkbox"
              className="w-4 h-4 rounded text-primary focus:ring-primary border-stroke cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* 6. Property Surcharges Grid */}
      <div className="bg-white dark:bg-boxdark rounded-2xl border border-stroke dark:border-strokedark p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stroke dark:border-strokedark">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-lg shrink-0">
              <MdHomeWork />
            </div>
            <div>
              <h4 className="text-sm font-bold text-black dark:text-white">
                Property Location Surcharges
              </h4>
              <p className="text-[11px] text-body dark:text-bodydark">
                Additional fees applied per housing or commercial structure type (Synced with Property Types)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (onNavigateToPropertyTypes) {
                onNavigateToPropertyTypes();
              } else {
                navigate('/data?active=5');
              }
            }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:bg-primary/10 px-3 py-1.5 rounded-xl border border-primary/20 transition-all cursor-pointer self-start sm:self-auto shrink-0"
            title="Manage master property list under Property Classifications"
          >
            <MdAdd className="text-sm" />
            <span>Add / Edit Property Types</span>
            <MdOutlineLaunch className="text-xs opacity-70" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {dynamicSurchargesList.map((item, idx) => (
            <div
              key={item.key || idx}
              className="bg-gray-2/40 dark:bg-meta-4/20 p-3.5 rounded-xl border border-stroke dark:border-strokedark"
            >
              <label className="block text-xs font-semibold text-black dark:text-white mb-1.5 truncate" title={item.label}>
                {item.label}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">
                  {currencySymbol}
                </span>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={propertySurcharges[item.key] ?? item.surcharge ?? ''}
                  onChange={(e) => handleSurchargeChange(item.key, e.target.value)}
                  onFocus={(e) => e.target.select()}
                  placeholder="0.00"
                  className="w-full bg-white dark:bg-form-input text-black dark:text-white rounded-lg border border-stroke dark:border-strokedark py-1.5 pl-8 pr-3 outline-none focus:border-primary text-xs font-semibold"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7. Prices for Optional Services */}
      <div className="bg-white dark:bg-boxdark rounded-2xl border border-stroke dark:border-strokedark p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-stroke dark:border-strokedark">
          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-lg shrink-0">
            <MdMiscellaneousServices />
          </div>
          <div>
            <h4 className="text-sm font-bold text-black dark:text-white">
              Add-On Services & Protection
            </h4>
            <p className="text-[11px] text-body dark:text-bodydark">
              Configured prices for certificates, protection packages, and special items
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {servicesData.map((service, idx) => (
            <div
              key={service._id || idx}
              className="bg-gray-2/40 dark:bg-meta-4/20 p-3.5 rounded-xl border border-stroke dark:border-strokedark"
            >
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-black dark:text-white truncate">
                  {service.serviceName || formatLabel(service.serviceTypeName)}
                </label>
                <span className="text-[10px] text-slate-500 uppercase font-mono">
                  {formatLabel(service.serviceTypeName)}
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">
                  {currencySymbol}
                </span>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={service.price ?? 0}
                  onChange={(e) => handleServicePriceChange(service._id, e.target.value)}
                  onFocus={(e) => e.target.select()}
                  placeholder="0.00"
                  className="w-full bg-white dark:bg-form-input text-black dark:text-white rounded-lg border border-stroke dark:border-strokedark py-1.5 pl-8 pr-3 outline-none focus:border-primary text-xs font-semibold"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Features;


