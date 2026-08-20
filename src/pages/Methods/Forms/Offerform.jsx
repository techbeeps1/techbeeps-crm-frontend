import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { apiPath } from '../../../../apiPath';
import {
  MdAddCircleOutline,
  MdDeleteOutline,
  MdAccountBalance,
  MdDiscount,
  MdPercent,
  MdListAlt,
  MdCalculate,
  MdTune
} from 'react-icons/md';

const OffersForm = ({ register, errors, type, watch, setValue }) => {
  const [rules, setRules] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [template, setTemplate] = useState([]);
  const [inputField, setInputFields] = useState([]);
  const [salesgroup, setSales] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleTemplateChange = (e) => {
    const selectedValue = e.target.value;
    setSelectedTemplate(selectedValue);
  };

  const addFixedRule = (isCalculated) => {
    setRules([
      ...rules,
      {
        salesGroup: '',
        description: '',
        number: '',
        unitPrice: '',
        btw: '',
        enabled: true,
        isCalculated: isCalculated,
      },
    ]);
  };

  const deleteRule = (index) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const handletemplate = async () => {
    try {
      const response = await axios.get(
        `${apiPath}/api/templates?type=${type === 'offers' ? 'quote' : 'invoice'}`
      );
      setTemplate(response.data || []);
    } catch (error) {
      console.error('Error fetching template:', error.message);
    }
  };

  const handleAllinputs = async () => {
    try {
      const response = await axios.get(
        `${apiPath}/api/input?inputFor=Template&name=${selectedTemplate}`
      );
      setInputFields(response.data[0]?.extraFields || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handlesalesgroup = async () => {
    try {
      const response = await axios.get(`${apiPath}/api/sale_group?type=salesGroup`);
      setSales(response.data || []);
    } catch (error) {
      console.error('Error fetching sales group:', error.message);
    }
  };

  useEffect(() => {
    if (selectedTemplate) {
      handleAllinputs();
    }
  }, [selectedTemplate]);

  useEffect(() => {
    handletemplate();
    handlesalesgroup();
  }, []);

  return (
    <div className="space-y-6">
      {/* Use Invoice Moment Toggle */}
      <div className="bg-gray-2/60 dark:bg-meta-4/20 p-4 rounded-xl border border-stroke dark:border-strokedark flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <label className="block text-xs font-bold text-black dark:text-white">
            Use Invoice moment calculation?
          </label>
          <p className="text-[11px] text-body dark:text-bodydark">
            Enable detailed financial template mapping and itemized rules
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className={`py-1.5 px-4 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              showConfirmation
                ? 'bg-primary text-white border-primary shadow-xs'
                : 'bg-white dark:bg-boxdark text-slate-600 dark:text-slate-300 border-stroke dark:border-strokedark'
            }`}
            onClick={() => setShowConfirmation(true)}
          >
            Yes
          </button>
          <button
            type="button"
            className={`py-1.5 px-4 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              !showConfirmation
                ? 'bg-primary text-white border-primary shadow-xs'
                : 'bg-white dark:bg-boxdark text-slate-600 dark:text-slate-300 border-stroke dark:border-strokedark'
            }`}
            onClick={() => setShowConfirmation(false)}
          >
            No
          </button>
        </div>
      </div>

      {showConfirmation && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Financial Template & Dynamic Extra Fields */}
          <div className="bg-white dark:bg-boxdark p-4 sm:p-5 rounded-2xl border border-stroke dark:border-strokedark space-y-4">
            <div>
              <label className="block text-xs font-bold text-black dark:text-white mb-1.5 flex items-center gap-1.5">
                <MdAccountBalance className="text-slate-400 text-sm" />
                Financial Template
              </label>
              <select
                {...register(`${type}_financialTemplate`)}
                onChange={handleTemplateChange}
                className="w-full bg-white dark:bg-form-input text-black dark:text-white rounded-xl border border-stroke dark:border-strokedark py-2.5 px-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm font-medium"
              >
                <option value="">Select Financial Template</option>
                {template &&
                  template.map((item, index) => (
                    <option key={index} value={item._id}>
                      {item.name}
                    </option>
                  ))}
              </select>
            </div>

            {/* Dynamic Template Fields */}
            {selectedTemplate && inputField && inputField.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {inputField.map((field, index) => (
                  <div key={index}>
                    <label className="block text-xs font-semibold text-black dark:text-white mb-1">
                      {field.label}
                    </label>
                    <input
                      {...register(`${type}_${field.name}`)}
                      placeholder={field.label}
                      type={field.type}
                      className="w-full bg-white dark:bg-form-input text-black dark:text-white rounded-xl border border-stroke dark:border-strokedark py-2 px-3.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-xs font-medium"
                    />
                    {errors[`jobinput_${field.name}`] && (
                      <p className="text-meta-1 text-xs mt-1">Field is required</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Discount & Percentage */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-stroke dark:border-strokedark">
              <div>
                <label className="block text-xs font-bold text-black dark:text-white mb-1.5 flex items-center gap-1.5">
                  <MdDiscount className="text-slate-400 text-sm" />
                  Discount Description
                </label>
                <input
                  {...register(`${type}_discountDescription`)}
                  placeholder="e.g. Seasonal Promotion Discount"
                  className="w-full bg-white dark:bg-form-input text-black dark:text-white rounded-xl border border-stroke dark:border-strokedark py-2.5 px-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-black dark:text-white mb-1.5 flex items-center gap-1.5">
                  <MdPercent className="text-slate-400 text-sm" />
                  Discount Percentage (%)
                </label>
                <input
                  {...register(`${type}_percentage`)}
                  placeholder="e.g. 10"
                  type="number"
                  className="w-full bg-white dark:bg-form-input text-black dark:text-white rounded-xl border border-stroke dark:border-strokedark py-2.5 px-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm font-medium"
                />
              </div>
            </div>
          </div>

          {/* Pricing & Calculation Rules Section */}
          <div className="bg-white dark:bg-boxdark rounded-2xl border border-stroke dark:border-strokedark overflow-hidden shadow-xs">
            <div className="px-5 py-4 border-b border-stroke dark:border-strokedark bg-gray-2/40 dark:bg-meta-4/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MdListAlt className="text-primary text-lg" />
                <h4 className="text-sm font-bold text-black dark:text-white">
                  Calculation & Line Item Rules
                </h4>
              </div>
              <span className="text-xs font-medium text-body dark:text-bodydark">
                {rules.length} rule{rules.length === 1 ? '' : 's'} configured
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-stroke dark:border-strokedark bg-gray-2/60 dark:bg-meta-4/30 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <th className="py-3 px-4 min-w-[140px]">Sales Group</th>
                    <th className="py-3 px-4 min-w-[200px]">Description</th>
                    <th className="py-3 px-4 min-w-[180px]">Quantity / Dynamic Metric</th>
                    <th className="py-3 px-4 min-w-[180px]">Unit Price / Rate Source</th>
                    <th className="py-3 px-4 min-w-[90px]">BTW (Tax)</th>
                    <th className="py-3 px-4 text-center min-w-[90px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stroke dark:divide-strokedark text-xs">
                  {rules.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-body dark:text-bodydark text-xs">
                        No calculation rules added. Click "Add Calculated Rule" or "Add Fixed Rule" below.
                      </td>
                    </tr>
                  ) : (
                    rules.map((rule, index) => (
                      <tr
                        key={index}
                        className="hover:bg-gray-2/30 dark:hover:bg-meta-4/20 transition-colors"
                      >
                        {/* Sales Group */}
                        <td className="py-3 px-4 align-top">
                          <select
                            className="w-full bg-white dark:bg-form-input text-black dark:text-white rounded-lg border border-stroke dark:border-strokedark py-2 px-2.5 outline-none focus:border-primary text-xs font-medium"
                            {...register(`${type}rules[${index}].salesGroup`)}
                          >
                            <option value="">Select Group</option>
                            {salesgroup &&
                              salesgroup.map((item, i) => (
                                <option key={i} value={item._id}>
                                  {item.name}
                                </option>
                              ))}
                          </select>
                        </td>

                        {/* Description */}
                        <td className="py-3 px-4 align-top">
                          <textarea
                            rows={2}
                            {...register(`${type}rules[${index}].description`)}
                            className="w-full bg-white dark:bg-form-input text-black dark:text-white rounded-lg border border-stroke dark:border-strokedark py-2 px-2.5 outline-none focus:border-primary text-xs font-medium resize-none"
                            placeholder="Line item description"
                          />
                        </td>

                        {/* Quantity */}
                        <td className="py-3 px-4 align-top">
                          {rule.isCalculated ? (
                            <select
                              {...register(`${type}rules[${index}].number`)}
                              className="w-full bg-white dark:bg-form-input text-black dark:text-white rounded-lg border border-stroke dark:border-strokedark py-2 px-2.5 outline-none focus:border-primary text-xs font-medium"
                            >
                              <option value="">Select Quantity Metric</option>
                              <option value="{{relocation_totalVolume}}">Total Volume (m³)</option>
                              <option value="{{relocation_movers}}">Movers Count</option>
                              <option value="{{relocation_requiredHours}}">Required Hours</option>
                              <option value="{{relocation_totalBoxes}}">Box Quantity</option>
                              <option value="{{relocation_travelTime}}">Travel Time</option>
                              <option value="{{relocation_distance}}">Distance (km)</option>
                              <option value="{{movingLift_quantity}}">Moving Lift Count</option>
                              <option value="{{assembling_requiredHours}}">Assembling Hours</option>
                              <option value="{{disassembling_requiredHours}}">Dismantle Hours</option>
                              <option value="{{total_handyman}}">Handyman Count</option>
                              <option value="{{packing_requiredHours}}">Packing Hours</option>
                              <option value="{{packing_requiredPackers}}">Packers Count</option>
                              <option value="{{unpacking_requiredHours}}">Unpacking Hours</option>
                              <option value="{{unpacking_requiredPackers}}">Unpackers Count</option>
                              <option value="{{certificate_quantity}}">Warranty Certificate</option>
                              <option value="{{insurance_quantity}}">Insurance Coverage</option>
                              <option value="{{storage_storageVolume}}">Storage Volume</option>
                            </select>
                          ) : (
                            <input
                              {...register(`${type}rules[${index}].number`)}
                              className="w-full bg-white dark:bg-form-input text-black dark:text-white rounded-lg border border-stroke dark:border-strokedark py-2 px-2.5 outline-none focus:border-primary text-xs font-medium"
                              placeholder="Fixed quantity"
                              type="number"
                            />
                          )}
                        </td>

                        {/* Unit Price */}
                        <td className="py-3 px-4 align-top">
                          {rule.isCalculated ? (
                            <select
                              {...register(`${type}rules[${index}].unitPrice`)}
                              className="w-full bg-white dark:bg-form-input text-black dark:text-white rounded-lg border border-stroke dark:border-strokedark py-2 px-2.5 outline-none focus:border-primary text-xs font-medium"
                            >
                              <option value="">Select Price Rate Component</option>
                              <option value="{{relocation_pricePerMeterCubic}}">Volume Rate (€/m³)</option>
                              <option value="{{moverPrice}}">Mover Hourly Rate</option>
                              <option value="{{boxCharges}}">Box Charge Rate</option>
                              <option value="{{relocation_pricePerHour}}">Hourly Transport Rate</option>
                              <option value="{{relocation_pricePerKilometer}}">Distance Rate (€/km)</option>
                              <option value="{{movingLift_price}}">Moving Lift Rate</option>
                              <option value="{{assembling_appliedPrice}}">Assembling Hourly Rate</option>
                              <option value="{{disassembling_appliedPrice}}">Dismantle Hourly Rate</option>
                              <option value="{{handymanCharge}}">Handyman Rate</option>
                              <option value="{{packing_appliedPrice}}">Packing Hourly Rate</option>
                              <option value="{{packersCharge}}">Packers Rate</option>
                              <option value="{{unpacking_appliedPrice}}">Unpacking Hourly Rate</option>
                              <option value="{{packerCharge}}">Unpacker Rate</option>
                              <option value="{{certificate_price}}">Certificate Price</option>
                              <option value="{{insurance_price}}">Insurance Premium</option>
                              <option value="{{storage_appliedPrice}}">Storage Rate</option>
                            </select>
                          ) : (
                            <input
                              {...register(`${type}rules[${index}].unitPrice`)}
                              className="w-full bg-white dark:bg-form-input text-black dark:text-white rounded-lg border border-stroke dark:border-strokedark py-2 px-2.5 outline-none focus:border-primary text-xs font-medium"
                              placeholder="Fixed Unit Price"
                              type="number"
                            />
                          )}
                        </td>

                        {/* BTW */}
                        <td className="py-3 px-4 align-top">
                          <select
                            className="w-full bg-white dark:bg-form-input text-black dark:text-white rounded-lg border border-stroke dark:border-strokedark py-2 px-2 outline-none focus:border-primary text-xs font-medium"
                            {...register(`${type}rules[${index}].btw`)}
                          >
                            <option value="">VAT</option>
                            <option value="0">0%</option>
                            <option value="9">9%</option>
                            <option value="21">21%</option>
                          </select>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-center align-top">
                          <div className="flex items-center justify-center gap-2 pt-1">
                            <label className="flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                {...register(`${type}rules[${index}].enabled`)}
                                defaultChecked
                                className="w-4 h-4 rounded text-primary focus:ring-primary border-stroke cursor-pointer"
                              />
                            </label>
                            <input
                              type="hidden"
                              {...register(`${type}rules[${index}].isCalculated`)}
                              value={rule.isCalculated}
                            />
                            <button
                              type="button"
                              onClick={() => deleteRule(index)}
                              className="p-1.5 text-slate-400 hover:text-meta-1 hover:bg-meta-1/10 rounded-lg transition-colors cursor-pointer"
                              title="Delete Rule"
                            >
                              <MdDeleteOutline className="text-base" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Add Rule Actions Toolbar */}
            <div className="p-4 border-t border-stroke dark:border-strokedark bg-gray-2/20 dark:bg-meta-4/10 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => addFixedRule(true)}
                className="flex items-center gap-1.5 bg-primary/10 hover:bg-primary text-primary hover:text-white text-xs font-bold py-2 px-4 rounded-xl border border-primary/20 transition-all cursor-pointer"
              >
                <MdCalculate className="text-base" />
                <span>Add Calculated Dynamic Rule</span>
              </button>

              <button
                type="button"
                onClick={() => addFixedRule(false)}
                className="flex items-center gap-1.5 bg-gray-2 dark:bg-meta-4 hover:bg-gray-3 text-slate-700 dark:text-slate-200 text-xs font-bold py-2 px-4 rounded-xl border border-stroke dark:border-strokedark transition-all cursor-pointer"
              >
                <MdTune className="text-base" />
                <span>Add Fixed Rate Rule</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OffersForm;

