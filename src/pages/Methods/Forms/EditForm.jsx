import React, { useState, useEffect } from 'react';
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
import { useCurrency } from '../../../utils/currencyUtil';

const EditForm = ({ register, errors, type, watch, setValue, data }) => {
  const { symbol: currencySymbol } = useCurrency();
  const [rules, setRules] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [template, setTemplate] = useState([]);
  const [inputField, setInputFields] = useState([]);
  const [salesgroup, setSales] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    if (data) {
      const sectionData =
        data._doc ||
        (typeof data.toObject === 'function' ? data.toObject() : data);

      setValue(
        `${type}_discountDescription`,
        sectionData.discountDescription || ''
      );
      setValue(`${type}_percentage`, sectionData.percentage || '');

      if (
        sectionData.financialTemplate ||
        (sectionData.rules && sectionData.rules.length > 0) ||
        sectionData.discountDescription ||
        sectionData.percentage
      ) {
        setShowConfirmation(true);
      }

      if (sectionData.financialTemplate) {
        setSelectedTemplate(sectionData.financialTemplate);
        setValue(`${type}_financialTemplate`, sectionData.financialTemplate);
      }

      if (sectionData.rules && Array.isArray(sectionData.rules)) {
        const normalizedRules = sectionData.rules.map((rule) => {
          const rawSg =
            rule.salesGroup?._id ||
            rule.salesGroup ||
            rule.salesgroup?._id ||
            rule.salesgroup ||
            '';
          return {
            ...rule,
            salesGroup: rawSg,
            isCalculated:
              rule.isCalculated === true || rule.isCalculated === 'true',
            enabled:
              rule.enabled === true ||
              rule.enabled === 'true' ||
              rule.enabled === undefined,
          };
        });
        setRules(normalizedRules);
        normalizedRules.forEach((rule, index) => {
          setValue(`${type}rules[${index}].description`, rule.description || '');
          setValue(`${type}rules[${index}].number`, rule.number || '');
          setValue(`${type}rules[${index}].unitPrice`, rule.unitPrice || '');
          setValue(
            `${type}rules[${index}].btw`,
            rule.btw !== undefined && rule.btw !== null ? String(rule.btw) : '21'
          );
          setValue(`${type}rules[${index}].salesGroup`, rule.salesGroup || '');
          setValue(`${type}rules[${index}].enabled`, rule.enabled);
          setValue(`${type}rules[${index}].isCalculated`, rule.isCalculated);
        });
      }
    }
  }, [data, setValue, type]);

  const addFixedRule = (isCalculated) => {
    const isCalc = isCalculated === true;
    const newRule = {
      salesGroup: '',
      description: '',
      number: '',
      unitPrice: '',
      btw: '21',
      enabled: true,
      isCalculated: isCalc,
    };
    const nextRules = [...rules, newRule];
    setRules(nextRules);
    const newIndex = rules.length;
    setValue(`${type}rules[${newIndex}].description`, '');
    setValue(`${type}rules[${newIndex}].number`, '');
    setValue(`${type}rules[${newIndex}].unitPrice`, '');
    setValue(`${type}rules[${newIndex}].btw`, '21');
    setValue(`${type}rules[${newIndex}].salesGroup`, '');
    setValue(`${type}rules[${newIndex}].enabled`, true);
    setValue(`${type}rules[${newIndex}].isCalculated`, isCalc);
  };

  const deleteRule = (index) => {
    const updatedRules = rules.filter((_, i) => i !== index);
    setRules(updatedRules);

    updatedRules.forEach((r, i) => {
      setValue(
        `${type}rules[${i}].description`,
        watch(`${type}rules[${i >= index ? i + 1 : i}].description`) ||
          r.description ||
          ''
      );
      setValue(
        `${type}rules[${i}].number`,
        watch(`${type}rules[${i >= index ? i + 1 : i}].number`) ||
          r.number ||
          ''
      );
      setValue(
        `${type}rules[${i}].unitPrice`,
        watch(`${type}rules[${i >= index ? i + 1 : i}].unitPrice`) ||
          r.unitPrice ||
          ''
      );
      setValue(
        `${type}rules[${i}].btw`,
        watch(`${type}rules[${i >= index ? i + 1 : i}].btw`) || r.btw || '21'
      );
      const prevSalesGroup =
        watch(`${type}rules[${i >= index ? i + 1 : i}].salesGroup`) ||
        r.salesGroup?._id ||
        r.salesGroup ||
        r.salesgroup?._id ||
        r.salesgroup ||
        '';
      setValue(`${type}rules[${i}].salesGroup`, prevSalesGroup);
      setValue(
        `${type}rules[${i}].enabled`,
        watch(`${type}rules[${i >= index ? i + 1 : i}].enabled`) ?? r.enabled
      );
      setValue(`${type}rules[${i}].isCalculated`, r.isCalculated);
    });

    const lastIndex = updatedRules.length;
    setValue(`${type}rules[${lastIndex}].description`, '');
    setValue(`${type}rules[${lastIndex}].number`, '');
    setValue(`${type}rules[${lastIndex}].unitPrice`, '');
    setValue(`${type}rules[${lastIndex}].btw`, '');
    setValue(`${type}rules[${lastIndex}].salesGroup`, '');
    setValue(`${type}rules[${lastIndex}].enabled`, false);
    setValue(`${type}rules[${lastIndex}].isCalculated`, false);
  };

  const handletemplate = async () => {
    try {
      const response = await axios.get(
        `${apiPath}/api/templates?type=${type === 'offers' ? 'quote' : 'invoice'}`
      );
      setTemplate(response.data || []);
      const currentFinancialTemplate = data?.financialTemplate;
      if (currentFinancialTemplate) {
        setValue(`${type}_financialTemplate`, currentFinancialTemplate);
        setSelectedTemplate(currentFinancialTemplate);
      }
    } catch (error) {
      console.error('Error fetching template:', error.message);
    }
  };

  const handleAllinputs = async () => {
    if (!selectedTemplate) {
      setInputFields([]);
      return;
    }
    try {
      const response = await axios.get(
        `${apiPath}/api/input?inputFor=Template&name=${selectedTemplate}`
      );
      const fields = response.data[0]?.extraFields || [];
      setInputFields(fields);
      if (data) {
        fields.forEach((f) => {
          if (data[f.name] !== undefined) {
            setValue(`${type}_${f.name}`, data[f.name]);
          }
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlesalesgroup = async () => {
    try {
      const response = await axios.get(`${apiPath}/api/sale_group?type=salesGroup`);
      const list = response.data || [];
      setSales(list);
      const sectionData =
        data?._doc ||
        (typeof data?.toObject === 'function' ? data.toObject() : data);
      if (sectionData?.rules && Array.isArray(sectionData.rules)) {
        sectionData.rules.forEach((rule, index) => {
          const rawGroup =
            rule.salesGroup?._id ||
            rule.salesGroup ||
            rule.salesgroup?._id ||
            rule.salesgroup ||
            '';
          if (rawGroup) {
            const matched = list.find(
              (g) => g._id === rawGroup || g.name === rawGroup
            );
            const resolvedId = matched ? matched._id : rawGroup;
            setValue(`${type}rules[${index}].salesGroup`, resolvedId);
          }
        });
      }
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
  }, [data, type]);

  const currentTemplateVal =
    watch(`${type}_financialTemplate`) || selectedTemplate || data?.financialTemplate || '';

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
                value={currentTemplateVal}
                onChange={(e) => {
                  const val = e.target.value;
                  setValue(`${type}_financialTemplate`, val);
                  setSelectedTemplate(val);
                }}
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
                  placeholder="Enter discount description"
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
                  placeholder="Enter %"
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
                        No calculation rules configured.
                      </td>
                    </tr>
                  ) : (
                    rules.map((rule, index) => {
                      const isCalc =
                        rule.isCalculated === true ||
                        rule.isCalculated === 'true';
                      const formSalesGroup = watch(`${type}rules[${index}].salesGroup`);
                      const rawSalesGroup =
                        formSalesGroup !== undefined && formSalesGroup !== null && formSalesGroup !== ''
                          ? formSalesGroup
                          : (rule.salesGroup?._id || rule.salesGroup || rule.salesgroup?._id || rule.salesgroup || '');
                      const matchedGroup = salesgroup.find(
                        (g) => g._id === rawSalesGroup || g.name === rawSalesGroup
                      );
                      const currentSalesGroup = matchedGroup ? matchedGroup._id : (rawSalesGroup || '');
                      return (
                        <tr
                          key={index}
                          className="hover:bg-gray-2/30 dark:hover:bg-meta-4/20 transition-colors"
                        >
                          {/* Sales Group */}
                          <td className="py-3 px-4 align-top">
                            <select
                              className="w-full bg-white dark:bg-form-input text-black dark:text-white rounded-lg border border-stroke dark:border-strokedark py-2 px-2.5 outline-none focus:border-primary text-xs font-medium"
                              {...register(`${type}rules[${index}].salesGroup`)}
                              value={currentSalesGroup}
                              onChange={(e) => {
                                setValue(`${type}rules[${index}].salesGroup`, e.target.value);
                              }}
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
                              placeholder="Description"
                            />
                          </td>

                          {/* Quantity */}
                          <td className="py-3 px-4 align-top">
                            {isCalc ? (
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
                                placeholder="Number"
                                type="number"
                              />
                            )}
                          </td>

                          {/* Unit Price */}
                          <td className="py-3 px-4 align-top">
                            {isCalc ? (
                              <select
                                {...register(`${type}rules[${index}].unitPrice`)}
                                className="w-full bg-white dark:bg-form-input text-black dark:text-white rounded-lg border border-stroke dark:border-strokedark py-2 px-2.5 outline-none focus:border-primary text-xs font-medium"
                              >
                                <option value="">Select Price Rate Component</option>
                                <option value="{{relocation_pricePerMeterCubic}}">Volume Rate ({currencySymbol}/m³)</option>
                                <option value="{{moverPrice}}">Mover Hourly Rate</option>
                                <option value="{{relocation_pricePerMeterCubic}}">Hours</option>
                                <option value="{{boxCharges}}">Box Charge Rate</option>
                                <option value="{{relocation_pricePerHour}}">Hourly Transport Rate</option>
                                <option value="{{relocation_pricePerKilometer}}">Distance Rate ({currencySymbol}/km)</option>
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
                                placeholder="Unit Price"
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
                                  defaultChecked={rule.enabled}
                                  className="w-4 h-4 rounded text-primary focus:ring-primary border-stroke cursor-pointer"
                                />
                              </label>
                              <input
                                type="hidden"
                                {...register(`${type}rules[${index}].isCalculated`)}
                                value={isCalc ? 'true' : 'false'}
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
                      );
                    })
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

export default EditForm;

