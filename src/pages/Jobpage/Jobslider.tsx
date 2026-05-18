import React, { useEffect, useState } from 'react';
import {
    Button,
    IconButton,
    TextField,
    Tabs,
    Tab, Typography, Chip, Dialog,
    DialogContent,
    DialogActions,
    DialogTitle,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Phone, Mail, ElevatorOutlined, GifBoxOutlined, ApprovalOutlined } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { apiPath } from '../../../apiPath';
import SendQuotation from './SendQuotation';
import AppointmentScheduler from './appointmentForm';
import JobOffermodule from './jobDetailmodules/JobOffermodule';
import UploadDocument from './jobDetailmodules/UploadDocument';
import CommunicationLog from '../InvoicePage/Communication';
import FinanceModule from './jobDetailmodules/FinanceModule';
import QuotesActivity from '../Quotes/QuotesActivity';
import { useNavigate } from 'react-router-dom';
import DocumentSelected from '../customerDetails/DocumentSelected';
import EmailLayout from '../Emailpage/EmailComponent';
import TaskPage from '../Taskcomponent/TaskPage';

interface job {
    _id: string;
    customer?: {
        firstName?: string;
        lastName?: string;
        contact?: string;
        email?: string;
        houseNumber?: string;
        street?: string;
        city?: string;
        postcode?: string;
        country?: string;
    };
    load: any;
    unload: any;
    status: string;
    date: string;
    index: string;
    package?: any;
    offer?: any;
}

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

