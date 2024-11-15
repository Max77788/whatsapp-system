"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import Link from "next/link";
import { GoogleSignInButton } from "../../components/signin/authButtons";
import CredentialsForm from "../../components/signin/credentialsForm";

const SearchParamsHandler = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.toString()) {
      router.replace("/auth/signin");
    }

    const notification = searchParams.get("notification");
    switch (notification) {
      case "login-required":
        toast.error("You must be signed in to view this page");
        break;
      case "loggedOut":
        toast.info("You have been logged out");
        document.cookie = "loggedOut=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        console.log("loggedOut cookie deleted");
        break;
      case "email-verified":
        toast.success("Email verified successfully. Please sign in to continue.");
        break;
      case "invalid-token":
        toast.error("Invalid token");
        break;
      default:
        break;
    }
  }, [router, searchParams]);

  return null; // No UI, just handles side effects
};

const SignIn = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchParamsHandler />
      <div className="flex flex-col items-center justify-center min-h-screen py-2">
        <div className="flex flex-col items-center w-1/3 mt-10 p-10 shadow-md">
          <GoogleSignInButton />
          <div className="my-4 flex items-center">
            <hr className="flex-1"></hr>
            <span className="mx-4">or</span>
            <hr className="flex-1"></hr>
          </div>
          <CredentialsForm />
          <p className="mt-5">
            Admin credentials:
            <br />
            admin@admin.com, admin123
          </p>
        </div>
        <div className="flex flex-col items-center w-1/3 mt-10 p-10 shadow-md">
          <p className="mt-5">
            Don't have an account? <Link href="/auth/signup">Sign up</Link>
          </p>
        </div>
      </div>
    </Suspense>
  );
};

export default SignIn;