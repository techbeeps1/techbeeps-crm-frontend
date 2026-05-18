import React, { useState, useEffect } from 'react';
import { Button, Radio } from '@mui/material';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { useForm} from 'react-hook-form';
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
      name: formattedData.name,
      ignoreRules: formattedData.ignoreRules,
      type_job: formattedData.type_job,
      priceAgree: formattedData.priceAgree,
      vat: formattedData.vat,
    };

    const sections = ['offers', 'invoice', 'start_job', 'Storage', 'appointment'] as const;
    sections.forEach(section => {
      if (formattedData[section]) {
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

  return (
    <div className="px-4">
      <Button variant="contained" color="primary" className="w-full sm:w-auto">
        Process
      </Button>
      <form>
        <div className="font-bold my-3 text-center sm:text-left">Package: {data.name}</div>
        <div className="flex items-center justify-center mb-6 mt-5">
          {/* Acceptance of Offer Option */}
          <div
            className={`flex flex-col items-center cursor-pointer transition-colors duration-300 ${
              selectedForm === 'invoice' ? 'text-blue' : 'text-black'
            }`}
            onClick={() => setSelectedForm('invoice')}
          >
            <div
              className={`border p-4 flex items-center justify-center rounded-full ${
                selectedForm === 'invoice' ? 'bg-blue text-white' : 'bg-green text-black'
              }`}
            >
              <ReceiptIcon fontSize="large" />
            </div>
            <Radio
              checked={selectedForm === 'invoice'}
              value="invoice"
              style={{ display: 'none' }}
              className="p-0 mt-2"
              size="small"
            />
            <span className="text-sm font-medium">Acceptance of offer</span>
          </div>

          {/* Divider */}
          <div className="w-20 h-1 bg-gray relative">
            <div className="absolute inset-0 bg-blue" />
          </div>

          {/* Start Job Option */}
          <div
            className={`flex flex-col items-center cursor-pointer transition-colors duration-300 ${
              selectedForm === 'start_job' ? 'text-blue' : 'text-black'
            }`}
            onClick={() => setSelectedForm('start_job')}
          >
            <div
              className={`border p-4 flex items-center justify-center rounded-full ${
                selectedForm === 'start_job' ? 'bg-blue text-white' : 'bg-green text-black'
              }`}
            >
              <ReceiptIcon fontSize="large" />
            </div>
            <Radio
              checked={selectedForm === 'start_job'}
              value="start_job"
              style={{ display: 'none' }}
              className="p-0 mt-2"
              size="small"
            />
            <span className="text-sm font-medium">Start job</span>
          </div>

          {/* Divider */}
          <div className="w-30 h-1 bg-gray relative">
            <div className="absolute inset-0 bg-blue" />
          </div>

          {/* Storage Loaded Option */}
          <div
            className={`flex flex-col items-center cursor-pointer transition-colors duration-300 ${
              selectedForm === 'Storage' ? 'text-blue' : 'text-black'
            }`}
            onClick={() => setSelectedForm('Storage')}
          >
            <div
              className={`border p-4 flex items-center justify-center rounded-full ${
                selectedForm === 'Storage' ? 'bg-blue text-white' : 'bg-green text-black'
              }`}
            >
              <ReceiptIcon fontSize="large" />
            </div>
            <Radio
              checked={selectedForm === 'Storage'}
              value="Storage"
              style={{ display: 'none' }}
              className="p-0 mt-2"
              size="small"
            />
            <span className="text-sm font-medium">Storage loaded</span>
          </div>

          {/* Divider */}
          <div className="w-30 h-1 bg-gray relative">
            <div className="absolute inset-0 bg-blue" />
          </div>

          {/* After Last Appointment Option */}
          <div
            className={`flex flex-col items-center cursor-pointer transition-colors duration-300 ${
              selectedForm === 'appointment' ? 'text-blue' : 'text-black'
            }`}
            onClick={() => setSelectedForm('appointment')}
          >
            <div
              className={`border p-4 flex items-center justify-center rounded-full ${
                selectedForm === 'appointment' ? 'bg-blue text-white' : 'bg-green text-black'
              }`}
            >
              <ReceiptIcon fontSize="large" />
            </div>
            <Radio
              checked={selectedForm === 'appointment'}
              value="appointment"
              style={{ display: 'none' }}
              className="p-0 mt-2"
              size="small"
            />
            <span className="text-sm font-medium">After last appointment</span>
          </div>
        </div>

        {/* Conditional Forms */}
        {selectedForm === 'invoice' && (
          <EditForm register={register} errors={errors} type="invoice" watch={watch} setValue={setValue} data={data.invoice} />
        )}
        {selectedForm === 'start_job' && (
          <EditForm register={register} errors={errors} type="start_job" watch={watch} setValue={setValue} data={data.start_job} />
        )}
        {selectedForm === 'Storage' && (
          <EditForm register={register} errors={errors} type="Storage" watch={watch} setValue={setValue} data={data.Storage} />
        )}
        {selectedForm === 'appointment' && (
          <EditForm register={register} errors={errors} type="appointment" watch={watch} setValue={setValue} data={data.appointment} />
        )}
      </form>
    </div>
  );
};

export default FinanceModule;
