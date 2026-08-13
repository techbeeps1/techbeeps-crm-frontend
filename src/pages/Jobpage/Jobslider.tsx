import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
  IconButton,
  TextField,
  Tabs,
  Tab,
  Dialog,
  DialogContent,
  DialogActions,
  DialogTitle,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ElevatorOutlined from '@mui/icons-material/ElevatorOutlined';
import GifBoxOutlined from '@mui/icons-material/GifBoxOutlined';
import ApprovalOutlined from '@mui/icons-material/ApprovalOutlined';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { DeleteForever } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { apiPath } from '../../../apiPath';
import SendQuotation from './SendQuotation';
import AppointmentScheduler from './appointmentForm';
import JobOffermodule from './jobDetailmodules/JobOffermodule';
import CommunicationLog from '../InvoicePage/Communication';
import FinanceModule from './jobDetailmodules/FinanceModule';
import QuotesActivity from '../Quotes/QuotesActivity';
import { useNavigate } from 'react-router-dom';
import DocumentSelected from '../customerDetails/DocumentSelected';
import EmailLayout from '../Emailpage/EmailComponent';
import TaskPage from '../Taskcomponent/TaskPage';
import JobOfferRooms from './jobDetailmodules/JobOfferRooms';

interface JobsliderProps {
  job: any | null;
  onClose: () => void;
  handler: () => void;
  Ondelete: () => void;
}
interface NotesFormInputs {
  _id: string;
  genralNotes: string;
  employeeNotes: string;
  customerNotes: string;
}

const notify = (message: string) => toast(message);
const notifyError = (message: string) =>
  toast.error(message, {
    autoClose: 2000,
  });

