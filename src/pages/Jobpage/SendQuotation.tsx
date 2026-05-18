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
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <div className="flex justify-between items-center p-4">
        <DialogTitle className="text-blue-600 text-lg font-semibold">Quotation</DialogTitle>
        <IconButton onClick={onClose} className="text-gray-500">
          <CloseIcon />
        </IconButton>
      </div>
      <DialogContent className="p-6">
        {job.offer.length > 0 ?
          <Editoffer display={"none"} offer={job.offer[job.offer.length - 1]} onclose={onClose} />
        :
          <NewOffer display={"none"} job={job} onclose={onClose} />
        }
      </DialogContent>
    </Dialog>
  );
};

export default SendQuotation;
