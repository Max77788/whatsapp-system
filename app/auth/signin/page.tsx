"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { GoogleSignInButton } from "../../components/signin/authButtons";
import CredentialsForm from "../../components/signin/credentialsForm";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Send email and password to the credentials provider
    const result = await signIn("credentials", {
      redirect: true,
      email: email,
      password: password,
      callbackUrl: "/dashboard",
    });

    if (!result?.ok) {
      console.error("Invalid login attempt");
    }
  };

  const handleGoogleLogin = () => {
    signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    
<div className="w-full-flex-flex-col· items-center justify-center min-h-screen py-2"> 
      <div className="flex-flex-col-items-center w-1/3-mt-10-p-10-shadow-md">
        <GoogleSignInButton />
        <hr className="my-5"></hr>
         <CredentialsForm/>
      </div>
    </div>
  );
};

export default SignIn;
