import React, { useContext, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Checkbox,
  FormControlLabel,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { apiPath } from '../../../apiPath';
import { EmailContext } from '../../EmailProvider/EmailContext';
import DatePickerComponent from '../../common/Datepicker';

const InvoicePopup = ({ type, index, date, open, onClose, SendInvoice, expireDate, status }) => {
  const formattedDate = date ? new Date(date).toISOString().split('T')[0] : '';
  const {
    control,
    handleSubmit,
    watch, setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      date: "",
      expire_date: '',
      sendImmediately: false,
      additionalEmails: '',
    },
  });
  const { Id } = useParams();
  const { settings } = useContext(EmailContext);
  const sendImmediately = watch('sendImmediately');

  const handleInvoice = async (data) => {
    try {
      const response = await axios.post(`${apiPath}/invoice/update/${Id}`, { ...data, Status: 'Sent' });
      status === 'Sent' ? SendInvoice(settings?.emailTemplates?.invoiceReminder) : SendInvoice(settings?.emailTemplates?.invoice)
    } catch (error) {
      console.error('Error updating invoice:', error);
    }
  };
  const handleQuote = async (data) => {
    try {
      const response = await axios.post(`${apiPath}/finance/update/${Id}`, { ...data, Status: 'Sent' });
      status === 'Sent' ? SendInvoice(settings?.emailTemplates?.quoteReminders) : SendInvoice(settings?.emailTemplates?.quote)
    } catch (error) {
      console.error('Error updating invoice:', error);
    }
  };

  useEffect(() => {
    setValue('date', formattedDate);
    setValue('expire_date', expireDate ? new Date(expireDate).toISOString().split('T')[0] : "")
  }, [date, expireDate]);


  const onSubmit = (data) => {
    type === 'quote' ? handleQuote(data) : handleInvoice(data);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <div className="p-4">
        <DialogTitle className="flex justify-between items-center">
          <h2 className='text-2xl text-primary font-bold'>
            Complete {type} concept # {index && index}
          </h2>
          <IconButton edge="end" color="inherit" onClick={onClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent className="space-y-6">
            <DatePickerComponent
              control={control}
              name="date"
              label="Invoice date"
              rules={{ required: "Invoice date is required" }}
              errors={errors}
              disabled={true}
              minDate={new Date()}
            />
            <DatePickerComponent
              control={control}
              name="expire_date"
              label="Expiry date"
              rules={{ required: "Expiry date is required" }}
              errors={errors}
              minDate={new Date()}
            />
            <Controller
              name="sendImmediately"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Checkbox {...field} color="primary" />}
                  label="Send immediately"
                />
              )}
            />
            {/* {sendImmediately && (
              <Controller
                name="additionalEmails"
                control={control}
                rules={{
                  required: 'Additional email addresses are required',
                  pattern: {
                    value: /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+([,;][\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+)*$/,
                    message: 'Enter valid email addresses separated by commas',
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Additional email addresses"
                    variant="standard"
                    fullWidth
                    error={!!errors.additionalEmails}
                    helperText={errors.additionalEmails?.message}
                  />
                )}
              />
            )} */} <DialogActions className="space-x-3">
              <Button onClick={onClose} variant='outlined' className="text-gray-600">
                Cancel
              </Button>
              <Button type="submit" variant="contained" color="primary">
                Send
              </Button>
            </DialogActions>
          </DialogContent>
        </form>
      </div>
    </Dialog>
  );
};

export default InvoicePopup;
