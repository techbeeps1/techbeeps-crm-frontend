import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Dialog, DialogContent, DialogActions, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import { apiPath } from '../../../../apiPath';
import { toast } from 'react-toastify';
import { MdShoppingCart, MdCheckCircle, MdCalendarToday, MdOutlineFormatListNumbered } from 'react-icons/md';

const StockForm: React.FC<any> = ({ supplier, handleAllData }) => {
  const { handleSubmit, control, formState: { errors }, reset } = useForm({
    defaultValues: {
      supplier: '',
      receivedOn: '',
      quantity: '',
      orderOn: '',
      orderQuantity: '',
    },
  });
  const notify = (message: string) => toast.success(message);
  const notifyError = (message: string) => toast.error(message, {
    autoClose: 2000,
  });
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [type, setType] = useState<string>('');

  const handleOpenPopup = () => setIsPopupOpen(true);
  const handleClosePopup = () => setIsPopupOpen(false);

  const handleFormSubmit = (data: any) => {
    addStock({ ...data, material: supplier._id, type: type });
    reset();
    handleClosePopup();
  };

  const addStock = async (stockData: any) => {
    try {
      const response = await axios.post(`${apiPath}/api/material-stock`, stockData);
      if (response) {
        notify('Stock updated successfully!');
        handleAllData();
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Something went wrong. Please try again.";
      notifyError(errorMessage);
    }
  };

  const handleCancel = () => {
    reset();
    handleClosePopup();
  };

  return (
    <>
      <div className="flex gap-2.5 my-3">
        <button
          type="button"
          onClick={() => { handleOpenPopup(); setType('Order'); }}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-primary bg-primary/5 hover:bg-primary/10 border border-primary/20 rounded-xl transition-all shadow-xs cursor-pointer"
        >
          <MdShoppingCart className="text-sm" />
          <span>Order Stock</span>
        </button>
        <button
          type="button"
          onClick={() => { handleOpenPopup(); setType('Register'); }}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-all shadow-xs cursor-pointer"
        >
          <MdCheckCircle className="text-sm" />
          <span>Register Received</span>
        </button>
      </div>

      <Dialog
        open={isPopupOpen}
        onClose={handleClosePopup}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: "16px",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
            overflow: "hidden",
          }
        }}
      >
        <div className="bg-white flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-xs ${
                type === 'Order' ? 'bg-primary/10 text-primary' : 'bg-emerald-100 text-emerald-600'
              }`}>
                {type === 'Order' ? <MdShoppingCart className="text-xl" /> : <MdCheckCircle className="text-xl" />}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  {type === 'Order' ? 'Place Stock Order' : 'Register Received Stock'}
                </h3>
                <p className="text-xs text-slate-500">
                  {type === 'Order' ? 'Create a purchase order with a selected supplier' : 'Record incoming shipment delivery'}
                </p>
              </div>
            </div>
            <IconButton onClick={handleCancel} size="small" className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg">
              <CloseIcon fontSize="small" />
            </IconButton>
          </div>

          <form onSubmit={handleSubmit(handleFormSubmit)}>
            <DialogContent className="px-6 py-5 space-y-4">
              {/* Supplier Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Select Supplier <span className="text-rose-500">*</span>
                </label>
                <Controller
                  name="supplier"
                  control={control}
                  defaultValue=""
                  rules={{ required: "Supplier is a required field" }}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    >
                      <option value="">Select Supplier</option>
                      {supplier && supplier.inventorySuppliers.map((item: any) => (
                        <option key={item.supplier?._id} value={item.supplier?._id}>
                          {item.supplier?.name}
                        </option>
                      ))}
                    </select>
                  )}
                />
                {errors.supplier && <p className="text-rose-500 text-xs mt-1 font-medium">{String(errors.supplier.message)}</p>}
              </div>

              {/* Received Date & Quantity */}
              {type === 'Register' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Received Date <span className="text-rose-500">*</span>
                    </label>
                    <Controller
                      name="receivedOn"
                      control={control}
                      defaultValue=""
                      rules={{ required: "Received Date is required" }}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="date"
                          className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                      )}
                    />
                    {errors.receivedOn && <p className="text-rose-500 text-xs mt-1 font-medium">{String(errors.receivedOn.message)}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Quantity Received <span className="text-rose-500">*</span>
                    </label>
                    <Controller
                      name="quantity"
                      control={control}
                      defaultValue=""
                      rules={{ required: "Quantity is required" }}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="number"
                          placeholder="e.g. 100"
                          className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                      )}
                    />
                    {errors.quantity && <p className="text-rose-500 text-xs mt-1 font-medium">{String(errors.quantity.message)}</p>}
                  </div>
                </div>
              )}

              {/* Order Date & Quantity */}
              {type === 'Order' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Order Date <span className="text-rose-500">*</span>
                    </label>
                    <Controller
                      name="orderOn"
                      control={control}
                      defaultValue=""
                      rules={{ required: "Order Date is required" }}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="date"
                          className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                      )}
                    />
                    {errors.orderOn && <p className="text-rose-500 text-xs mt-1 font-medium">{String(errors.orderOn.message)}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Order Quantity <span className="text-rose-500">*</span>
                    </label>
                    <Controller
                      name="orderQuantity"
                      control={control}
                      defaultValue=""
                      rules={{ required: "Order Quantity is required" }}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="number"
                          placeholder="e.g. 100"
                          className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                      )}
                    />
                    {errors.orderQuantity && <p className="text-rose-500 text-xs mt-1 font-medium">{String(errors.orderQuantity.message)}</p>}
                  </div>
                </div>
              )}
            </DialogContent>

            {/* Actions Footer */}
            <div className="px-6 py-4.5 border-t border-slate-100 bg-slate-50/70 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold text-sm transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-6 py-2.5 rounded-xl text-white font-semibold text-sm shadow-sm transition-all cursor-pointer ${
                  type === 'Order'
                    ? 'bg-primary hover:bg-opacity-90 shadow-primary/20'
                    : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
                }`}
              >
                {type === 'Order' ? 'Submit Order' : 'Register Stock'}
              </button>
            </div>
          </form>
        </div>
      </Dialog>
    </>
  );
};

export default StockForm;

