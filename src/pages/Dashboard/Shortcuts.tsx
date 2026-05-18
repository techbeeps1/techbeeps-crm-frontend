import React, { useState } from 'react';
import PersonIcon from '@mui/icons-material/Person';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ConstructionIcon from '@mui/icons-material/Construction';
import ArchitectureIcon from '@mui/icons-material/Architecture';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import NewCustomer from '../customerDetails/NewCustomer';
import { Link } from 'react-router-dom';

const Shortcuts: React.FC = () => {
    const [open, setOpen] = useState(false);
    return (
        <div className="max-w-lg overflow-y-auto" style={{ maxHeight: `calc(100vh - 100px)` }}>
            <div className="grid gap-4">
                <Link to="/intake">
                <div className="flex flex-col items-center justify-center p-4 bg-white rounded-md shadow hover:bg-gray hover:border cursor-pointer">
                    <div className="text-5xl mb-2"><ArchitectureIcon fontSize="inherit" /></div>
                    <span className="text-center text-lg font-medium text-black">New Valuation</span>
                </div>
                </Link>
                <div onClick={() => setOpen(true)} className="flex flex-col items-center justify-center p-4 bg-white rounded-md shadow hover:bg-gray hover:border cursor-pointer">
                    <div className="text-5xl mb-2"><PersonIcon fontSize="inherit" /></div>
                    <span className="text-center text-lg font-medium text-black">New customer</span>
                </div>
                <Link to="/jobs">
                <div className="flex flex-col items-center justify-center p-4 bg-white rounded-md shadow hover:bg-gray hover:border cursor-pointer">
                    <div className="text-5xl mb-2"><LocalShippingIcon fontSize="inherit" /></div>
                    <span className="text-center text-lg font-medium text-black">New Job</span>
                </div>
                </Link>
                <Link to="/jobs">
                <div className="flex flex-col items-center justify-center p-4 bg-white rounded-md shadow hover:bg-gray hover:border cursor-pointer">
                    <div className="text-5xl mb-2"><ConstructionIcon fontSize="inherit" /></div>
                    <span className="text-center text-lg font-medium text-black">New moving lift job</span>
                </div>
                </Link>
                <Link to="/new_offer">
                <div className="flex flex-col items-center justify-center p-4 bg-white rounded-md shadow hover:bg-gray hover:border cursor-pointer">
                    <div className="text-5xl mb-2"><AddCircleIcon fontSize="inherit" /></div>
                    <span className="text-center text-lg font-medium text-black">New Offer</span>
                </div>
                </Link>
            </div>
            <div style={{ display: 'none' }}>
                <NewCustomer setOpen={setOpen} open={open} handler={console.log('customer Created')} type='Customer' />
            </div>
        </div>
    );
};

export default Shortcuts;
