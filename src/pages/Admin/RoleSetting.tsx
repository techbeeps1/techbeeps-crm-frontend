import { useContext, useEffect, useState } from 'react';
import { apiPath } from '../../../apiPath';
import { toast } from 'react-toastify';
import axios from 'axios';
import Loader from '../../common/Loader';
import {
  IconButton,
  Modal,
  Box,
} from '@mui/material';
import {
  MdOutlineAdminPanelSettings,
  MdSearch,
  MdEdit,
  MdClose,
  MdPerson,
  MdCheckCircle,
  MdSecurity,
  MdSave,
  MdShield
} from 'react-icons/md';
import { useForm, Controller } from 'react-hook-form';

interface RoleOption {
  label: string;
  value: string;
}

const roles: RoleOption[] = [
  { label: 'Dashboard', value: 'Dashboard' },
  { label: 'Tasks', value: 'Tasks' },
  { label: 'Leads', value: 'Leads' },
  { label: 'To do', value: 'To do' },
  { label: 'Customer', value: 'Customer' },
  { label: 'Planning', value: 'Planning' },
  { label: 'Finance', value: 'Finance' },
  { label: 'Resources', value: 'Resources' },
  { label: 'HRM', value: 'HRM' },
  { label: 'Communication', value: 'Communication' },
  { label: 'Profile', value: 'Profile' },
  { label: 'Features', value: 'Features' },
  { label: 'Settings', value: 'Settings' },
  { label: 'Notifications', value: 'Notifications' },
];

