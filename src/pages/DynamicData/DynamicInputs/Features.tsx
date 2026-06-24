import React, { useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { EmailContext } from '../../../EmailProvider/EmailContext';
import axios from 'axios';
import { apiPath } from '../../../../apiPath';
import { Typography, Grid, Switch, TextField, Select, MenuItem, FormControl, FormControlLabel, Tooltip } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'

const Features: React.FC = () => {
  const { settings, fetchTemplates } = useContext(EmailContext) as any;
  const [loading, setLoading] = useState<boolean>(false);
  const [prices, setPrices] = useState<any>([
    { label: 'Price per cubic meter', value: settings.standardPrice?.pricePerMeterCubic || 0 },
    { label: 'Price per hour for travel time', value: settings.standardPrice?.pricePerHour || 0 },
    { label: 'Price per kilometer', value: settings.standardPrice?.pricePerKilometer || 0 },
    { label: 'QUOTATION CALCULATION', type: 'heading' },
    { label: 'Cubic meters per employee per hour (average)', value: settings.standardPrice?.cubicMeterPerHourPerEmployee || 0  },
    { label: 'Packing boxes per hour',  value: settings.standardPrice?.packingBoxPerHour || 0  },
    { label: 'Unpacking boxes per hour',  value: settings.standardPrice?.unPackagingBoxPerHour || 0 },
    { label: 'Minutes of assembly time per piece of furniture (or per door)', value: settings.standardPrice?.assemblingTimePerfurniture || 0  },
    { label: 'Minutes to disassemble per piece of furniture (or per door)',  value: settings.standardPrice?.disassemblingTimePerfurniture || 0 },
  ]);
  const handlePriceChange = (index: number, value: string) => {
    const updatedPrices = [...prices];
    updatedPrices[index].value = value === '' ? '' : parseFloat(value) || 0;
    setPrices(updatedPrices);
  };

  const handleSaveSettings = () => {
    setLoading(true);
    axios.post(`${apiPath}/api/save-settings`, {
        standardPrice: {
          pricePerMeterCubic: prices[0].value,
          pricePerHour: prices[1].value,
          pricePerKilometer: prices[2].value,
          cubicMeterPerHourPerEmployee: prices[4].value,
          packingBoxPerHour: prices[5].value,
          unPackagingBoxPerHour: prices[6].value,
          assemblingTimePerfurniture: prices[7].value,
          disassemblingTimePerfurniture: prices[8].value,
        }
      })
      .then(() => {
        toast.success('Settings saved successfully!');
        fetchTemplates();
      })
      .catch((error:any) => {
        toast.error(`Failed to save settings.${error.message}`);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div
      className="px-4"
      style={{ justifyContent: 'flex-start', maxHeight: '80vh', overflowY: 'auto' }}
    >
      <h6 className="text-2xl font-semibold mb-4">Settings</h6>
      <h6 className="mt-4 text-lg font-medium">PRICES</h6>
      <div className="flex flex-col gap-3 mt-2 mb-4">
        {prices.map((item: any, index: number) => {
          if (item.type === 'heading') {
            return <h6 key={index} className="mt-4 text-lg font-medium">{item.label}</h6>;
          }
          return (
            <div key={index}>
              <div className="flex items-center gap-3 py-2">
                <input
                  type="number"
                  min={0}
                  value={item.value}
                  onChange={(e) => handlePriceChange(index, e.target.value)}
                  className="w-15 font-medium border-b border-gray-300 focus:outline-none focus:border-blue-500"
                />
                <label className="text-lg font-medium">{item.label}</label>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-end mt-4">
        <button
          onClick={handleSaveSettings}
          disabled={loading}
          className={`px-4 py-2 rounded-md text-white text-lg border border-black ${loading ? 'bg-primary cursor-not-allowed' : 'bg-success hover:bg-blue-600'
            }`}
        >
          {loading ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <Typography variant="subtitle1" style={{ marginTop: 16 }}>QUOTATION CALCULATION</Typography>
      <Grid container alignItems="center" spacing={1}>
        <Grid item xs={12}>
          <FormControlLabel
            control={<Switch defaultChecked />}
            label={
              <>
                Include company address in km calculation
                <Tooltip title="Help text for including company address in km calculation">
                  <HelpOutlineIcon fontSize="small" />
                </Tooltip>
              </>
            }
          />
        </Grid>
        {[
          { label: 'Cubic meters per employee per hour (average)', defaultValue: '1.2' },
          { label: 'Packing boxes per hour', defaultValue: '10' },
          { label: 'Unpacking boxes per hour', defaultValue: '10' },
          { label: 'Minutes of assembly time per piece of furniture (or per door)', defaultValue: '15' },
          { label: 'Minutes to disassemble per piece of furniture (or per door)', defaultValue: '15' },
        ].map((item) => (
          <Grid item xs={12} key={item.label}>
            <TextField
              variant="standard"
              className="w-auto font-medium border-b border-gray-300 focus:outline-none focus:border-blue-500"
              defaultValue={item.defaultValue}
              label={item.label}
              InputProps={{ style: { width: '450px' } }}
            />
          </Grid>
        ))}
      </Grid>

      <Typography variant="h6" marginBottom={1}>OFFERS-</Typography>
      <Grid container alignItems="center" spacing={1}>
        <Grid item>
          <FormControl variant="standard">
            <Select defaultValue="always">
              <MenuItem value="always">Always</MenuItem>
              <MenuItem value="sometimes">Sometimes</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item>
          <Typography>send inventory list</Typography>
        </Grid>
        <Grid item xs={12}>
          <FormControlLabel
            control={<Switch />}
            label={
              <>
                Hide the PDF on the acceptance page
                <Tooltip title="Help text for hiding PDF on acceptance page">
                  <HelpOutlineIcon fontSize="small" />
                </Tooltip>
              </>
            }
          />
        </Grid>
        <Grid item xs={12}>
          <FormControlLabel
            control={<Switch defaultChecked />}
            label={
              <>
                Force full PDF on acceptance page
                <Tooltip title="Help text for forcing full PDF">
                  <HelpOutlineIcon fontSize="small" />
                </Tooltip>
              </>
            }
          />
        </Grid>
      </Grid>
      <Typography variant="subtitle1" style={{ marginTop: 16 }}>BILLING</Typography>
      <Grid container alignItems="center" spacing={1}>
        {["Show totals per line for hourly rates", "Show numbers per line for hourly rates", "Show totals", "Pre-billing storage"].map((label) => (
          <Grid item xs={12} key={label}>
            <FormControlLabel
              control={<Switch defaultChecked />}
              label={
                <>
                  {label}
                  <Tooltip title={`Help text for ${label.toLowerCase()}`}>
                    <HelpOutlineIcon fontSize="small" />
                  </Tooltip>
                </>
              }
            />
          </Grid>
        ))}
        <Grid item xs={12}>
          <TextField
            variant="standard"
            defaultValue="7"
            label="Prepare storage invoices days in advance"
            InputProps={{ style: { width: 60 } }}
          />
        </Grid>
        <Grid item xs={12}>
          <FormControlLabel
            control={<Switch defaultChecked />}
            label={
              <>
                Send invoice reminders automatically
                <Tooltip title="Help text for sending invoice reminders automatically">
                  <HelpOutlineIcon fontSize="small" />
                </Tooltip>
              </>
            }
          />
        </Grid>
      </Grid>

      <Typography variant="subtitle1" style={{ marginTop: 16 }}>TO DO ODD JOBS</Typography>
      <Grid container alignItems="center" spacing={1}>
        {["Start planning intake for a new job", "Description always as first tab"].map((label) => (
          <Grid item xs={12} key={label}>
            <FormControlLabel
              control={<Switch defaultChecked />}
              label={
                <>
                  {label}
                  <Tooltip title={`Help text for ${label.toLowerCase()}`}>
                    <HelpOutlineIcon fontSize="small" />
                  </Tooltip>
                </>
              }
            />
          </Grid>
        ))}
        <Grid item xs={12}>
          <FormControlLabel
            control={<Switch />}
            label={
              <>
                No boxes supplied as standard
                <Tooltip title="Help text for no boxes supplied as standard">
                  <HelpOutlineIcon fontSize="small" />
                </Tooltip>
              </>
            }
          />
        </Grid>
      </Grid>
      <Typography variant="subtitle1" style={{ marginTop: 16 }}>QUOTATION CALCULATION</Typography>
      <Grid container alignItems="center" spacing={1}>
        <Grid item xs={12}>
          <FormControlLabel
            control={<Switch defaultChecked />}
            label={
              <>
                Include company address in km calculation
                <Tooltip title="Help text for including company address in km calculation">
                  <HelpOutlineIcon fontSize="small" />
                </Tooltip>
              </>
            }
          />
        </Grid>
        {[
          { label: 'Cubic meters per employee per hour (average)', defaultValue: '1.2' },
          { label: 'Packing boxes per hour', defaultValue: '10' },
          { label: 'Unpacking boxes per hour', defaultValue: '10' },
          { label: 'Minutes of assembly time per piece of furniture (or per door)', defaultValue: '15' },
          { label: 'Minutes to disassemble per piece of furniture (or per door)', defaultValue: '15' },
        ].map((item) => (
          <Grid item xs={12} key={item.label}>
            <TextField
            className="w-auto font-medium border-b border-gray-300 focus:outline-none focus:border-blue-500"
              variant="standard"
              defaultValue={item.defaultValue}
              label={item.label}
              InputProps={{ style: { width: '450px' } }}
            />
          </Grid>
        ))}
      </Grid>
      <Typography variant="subtitle1" style={{ marginTop: 16 }}>SURCHARGES</Typography>
      <Grid container alignItems="center" spacing={1}>
        {[
          'Additional charge for Apartment',
          'Additional charge for House',
          'Additional charge for Bungalow',
          'Additional charge for Office',
          'Additional charge for storage',
          'Additional charge for Drive in',
          'Additional charge for Double apartment',
          'Additional charge for Studio',
          'Additional charge for Villa',
          'Additional surcharge for Farm',
          'Additional surcharge for semi-detached houses',
          'Additional surcharge for Mansion',
          'Additional surcharge for upper floor apartment',
          'Additional surcharge for detached house',
          'Additional surcharge for terraced house',
          'Additional surcharge for corner house',
          'Additional fee for School',
          'Additional allowance for Nursing Home',
        ].map((label) => (
          <Grid item xs={12} key={label}>
            <TextField
            className="w-auto font-medium border-b border-gray-300 focus:outline-none focus:border-blue-500"
              variant="standard"
              defaultValue="€ 0,00"
              label={label}
              InputProps={{ style: { width: '450px' } }}
            />
          </Grid>
        ))}
      </Grid>

      <Typography variant="subtitle1" style={{ marginTop: 16 }}>PRICES FOR SERVICES</Typography>
      <Grid container alignItems="center" spacing={1}>
        {[
          'Warranty Certificate',
          'Insurance',
          'Moving package',
          'Additional fee for Car',
          'Additional fee for Boat',
          'Additional fee for Pets',
        ].map((label) => (
          <Grid item xs={12} key={label}>
            <TextField
              className="w-auto font-medium border-b border-gray-300 focus:outline-none focus:border-blue-500"
              variant="standard"
              defaultValue="€ 0,00"
              label={label}
              InputProps={{ style: { width: '450px' } }}
            />
          </Grid>
        ))}
      </Grid>
    </div >
  );
};

export default Features;

