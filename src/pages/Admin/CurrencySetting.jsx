import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import axios from 'axios';
import { apiPath } from '../../../apiPath';
import {
  SUPPORTED_CURRENCIES,
  getCurrencySettings,
  setCurrencySettings,
  formatCurrency,
} from '../../utils/currencyUtil';
import {
  MdOutlinePayments,
  MdCheckCircle,
  MdAttachMoney,
  MdSave,
  MdInfoOutline,
} from 'react-icons/md';

const MoneyFormatSettings = () => {
  const initial = getCurrencySettings();
  const [selectedCurrency, setSelectedCurrency] = useState(initial.code || 'USD');
  const [symbolPosition, setSymbolPosition] = useState(initial.position || 'before');
  const [decimalPlaces, setDecimalPlaces] = useState(initial.decimals !== undefined ? initial.decimals : 2);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, setValue } = useForm({
    defaultValues: {
      currency: selectedCurrency,
    },
  });

  // Load from backend on mount
  useEffect(() => {
    const fetchSavedCurrency = async () => {
      try {
        const res = await axios.get(`${apiPath}/api/available-settings`);
        if (res.status === 200 && res.data) {
          const d = res.data;
          const code = d.currency || initial.code || 'USD';
          const pos = d.currencyPosition || initial.position || 'before';
          const dec = d.currencyDecimals !== undefined ? Number(d.currencyDecimals) : initial.decimals;
          setSelectedCurrency(code);
          setSymbolPosition(pos);
          setDecimalPlaces(dec);
          setValue('currency', code);

          const matched = SUPPORTED_CURRENCIES.find((c) => c.code === code) || SUPPORTED_CURRENCIES[0];
          setCurrencySettings({
            code,
            symbol: d.currencySymbol || matched.symbol,
            position: pos,
            decimals: dec,
          });
        }
      } catch (e) {
        console.warn('Could not fetch currency settings:', e);
      }
    };
    fetchSavedCurrency();
  }, [setValue]);

  const handleSelectCurrency = (code) => {
    setSelectedCurrency(code);
    setValue('currency', code);
  };

  const onSubmit = async (data) => {
    setSaving(true);
    const code = data.currency || selectedCurrency;
    const matched = SUPPORTED_CURRENCIES.find((c) => c.code === code) || SUPPORTED_CURRENCIES[0];
    const symbol = matched.symbol;

    try {
      await axios.post(`${apiPath}/api/save-settings`, {
        currency: code,
        currencySymbol: symbol,
        currencyPosition: symbolPosition,
        currencyDecimals: decimalPlaces,
      });

      setCurrencySettings({
        code,
        symbol,
        position: symbolPosition,
        decimals: decimalPlaces,
      });

      toast.success(`Default currency updated to ${code} (${symbol}) across the project!`, {
        autoClose: 2500,
      });
    } catch (err) {
      console.error('Failed to save currency settings:', err);
      // Still set locally so user is not blocked
      setCurrencySettings({
        code,
        symbol,
        position: symbolPosition,
        decimals: decimalPlaces,
      });
      toast.info(`Currency set locally to ${code} (${symbol}).`);
    } finally {
      setSaving(false);
    }
  };

  const currentObj = SUPPORTED_CURRENCIES.find((c) => c.code === selectedCurrency) || SUPPORTED_CURRENCIES[0];

  const formatSample = (val) => {
    return formatCurrency(val, {
      symbol: currentObj.symbol,
      position: symbolPosition,
      decimals: decimalPlaces,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="border-b border-stroke dark:border-strokedark pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-xl font-bold text-black dark:text-white flex items-center gap-2">
            <MdOutlinePayments className="text-primary text-2xl" />
            Currency & Financial Formatting
          </h3>
          <p className="text-sm text-body dark:text-bodydark mt-1">
            Choose your primary currency standard for quoting, estimating, invoicing and revenue charts.
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-primary bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20 self-start sm:self-auto font-medium">
          <MdInfoOutline className="text-sm" />
          Global financial standard
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Preset Cards Grid */}
        <div className="space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
            Select Default Currency
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
            {SUPPORTED_CURRENCIES.map((c) => {
              const isSelected = selectedCurrency === c.code;
              return (
                <button
                  type="button"
                  key={c.code}
                  onClick={() => handleSelectCurrency(c.code)}
                  className={`p-4 rounded-xl border text-left transition-all relative flex flex-col justify-between h-28 cursor-pointer ${
                    isSelected
                      ? 'border-primary bg-primary/5 dark:bg-primary/10 shadow-sm ring-2 ring-primary/25'
                      : 'border-stroke dark:border-strokedark bg-white dark:bg-boxdark hover:border-slate-300 dark:hover:border-strokedark'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black text-black dark:text-white">
                      {c.symbol}
                    </span>
                    {isSelected && (
                      <MdCheckCircle className="text-primary text-xl" />
                    )}
                  </div>
                  <div>
                    <span className="text-sm font-bold text-black dark:text-white block">
                      {c.code}
                    </span>
                    <span className="text-[11px] text-body dark:text-bodydark block truncate">
                      {c.name}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dropdown Fallback & Advanced Formatting */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 bg-gray-2/70 dark:bg-meta-4/20 p-5 rounded-2xl border border-stroke dark:border-strokedark">
          {/* Dropdown selector */}
          <div>
            <label className="block text-xs font-bold text-black dark:text-white mb-1.5">
              Currency Dropdown
            </label>
            <select
              {...register('currency')}
              value={selectedCurrency}
              onChange={(e) => handleSelectCurrency(e.target.value)}
              className="w-full bg-white dark:bg-form-input text-black dark:text-white rounded-xl border border-stroke dark:border-strokedark py-2.5 px-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium"
            >
              {SUPPORTED_CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} - {c.symbol} ({c.name})
                </option>
              ))}
            </select>
          </div>

          {/* Symbol Position */}
          <div>
            <label className="block text-xs font-bold text-black dark:text-white mb-1.5">
              Symbol Position
            </label>
            <select
              value={symbolPosition}
              onChange={(e) => setSymbolPosition(e.target.value)}
              className="w-full bg-white dark:bg-form-input text-black dark:text-white rounded-xl border border-stroke dark:border-strokedark py-2.5 px-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium"
            >
              <option value="before">Before Amount ({currentObj.symbol} 100)</option>
              <option value="after">After Amount (100 {currentObj.symbol})</option>
            </select>
          </div>

          {/* Decimals */}
          <div>
            <label className="block text-xs font-bold text-black dark:text-white mb-1.5">
              Decimal Precision
            </label>
            <select
              value={decimalPlaces}
              onChange={(e) => setDecimalPlaces(Number(e.target.value))}
              className="w-full bg-white dark:bg-form-input text-black dark:text-white rounded-xl border border-stroke dark:border-strokedark py-2.5 px-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium"
            >
              <option value={0}>0 Decimals (e.g. 100)</option>
              <option value={2}>2 Decimals (e.g. 100.00)</option>
              <option value={3}>3 Decimals (e.g. 100.000)</option>
            </select>
          </div>
        </div>

        {/* Live Preview Box */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-primary block mb-0.5">
              Live Currency Formatting Preview
            </span>
            <p className="text-xs text-body dark:text-bodydark">
              Here is how monetary figures will appear across invoices & quotations
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white dark:bg-boxdark px-4 py-2 rounded-xl border border-stroke dark:border-strokedark shadow-xs text-right">
              <span className="text-[10px] text-body dark:text-bodydark block">Example Total</span>
              <span className="text-base font-black text-black dark:text-white">
                {formatSample(2450.5)}
              </span>
            </div>
            <div className="bg-white dark:bg-boxdark px-4 py-2 rounded-xl border border-stroke dark:border-strokedark shadow-xs text-right">
              <span className="text-[10px] text-body dark:text-bodydark block">Tax Amount</span>
              <span className="text-base font-black text-success">
                {formatSample(441.09)}
              </span>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-primary hover:bg-opacity-90 text-white font-semibold py-2.5 px-7 rounded-xl shadow-md shadow-primary/25 transition-all cursor-pointer disabled:opacity-50"
          >
            <MdSave className="text-lg" />
            {saving ? 'Saving...' : 'Save Currency Preferences'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MoneyFormatSettings;

