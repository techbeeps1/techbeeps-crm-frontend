import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useForm, Controller } from 'react-hook-form';
import { apiPath } from '../../../../apiPath';
import { toast } from 'react-toastify';
import Loader from '../../../common/Loader';
import { EmailContext } from '../../../EmailProvider/EmailContext';

interface AppSettings {
  emailTemplates: EmailTemplate;
}

interface EmailTemplate {
  quote: string;
  quoteReminders: string;
  appointment: string;
  invoice: string;
  confirmation: string;
  reminder: string;
  cancellation: string;
  paymentReminder: string;
  paymentReminder2: string;
  thankyou: string;
}

interface TemplateOption {
  _id: string;
  name: string;
  status: string;
}

const AppSettingsForm: React.FC = () => {
  const [availableTemplates, setAvailableTemplates] = useState<TemplateOption[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [emailTemplates, setEmailTemplates] = useState<any>()
  const { control, handleSubmit, setValue } = useForm<AppSettings>();
  const { fetchTemplates } = useContext(EmailContext) as any;

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${apiPath}/api/reporting`)
      .then((response) => {
        setAvailableTemplates(response.data.reportings);
      })
      .catch((error) => {
        console.error('Error fetching templates', error);
        toast.error('Failed to load templates.');
      });

    axios.get(`${apiPath}/api/available-settings`)
      .then((response) => {
        const settings = response.data.emailTemplates;
        const filteredSettings = Object.fromEntries(
          Object.entries(settings).filter(([key]) => key !== '_id')
        );
        setEmailTemplates(filteredSettings)
        Object.entries(filteredSettings).forEach(([key, value]) => {
          setValue(`emailTemplates.${key}` as any, value);
        });
      })
      .catch((error) => {
        console.error('Error fetching app settings', error);
        toast.error('Failed to load app settings.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [setValue]);

  const handleSaveSettings = (data: AppSettings) => {
    setLoading(true);
    axios
      .post(`${apiPath}/api/save-settings`, { emailTemplates: data.emailTemplates })
      .then(() => {
        toast.success('Settings saved successfully!');
        fetchTemplates()
      })
      .catch((error) => {
        console.error('Error saving settings', error);
        toast.error('Failed to save settings.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="p-8 bg-white mt-2">
      {loading && <Loader />}
      <form onSubmit={handleSubmit(handleSaveSettings)}>
        <div className="">
          <h3 className="text-lg font-semibold mb-4">Email Templates Setting ---</h3>
          <div className="grid grid-cols-3 md:grid-cols-3 gap-3">
            {emailTemplates && Object.entries(emailTemplates).map(([key]) => (
              <div key={key} className="mb-4">
                <label htmlFor={key} className="block font-bold mb-2" style={{ textTransform: 'capitalize' }}>
                  {key.replace(/([A-Z])/g, ' $1')}
                </label>
                <Controller
                  name={`emailTemplates.${key}` as any}
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      id={key}
                      className="w-full border border-gray p-2"
                    >
                      <option value="">Select a template</option>
                      {availableTemplates.map((template) => (
                        <option key={template._id} value={template._id}>
                          {template.name}
                        </option>
                      ))}
                    </select>
                  )}
                />
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="mt-4 bg-blue text-white font-bold px-4 py-2 rounded hover:bg-black"
        >
          Save Settings
        </button>
      </form>
    </div>
  );
};

export default AppSettingsForm;
