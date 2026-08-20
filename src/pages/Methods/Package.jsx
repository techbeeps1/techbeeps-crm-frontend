import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { apiPath } from '../../../apiPath';
import { Modal, Box, Menu, MenuItem } from '@mui/material';
import { toast } from 'react-toastify';
import NewPackageModal from './NewPackage';
import NewPackjob from './Newpackjob';
import EditPacknoJob from './Editforms/EditPacknoJob';
import EditwithJob from './Editforms/EditwithJob';
import {
  MdInventory2,
  MdAdd,
  MdEdit,
  MdDeleteOutline,
  MdClose,
  MdSearch,
  MdWorkOutline,
  MdWarningAmber,
  MdArrowDropDown
} from 'react-icons/md';

const Packages = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [isNewPackageModalOpen, setIsNewPackageModalOpen] = useState(false);
  const [isNewJobModalOpen, setIsNewJobModalOpen] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [packagedata, setPackageData] = useState(null);
  const [Editone, setEditone] = useState(false);
  const [Edittwo, setEdittwo] = useState(false);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleOpenNewPackageModal = () => {
    handleClose();
    setIsNewPackageModalOpen(true);
  };

  const handleOpenNewJobModal = () => {
    handleClose();
    setIsNewJobModalOpen(true);
  };

  const openDeleteModal = (item) => {
    setSelectedAgent(item);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
  };

  const deletePackage = async (id) => {
    try {
      await axios.delete(`${apiPath}/api/packages/${id}`);
      toast.success('Package deleted successfully');
      closeDeleteModal();
      handleAllPackage();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error deleting package');
    }
  };

  const handleAllPackage = async () => {
    try {
      const response = await axios.get(`${apiPath}/api/packages`);
      setData(response.data || []);
    } catch (err) {
      toast.error('Failed to fetch packages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleAllPackage();
  }, [Editone, Edittwo, isDeleteModalOpen, isNewJobModalOpen, isNewPackageModalOpen]);

  const filteredPackages = data.filter((item) => {
    const query = searchTerm.toLowerCase();
    return (
      (item.name || '').toLowerCase().includes(query) ||
      (item.type_job || '').toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-2/70 dark:bg-meta-4/20 p-4 rounded-2xl border border-stroke dark:border-strokedark">
        <div className="relative flex-1 max-w-md">
          <MdSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search quotation packages..."
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-form-input text-black dark:text-white rounded-xl border border-stroke dark:border-strokedark outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-xs sm:text-sm font-medium"
          />
        </div>

        <div>
          <button
            type="button"
            onClick={handleClick}
            className="flex items-center gap-2 bg-primary hover:bg-opacity-90 text-white font-semibold py-2.5 px-5 rounded-xl shadow-md shadow-primary/25 transition-all cursor-pointer text-xs sm:text-sm"
          >
            <MdAdd className="text-lg" />
            <span>Create Package</span>
            <MdArrowDropDown className="text-lg -ml-1" />
          </button>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            PaperProps={{
              className: 'dark:bg-boxdark rounded-2xl shadow-xl border border-stroke dark:border-strokedark mt-2 text-sm',
            }}
          >
            <MenuItem
              onClick={handleOpenNewPackageModal}
              className="text-xs sm:text-sm font-medium py-2.5 px-4 hover:bg-primary/10 hover:text-primary transition-colors"
            >
              Standard Package (No Job)
            </MenuItem>
            <MenuItem
              onClick={handleOpenNewJobModal}
              className="text-xs sm:text-sm font-medium py-2.5 px-4 hover:bg-primary/10 hover:text-primary transition-colors"
            >
              Custom Package (With Job Details)
            </MenuItem>
          </Menu>
        </div>

        <NewPackageModal
          open={isNewPackageModalOpen}
          onClose={() => setIsNewPackageModalOpen(false)}
        />
        <NewPackjob
          open={isNewJobModalOpen}
          onClose={() => setIsNewJobModalOpen(false)}
        />
      </div>

      {/* Packages Table */}
      <div className="overflow-hidden rounded-2xl border border-stroke dark:border-strokedark bg-white dark:bg-boxdark shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stroke dark:border-strokedark bg-gray-2/50 dark:bg-meta-4/30 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="py-3.5 px-5">Package Name</th>
                <th className="py-3.5 px-5">Job Scope Type</th>
                <th className="py-3.5 px-5">Price Agreement</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stroke dark:divide-strokedark text-sm">
              {filteredPackages.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-body dark:text-bodydark text-sm">
                    No quotation packages configured yet.
                  </td>
                </tr>
              ) : (
                filteredPackages.map((item, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-2/40 dark:hover:bg-meta-4/20 transition-colors"
                  >
                    {/* Name */}
                    <td
                      onClick={() => {
                        setPackageData(item);
                        item.priceAgree ? setEdittwo(true) : setEditone(true);
                      }}
                      className="py-3.5 px-5 font-bold text-black dark:text-white cursor-pointer hover:text-primary transition-colors flex items-center gap-2.5"
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-base shrink-0">
                        <MdInventory2 />
                      </div>
                      <span>{item.name || 'Unnamed Package'}</span>
                    </td>

                    {/* Job Scope */}
                    <td className="py-3.5 px-5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-2 dark:bg-meta-4 text-slate-700 dark:text-slate-200 border border-stroke dark:border-strokedark">
                        <MdWorkOutline className="text-slate-400" />
                        {item.type_job || 'Standard'}
                      </span>
                    </td>

                    {/* Price Agreement */}
                    <td className="py-3.5 px-5 font-medium text-black dark:text-white">
                      {item.priceAgree || 'Fixed Quote'}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setPackageData(item);
                            item.priceAgree ? setEdittwo(true) : setEditone(true);
                          }}
                          className="p-2 text-slate-500 hover:text-primary hover:bg-primary/10 rounded-xl transition-colors cursor-pointer"
                          title="Edit Package"
                        >
                          <MdEdit className="text-base" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openDeleteModal(item)}
                          className="p-2 text-slate-500 hover:text-meta-1 hover:bg-meta-1/10 rounded-xl transition-colors cursor-pointer"
                          title="Delete Package"
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
      </div>

      {/* Package Editors */}
      <EditwithJob
        open={Edittwo}
        onClose={() => {
          setPackageData(null);
          setEdittwo(false);
        }}
        data={packagedata}
      />

      <EditPacknoJob
        open={Editone}
        onClose={() => {
          setPackageData(null);
          setEditone(false);
        }}
        data={packagedata}
      />

      {/* Delete Confirmation Modal */}
      <Modal open={isDeleteModalOpen} onClose={closeDeleteModal}>
        <Box className="fixed inset-0 flex items-center justify-center p-4 z-99999 outline-none">
          <div className="bg-white dark:bg-boxdark rounded-2xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-stroke dark:border-strokedark space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="w-12 h-12 rounded-2xl bg-meta-1/10 text-meta-1 flex items-center justify-center text-2xl">
              <MdWarningAmber />
            </div>
            <div>
              <h4 className="text-lg font-bold text-black dark:text-white">
                Delete Package
              </h4>
              <p className="text-xs text-body dark:text-bodydark mt-1 leading-relaxed">
                Are you sure you want to delete quotation package{' '}
                <span className="font-bold text-black dark:text-white">
                  "{selectedAgent?.name}"
                </span>
                ? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={closeDeleteModal}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold border border-stroke dark:border-strokedark text-slate-700 dark:text-slate-200 hover:bg-gray-2 dark:hover:bg-strokedark transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => deletePackage(selectedAgent._id)}
                className="px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-meta-1 hover:bg-opacity-90 text-white shadow-md shadow-meta-1/25 transition-all cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </Box>
      </Modal>
    </div>
  );
};

export default Packages;

