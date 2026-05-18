
import { useForm, SubmitHandler } from 'react-hook-form';
import { useState } from 'react';
import { apiPath } from '../../../apiPath';
import axios from 'axios';


interface SignUpFormInputs {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface SignUpProps {
  signup: boolean;
  setsignup: (value: boolean) => void;
}

const SignUp: React.FC<SignUpProps> = ({ signup, setsignup }) => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [showOtpPopup, setShowOtpPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [otp, setOtp] = useState('');
  const [userData, setUserdata] = useState<any>({});

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignUpFormInputs>();

  const password = watch('password');

  const handlesignup = async (data: SignUpFormInputs) => {
    try {
      const response = await axios.post(`${apiPath}/user/register`, data, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.status === 201) {
        localStorage.setItem('token', response.data.token);
        window.location.href = '/';
        setShowOtpPopup(false);
      }
    } catch (error: any) {
      console.error('Error submitting the form:', error.response || error.message);
      throw new Error(error.response?.data?.message || 'Failed to submit form.');
    }
  };

  const handleVerifyOTP = async () => {
    try {
      const response = await axios.post(`${apiPath}/email/verify-otp`, { email : userData.email , otp }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.status == 200) {
        handlesignup(userData)
        // alert('verify done')
      }
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'Failed to verify OTP.');
    }
  };

  const onSubmit: SubmitHandler<SignUpFormInputs> = async (data) => {
    try {
      const response = await axios.post(`${apiPath}/email/send-otp`, { email: data.email }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.status === 200) {
        setUserdata(data)
        setShowOtpPopup(true);
        alert('otp sent successfully');
      }
    } catch (error: any) {
      alert('Failed to send OTP.');
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const toggleConfirmPasswordVisibility = () => {
    setConfirmPasswordVisible(!confirmPasswordVisible);
  };

  return (
    <>
      <div className="w-full border-stroke dark:border-strokedark xl:w-1/2 xl:border-l-2">
        <div className="w-full p-4 sm:p-12.5 xl:p-17.5">
          <span className="mb-1.5 block font-medium">Start for free</span>
          <h2 className="mb-9 text-2xl font-bold text-black dark:text-white sm:text-title-xl2">
            Sign Up to Techbeeps CRM
          </h2>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-4">
              <label className="mb-2.5 block font-medium text-black dark:text-white">
                Name
              </label>
              <div className="relative">
                <input
                  {...register("username", { required: "Name is required" })}
                  type="text"
                  placeholder="Enter your full name"
                  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                />
                {errors.username && (
                  <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>
                )}
              </div>
            </div>

            <div className="mb-4">
              <label className="mb-2.5 block font-medium text-black dark:text-white">
                Email
              </label>
              <div className="relative">
                <input
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: "Please enter a valid email address",
                    },
                  })}
                  type="email"
                  placeholder="Enter your email"
                  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div className="mb-4">
              <label className="mb-2.5 block font-medium text-black dark:text-white">
                Password
              </label>
              <div className="relative">
                <input
                  {...register("password", { required: "Password is required" })}
                  type={passwordVisible ? "text" : "password"}
                  placeholder="Enter your password"
                  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                />
                <span
                  className="absolute right-4 top-4 cursor-pointer"
                  onClick={togglePasswordVisibility}
                >
                  {passwordVisible ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      width="22"
                      height="22"
                    >
                      <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-.59 1.687-1.601 3.178-2.875 4.25M15 12a3 3 0 11-6 0 3 3 0 016 0zm-3 7v-1m0-4v-1"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      width="22"
                      height="22"
                    >
                      <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 5c-4.477 0-8.268 2.943-9.542 7C3.732 16.057 7.523 19 12 19c4.477 0 8.268-2.943 9.542-7C20.268 7.943 16.477 5 12 5z"
                      />
                    </svg>
                  )}
                </span>
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                )}
              </div>
            </div>

            <div className="mb-4">
              <label className="mb-2.5 block font-medium text-black dark:text-white">
                Re-type Password
              </label>
              <div className="relative">
                <input
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (value) =>
                      value === password || "Passwords do not match",
                  })}
                  type={confirmPasswordVisible ? "text" : "password"}
                  placeholder="Re-enter your password"
                  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                />
                <span
                  className="absolute right-4 top-4 cursor-pointer"
                  onClick={toggleConfirmPasswordVisibility}
                >
                  {confirmPasswordVisible ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      width="22"
                      height="22"
                    >
                      <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-.59 1.687-1.601 3.178-2.875 4.25M15 12a3 3 0 11-6 0 3 3 0 016 0zm-3 7v-1m0-4v-1"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      width="22"
                      height="22"
                    >
                      <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 5c-4.477 0-8.268 2.943-9.542 7C3.732 16.057 7.523 19 12 19c4.477 0 8.268-2.943 9.542-7C20.268 7.943 16.477 5 12 5z"
                      />
                    </svg>
                  )}
                </span>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center rounded-lg bg-primary py-4 px-10 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10"
            >
              Sign Up
            </button>

            <p className="mt-6 text-center">
              Already have an account?{" "}
              <a onClick={() => setsignup(!signup)} className="text-primary">
                Sign In
              </a>
            </p>
          </form>

        </div>
        {showOtpPopup && <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-1/3">
            <h2 className="text-xl font-bold mb-4">Verify Your Email</h2>
            <p className="mb-4">Please enter the OTP sent to your email <strong>{userData.email}</strong>.</p>

            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              className="w-full mb-4 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
            />

            {errorMessage && <p className="text-red-500 text-sm mb-4">{errorMessage}</p>}

            <div className="flex justify-end">
              <button onClick={()=>handleVerifyOTP()}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
              >
                Verify
              </button>
              <button onClick={()=>{
                setShowOtpPopup(false);
                setOtp("")
                setErrorMessage("")
              }}
                className="ml-2 px-4 py-2 bg-gray-300 text-black rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
        }
      </div>
    </>
  );
};

export default SignUp;