const Jobslider: React.FC<JobsliderProps> = ({
  job,
  onClose = () => {},
  Ondelete = () => {},
}) => {
  const [tabIndex, setTabIndex] = useState(0);
  const [isNotesModalShow, setIsNotesModalShow] = useState(false);
  const [open, setOpen] = useState(false);
  const {
    handleSubmit,
    register,
    setValue,
    reset,
    formState: { errors },
  } = useForm<any>();
  const [notes, setNotes] = useState<NotesFormInputs>({
    _id: '',
    genralNotes: '',
    employeeNotes: '',
    customerNotes: '',
  });
  const [appointment, setAppointment] = useState<any>([]);
  const [relocation, setRelocation] = useState<any>();
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [isAppointmentEditorOpen, setIsAppointmentEditorOpen] = useState(false);
  const [isAppointmentViewerOpen, setIsAppointmentViewerOpen] = useState(false);
  const [isdeleteBoc, setIsDeleteBox] = useState('');
  const navigate = useNavigate();

  const handleChange = (_event: React.ChangeEvent<{}>, newValue: number) => {
    setTabIndex(newValue);
  };

  const handleNotesForm = async (data: any) => {
    try {
      if (notes) {
        await axios.post(`${apiPath}/api/jobNotes`, {
          ...data,
          jobId: job?._id,
          id: notes._id,
        });
        setIsNotesModalShow(false);
        handleNotes();
      } else {
        await axios.post(`${apiPath}/api/jobNotes`, {
          ...data,
          jobId: job?._id,
        });
        setIsNotesModalShow(false);
        handleNotes();
      }
    } catch (error) {
      console.error('Error during form submission:', error);
    }
  };

  const handleNotes = async () => {
    try {
      const response = await axios.get(
        `${apiPath}/api/notesListByJobId?jobId=${job?._id}`,
      );
      setNotes(response.data?.notesListByJobId);
      const fetchedNotes = response.data?.notesListByJobId;
      setValue('genralNotes', fetchedNotes?.genralNotes || '');
      setValue('employeeNotes', fetchedNotes?.employeeNotes || '');
      setValue('customerNotes', fetchedNotes?.customerNotes || '');
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  const getAppointments = async () => {
    try {
      const queryString = job ? `?jobId=${job._id}` : '';
      const response = await axios.get(
        `${apiPath}/api/appointment${queryString}`,
      );
      setAppointment(response.data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const transformData = (data: Record<string, any>) => {
    const transformedData: Record<string, any> = {};
    Object.entries(data).forEach(([key, value]) => {
      const [prefix, ...rest] = key.split('_');
      const fieldName = rest.join('_');
      if (!transformedData[prefix]) {
        transformedData[prefix] = {};
      }
      transformedData[prefix][fieldName] = value;
    });
    return transformedData;
  };

  const handleClickOutside = (event: any) => {
    if (event.target.id === 'modalBackdrop') {
      setIsDeleteBox('');
    }
  };

  function deleteappointment() {
    fetch(`${apiPath}/api/appointment/${isdeleteBoc}`, {
      method: 'DELETE',
    })
      .then((d) => d.json())
      .then((data) => {
        if (data.success) {
          setIsDeleteBox('');
          getAppointments();
          notify('Appointment deleted successfully');
        } else {
          notifyError('Error while deleting appointment');
        }
      });
  }

  useEffect(() => {
    if (job) {
      handleNotes();
      getAppointments();
      if (job.relocation) {
        setRelocation(transformData(job?.relocation));
      } else {
        setRelocation(null);
      }
    }
  }, [job]);

  const formatDate = (date: any) => {
    if (date) {
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      };
      const formattedDate = new Intl.DateTimeFormat('en-GB', options).format(
        new Date(date),
      );
      return formattedDate.toUpperCase();
    }
    return '';
  };

  const formatTime = (date: any) => {
    if (!date) return '';
    return new Date(date).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleNotesFormSubmission = (data: NotesFormInputs) => {
    handleNotesForm(data);
  };

  if (!job) {
    return (
      <div className="flex h-full max-h-full overflow-y-auto items-center justify-center bg-white dark:bg-boxdark">
        <img
          className="h-24 w-24 rounded-full"
          src="https://cdn.dribbble.com/users/1238723/screenshots/4794365/loading.gif"
          alt="Loading..."
        />
      </div>
    );
  }

  const tabsConfig = [
    { label: 'Description', icon: <InfoOutlinedIcon fontSize="small" /> },
    { label: 'Offers', icon: <LocalOfferOutlinedIcon fontSize="small" /> },
    { label: 'Financial', icon: <AccountBalanceWalletOutlinedIcon fontSize="small" /> },
    { label: 'Appointments', icon: <EventOutlinedIcon fontSize="small" /> },
    { label: 'Documents', icon: <FolderOutlinedIcon fontSize="small" /> },
    { label: 'Communication', icon: <ForumOutlinedIcon fontSize="small" /> },
    { label: 'Email', icon: <EmailOutlinedIcon fontSize="small" /> },
    { label: 'Taken', icon: <TaskAltOutlinedIcon fontSize="small" /> },
    { label: 'Activity', icon: <HistoryOutlinedIcon fontSize="small" /> },
  ];

  return (
    <div className="shadow-xl top-0 right-0 h-full left-0 bg-slate-50/70 dark:bg-boxdark-2 p-4 md:p-6 overflow-y-auto transition-all font-sans text-slate-800 dark:text-white space-y-5">
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-strokedark">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 dark:text-white capitalize">
              {job?.customer?.firstName} {job?.customer?.lastName}
            </h2>
            {job?.index && (
              <span className="px-2.5 py-1 rounded-xl bg-slate-200/60 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-xs font-bold border border-slate-300/50 dark:border-slate-700">
                #{job.index}
              </span>
            )}
          </div>
          <div className="mt-1.5 flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                (job?.status || '').toLowerCase() === 'execution'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
              {job?.status || 'PENDING'}
            </span>
          </div>
        </div>

        <IconButton
          onClick={onClose}
          className="bg-white dark:bg-boxdark shadow-xs border border-slate-200/80 dark:border-strokedark hover:bg-slate-100 dark:hover:bg-slate-700 transition-all text-slate-600 dark:text-slate-300"
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </div>

      {/* Executive Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white dark:bg-boxdark p-4 rounded-2xl border border-slate-200/80 dark:border-strokedark shadow-xs text-center">
          <p className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Expected Profit
          </p>
          <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            € 0,00
          </p>
        </div>
        <div className="bg-white dark:bg-boxdark p-4 rounded-2xl border border-slate-200/80 dark:border-strokedark shadow-xs text-center">
          <p className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Expected Turnover
          </p>
          <p className="text-xl font-black text-blue-600 dark:text-blue-400 mt-1">
            € 0,00
          </p>
        </div>
        <div className="bg-white dark:bg-boxdark p-4 rounded-2xl border border-slate-200/80 dark:border-strokedark shadow-xs text-center">
          <p className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Expected Costs
          </p>
          <p className="text-xl font-black text-slate-700 dark:text-slate-300 mt-1">
            € 0,00
          </p>
        </div>
      </div>

      {/* Segmented Navigation Tabs */}
      <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark p-1.5 shadow-xs">
        <Tabs
          value={tabIndex}
          onChange={handleChange}
          variant="scrollable"
          scrollButtons="auto"
          indicatorColor="primary"
          textColor="primary"
          sx={{
            minHeight: '42px',
            '& .MuiTabs-indicator': {
              height: '3px',
              borderRadius: '3px 3px 0 0',
            },
            '& .MuiTab-root': {
              minHeight: '42px',
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: 800,
              textTransform: 'none',
              borderRadius: '12px',
              gap: '6px',
              color: '#64748b',
              '&.Mui-selected': {
                color: '#3c50e0',
                backgroundColor: 'rgba(60, 80, 224, 0.08)',
              },
            },
          }}
        >
          {tabsConfig.map((item, index) => (
            <Tab
              key={index}
              label={
                <div className="flex items-center gap-2">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
              }
            />
          ))}
        </Tabs>
      </div>

      {/* Tab Panels */}
      {tabIndex === 0 && (
        <div className="space-y-6">
          {/* Action Buttons Bar */}
          <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-boxdark p-4 rounded-2xl border border-slate-200/80 dark:border-strokedark shadow-xs">
            <button
              type="button"
              onClick={() => navigate(`/intake/job/${job._id}`)}
              className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              {job?.status !== 'execution' ? 'Start valuation' : 'Re-valuation'}
            </button>
            <AppointmentScheduler
              allAppointments={getAppointments}
              jobId={job && job._id}
            />
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="px-4 py-2.5 rounded-xl border border-primary text-primary hover:bg-primary/10 font-bold text-xs transition-all cursor-pointer"
            >
              Send Quote
            </button>
            <SendQuotation
              open={open}
              onClose={() => setOpen(false)}
              job={job}
            />
            <button
              type="button"
              onClick={Ondelete}
              className="px-4 py-2.5 rounded-xl border border-rose-300 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-bold text-xs transition-all cursor-pointer"
            >
              Cancel Job
            </button>
          </div>

          {/* Relocation, Hours & Rates Metrics */}
          {relocation && (
            <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark p-5 shadow-xs space-y-5">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-strokedark">
                <LocalShippingIcon className="text-primary" fontSize="small" />
                <span>Relocation Metrics & Rates Breakdown</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Summary Card */}
                <div className="bg-slate-50/70 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-3">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                    Summary
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-white dark:bg-boxdark p-2.5 rounded-lg border border-slate-200/60 dark:border-strokedark">
                      <span className="text-slate-400 block font-medium">Total Volume</span>
                      <span className="font-extrabold text-slate-900 dark:text-white">
                        {relocation.relocation?.totalVolume ?? 0} m³
                      </span>
                    </div>
                    <div className="bg-white dark:bg-boxdark p-2.5 rounded-lg border border-slate-200/60 dark:border-strokedark">
                      <span className="text-slate-400 block font-medium">Distance</span>
                      <span className="font-extrabold text-slate-900 dark:text-white">
                        {relocation.relocation?.distance ?? 0} km
                      </span>
                    </div>
                    <div className="bg-white dark:bg-boxdark p-2.5 rounded-lg border border-slate-200/60 dark:border-strokedark">
                      <span className="text-slate-400 block font-medium">Movers</span>
                      <span className="font-extrabold text-slate-900 dark:text-white">
                        {relocation.relocation?.movers ?? 0}
                      </span>
                    </div>
                    <div className="bg-white dark:bg-boxdark p-2.5 rounded-lg border border-slate-200/60 dark:border-strokedark">
                      <span className="text-slate-400 block font-medium">Handyman</span>
                      <span className="font-extrabold text-slate-900 dark:text-white">
                        {relocation.relocation?.handyman ?? relocation.total?.handyman ?? 0}
                      </span>
                    </div>
                    <div className="bg-white dark:bg-boxdark p-2.5 rounded-lg border border-slate-200/60 dark:border-strokedark">
                      <span className="text-slate-400 block font-medium">Packers</span>
                      <span className="font-extrabold text-slate-900 dark:text-white">
                        {relocation.packing?.requiredPackers ?? relocation.relocation?.packers ?? 0}
                      </span>
                    </div>
                    <div className="bg-white dark:bg-boxdark p-2.5 rounded-lg border border-slate-200/60 dark:border-strokedark">
                      <span className="text-slate-400 block font-medium">Unpackers</span>
                      <span className="font-extrabold text-slate-900 dark:text-white">
                        {relocation.unpacking?.requiredPackers ?? relocation.relocation?.unpackers ?? 0}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Hours Card */}
                <div className="bg-slate-50/70 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-3">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                    Estimated Hours
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-white dark:bg-boxdark p-2.5 rounded-lg border border-slate-200/60 dark:border-strokedark">
                      <span className="text-slate-400 block font-medium">Total Hours</span>
                      <span className="font-extrabold text-slate-900 dark:text-white">
                        {relocation.relocation?.requiredHours ?? relocation.hours?.hours ?? 0} hrs
                      </span>
                    </div>
                    <div className="bg-white dark:bg-boxdark p-2.5 rounded-lg border border-slate-200/60 dark:border-strokedark">
                      <span className="text-slate-400 block font-medium">Travel Time</span>
                      <span className="font-extrabold text-slate-900 dark:text-white">
                        {relocation.relocation?.travelTime ?? relocation.hours?.travelTime ?? 0} hrs
                      </span>
                    </div>
                    <div className="bg-white dark:bg-boxdark p-2.5 rounded-lg border border-slate-200/60 dark:border-strokedark">
                      <span className="text-slate-400 block font-medium">Assembling</span>
                      <span className="font-extrabold text-slate-900 dark:text-white">
                        {relocation.assembling?.requiredHours ?? relocation.hours?.assemblingHours ?? 0} hrs
                      </span>
                    </div>
                    <div className="bg-white dark:bg-boxdark p-2.5 rounded-lg border border-slate-200/60 dark:border-strokedark">
                      <span className="text-slate-400 block font-medium">Disassembly</span>
                      <span className="font-extrabold text-slate-900 dark:text-white">
                        {relocation.disassembling?.requiredHours ?? relocation.hours?.disassemblyHours ?? 0} hrs
                      </span>
                    </div>
                    <div className="bg-white dark:bg-boxdark p-2.5 rounded-lg border border-slate-200/60 dark:border-strokedark">
                      <span className="text-slate-400 block font-medium">Packing</span>
                      <span className="font-extrabold text-slate-900 dark:text-white">
                        {relocation.packing?.requiredHours ?? relocation.hours?.packingHours ?? 0} hrs
                      </span>
                    </div>
                    <div className="bg-white dark:bg-boxdark p-2.5 rounded-lg border border-slate-200/60 dark:border-strokedark">
                      <span className="text-slate-400 block font-medium">Unpacking</span>
                      <span className="font-extrabold text-slate-900 dark:text-white">
                        {relocation.unpacking?.requiredHours ?? relocation.hours?.unpackingHours ?? 0} hrs
                      </span>
                    </div>
                  </div>
                </div>

                {/* Rates Card */}
                <div className="bg-slate-50/70 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-3">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                    Rates Structure
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-white dark:bg-boxdark p-2.5 rounded-lg border border-slate-200/60 dark:border-strokedark">
                      <span className="text-slate-400 block font-medium">Cubic Meter</span>
                      <span className="font-extrabold text-primary">
                        $ {relocation.relocation?.pricePerMeterCubic ?? relocation.rates?.cubicMeter ?? 0}
                      </span>
                    </div>
                    <div className="bg-white dark:bg-boxdark p-2.5 rounded-lg border border-slate-200/60 dark:border-strokedark">
                      <span className="text-slate-400 block font-medium">Travel Time</span>
                      <span className="font-extrabold text-primary">
                        $ {relocation.relocation?.pricePerHour ?? relocation.rates?.travelTime ?? 0}
                      </span>
                    </div>
                    <div className="bg-white dark:bg-boxdark p-2.5 rounded-lg border border-slate-200/60 dark:border-strokedark">
                      <span className="text-slate-400 block font-medium">Distance</span>
                      <span className="font-extrabold text-primary">
                        $ {relocation.relocation?.pricePerKilometer ?? relocation.rates?.distance ?? 0}
                      </span>
                    </div>
                    <div className="bg-white dark:bg-boxdark p-2.5 rounded-lg border border-slate-200/60 dark:border-strokedark">
                      <span className="text-slate-400 block font-medium">Disassembly</span>
                      <span className="font-extrabold text-primary">
                        $ {relocation.disassembling?.appliedPrice ?? relocation.rates?.disassemblyHours ?? 0}
                      </span>
                    </div>
                    <div className="bg-white dark:bg-boxdark p-2.5 rounded-lg border border-slate-200/60 dark:border-strokedark">
                      <span className="text-slate-400 block font-medium">Assembly</span>
                      <span className="font-extrabold text-primary">
                        $ {relocation.assembling?.appliedPrice ?? relocation.rates?.assemblyHours ?? 0}
                      </span>
                    </div>
                    <div className="bg-white dark:bg-boxdark p-2.5 rounded-lg border border-slate-200/60 dark:border-strokedark">
                      <span className="text-slate-400 block font-medium">Packing</span>
                      <span className="font-extrabold text-primary">
                        $ {relocation.packing?.appliedPrice ?? relocation.rates?.packingHours ?? 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Valuation Rooms Breakdown Component */}
          <JobOfferRooms job={job} type="offer" />

          {/* Load & Unload Transport Route */}
          <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark p-5 shadow-xs space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-strokedark">
              <LocationOnIcon className="text-primary" fontSize="small" />
              <span>Load & Unload Transport Route ("The Address")</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { ...job?.load, type: 'Load / Origin', isLoad: true },
                { ...job?.unload, type: 'Unload / Destination', isLoad: false },
              ].map((item: any, index: number) => (
                <div
                  key={index}
                  className={`p-4 rounded-2xl border ${
                    item.isLoad
                      ? 'bg-blue-50/40 dark:bg-blue-950/20 border-blue-200/80 dark:border-blue-900/40'
                      : 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-900/40'
                  } space-y-3 text-xs`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`font-black uppercase tracking-wider text-xs ${
                        item.isLoad
                          ? 'text-blue-700 dark:text-blue-300'
                          : 'text-emerald-700 dark:text-emerald-300'
                      }`}
                    >
                      {item.type}
                    </span>
                    <span className="font-bold bg-white dark:bg-boxdark px-2.5 py-0.5 rounded-lg border border-slate-200/60 dark:border-strokedark text-slate-700 dark:text-slate-300">
                      {item.typeOfProperty || 'Property'}
                    </span>
                  </div>
                  <p className="font-extrabold text-slate-900 dark:text-white text-sm capitalize">
                    Floor {item.floor || '0'}, House {item.houseNumber || '0'}{' '}
                    {item.addition || ''} {item.street || 'N/A'} {item.city || ''}{' '}
                    {item.country || ''}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-slate-500 pt-2 border-t border-slate-200/60 dark:border-strokedark">
                    {item.hasElevator && (
                      <span className="inline-flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                        <ElevatorOutlined fontSize="small" /> Elevator ({item.distanceToLift || 0}m lift, {item.distanceToApartment || 0}m apt)
                      </span>
                    )}
                    {item.deliveringBoxes && (
                      <span className="inline-flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                        <GifBoxOutlined fontSize="small" /> Box Delivery
                      </span>
                    )}
                    {item.applyForPermit && (
                      <span className="inline-flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                        <ApprovalOutlined fontSize="small" /> Permit
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Job Notes */}
          <div className="bg-white dark:bg-boxdark p-5 rounded-2xl border border-slate-200/80 dark:border-strokedark shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-strokedark">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <span>Job Notes</span>
              </h3>
              <button
                type="button"
                className="px-3.5 py-1.5 rounded-xl border border-primary text-primary hover:bg-primary/10 font-bold text-xs transition-all cursor-pointer"
                onClick={() => setIsNotesModalShow(true)}
              >
                Edit Notes
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  General Notes
                </p>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  {notes?.genralNotes || 'No notes added'}
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Employee Notes
                </p>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  {notes?.employeeNotes || 'No notes added'}
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Customer Notes
                </p>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  {notes?.customerNotes || 'No notes added'}
                </p>
              </div>
            </div>
          </div>

          {/* Edit Notes Dialog */}
          <Dialog
            open={isNotesModalShow}
            onClose={() => setIsNotesModalShow(false)}
            maxWidth="sm"
            fullWidth
            PaperProps={{
              className:
                'rounded-2xl dark:bg-boxdark border border-slate-200 dark:border-strokedark shadow-2xl p-2',
            }}
          >
            <div className="p-4">
              <DialogTitle className="text-xl font-extrabold text-slate-900 dark:text-white px-2">
                Edit Job Notes
              </DialogTitle>
              <DialogContent className="px-2 py-4">
                <form
                  onSubmit={handleSubmit(handleNotesFormSubmission)}
                  className="space-y-4"
                >
                  <div>
                    <TextField
                      label="General notes"
                      variant="outlined"
                      fullWidth
                      margin="normal"
                      multiline
                      minRows={2}
                      {...register('genralNotes', {
                        required: 'General notes are required',
                      })}
                      error={!!errors.genralNotes}
                      helperText={
                        errors.genralNotes ? (errors.genralNotes.message as string) : ''
                      }
                      InputProps={{ className: 'rounded-xl text-xs' }}
                    />
                  </div>

                  <div>
                    <TextField
                      label="Notes for the employee"
                      variant="outlined"
                      margin="normal"
                      fullWidth
                      multiline
                      minRows={2}
                      {...register('employeeNotes')}
                      InputProps={{ className: 'rounded-xl text-xs' }}
                    />
                  </div>

                  <div>
                    <TextField
                      label="Notes for the customer"
                      variant="outlined"
                      margin="normal"
                      fullWidth
                      multiline
                      minRows={2}
                      {...register('customerNotes')}
                      InputProps={{ className: 'rounded-xl text-xs' }}
                    />
                  </div>

                  <DialogActions className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-strokedark">
                    <button
                      type="button"
                      onClick={() => {
                        setIsNotesModalShow(false);
                        reset();
                      }}
                      className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-strokedark text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 text-xs font-bold rounded-xl bg-primary hover:bg-primary/90 text-white shadow-md transition-all"
                    >
                      Save Notes
                    </button>
                  </DialogActions>
                </form>
              </DialogContent>
            </div>
          </Dialog>

          {/* Customer Information Card */}
          <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark p-5 shadow-xs space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white uppercase tracking-wider pb-3 border-b border-slate-100 dark:border-strokedark">
              CUSTOMER INFORMATION :
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Customer Details */}
              <div className="bg-slate-50/50 dark:bg-slate-800/30 p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white capitalize pb-1">
                  {job?.customer?.typeOfCustomer || job?.customer?.type || 'Customer'} Details :
                </h4>
                {job?.customer?._id && (
                  <a
                    className="cursor-pointer text-primary font-bold hover:underline block pb-1"
                    onClick={() => navigate(`/customers/${job.customer._id}`)}
                  >
                    Go to customer
                  </a>
                )}
                {[
                  { label: 'Name', value: `${job?.customer?.salutation || ''} ${job?.customer?.firstName || ''} ${job?.customer?.lastName || ''}`.trim() },
                  { label: 'Gender', value: job?.customer?.gender },
                  { label: 'Contact', value: job?.customer?.contact },
                  { label: 'Language', value: job?.customer?.taal },
                  { label: 'Email', value: job?.customer?.email },
                  { label: 'Type', value: job?.customer?.typeOfCustomer },
                  { label: 'Contact No', value: job?.customer?.contact },
                  { label: 'Mobile No.', value: job?.customer?.mobile },
                ].map(({ label, value }) => (
                  <div key={label} className="flex gap-4 text-slate-600 dark:text-slate-300 font-medium">
                    <p className="w-24 font-bold text-slate-500">{label}:</p>
                    <p className="text-slate-900 dark:text-white capitalize font-semibold">{value || 'N/A'}</p>
                  </div>
                ))}
              </div>

              {/* Address Details */}
              <div className="bg-slate-50/50 dark:bg-slate-800/30 p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-3 text-xs">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white capitalize">
                  Address :
                </h4>
                {job?.customer?.address && job.customer.address.length > 0 ? (
                  job.customer.address.map((item: any, index: number) => (
                    <div key={index} className="space-y-1 bg-white dark:bg-boxdark p-3 rounded-xl border border-slate-200/60 dark:border-strokedark">
                      <h5 className="font-bold text-slate-700 dark:text-slate-300 capitalize">{item.addressType}</h5>
                      <p className="text-slate-900 dark:text-white font-medium capitalize">
                        {item.floor ? `${item.floor} Floor ` : ''}{item.houseNumber || '0'} {item.addition || ''} {item.street || ''} {item.city || ''} {item.country || ''}
                      </p>
                      <p className="text-slate-500 font-medium">{item.typeOfProperty}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400">N/A</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 1: Offers */}
      {tabIndex === 1 && <JobOffermodule type="offer" job={job} />}

      {/* Tab 2: Financial */}
      {tabIndex === 2 && (
        <div className="space-y-6">
          <FinanceModule data={job.package} />
          <JobOffermodule type="invoice" job={job} />
        </div>
      )}

      {/* Tab 3: Appointments */}
      {tabIndex === 3 && (
        <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark p-5 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100 dark:border-strokedark">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Scheduled Appointments
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Manage dates, teams, and departure schedules for this job.
              </p>
            </div>
            <AppointmentScheduler
              allAppointments={getAppointments}
              jobId={job && job._id}
            />
          </div>

          {/* Executive Table for Appointments */}
          {appointment && appointment.length > 0 ? (
            <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-strokedark">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-50/80 dark:bg-slate-800/60 uppercase text-[11px] font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200/80 dark:border-strokedark">
                  <tr>
                    <th className="py-3.5 px-4">Type</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4">Time Window</th>
                    <th className="py-3.5 px-4">Departure Location</th>
                    <th className="py-3.5 px-4">Assigned Team</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {appointment.map((item: any) => {
                    const typeUpper = (item.appointmentType || 'OTHER').toUpperCase();
                    let badgeStyle = 'bg-slate-100 text-slate-700 border-slate-200';
                    if (typeUpper === 'MOVE') badgeStyle = 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800';
                    if (typeUpper === 'PACKING') badgeStyle = 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800';
                    if (typeUpper === 'LOADING') badgeStyle = 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800';
                    if (typeUpper === 'UNPACKING') badgeStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800';

                    return (
                      <tr
                        key={item._id}
                        className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold border uppercase tracking-wider ${badgeStyle}`}>
                            {item.appointmentType || 'Appointment'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-extrabold text-slate-900 dark:text-white whitespace-nowrap">
                          {formatDate(item.date)}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-700 dark:text-slate-200 whitespace-nowrap">
                          {formatTime(item.startTime)} - {formatTime(item.endTime)}
                        </td>
                        <td className="py-3.5 px-4 max-w-xs truncate font-medium text-slate-800 dark:text-slate-200">
                          {item.departureLocation || 'N/A'}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                          <span className="bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                            {item.assignedEmployees?.length ?? 0} Employees
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedAppointment(item);
                                setIsAppointmentViewerOpen(true);
                              }}
                              className="text-slate-500 hover:text-primary"
                              title="View Details"
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedAppointment(item);
                                setIsAppointmentEditorOpen(true);
                              }}
                              className="text-slate-500 hover:text-primary"
                              title="Edit Appointment"
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => setIsDeleteBox(item._id)}
                              className="text-rose-500 hover:text-rose-700"
                              title="Delete Appointment"
                            >
                              <DeleteForever fontSize="small" />
                            </IconButton>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 text-xs font-medium">
              There are no appointments scheduled for this job.
            </div>
          )}

          <AppointmentScheduler
            allAppointments={getAppointments}
            jobId={job && job._id}
            appointmentToEdit={selectedAppointment}
            open={isAppointmentEditorOpen}
            onClose={() => {
              setIsAppointmentEditorOpen(false);
              setSelectedAppointment(null);
            }}
            hideTriggerButton
          />

          <AppointmentScheduler
            allAppointments={getAppointments}
            jobId={job && job._id}
            appointmentToEdit={selectedAppointment}
            open={isAppointmentViewerOpen}
            onClose={() => {
              setIsAppointmentViewerOpen(false);
              setSelectedAppointment(null);
            }}
            hideTriggerButton
            viewOnly
          />

          {/* Delete Confirmation Modal */}
          {isdeleteBoc && (
            <div
              id="modalBackdrop"
              className="fixed inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-xs p-4"
              onClick={handleClickOutside}
            >
              <div
                className="bg-white dark:bg-boxdark p-6 rounded-2xl shadow-2xl z-50 max-w-md w-full border border-slate-200 dark:border-strokedark space-y-4"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="font-black text-lg text-rose-600 dark:text-rose-400">
                  Delete Appointment?
                </h3>
                <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  Are you sure you want to delete this scheduled appointment? This action cannot be undone.
                </p>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-all cursor-pointer"
                    onClick={() => setIsDeleteBox('')}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md transition-all cursor-pointer"
                    onClick={() => deleteappointment()}
                  >
                    Confirm Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Documents */}
      {tabIndex === 4 && (
        <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark p-4 shadow-xs">
          <DocumentSelected id={job?.customer?._id} />
        </div>
      )}

      {/* Tab 5: Communication */}
      {tabIndex === 5 && (
        <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark p-4 shadow-xs">
          <CommunicationLog id={job?._id} />
        </div>
      )}

      {/* Tab 6: Email */}
      {tabIndex === 6 && (
        <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark p-4 shadow-xs">
          <EmailLayout
            customerId={job?.customer?._id}
            offerId={job?.offer[0]?._id || ''}
          />
        </div>
      )}

      {/* Tab 7: Taken / Tasks */}
      {tabIndex === 7 && (
        <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark p-4 shadow-xs">
          <TaskPage jobId={job._id} />
        </div>
      )}

      {/* Tab 8: Activity */}
      {tabIndex === 8 && (
        <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark p-4 shadow-xs">
          <QuotesActivity invoiceData={job?.offer[0]} />
        </div>
      )}
    </div>
  );
};

export default Jobslider;
