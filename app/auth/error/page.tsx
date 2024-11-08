// app/auth/error/page.tsx
import React from "react";

const ErrorPage: React.FC = () => {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Authentication Error</h1>
      <p style={{ fontSize: '24px', color: 'red' }}>Something went wrong during authentication. Please try again.</p>
      <a href="/auth/signin">Go back to Sign In</a>
    </div>
  );
};

export default ErrorPage;