const RoleSettings = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const { control, register, handleSubmit, reset, setValue, watch } = useForm();

  const watchedAccess = watch('access') || [];

  const notifyError = (message: string) =>
    toast.error(message, {
      autoClose: 2000,
    });

  const openEditModal = (user: any) => {
    setSelectedUser(user);
    const userAccess = Array.isArray(user.access) ? user.access : [];
    reset({
      firstName: user.firstName || user.username || '',
      role: user.role || 'Staff',
      access: userAccess,
    });
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setSelectedUser(null);
  };

  const toggleAccessModule = (moduleValue: string) => {
    const current = watch('access') || [];
    if (current.includes(moduleValue)) {
      setValue('access', current.filter((v: string) => v !== moduleValue));
    } else {
      setValue('access', [...current, moduleValue]);
    }
  };

  const toggleAllAccess = () => {
    const current = watch('access') || [];
    if (current.length === roles.length) {
      setValue('access', []);
    } else {
      setValue('access', roles.map((r) => r.value));
    }
  };

  const onEditSubmit = async (formData: any) => {
    if (!selectedUser) return;
    setSaving(true);
    try {
      const payload = {
        id: selectedUser._id,
        ...formData,
        access: formData.access,
      };
      const response = await axios.post(`${apiPath}/user/update`, payload);
      toast.success(response.data.msg || 'User privileges updated successfully!');
      fetchUsers();
      closeEditModal();
    } catch (err: any) {
      console.error('Failed to update user:', err);
      notifyError(err.response?.data?.msg || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${apiPath}/user/all`);
      setData(response.data || []);
    } catch (err: any) {
      notifyError(`Failed to fetch users: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = data.filter((user) => {
    const nameMatch = (user.username || user.firstName || '')
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const roleMatch =
      roleFilter === 'All' ||
      (user.role || '').toLowerCase() === roleFilter.toLowerCase();
    return nameMatch && roleMatch;
  });

  const getRoleBadge = (roleName: string) => {
    const role = (roleName || 'Staff').toLowerCase();
    if (role === 'admin') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50">
          <MdShield className="text-xs" /> Admin
        </span>
      );
    }
    if (role === 'agent') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50">
          <MdSecurity className="text-xs" /> Agent
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
        <MdPerson className="text-xs" /> Staff
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {loading && <Loader />}

      {/* Header info */}
      <div className="border-b border-stroke dark:border-strokedark pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-black dark:text-white flex items-center gap-2">
            <MdOutlineAdminPanelSettings className="text-primary text-2xl" />
            User Roles & Access Permissions
          </h3>
          <p className="text-sm text-body dark:text-bodydark mt-1">
            Control employee access levels and assign specific module permissions across the CRM.
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-2/70 dark:bg-meta-4/20 p-4 rounded-2xl border border-stroke dark:border-strokedark">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <MdSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by staff name or username..."
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-form-input text-black dark:text-white rounded-xl border border-stroke dark:border-strokedark outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-xs sm:text-sm font-medium"
          />
        </div>

        {/* Role Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-white dark:bg-boxdark p-1 rounded-xl border border-stroke dark:border-strokedark self-start sm:self-auto">
          {['All', 'Admin', 'Agent', 'Staff'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setRoleFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                roleFilter === tab
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white hover:bg-slate-100 dark:hover:bg-meta-4'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Modern Users Table */}
      <div className="overflow-hidden rounded-2xl border border-stroke dark:border-strokedark bg-white dark:bg-boxdark shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stroke dark:border-strokedark bg-gray-2/50 dark:bg-meta-4/30 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="py-3.5 px-5">Team Member</th>
                <th className="py-3.5 px-5">Assigned Role</th>
                <th className="py-3.5 px-5">Module Access & Permissions</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stroke dark:divide-strokedark text-sm">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-body dark:text-bodydark text-sm">
                    No staff members match the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((item: any) => {
                  const accessList = Array.isArray(item.access) ? item.access : [];
                  return (
                    <tr
                      key={item._id}
                      className="hover:bg-gray-2/40 dark:hover:bg-meta-4/20 transition-colors"
                    >
                      {/* Name & Avatar */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary/20 to-blue-500/20 text-primary flex items-center justify-center font-bold text-sm shrink-0 border border-primary/20">
                            {(item.username || item.firstName || 'U')[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-black dark:text-white">
                              {item.username || item.firstName || 'Unnamed User'}
                            </p>
                            {item.email && (
                              <p className="text-xs text-body dark:text-bodydark">{item.email}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-4 px-5">{getRoleBadge(item.role)}</td>

                      {/* Access Pills */}
                      <td className="py-4 px-5">
                        <div className="flex flex-wrap gap-1.5 max-w-md">
                          {accessList.length === 0 ? (
                            <span className="text-xs text-slate-400 italic">No modules granted</span>
                          ) : (
                            accessList.slice(0, 6).map((acc: string) => (
                              <span
                                key={acc}
                                className="px-2 py-0.5 bg-slate-100 dark:bg-meta-4 text-slate-700 dark:text-slate-200 rounded-md text-[11px] font-medium border border-slate-200 dark:border-strokedark"
                              >
                                {acc}
                              </span>
                            ))
                          )}
                          {accessList.length > 6 && (
                            <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-md text-[11px] font-bold">
                              +{accessList.length - 6} more
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Action */}
                      <td className="py-4 px-5 text-right">
                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary text-primary hover:text-white transition-all text-xs font-bold cursor-pointer"
                        >
                          <MdEdit className="text-sm" />
                          Edit Role
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Role Modal */}
      <Modal open={isEditModalOpen} onClose={closeEditModal}>
        <Box className="fixed inset-0 flex items-center justify-center p-4 z-99999 outline-none">
          <div className="bg-white dark:bg-boxdark rounded-2xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-stroke dark:border-strokedark relative max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              type="button"
              onClick={closeEditModal}
              className="absolute top-5 right-5 text-slate-400 hover:text-black dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-meta-4 transition-colors cursor-pointer"
            >
              <MdClose className="text-xl" />
            </button>

            {/* Modal Title */}
            <div className="flex items-center gap-3 mb-5 border-b border-stroke dark:border-strokedark pb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-xl shrink-0">
                <MdShield />
              </div>
              <div>
                <h3 className="text-lg font-bold text-black dark:text-white">
                  Edit Role & Access Permissions
                </h3>
                <p className="text-xs text-body dark:text-bodydark">
                  Configure privileges for{' '}
                  <span className="font-semibold text-black dark:text-white">
                    {selectedUser?.username || selectedUser?.firstName}
                  </span>
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit(onEditSubmit)} className="space-y-5">
              {/* User Name (Read-only) */}
              <div>
                <label className="block text-xs font-bold text-black dark:text-white mb-1.5">
                  User Account Name
                </label>
                <input
                  {...register('firstName')}
                  disabled
                  className="w-full bg-gray-2 dark:bg-meta-4 text-slate-500 dark:text-slate-400 rounded-xl border border-stroke dark:border-strokedark py-2.5 px-4 text-sm font-medium cursor-not-allowed"
                />
              </div>

              {/* Role Select */}
              <div>
                <label className="block text-xs font-bold text-black dark:text-white mb-1.5">
                  Assigned Security Role <span className="text-meta-1">*</span>
                </label>
                <Controller
                  name="role"
                  control={control}
                  rules={{ required: 'Role is required' }}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="w-full bg-white dark:bg-form-input text-black dark:text-white rounded-xl border border-stroke dark:border-strokedark py-2.5 px-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm font-medium"
                    >
                      <option value="Staff">Staff (Standard CRM Access)</option>
                      <option value="Agent">Agent (Assigned Tasks & Leads)</option>
                      <option value="Admin">Admin (Full System Privilege)</option>
                    </select>
                  )}
                />
              </div>

              {/* Module Access Multi-Select Chips */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-black dark:text-white">
                    Module Access Rights ({watchedAccess.length}/{roles.length})
                  </label>
                  <button
                    type="button"
                    onClick={toggleAllAccess}
                    className="text-xs text-primary font-bold hover:underline cursor-pointer"
                  >
                    {watchedAccess.length === roles.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-gray-2/60 dark:bg-meta-4/20 p-3.5 rounded-2xl border border-stroke dark:border-strokedark max-h-48 overflow-y-auto">
                  {roles.map((r) => {
                    const isChecked = watchedAccess.includes(r.value);
                    return (
                      <button
                        type="button"
                        key={r.value}
                        onClick={() => toggleAccessModule(r.value)}
                        className={`flex items-center justify-between p-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          isChecked
                            ? 'bg-primary text-white border-primary shadow-xs'
                            : 'bg-white dark:bg-boxdark text-slate-700 dark:text-slate-300 border-stroke dark:border-strokedark hover:border-slate-300'
                        }`}
                      >
                        <span className="truncate">{r.label}</span>
                        {isChecked && <MdCheckCircle className="text-white shrink-0 ml-1 text-sm" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stroke dark:border-strokedark">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border border-stroke dark:border-strokedark text-slate-700 dark:text-slate-200 hover:bg-gray-2 dark:hover:bg-strokedark transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 bg-primary hover:bg-opacity-90 text-white font-semibold py-2.5 px-6 rounded-xl shadow-md shadow-primary/25 transition-all cursor-pointer disabled:opacity-50"
                >
                  <MdSave className="text-base" />
                  {saving ? 'Saving...' : 'Save Privileges'}
                </button>
              </div>
            </form>
          </div>
        </Box>
      </Modal>
    </div>
  );
};

export default RoleSettings;

