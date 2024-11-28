"use server";

import React from 'react';

const SignInLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="w-full flex flex-col items-center justify-center min-h-screen">
      <div className="flex flex-col items-center w-full max-w-md p-8 shadow-md">
        <h1 className="text-2xl font-bold mb-1">Forgot Password</h1>
        <div className="flex items-center justify-center">{children}</div>
      </div>
    </div>
  );
};

export default SignInLayout;
