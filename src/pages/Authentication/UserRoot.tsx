import React, { useState } from 'react';
import SignIn from './SignIn';
import SignUp from './SignUp';
import ResetPassword from './ForgetPassword';

const UserRoot = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);

  const handleResetPassword = () => {
    setIsResetPassword(!isResetPassword);
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center p-4 sm:p-6 md:p-8 font-sans selection:bg-primary selection:text-white relative overflow-hidden">
      {/* Subtle Background Glow Orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Centered Login Box */}
      <div className="w-full max-w-[500px] relative z-10 bg-white dark:bg-boxdark rounded-3xl border border-stroke/70 dark:border-strokedark/80 shadow-2xl p-6 sm:p-10 md:p-12 animate-in fade-in zoom-in-95 duration-200">
        {isResetPassword ? (
          <ResetPassword handler={handleResetPassword} />
        ) : isSignUp ? (
          <SignUp signup={isSignUp} setsignup={setIsSignUp} />
        ) : (
          <SignIn
            signup={isSignUp}
            setsignup={setIsSignUp}
            onResetPassword={handleResetPassword}
          />
        )}
      </div>
    </div>
  );
};

export default UserRoot;
