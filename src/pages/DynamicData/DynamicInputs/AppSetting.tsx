import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useForm, Controller } from 'react-hook-form';
import { apiPath } from '../../../../apiPath';
import { toast } from 'react-toastify';
import Loader from '../../../common/Loader';
import { EmailContext } from '../../../EmailProvider/EmailContext';
import {
  MdMarkEmailRead,
  MdMailOutline,
  MdSave,
  MdNotificationsActive,
} from 'react-icons/md';

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
  const [emailTemplates, setEmailTemplates] = useState<any>();
  const { control, handleSubmit, setValue } = useForm<AppSettings>();
  const { fetchTemplates } = useContext(EmailContext) as any;

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${apiPath}/api/reporting`)
      .then((response) => {
        setAvailableTemplates(response.data.reportings || []);
      })
      .catch((error) => {
        console.error('Error fetching templates', error);
        toast.error('Failed to load templates.');
      });

    axios
      .get(`${apiPath}/api/available-settings`)
      .then((response) => {
        const settings = response.data.emailTemplates || {};
        const filteredSettings = Object.fromEntries(
          Object.entries(settings).filter(([key]) => key !== '_id')
        );
        setEmailTemplates(filteredSettings);
        Object.entries(filteredSettings).forEach(([key, value]) => {
          setValue(`emailTemplates.${key}` as any, value as string);
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
      .post(`${apiPath}/api/save-settings`, {
        emailTemplates: data.emailTemplates,
      })
      .then(() => {
        toast.success('Email template settings saved successfully!');
        fetchTemplates();
      })
      .catch((error) => {
        console.error('Error saving settings', error);
        toast.error('Failed to save settings.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const getEventDescription = (key: string) => {
    switch (key.toLowerCase()) {
      case 'quote':
        return 'Sent when a new quotation proposal is dispatched to client';
      case 'quotereminders':
        return 'Follow-up notification for pending quotation acceptance';
      case 'appointment':
        return 'Booking confirmation & survey schedule notification';
      case 'invoice':
        return 'Dispatched alongside new invoice issue';
      case 'confirmation':
        return 'Job order confirmation & schedule acknowledgment';
      case 'reminder':
        return 'Operational reminder sent prior to move or job execution';
      case 'cancellation':
        return 'Notification sent upon booking or quote cancellation';
      case 'paymentreminder':
        return '1st Stage polite payment reminder for outstanding balance';
      case 'paymentreminder2':
        return '2nd Stage final notice for overdue invoices';
      case 'thankyou':
        return 'Post-completion courtesy notice and feedback request';
      default:
        return 'Automated notification template mapping';
    }
  };

  return (
    <div className="bg-white dark:bg-boxdark rounded-2xl border border-stroke dark:border-strokedark p-5 sm:p-7 md:p-8 shadow-xs space-y-6">
      {loading && <Loader />}

      <form onSubmit={handleSubmit(handleSaveSettings)} className="space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stroke dark:border-strokedark">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-xl shrink-0">
              <MdNotificationsActive />
            </div>
            <div>
              <h3 className="text-lg font-bold text-black dark:text-white">
                Automated Email Notification Routing
              </h3>
              <p className="text-xs text-body dark:text-bodydark">
                Assign customized layout templates to respective operational email triggers
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-primary hover:bg-opacity-90 text-white font-semibold py-2.5 px-6 rounded-xl shadow-md shadow-primary/25 transition-all cursor-pointer text-xs sm:text-sm self-start sm:self-auto disabled:opacity-50"
          >
            <MdSave className="text-base" />
            <span>Save Email Mappings</span>
          </button>
        </div>

        {/* Email Triggers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {emailTemplates &&
            Object.entries(emailTemplates).map(([key]) => (
              <div
                key={key}
                className="bg-gray-2/40 dark:bg-meta-4/20 p-4 rounded-xl border border-stroke dark:border-strokedark space-y-3 hover:border-primary/40 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white dark:bg-boxdark text-primary flex items-center justify-center text-sm shadow-xs shrink-0">
                    <MdMailOutline />
                  </div>
                  <div className="min-w-0 flex-1">
                    <label
                      htmlFor={key}
                      className="block text-xs font-bold text-black dark:text-white capitalize truncate"
                    >
                      {key.replace(/([A-Z])/g, ' $1')}
                    </label>
                    <p className="text-[10px] text-body dark:text-bodydark truncate">
                      {getEventDescription(key)}
                    </p>
                  </div>
                </div>

                <div>
                  <Controller
                    name={`emailTemplates.${key}` as any}
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        id={key}
                        className="w-full bg-white dark:bg-form-input text-black dark:text-white rounded-lg border border-stroke dark:border-strokedark py-2 px-3 outline-none focus:border-primary text-xs font-medium"
                      >
                        <option value="">-- Select a document template --</option>
                        {availableTemplates.map((template) => (
                          <option key={template._id} value={template._id}>
                            {template.name}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                </div>
              </div>
            ))}
        </div>

        {/* Bottom Save Action */}
        <div className="flex justify-end pt-4 border-t border-stroke dark:border-strokedark">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-primary hover:bg-opacity-90 text-white font-semibold py-2.5 px-6 rounded-xl shadow-md shadow-primary/25 transition-all cursor-pointer text-xs sm:text-sm disabled:opacity-50"
          >
            <MdSave className="text-base" />
            <span>Save Email Mappings</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default AppSettingsForm;

