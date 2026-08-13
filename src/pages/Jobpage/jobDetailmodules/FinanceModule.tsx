import React, { useState, useEffect } from 'react';
import { Radio } from '@mui/material';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import InventoryIcon from '@mui/icons-material/Inventory';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import { useForm } from 'react-hook-form';
import EditForm from '../../Methods/Forms/EditForm';

interface FinanceModuleProps {
  data: {
    name: string;
    ignoreRules: boolean;
    type_job: string;
    priceAgree: boolean;
    vat: number;
    offers?: any;
    invoice?: any;
    start_job?: any;
    Storage?: any;
    appointment?: any;
  };
}

const FinanceModule: React.FC<FinanceModuleProps> = ({ data }) => {
  const { register, formState: { errors }, reset, setValue, watch } = useForm();
  const [selectedForm, setSelectedForm] = useState<string>('');

  useEffect(() => {
    reset();
    if (data) {
      const reversedData = reverseApiData(data);
      Object.keys(reversedData).forEach(key => {
        setValue(key, reversedData[key]);
      });
    }
  }, [data, setValue, reset]);

  function reverseApiData(formattedData: FinanceModuleProps['data']) {
    const result: Record<string, any> = {
      name: formattedData?.name || '',
      ignoreRules: formattedData?.ignoreRules || false,
      type_job: formattedData?.type_job || '',
      priceAgree: formattedData?.priceAgree || false,
      vat: formattedData?.vat || 0,
    };

    const sections = ['offers', 'invoice', 'start_job', 'Storage', 'appointment'] as const;
    sections.forEach(section => {
      if (formattedData && formattedData[section]) {
        Object.keys(formattedData[section]).forEach(key => {
          if (key !== 'rules') {
            result[`${section}_${key}`] = formattedData[section][key];
          }
        });
        if (formattedData[section].rules) {
          result[`${section}rules`] = formattedData[section].rules;
        }
      }
    });
    return result;
  }

  const steps = [
    { id: 'invoice', label: 'Acceptance of offer', icon: <ReceiptIcon /> },
    { id: 'start_job', label: 'Start job', icon: <PlayArrowIcon /> },
    { id: 'Storage', label: 'Storage loaded', icon: <InventoryIcon /> },
    { id: 'appointment', label: 'After last appointment', icon: <EventAvailableIcon /> },
  ];

  return (
    <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark p-5 shadow-xs space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-strokedark">
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Financial Workflow Settings
          </span>
          <h3 className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
            Package: {data?.name || 'Standard Package'}
          </h3>
        </div>
        <button
          type="button"
          className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer w-full sm:w-auto"
        >
          Process Workflow
        </button>
      </div>

      <form className="space-y-6">
        {/* Step Selector Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {steps.map((step) => {
            const isSelected = selectedForm === step.id;
            return (
              <div
                key={step.id}
                onClick={() => setSelectedForm(step.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                  isSelected
                    ? 'bg-primary/10 border-primary shadow-sm text-primary dark:text-white'
                    : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-primary text-white'
                      : 'bg-white dark:bg-boxdark text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-strokedark'
                  }`}
                >
                  {step.icon}
                </div>
                <Radio
                  checked={isSelected}
                  value={step.id}
                  style={{ display: 'none' }}
                />
                <div>
                  <span className="text-xs font-bold block">{step.label}</span>
                  <span className="text-[10px] text-slate-400 block font-medium">
                    {isSelected ? 'Selected' : 'Click to configure'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Dynamic Form Editor */}
        {selectedForm && (
          <div className="p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/30 border border-slate-200/80 dark:border-slate-800">
            {selectedForm === 'invoice' && (
              <EditForm
                register={register}
                errors={errors}
                type="invoice"
                watch={watch}
                setValue={setValue}
                data={data?.invoice}
              />
            )}
            {selectedForm === 'start_job' && (
              <EditForm
                register={register}
                errors={errors}
                type="start_job"
                watch={watch}
                setValue={setValue}
                data={data?.start_job}
              />
            )}
            {selectedForm === 'Storage' && (
              <EditForm
                register={register}
                errors={errors}
                type="Storage"
                watch={watch}
                setValue={setValue}
                data={data?.Storage}
              />
            )}
            {selectedForm === 'appointment' && (
              <EditForm
                register={register}
                errors={errors}
                type="appointment"
                watch={watch}
                setValue={setValue}
                data={data?.appointment}
              />
            )}
          </div>
        )}
      </form>
    </div>
  );
};

export default FinanceModule;
