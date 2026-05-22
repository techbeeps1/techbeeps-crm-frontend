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
        <div className="overflow-y-auto mt-5">

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-7">

    <Link to="/intake">
        <div className="group relative overflow-hidden bg-white rounded-[16px] p-5  cursor-pointer shadow-[0_10px_40px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_60px_rgba(59,130,246,0.15)] transition-all duration-500 hover:-translate-y-2">
            
            <div className="absolute top-0 right-0 w-40 h-40 bg-blue-100 rounded-full blur-[80px] opacity-40 group-hover:scale-125 transition duration-700" />

            <div className="relative z-10">
                <div className="w-20 h-20 rounded-[24px] mx-auto bg-gradient-to-br from-sky-500 to-green-400 text-white flex items-center justify-center text-5xl shadow-lg">
                    <ArchitectureIcon fontSize="inherit" />
                </div>

                <div className="mt-5">
                    <h2 className="text-xl font-bold text-gray-800 text-center">
                        New Valuation
                    </h2>
                </div>


            </div>
        </div>
    </Link>


    <div
        onClick={() => setOpen(true)}
        className="group relative overflow-hidden bg-white rounded-[16px] p-5  cursor-pointer shadow-[0_10px_40px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_60px_rgba(168,85,247,0.15)] transition-all duration-500 hover:-translate-y-2"
    >
        <div className="absolute top-0 right-0 w-40 h-40 bg-purple-100 rounded-full blur-[80px] opacity-40 group-hover:scale-125 transition duration-700" />

        <div className="relative z-10">
            <div className="w-20 h-20 rounded-[24px] mx-auto bg-gradient-to-br from-purple-500 to-pink-500 text-white flex items-center justify-center text-5xl shadow-lg">
                <PersonIcon fontSize="inherit" />
            </div>

            <div className="mt-5">
                <h2 className="text-xl font-bold text-gray-800 text-center">
                    New Customer
                </h2>


            </div>

        </div>
    </div>


    <Link to="/jobs">
        <div className="group relative overflow-hidden bg-white rounded-[16px] p-5  cursor-pointer shadow-[0_10px_40px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_60px_rgba(34,197,94,0.15)] transition-all duration-500 hover:-translate-y-2">

            <div className="absolute top-0 right-0 w-40 h-40 bg-green-100 rounded-full blur-[80px] opacity-40 group-hover:scale-125 transition duration-700" />

            <div className="relative z-10">
                <div className="w-20 h-20 rounded-[24px] mx-auto bg-gradient-to-br from-green-500 to-emerald-400 text-white flex items-center justify-center text-5xl shadow-lg">
                    <LocalShippingIcon fontSize="inherit" />
                </div>

                <div className="mt-5">
                    <h2 className="text-xl font-bold text-gray-800 text-center">
                        New Job
                    </h2>

                </div>
            </div>
        </div>
    </Link>


    <Link to="/jobs">
        <div className="group relative overflow-hidden bg-white rounded-[16px] p-5  cursor-pointer shadow-[0_10px_40px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_60px_rgba(249,115,22,0.15)] transition-all duration-500 hover:-translate-y-2">

            <div className="absolute top-0 right-0 w-40 h-40 bg-orange-100 rounded-full blur-[80px] opacity-40 group-hover:scale-125 transition duration-700" />

            <div className="relative z-10">
                <div className="w-20 h-20 rounded-[24px] mx-auto bg-gradient-to-br from-orange-500 to-red-400 text-white flex items-center justify-center text-5xl shadow-lg">
                    <ConstructionIcon fontSize="inherit" />
                </div>

                <div className="mt-5">
                    <h2 className="text-xl font-bold text-gray-800 text-center">
                        Moving Lift Job
                    </h2>

           
                </div>

            </div>
        </div>
    </Link>


    <Link to="/new_offer">
        <div className="group relative overflow-hidden bg-white rounded-[16px] p-5  cursor-pointer shadow-[0_10px_40px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_60px_rgba(236,72,153,0.15)] transition-all duration-500 hover:-translate-y-2">

            <div className="absolute top-0 right-0 w-40 h-40 bg-pink-100 rounded-full blur-[80px] opacity-40 group-hover:scale-125 transition duration-700" />

            <div className="relative z-10">
                <div className="w-20 h-20 rounded-[24px] mx-auto bg-gradient-to-br from-pink-500 to-rose-400 text-white flex items-center justify-center text-5xl shadow-lg">
                    <AddCircleIcon fontSize="inherit" />
                </div>

                <div className="mt-5">
                    <h2 className="text-xl font-bold text-gray-800 text-center">
                        New Offer
                    </h2>

             
                </div>

            </div>
        </div>
    </Link>

</div>
            
            <div className='hidden'>
                <NewCustomer setOpen={setOpen} open={open} handler={console.log('customer Created')} type='Customer' />
            </div>
        </div>
    );
};

export default Shortcuts;
