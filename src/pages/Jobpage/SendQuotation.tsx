import React from 'react';
import { Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import NewOffer from '../Quotes/NewOffer';
import Editoffer from '../Quotes/Editoffer';

interface SendQuotationProps {
  open: boolean;
  onClose: () => void;
  job: any;
}

const SendQuotation: React.FC<SendQuotationProps> = ({ open, onClose, job }) => {

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      fullWidth 
      maxWidth="xl"
      PaperProps={{
        className: 'rounded-2xl max-w-7xl w-full text-slate-800 dark:text-white dark:bg-boxdark'
      }}
    >
      <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 dark:border-strokedark">
        <DialogTitle className="text-primary text-xl font-bold p-0">New Quotation Proposal</DialogTitle>
        <IconButton onClick={onClose} className="text-slate-400 hover:text-slate-600">
          <CloseIcon />
        </IconButton>
      </div>
      <DialogContent className="p-4 sm:p-6">
        {job?.offer && job.offer.length > 0 ? (
          <Editoffer display={"none"} offer={job.offer[job.offer.length - 1]} onclose={onClose} />
        ) : (
          <NewOffer display={"none"} job={job} onclose={onClose} />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SendQuotation;
