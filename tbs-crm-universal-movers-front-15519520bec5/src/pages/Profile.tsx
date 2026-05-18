import React, { useContext, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Avatar,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button, TextField
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import { UserContext } from "../UserContext";
import { useForm, Controller } from "react-hook-form";
import DatePickerComponent from "../common/Datepicker";
import { apiPath } from "../../apiPath";
import axios from "axios";
import Loader from "../common/Loader";
import { toast } from "react-toastify";

const Profile: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { userData, fetchProfile } = useContext(UserContext) as any;
  const [loading, setLoading] = useState<boolean>(false);

  const notify = (message: string) => toast.success(message, {
    autoClose: 2000,
  });
  const notifyError = (message: string) => toast.error(message, {
    autoClose: 2000,
  });

  const { handleSubmit, control, reset, formState: { errors } } = useForm({
    defaultValues: {
      username: userData?.username || "",
      dob: userData?.dob || "",
      telephone: userData?.telephone || "",
      email: userData?.email || "",
      houseNumber: userData?.houseNumber || "",
      street: userData?.street || "",
      city: userData?.city || "",
      country: userData?.country || "",
      postCode: userData?.postCode || "",
    },
  });

  const handleOpen = () => {
    reset({
      username: userData?.username || "",
      dob: userData?.dob || "",
      telephone: userData?.telephone || "",
      email: userData?.email || "",
      houseNumber: userData?.houseNumber || "",
      street: userData?.street || "",
      city: userData?.city || "",
      country: userData?.country || "",
      postCode: userData?.postCode || "",
    });
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  const onSubmit = (data: any) => {
    updateProfile({ id: userData._id, ...data })
  };

  const updateProfile = async (data: any): Promise<any> => {
    setLoading(true);
    try {
      const response = await axios.post(`${apiPath}/user/update`, data);
      handleClose()
      await fetchProfile()
      notify('Profile updated successfully')
    } catch (error: any) {
      throw error.response?.data || error;
      notifyError(`Failed to update profile. ${error?.message}`)
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="bg-gray">
      {loading && <Loader />}
      <Card className="mb-2 p-3">
        <CardContent>
          <Grid container alignItems="center" spacing={3}>
            <Grid item>
              <Avatar
                src='https://static.vecteezy.com/system/resources/previews/005/129/844/non_2x/profile-user-icon-isolated-on-white-background-eps10-free-vector.jpg'
                alt={userData.username}
                className="h-30 w-30 shadow-lg"
              />
            </Grid>
            <Grid item xs>
              <Typography variant="body1" className="font-bold text-gray-800">
                {(userData.username).toUpperCase()}
              </Typography>
              <Typography variant="body1" className="">
                {userData.role}
              </Typography>
              <Typography variant="body2" className="">
                {userData.email}
              </Typography>
            </Grid>
            <Grid item>
              <IconButton aria-label="edit" onClick={handleOpen}>
                <EditIcon className="text-orange" />
              </IconButton>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card className="shadow-lg mb-2 p-3">
        <CardContent>
          <Typography
            variant="h6"
            className="font-semibold text-gray-600 mb-3"
          >
            Personal Information
          </Typography>
          <hr className="my-2 text-gray" />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography className="text-bold">Gender</Typography>
              <Typography className="font-medium">{userData.gender}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography className="text-sm">
                Date of Birth
              </Typography>
              <Typography className="font-medium">
                {userData.dob
                  ? new Intl.DateTimeFormat("en-US", {
                    month: "short",
                    day: "2-digit",
                    year: "numeric",
                  }).format(new Date(userData.dob))
                  : "N/A"}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography className="text-sm text-gray-500">Email</Typography>
              <Typography className="font-medium">{userData.email}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography className="text-sm text-gray-500">Language</Typography>
              <Typography className="font-medium">{userData.language}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography className="text-sm text-gray-500">Phone</Typography>
              <Typography className="font-medium">{userData.telephone}</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      <Card className="shadow p-3">
        <CardContent>
          <Typography
            variant="h6"
            className="font-semibold text-gray-600 mb-3"
          >
            Address
          </Typography>
          <hr className="my-2 text-gray" />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography className="text-sm text-gray-500">Address</Typography>
              <Typography className="font-medium">{userData.houseNumber} {userData.street} {userData.addition}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography className="text-sm text-gray-500">Country</Typography>
              <Typography className="font-medium">{userData.country}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography className="text-sm text-gray-500">City</Typography>
              <Typography className="font-medium">{userData.city}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography className="text-sm text-gray-500">
                Postal Code
              </Typography>
              <Typography className="font-medium">{userData.postCode}</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle className="flex justify-between items-center" marginTop={2}>
          <div style={{ fontSize: 'larger' }}>Edit Profile</div>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)} className="px-2">
          <DialogContent>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Controller
                  name="username"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} fullWidth label="Name" variant="standard" />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePickerComponent
                  name='dob'
                  control={control}
                  maxDate={new Date() || null}
                  label="Date of Birth"
                  rules={{ required: "field is required" }}
                  errors={errors}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="telephone"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} fullWidth label="Phone" variant="standard" />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="email"
                  control={control}
                  disabled
                  render={({ field }) => (
                    <TextField {...field} fullWidth label="Email" variant="standard" />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="houseNumber"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} fullWidth label="House Number" variant="standard" />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="street"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} fullWidth label="Street Address" variant="standard" />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="city"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} fullWidth label="City" variant="standard" />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="country"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} fullWidth label="Country" variant="standard" />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="postCode"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} fullWidth label="Postal Code" variant="standard" />
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <div className="p-3">
              <Button startIcon={<SaveIcon />} type="submit" variant="contained">
                Save
              </Button>
            </div>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
};

export default Profile;
