"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import Link from "next/link";
import { useEffect } from "react";
import { signIn } from "next-auth/react";
import { GoogleSignInButton } from "../../components/signin/authButtons";
import CredentialsForm from "../../components/signin/credentialsForm";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const searchParams = useSearchParams();

  const router = useRouter();

  useEffect(() => {
    // Remove URL parameters after they've been processed
    if (searchParams.toString()) {
      router.replace('/auth/signin');
    }
  }, [router, searchParams]);

  useEffect(() => {
    if (searchParams.get("notification") === "login-required") {
      toast.error("You must be signed in to view this page");
    } else if (searchParams.get("notification") === "loggedOut") {
      toast.info("You have been logged out");
    }
  }, [searchParams]);

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
        <div className="my-4 flex items-center">
          <hr className="flex-1"></hr>
          <span className="mx-4">or</span>
          <hr className="flex-1"></hr>
        </div>
         <CredentialsForm/>
         <p className="mt-5">Admin credentials:<br></br>admin@admin.com, admin123</p>
      </div>
      <div className="flex-flex-col-items-center w-1/3-mt-10-p-10-shadow-md">
      <p className="mt-5">Don't have an account? <Link href="/auth/signup">Sign up</Link></p>
      </div>
    </div>
  );
};

export default SignIn;
