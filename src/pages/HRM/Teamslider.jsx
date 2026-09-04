import React, { useEffect, useState } from 'react';
import { apiPath } from '../../../apiPath';
import { Autocomplete, Chip, TextField } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import {
  FiUsers,
  FiTrash2,
  FiEdit2,
  FiX,
  FiUserCheck,
  FiLayers,
} from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-toastify';

const TeamSlider = ({ selectedStaff, onClose, Ondelete, isEdited }) => {
  const [selectedStaffData, setSelectedStaff] = useState(selectedStaff);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    setSelectedStaff(selectedStaff);
  }, [selectedStaff]);

  const { control, register, handleSubmit, reset } = useForm();

  const openEditModal = () => {
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
  };

  const onEditSubmit = async (formData) => {
    const members = (formData.members || []).map((member) => member.value || member);
    try {
      const response = await axios.put(
        `${apiPath}/api/teams/${selectedStaffData._id}`,
        { teamName: formData.teamName, members: members }
      );
      toast.success('Team updated successfully');
      setSelectedStaff((prev) => ({
        ...prev,
        teamName: formData.teamName,
        members: (formData.members || []).map((m) => ({
          username: m.label || m.username,
          _id: m.value || m._id,
        })),
      }));
      if (isEdited) isEdited();
    } catch (err) {
      console.error('Failed to update team:', err);
      toast.error('Failed to update team');
    } finally {
      closeEditModal();
    }
  };

  const handleAllEmployee = async () => {
    try {
      const response = await axios.get(`${apiPath}/user/all`);
      const employees = (response.data || []).map((employee) => ({
        label: employee.username,
        value: employee._id,
      }));
      setRoles(employees);
    } catch (err) {
      console.error('Failed to fetch employees:', err);
    }
  };

  useEffect(() => {
    handleAllEmployee();
  }, []);

  useEffect(() => {
    if (selectedStaff) {
      reset({
        teamName: selectedStaff.teamName || '',
        members:
          selectedStaff.members?.map((member) => ({
            label: member.username,
            value: member._id,
          })) || [],
      });
    }
  }, [selectedStaff, reset]);

  if (!selectedStaffData) return null;

  const initial = (selectedStaffData.teamName || 'T').charAt(0).toUpperCase();

  return (
    <div className="w-full flex flex-col h-full bg-white dark:bg-boxdark rounded-2xl overflow-hidden font-sans">
      {/* Header Profile Section */}
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-primary/20 shrink-0">
              {initial}
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">
                {selectedStaffData.teamName}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-primary/10 text-primary border border-primary/20">
                  <FiUsers className="text-[10px]" />
                  {selectedStaffData?.members?.length || 0} Members
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={openEditModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs text-white bg-primary hover:bg-primary/90 shadow-xs active:scale-[0.98] transition-all cursor-pointer"
            >
              <FiEdit2 className="text-xs" />
              <span>Edit</span>
            </button>

            <button
              onClick={() => Ondelete(selectedStaffData)}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all cursor-pointer"
              title="Delete Team"
            >
              <FiTrash2 className="text-lg" />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
              title="Close panel"
            >
              <FiX className="text-lg" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
        {/* Team Details Card */}
        <div className="bg-slate-50/70 dark:bg-slate-800/40 rounded-2xl border border-slate-200/70 dark:border-slate-700/60 p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/50 dark:border-slate-700/50">
            <div className="flex items-center gap-2">
              <FiLayers className="text-primary text-sm" />
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Team Overview
              </h4>
            </div>
            <span className="text-xs text-slate-400 font-medium">
              ID: {selectedStaffData._id?.slice(-6)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-400 block mb-0.5">Team Name</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {selectedStaffData.teamName}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Capacity</span>
              <span className="font-bold text-primary">
                {selectedStaffData?.members?.length || 0} Members assigned
              </span>
            </div>
          </div>
        </div>

        {/* Members Grid Card */}
        <div className="bg-slate-50/70 dark:bg-slate-800/40 rounded-2xl border border-slate-200/70 dark:border-slate-700/60 p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/50 dark:border-slate-700/50">
            <div className="flex items-center gap-2">
              <FiUsers className="text-primary text-sm" />
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Assigned Team Members
              </h4>
            </div>
          </div>

          {selectedStaffData?.members && selectedStaffData.members.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {selectedStaffData.members.map((member, index) => {
                const memberInitial = (member.username || 'U').charAt(0).toUpperCase();
                return (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs hover:border-primary/50 transition-all"
                  >
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-blue-500 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                      {memberInitial}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate">
                        {member.username}
                      </p>
                      <p className="text-[10px] text-slate-400">Team Member</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-3 text-center">
              No members assigned to this team yet.
            </p>
          )}
        </div>
      </div>

      {/* Edit Team Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-999 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-boxdark rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 border border-slate-100 dark:border-strokedark relative">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-lg font-bold">
                  <FiUserCheck />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Edit Team Information
                  </h3>
                  <p className="text-xs text-slate-500">Update team name and assigned members</p>
                </div>
              </div>
              <button
                onClick={closeEditModal}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                <FiX className="text-lg" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onEditSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Team Name *
                </label>
                <input
                  type="text"
                  {...register('teamName', { required: true })}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Team Members
                </label>
                <Controller
                  name="members"
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      {...field}
                      multiple
                      options={roles}
                      defaultValue={selectedStaff?.members || []}
                      isOptionEqualToValue={(option, value) => option.value === value.value}
                      getOptionLabel={(option) => option.label}
                      onChange={(_, data) => field.onChange(data)}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                          <Chip
                            label={option.label}
                            {...getTagProps({ index })}
                            key={option.value}
                            size="small"
                            className="bg-primary/10 text-primary font-bold"
                          />
                        ))
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Select members..."
                          size="small"
                          className="bg-slate-50 dark:bg-slate-800 rounded-xl"
                        />
                      )}
                    />
                  )}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs shadow-md shadow-primary/25 active:scale-[0.98] transition-all cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamSlider;