const Jobslider: React.FC<JobsliderProps> = ({ job, onClose, Ondelete }) => {
    const [tabIndex, setTabIndex] = useState(0);
    const [isNotesModalShow, setIsNotesModalShow] = useState(false);
    const [open, setOpen] = useState(false);
    const { handleSubmit, register, setValue, formState: { errors } } = useForm<any>();
    const [notes, setNotes] = useState<NotesFormInputs>({ _id: '', genralNotes: '', employeeNotes: '', customerNotes: '' });
    const [appointment, setAppointment] = useState<any>([])
    const [relocation, setRelocation] = useState<any>();
    const handleChange = (_event: React.ChangeEvent<{}>, newValue: number) => {
        setTabIndex(newValue);
    };
    const handleNotesForm = async (data: any) => {
        try {
            if (notes) {
                await axios.post(`${apiPath}/api/jobNotes`, { ...data, jobId: job?._id, id: notes._id });
                setIsNotesModalShow(false);
                handleNotes()
            } else {
                await axios.post(`${apiPath}/api/jobNotes`, { ...data, jobId: job?._id });
                setIsNotesModalShow(false);
                handleNotes()
            }
        } catch (error) {
            console.error('Error during form submission:', error);
        }
    };

    let navigate = useNavigate();

    const handleNotes = async () => {
        try {
            const response = await axios.get(`${apiPath}/api/notesListByJobId?jobId=${job?._id}`);
            setNotes(response.data?.notesListByJobId)
            const notes = response.data.notesListByJobId;
            setValue('genralNotes', notes?.genralNotes || "");
            setValue('employeeNotes', notes?.employeeNotes || "");
            setValue('customerNotes', notes?.customerNotes || "");
        } catch (error) {
            console.error('Error fetching notes:', error);
        }
    }

    const getAppointments = async () => {
        try {
            const queryString = job ? `?jobId=${job._id}` : '';
            const response = await axios.get(`${apiPath}/api/appointment${queryString}`);
            setAppointment(response.data)
        } catch (error) {
            console.error('Error fetching appointments:', error);
        }
    };

    const transformData = (data: Record<string, any>) => {
        const transformedData: Record<string, any> = {};
        Object.entries(data).forEach(([key, value]) => {
            const [prefix, ...rest] = key.split('_');
            const fieldName = rest.join('_'); // Join the remaining parts of the key
            if (!transformedData[prefix]) {
                transformedData[prefix] = {};
            }
            transformedData[prefix][fieldName] = value;
        });
        return transformedData;
    };

    useEffect(() => {
        if (job) {
            handleNotes();
            getAppointments();
            if (job.relocation) {
                setRelocation(transformData(job?.relocation))
            } else {
                setRelocation(null)
            }
        }
    }, [job]);


    const formatDate = (date: any) => {
        if (date) {
            const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
            const formattedDate = new Intl.DateTimeFormat('en-GB', options).format(new Date(date));
            return formattedDate.toUpperCase(); // Convert month to uppercase
        }
    };

    const handleNotesFormSubmission = (data: NotesFormInputs) => {
        handleNotesForm(data);
    };

    if (!job) {
        return (
            <div className="flex h-full max-h-full overflow-y-auto items-center justify-center bg-white">
                <img className="h-30 w-30 rounded-full" src="https://cdn.dribbble.com/users/1238723/screenshots/4794365/loading.gif" alt="" />
            </div>
        );
    }

    return (
        <div className="shadow-xl top-0 right-0 h-full left-0 bg-white p-4 overflow-y-auto transition-transform">

            <div className="flex items-center justify-between capitalize">
                <Typography variant="h4" className="font-bold">
                    {job?.customer?.firstName} {job?.customer?.lastName} (# {job?.index})
                </Typography>
                <IconButton onClick={onClose}>
                    <CloseIcon />
                </IconButton>
            </div>
            <Chip
                label={job?.status}
                color="default"
                className="mt-2 bg-gray-200 text-gray-700"
            />

            {/* Financial Overview */}
            <div className="grid grid-cols-3 gap-2 text-center mt-4 mb-3">
                <div>
                    <Typography variant="body2" className="text-gray-500">Expected profit</Typography>
                    <Typography variant="h5" className="font-bold">€ 0,00</Typography>
                </div>
                <div>
                    <Typography variant="body2" className="text-gray-500">Expected turnover</Typography>
                    <Typography variant="h5" className="font-bold">€ 0,00</Typography>
                </div>
                <div>
                    <Typography variant="body2" className="text-gray-500">Expected costs</Typography>
                    <Typography variant="h5" className="font-bold">€ 0,00</Typography>
                </div>
            </div>

            {/* Tabs Section */}
            <Tabs
                value={tabIndex}
                onChange={handleChange}
                className="mb-4"
                variant="scrollable"
                scrollButtons="auto"
                indicatorColor="primary"
                textColor="primary"
            >
                <Tab label="Description" />
                <Tab label="Offers" />
                <Tab label="Financial" />
                <Tab label="Dates" />
                <Tab label="Documents" />
                <Tab label="Communication" />
                <Tab label="Email" />
                <Tab label="Taken" />
                <Tab label="Activity" />
            </Tabs>
            {tabIndex === 0 && (
                <div className='px-4'>
                    <div className="flex flex-wrap gap-4 mb-6 font-medium">
                        {job?.status !== 'execution' &&
                            <Button onClick={() => navigate(`/intake/${job._id}`)} variant="contained" color="primary">
                                Start valuation
                            </Button>}
                        <AppointmentScheduler allAppointments={getAppointments} jobId={job && job._id} />
                        <Button onClick={() => setOpen(true)} variant="outlined" color="primary">
                            Send quote
                        </Button>
                        <SendQuotation open={open} onClose={() => setOpen(false)} job={job} />
                        <Button onClick={Ondelete} variant="outlined" color="error">
                            Cancel job
                        </Button>
                    </div>
                        {relocation && (
                            <>
                                <h2 className="text-xl font-semibold mb-2">Relocation</h2>

                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    {/* Left Column */}
                                    <div>
                                        <h3 className="text-lg font-semibold mb-2">Summary</h3>
                                        <p className="font-medium mb-1">{relocation.relocation?.totalVolume} m<sup>3</sup></p>
                                        <p className="font-medium mb-1">{relocation.relocation?.movers} movers</p>
                                        <p className="font-medium mb-1">{relocation.total?.handyman} handyman</p>
                                        <p className="font-medium mb-1">{relocation.packing?.requiredPackers} Packers</p>
                                        <p className="font-medium mb-1">{relocation.unpacking?.requiredPackers} Unpackers</p>
                                        <p className="font-medium mb-1">{relocation.relocation?.distance} km </p>
                                    </div>

                                    {/* Right Column */}
                                    <div>
                                        <p className="text-lg mb-1">Hours</p>
                                        <p className="font-medium mb-1">
                                            {(relocation.relocation?.requiredHours).toFixed(2) || 'Not available'} hours
                                        </p>
                                        <p className="font-medium mb-1">
                                            {(relocation.relocation?.travelTime).toFixed(2)} Travel Time
                                        </p>
                                        <p className="font-medium mb-1">
                                            {(relocation.assembling?.requiredHours).toFixed(2)} Assembling hours
                                        </p>
                                        <p className="font-medium mb-1">
                                            {(relocation.disassembling?.requiredHours).toFixed(2)} Disassembly hours
                                        </p>
                                        <p className="font-medium mb-1">
                                            {(relocation.packing?.requiredHours).toFixed(2)} Packing Hours
                                        </p>
                                        <p className="font-medium mb-1">
                                            {(relocation.unpacking?.requiredHours).toFixed(2)} Unpacking Hours
                                        </p>
                                    </div>
                                </div>
                                <hr className="my-4 text-gray" />
                                <div className="max-w-md">
                                    <h4 className="font-bold text-xl text-black mb-2">Rates</h4>
                                    <ul className="space-y-2 font-medium text-lg">
                                        <li className="flex justify-between">
                                            <span>Cubic Meter</span>
                                            <span>{relocation.relocation?.pricePerMeterCubic} $</span>
                                        </li>
                                        <li className="flex justify-between">
                                            <span>Travel Time</span>
                                            <span>{relocation.relocation?.pricePerHour} $</span>
                                        </li>
                                        <li className="flex justify-between">
                                            <span>Distance</span>
                                            <span>{relocation.relocation?.pricePerKilometer} $</span>
                                        </li>
                                        <li className="flex justify-between">
                                            <span>Disassembly Hours</span>
                                            <span>{relocation.disassembling?.appliedPrice} $</span>
                                        </li>
                                        <li className="flex justify-between">
                                            <span>Assembly Hours</span>
                                            <span>{relocation.assembling?.appliedPrice} $</span>
                                        </li>
                                        <li className="flex justify-between">
                                            <span>Unpacking Hours</span>
                                            <span>{relocation.unpacking?.appliedPrice} $</span>
                                        </li>
                                        <li className="flex justify-between">
                                            <span>Packing Hours</span>
                                            <span>{relocation.packing?.appliedPrice} $</span>
                                        </li>
                                    </ul>
                                </div>
                                <hr className="my-4 text-gray" />
                            </>
                        )}

                    <div className="mb-4 mt-4">
                        <h3 className="font-bold text-lg text-slate-800 mb-3 mt">CUSTOMER INFORMATION :</h3>

                        <div className="grid grid-cols-2 sm:gird-cols-1 gap-5">
                            <div className="space-y-1">
                                <h2 className="font-medium text-xl pb-2 capitalize">{job?.customer?.type} Details :</h2>
                                <a className='cursor-pointer text-primary ' onClick={() => navigate(`/customers/${job?.customer?._id}`)}>Go to customer</a>
                                {[
                                    { label: 'Name', value: `${job?.customer?.salutation || ''} ${job?.customer?.firstName || ''} ${job?.customer?.lastName || ''}` },
                                    { label: 'Gender', value: job?.customer?.gender },
                                    { label: 'Contact', value: job?.customer?.contact },
                                    { label: 'Language', value: job?.customer?.taal },
                                    { label: 'Email', value: job?.customer?.email },
                                    { label: 'Type', value: job?.customer?.typeOfCustomer },
                                    { label: 'Contact No', value: job?.customer?.contact },
                                    { label: 'Mobile No.', value: job?.customer?.mobile },
                                ].map(({ label, value }) => (
                                    <div style={{ fontSize: '17px' }} className="flex gap-4 text-slate-600 font-medium" key={label}>
                                        <p className="">{label}:</p>
                                        <p className="text-slate-800 capitalize">{value || 'N/A'}</p>
                                    </div>
                                ))}

                            </div>
                            {job?.customer && job?.customer?.address.map((item: any, index: number) => (
                                <div key={index} className="">
                                    <h2 className="font-medium text-xl pb-2 capitalize">Address :</h2>
                                    <div className="flex items-center justify-between">
                                        <h2 className="font-bold text-slate-500 capitalize">{item.addressType}</h2>
                                    </div>
                                    <div style={{ fontSize: '17px' }} className="text-lg text-slate-600 font-medium">
                                        <p className="text-slate-800 capitalize max-w-100">
                                            {item.floor} Floor {item.houseNumber || '0'} {item.addition} {item.street} {item.city} {item.country}
                                        </p>
                                        <p className="text-slate-500">{item.typeOfProperty}</p>
                                        <div className="flex gap-2">
                                            <span className="relative group">
                                                {item.hasElevator && <ElevatorOutlined fontSize="medium" />}
                                                <div className="absolute buttom-0 rounded w-100 hidden group-hover:flex flex-col gap-2 bg-slate-300 border border-gray p-2 shadow-lg">
                                                    <p>Distance To Lift : {item.distanceToLift}m</p>
                                                    <p>Distance To Apartment :{item.distanceToApartment}m</p>
                                                </div>
                                            </span>
                                            <span>{item.deliveringBoxes && <GifBoxOutlined fontSize='medium' />}</span>
                                            <span>{item.applyForPermit && <ApprovalOutlined fontSize='medium' />}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <hr className="my-6 text-gray" />
                    <div className="mb-4">
                        <Typography variant="h6" className="font-semibold text-gray-700 mb-2">
                            The Address
                        </Typography>
                        <div className="grid grid-cols-2 gap-4">
                            {[{ ...job?.load, type: 'load' }, { ...job?.unload, type: 'unload' }].map((item: any, index: number) => (
                                <div key={index} className="w-1/2">
                                    <div className="flex items-center justify-between">
                                        <h2 className="font-bold text-slate-500 capitalize">{item.type}</h2>
                                    </div>
                                    <div style={{ fontSize: '17px' }} className="text-lg text-slate-600 font-medium">
                                        <p className="text-slate-800 capitalize max-w-100">
                                            {item.floor} Floor {item.houseNumber || '0'} {item.addition} {item.street} {item.city} {item.country}
                                        </p>
                                        <p className="text-slate-500">{item.typeOfProperty}</p>
                                        <div className="flex gap-2">
                                            <span className="relative group">
                                                {item.hasElevator && <ElevatorOutlined fontSize="medium" />}
                                                <div className="absolute buttom-0 rounded w-100 hidden group-hover:flex flex-col gap-2 bg-slate-300 border border-gray p-2 shadow-lg">
                                                    <p>Distance To Lift : {item.distanceToLift}m</p>
                                                    <p>Distance To Apartment :{item.distanceToApartment}m</p>
                                                </div>
                                            </span>
                                            <span>{item.deliveringBoxes && <GifBoxOutlined fontSize='medium' />}</span>
                                            <span>{item.applyForPermit && <ApprovalOutlined fontSize='medium' />}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <hr className="my-6 text-gray" />
                    <div className="mb-4">
                        <div className="grid grid-cols-2 gap-4">
                            <Typography variant="h6" className="font-semibold text-gray-700 mb-2">
                                DATA
                            </Typography>
                            <AppointmentScheduler allAppointments={getAppointments} jobId={job && job._id} />
                        </div>
                        {appointment.length > 0 ? appointment.map((item: any) =>
                            <div className="grid grid-cols-2 gap-4" key={item._id}>
                                <div className="text-gray-900 font-medium">{item.appointmentType}</div>
                                <div className="text-gray-900 font-medium my-1">{formatDate(item.date)}</div>
                            </div>
                        ) : 'There are no appointments available'}
                    </div>
                    <hr className="my-6 text-gray" />
                    <div className="max-w-xs">
                        <h4 className="text-xl mb-2">Necessary</h4>
                        <ul className="space-y-1">
                            {job?.materials.map((item: any, index:number) => (
                                <li key={index} className="text-gray-700 leading-relaxed">
                                    {item.quantity} {item.material.name}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <hr className="my-6 text-gray" />
                    <div className="mb-4">
                        <div className='grid grid-cols-2 gap-4 '>
                            <Typography variant="h6" className="font-semibold mb-2">
                                Notes
                            </Typography>
                            <Button
                                variant="outlined"
                                color="primary"
                                sx={{ width: '50px' }}
                                onClick={() => setIsNotesModalShow(true)}
                            >
                                Edit
                            </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <div className="text-gray-500">General</div>
                                <div className="text-gray-900 font-medium my-1">{notes?.genralNotes || "No Notes"} </div>
                            </div>
                            <div>
                                <div className="text-gray-500">For the employee</div>
                                <div className="text-gray-900 font-medium my-1">{notes?.employeeNotes || "No Notes"}</div>
                            </div>
                            <div>
                                <div className="text-gray-500">For the Customer</div>
                                <div className="text-gray-900 font-medium my-1">{notes?.customerNotes || "No Notes"}</div>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-wrap justify-center gap-5">
                        <Dialog
                            open={isNotesModalShow}
                            onClose={() => setIsNotesModalShow(false)}
                            maxWidth="sm"
                            fullWidth
                        >
                            <div className="p-4">
                                <DialogTitle className="text-xl font-bold text-black dark:text-white sm:text-2xl">
                                    Notes
                                </DialogTitle>
                                <DialogContent className="p-6">
                                    <form onSubmit={handleSubmit(handleNotesFormSubmission)}>
                                        {/* General Notes */}
                                        <div className="mb-2">
                                            <TextField
                                                label="General notes"
                                                variant="standard"
                                                fullWidth
                                                margin="normal"
                                                multiline
                                                minRows={2}
                                                {...register("genralNotes", { required: "General notes are required" })}
                                                error={!!errors.generalNotes} // Show error styling if there's an error
                                                helperText={errors.generalNotes ? errors.generalNotes.message : ""} // Display error message
                                                className="dark:bg-form-input dark:text-white"
                                            />
                                        </div>
                                        {/* Employee Notes */}
                                        <div className="mb-2">
                                            <TextField
                                                label="Notes for the employee"
                                                variant="standard"
                                                margin="normal"
                                                fullWidth
                                                multiline
                                                minRows={2}// Adjust the number of rows as needed
                                                {...register("employeeNotes")}
                                                className="dark:bg-form-input dark:text-white"
                                            />
                                        </div>
                                        {/* Customer Notes */}
                                        <div className="mb-8">
                                            <TextField
                                                label="Notes for the customer"
                                                variant="standard"
                                                margin="normal"
                                                fullWidth
                                                multiline
                                                minRows={2}  // Adjust the number of rows as needed
                                                {...register("customerNotes")}
                                                className="dark:bg-form-input dark:text-white"
                                            />
                                        </div>
                                        {/* Actions */}
                                        <DialogActions className="flex mt-4 ">
                                            <Button
                                                variant="outlined"
                                                color="secondary"
                                                onClick={() => setIsNotesModalShow(false)}
                                                className="w-full sm:w-1/4 border border-stroke bg-gray text-black hover:bg-meta-1 dark:border-strokedark dark:bg-meta-4 dark:text-white"
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                type="submit"
                                                variant="contained"
                                                color="primary"
                                                className="w-full sm:w-1/4 bg-primary text-white hover:bg-opacity-90"
                                            >
                                                Done
                                            </Button>
                                        </DialogActions>
                                    </form>

                                </DialogContent>
                            </div>
                        </Dialog>
                    </div>
                </div>
            )}
            {tabIndex === 1 && (
                <JobOffermodule type='offer' job={job} />
            )}
            {tabIndex === 2 && (
                <>
                    <FinanceModule data={job.package} />
                    <JobOffermodule type='invoice' job={job} />
                </>
            )}
            {tabIndex === 3 && (
                <div className='px-3 mx-3'>
                    <Typography variant="h6" marginBottom={2} className="font-semibold text-gray-700">
                        Dates
                    </Typography>
                    <div className="mb-4">
                        <div className="grid grid-cols-2 gap-4 mb-3">
                            <Typography variant="h6" className="font-semibold text-gray-700 mb-2">
                                DATA
                            </Typography>
                            <AppointmentScheduler allAppointments={getAppointments} jobId={job && job._id} />
                        </div>
                        {appointment.length > 0 ? appointment.map((item: any) =>
                            <div className="grid grid-cols-2 gap-4" key={item._id}>
                                <div className="text-gray-900 font-medium">{item.appointmentType}</div>
                                <div className="text-gray-900 font-medium my-1">{formatDate(item.date)}</div>
                            </div>
                        ) : 'There are no appointments available'}
                    </div>
                </div>
            )}
            {tabIndex === 4 && (
                <DocumentSelected id={job?.customer?._id} />
            )}{tabIndex === 5 && (
                <CommunicationLog id={job?._id} />
            )}
            {tabIndex === 6 && (
                <EmailLayout customerId={job?.customer?._id} offerId={job?.offer[0]?._id || ''} />
            )}
            {tabIndex === 7 && (
                <TaskPage jobId={job._id} />
            )}
            {tabIndex === 8 && (
                <QuotesActivity invoiceData={job?.offer[0]} />
            )}

        </div>
    );
};

export default Jobslider;
