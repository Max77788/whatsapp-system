"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { GoogleSignInButton } from "../../components/signin/authButtons";
import CredentialsForm from "../../components/signin/credentialsForm";

const SearchParamsHandler = (router: any) => {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.toString()) {
      router.replace("/auth/signin");
    }
  }, [router, searchParams]);

  useEffect(() => {
    const notification = searchParams.get("notification");
    if (notification === "login-required") {
      toast.error("You must be signed in to view this page");
    } else if (notification === "loggedOut") {
      toast.info("You have been logged out");
      document.cookie = "loggedOut=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      console.log("loggedOut cookie deleted");
    } else if (notification === "email-verified") {
      toast.success("Email verified successfully. Please sign in to continue.");
    } else if (notification === "invalid-token") {
      toast.error("Invalid token");
    }
  }, [searchParams]);

  return null;
};

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  return (
    <Suspense fallback={<p>Loading...</p>}>
      <SearchParamsHandler router={router} />
      <div className="w-full flex flex-col items-center justify-center min-h-screen py-2"> 
        <div className="flex flex-col items-center w-1/3 mt-10 p-10 shadow-md">
          <GoogleSignInButton />
          <div className="my-4 flex items-center">
            <hr className="flex-1"></hr>
            <span className="mx-4">or</span>
            <hr className="flex-1"></hr>
          </div>
          <CredentialsForm />
          <p className="mt-5">Admin credentials:<br />admin@admin.com, admin123</p>
        </div>
        <div className="flex flex-col items-center w-1/3 mt-10 p-10 shadow-md">
          <p className="mt-5">Don't have an account? <Link href="/auth/signup">Sign up</Link></p>
        </div>
      </div>
    </Suspense>
  );
};

export default SignIn;
