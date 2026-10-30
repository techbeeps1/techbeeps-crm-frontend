import React from 'react';
import { Dialog, DialogContent } from '@mui/material';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';

export interface DirtyConfirmDialogProps {
  open: boolean;
  title?: string;
  message?: string;
  discardText?: string;
  continueText?: string;
  onContinueEditing: () => void;
  onDiscardChanges: () => void;
}

export const DirtyConfirmDialog: React.FC<DirtyConfirmDialogProps> = ({
  open,
  title = 'Unsaved Changes',
  message = 'You have unsaved changes in this form. If you close now, all your entered information will be discarded. What would you like to do?',
  discardText = 'Discard Changes',
  continueText = 'Continue Editing',
  onContinueEditing,
  onDiscardChanges,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onContinueEditing}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          backgroundColor: 'transparent',
          backgroundImage: 'none',
        },
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        <div className="bg-white dark:bg-boxdark p-6 sm:p-7 border border-slate-100 dark:border-strokedark text-slate-800 dark:text-white rounded-3xl">
          {/* Header Icon & Title */}
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20 shadow-xs">
              <WarningAmberRoundedIcon style={{ fontSize: 26 }} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                {title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                {message}
              </p>
            </div>
          </div>

          {/* Action Choice Buttons */}
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onDiscardChanges}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-xs font-bold transition-all cursor-pointer order-2 sm:order-1"
            >
              <DeleteOutlineRoundedIcon style={{ fontSize: 16 }} />
              <span>{discardText}</span>
            </button>
            <button
              type="button"
              onClick={onContinueEditing}
              autoFocus
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer order-1 sm:order-2"
            >
              <EditNoteRoundedIcon style={{ fontSize: 18 }} />
              <span>{continueText}</span>
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DirtyConfirmDialog;

