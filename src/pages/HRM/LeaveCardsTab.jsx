import React, { useState, useEffect, useContext, useMemo } from 'react';
import axios from 'axios';
import { apiPath } from '../../../apiPath';
import { UserContext } from '../../UserContext';
import {
  Dialog,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import GridViewIcon from '@mui/icons-material/GridView';
import TableRowsIcon from '@mui/icons-material/TableRows';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import Loader from '../../common/Loader';
import toast from 'react-hot-toast';

const LeaveCardsTab = () => {
  const { userData, username, id, isAdmin, role } = useContext(UserContext) || {};
  const isUserAdmin = isAdmin || role === 'Admin' || userData?.role === 'Admin';

  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('table');

  // Adjust quota modal
  const [editingCard, setEditingCard] = useState(null);
  const [editEntitlement, setEditEntitlement] = useState(12);
  const [editNotes, setEditNotes] = useState('');
  const [savingQuota, setSavingQuota] = useState(false);

  // Fetch balances
  const fetchBalances = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await axios.get(`${apiPath}/api/leave/balances?year=${selectedYear}`, { headers });
      setBalances(res.data?.data || []);
    } catch (err) {
      console.error('Error fetching leave balances:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalances();
  }, [selectedYear]);

  // Filter balances
  const filteredBalances = useMemo(() => {
    return balances.filter((b) => {
      const empName = (b.employeeName || b.employee?.username || '').toLowerCase();
      const empEmail = (b.employee?.email || '').toLowerCase();
      const q = searchTerm.toLowerCase().trim();
      return empName.includes(q) || empEmail.includes(q);
    });
  }, [balances, searchTerm]);

  // Open Edit Modal
  const handleOpenEdit = (card) => {
    setEditingCard(card);
    setEditEntitlement(card.annualEntitlement !== undefined ? card.annualEntitlement : 12);
    setEditNotes(card.notes || '');
  };

  // Save Quota
  const handleSaveQuota = async (e) => {
    e.preventDefault();
    if (!editingCard) return;

    setSavingQuota(true);
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const empId = editingCard.employeeId?._id || editingCard.employeeId || editingCard.employee?._id;

      await axios.put(
        `${apiPath}/api/leave/balances/${empId}`,
        {
          annualEntitlement: editEntitlement,
          notes: editNotes.trim(),
          year: selectedYear,
        },
        { headers }
      );

      toast.success('Leave quotas updated successfully!');
      setEditingCard(null);
      fetchBalances();
    } catch (err) {
      console.error('Error saving quota:', err);
      toast.error(err.response?.data?.error || 'Failed to update leave quotas');
    } finally {
      setSavingQuota(false);
    }
  };

  const getInitials = (name = '') => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase() || 'LC';
  };

  return (
    <div className="space-y-6 font-sans">
      {loading && <Loader />}

      {/* Control Bar: Search, Year Selector, View Mode Toggle */}
      <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <SearchIcon
            style={{ fontSize: 18 }}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search employee leave card..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-primary focus:outline-none"
          />
        </div>

        {/* Year Selector & View Toggle */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase">Year:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              {[2025, 2026, 2027].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition ${viewMode === 'table'
                  ? 'bg-white dark:bg-boxdark text-primary shadow-xs'
                  : 'text-slate-400 hover:text-slate-600'
                }`}
              title="Table View"
            >
              <TableRowsIcon style={{ fontSize: 16 }} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition ${viewMode === 'grid'
                  ? 'bg-white dark:bg-boxdark text-primary shadow-xs'
                  : 'text-slate-400 hover:text-slate-600'
                }`}
              title="Grid Cards View"
            >
              <GridViewIcon style={{ fontSize: 16 }} />
            </button>
          </div>
        </div>
      </div>

      {/* Grid Mode: Employee Leave Cards */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBalances.length > 0 ? (
            filteredBalances.map((card) => {
              const name = card.employeeName || card.employee?.username || 'Employee';
              const email = card.employee?.email || '';
              const userRole = card.employee?.role || 'Staff';

              const ent = card.annualEntitlement !== undefined ? card.annualEntitlement : 24;
              const used = card.usedDays || 0;
              const remaining = Math.max(0, ent - used);
              const percentUsed = Math.min(100, Math.round((used / (ent || 1)) * 100));

              const breakdown = card.usedBreakdown || {};

              return (
                <div
                  key={card._id}
                  className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark p-5 shadow-xs space-y-4 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Card Header: Avatar, Name, Edit Button */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-primary to-indigo-500 text-white font-extrabold flex items-center justify-center text-sm shadow-sm flex-shrink-0">
                          {getInitials(name)}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-slate-800 dark:text-white">
                            {name}
                          </h4>
                          <p className="text-[11px] text-slate-400">{email || userRole}</p>
                        </div>
                      </div>

                      {isUserAdmin && (
                        <button
                          onClick={() => handleOpenEdit(card)}
                          className="p-2 rounded-xl text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                          title="Adjust Leave Quotas"
                        >
                          <EditIcon style={{ fontSize: 16 }} />
                        </button>
                      )}
                    </div>

                    {/* Progress Bar (Used vs Total) */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-500 dark:text-slate-400">
                          Used: <strong>{used}</strong> / {ent} Days
                        </span>
                        <span className="font-bold text-primary">{percentUsed}%</span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-primary to-indigo-500 transition-all duration-500"
                          style={{ width: `${percentUsed}%` }}
                        />
                      </div>
                    </div>

                    {/* 3 Core Balance Metrics Grid */}
                    <div className="grid grid-cols-3 gap-2 pt-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">
                          Entitlement
                        </span>
                        <span className="font-extrabold text-slate-800 dark:text-white mt-0.5 block">
                          {ent} Days
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">
                          Used / Taken
                        </span>
                        <span className="font-extrabold text-amber-600 mt-0.5 block">
                          {used} Days
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60">
                        <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase block">
                          Remaining Balance
                        </span>
                        <span className="font-extrabold text-emerald-600 dark:text-emerald-300 mt-0.5 block">
                          {remaining} Days
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer: Breakdown Badges */}
                  <div className="pt-3 border-t border-slate-100 dark:border-strokedark flex items-center justify-between text-[11px] text-slate-500">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 font-bold text-[10px]">
                        Annual: {breakdown.annual || 0}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 font-bold text-[10px]">
                        Sick: {breakdown.sick || 0}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 font-bold text-[10px]">
                        Casual: {breakdown.casual || 0}
                      </span>
                    </div>

                    {card.pendingDays > 0 && (
                      <span className="text-[10px] font-bold text-amber-600" title="Days in pending request">
                        {card.pendingDays}d pending
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-12 text-center text-slate-400 italic bg-white dark:bg-boxdark rounded-2xl border border-slate-200 dark:border-strokedark">
              No leave cards found matching your search.
            </div>
          )}
        </div>
      ) : (
        /* Table Mode */
        <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark p-5 shadow-xs overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                <th className="py-2.5 px-3">Employee</th>
                <th className="py-2.5 px-3">Annual Entitlement</th>
                <th className="py-2.5 px-3">Used Days</th>
                <th className="py-2.5 px-3">Remaining Balance</th>
                <th className="py-2.5 px-3">Breakdown</th>
                {isUserAdmin && <th className="py-2.5 px-3 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {filteredBalances.length > 0 ? (
                filteredBalances.map((card) => {
                  const name = card.employeeName || card.employee?.username || 'Employee';
                  const ent = card.annualEntitlement !== undefined ? card.annualEntitlement : 24;
                  const used = card.usedDays || 0;
                  const remaining = Math.max(0, ent - used);
                  const breakdown = card.usedBreakdown || {};

                  return (
                    <tr key={card._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-primary text-white font-bold flex items-center justify-center text-xs shadow-xs">
                            {getInitials(name)}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 dark:text-slate-100">{name}</p>
                            <p className="text-[10px] text-slate-400">{card.employee?.email || ''}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-700 dark:text-slate-200">
                        {ent} Days
                      </td>
                      <td className="py-3 px-3 font-bold text-amber-500">
                        {used} Days
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2.5 py-1 rounded-full font-extrabold text-[11px] bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200">
                          {remaining} Days Remaining
                        </span>
                      </td>
                      <td className="py-3 px-3 text-[11px] text-slate-500">
                        Annual: {breakdown.annual || 0} | Sick: {breakdown.sick || 0} | Casual: {breakdown.casual || 0}
                      </td>
                      {isUserAdmin && (
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => handleOpenEdit(card)}
                            className="px-3 py-1 rounded-lg text-xs font-bold bg-slate-100 hover:bg-primary hover:text-white transition cursor-pointer"
                          >
                            Adjust Quota
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={isUserAdmin ? 6 : 5} className="py-12 text-center text-slate-400 italic">
                    No leave cards found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Admin Edit / Adjust Quota Modal */}
      {editingCard && (
        <Dialog
          open={Boolean(editingCard)}
          onClose={() => setEditingCard(null)}
          maxWidth="xs"
          fullWidth
          PaperProps={{
            style: {
              borderRadius: '24px',
              overflow: 'hidden',
            },
          }}
        >
          <div className="relative bg-gradient-to-r from-primary to-indigo-700 p-6 text-white">
            <IconButton
              onClick={() => setEditingCard(null)}
              style={{
                position: 'absolute',
                top: 14,
                right: 14,
                color: 'white',
                backgroundColor: 'rgba(255,255,255,0.15)',
              }}
              size="small"
            >
              <CloseIcon fontSize="small" />
            </IconButton>

            <h3 className="text-lg font-bold">Adjust Leave Quotas</h3>
            <p className="text-xs opacity-90 mt-0.5">
              Employee: <strong>{editingCard.employeeName || editingCard.employee?.username}</strong> ({selectedYear})
            </p>
          </div>

          <form onSubmit={handleSaveQuota} className="p-6 space-y-4 bg-white dark:bg-boxdark text-slate-700 dark:text-slate-200 text-xs">
            <div>
              <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">
                Annual PTO Entitlement (Days) *
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={editEntitlement}
                onChange={(e) => setEditEntitlement(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none"
                required
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Standard annual allocated vacation days (e.g. 12.0).
              </span>
            </div>

            <div>
              <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">
                Administrative Notes (Optional)
              </label>
              <textarea
                rows={2}
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Remarks about contract changes or special quota approvals..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            {/* Total calculation preview */}
            <div className="p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-between font-bold">
              <span>Annual Entitlement:</span>
              <span className="text-primary text-sm font-extrabold">
                {editEntitlement} Days
              </span>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditingCard(null)}
                disabled={savingQuota}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingQuota}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-primary hover:bg-primary/90 text-white shadow-md shadow-primary/25 transition"
              >
                {savingQuota ? 'Saving Quota...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Dialog>
      )}
    </div>
  );
};

export default LeaveCardsTab;
