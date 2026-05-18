import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";
import { apiPath } from "../../../apiPath";

const LinkQuotePopup: React.FC<any> = ({ type, quotationData, fetchInvoice }) => {
  const [open, setOpen] = useState<boolean>(false);
  const [selectedJob, setSelectedJob] = useState<string>("");
  const [jobData, setJobData] = useState<any[]>([]);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleLink = () => {
    if (selectedJob) {
      handleQuotation()
    }
  };

  const handleAllJob = async () => {
    try {
      const response = await axios.get(`${apiPath}/api/jobList?customer=${quotationData?.customer?._id}`);
      setJobData(response.data.jobList);
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuotation = async () => {
    try {
      const response = (type !== 'invoice' ? await axios.post(`${apiPath}/finance/update/${quotationData._id}`, { job: selectedJob }) : await axios.post(`${apiPath}/invoice/update/${quotationData._id}`, { job: selectedJob }))
      alert("updated successfully");
      if (response.status === 200) {
        setOpen(false);
        fetchInvoice()
        if (type === 'invoice') {
          updateJobSchedule(selectedJob, { invoice: quotationData._id })
        } else {
          updateJobSchedule(selectedJob, { offer: quotationData._id })
        }
      }
    } catch (error) {
      console.error('Error updating invoice:', error);
    }
  };

  const updateJobSchedule = async (jobId: string, updatedData: any) => {
    try {
      const response = await axios.put(`${apiPath}/api/job-schedule/${jobId}`, updatedData);
      console.log(response.status);
    } catch (error: any) {
      console.error('Error updating job schedule:', error.response ? error.response.data : error.message);
    }
  };

  useEffect(() => {
    if (quotationData.customer) {
      handleAllJob()
    }
  }, [quotationData])

  return (
    <div>
      <button onClick={handleOpen} className="bg-danger text-white font-semibold px-4 rounded-md shadow-lg py-3">
        Connect to Job
      </button>
      <Dialog open={open} onClose={handleClose} fullWidth>
        <div className="p-4">
          <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            Link Quote # {quotationData.index} to Job
            <IconButton
              aria-label="close"
              onClick={handleClose}
              edge="end"
              size="large"
              sx={{
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ padding: "30px" }}>
            <div className="my-4">
              <InputLabel id="job-select-label">Select Job</InputLabel>
              <FormControl fullWidth margin="normal">
                <Select
                  labelId="job-select-label"
                  value={selectedJob}
                  variant="standard"
                  onChange={(e) => setSelectedJob(e.target.value as string)}
                >
                  <MenuItem value="">Select Job</MenuItem>
                  {jobData && jobData.map((job, index) =>
                    <MenuItem key={index} value={job._id}>{job.customer.firstName} {job.customer.lastName} {job.index}</MenuItem>
                  )}
                </Select>
              </FormControl>
            </div>
          </DialogContent>
          <DialogActions sx={{ padding: "50px" }}>
            <Button onClick={handleClose} color="primary">
              Cancel
            </Button>
            <Button onClick={handleLink} variant="contained" color="primary">
              To Link
            </Button>
          </DialogActions>
        </div>
      </Dialog>
    </div>
  );
};

export default LinkQuotePopup;
