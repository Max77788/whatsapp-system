import React from 'react';

const SignUpLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="w-full flex flex-col items-center justify-center min-h-screen">
      <div className="flex flex-col items-center w-full max-w-md p-8 shadow-md">
        <h1 className="text-3xl font-bold mb-4">Sign Up</h1>
        <p className="text-lg text-gray-600 mb-3">Please sign up to continue.</p>
        <div className="flex items-center justify-center">{children}</div>
      </div>
    </div>
  );
};

export default SignUpLayout;
