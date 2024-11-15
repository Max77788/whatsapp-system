"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import Link from "next/link";
import { GoogleSignInButton } from "../../components/signin/authButtons";
import CredentialsForm from "../../components/signin/credentialsForm";

// Component to handle search parameters and show notifications
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
      {/* SearchParamsHandler to manage URL params and notifications */}
      <SearchParamsHandler />

      {/* Main Sign-In Page */}
        <div className="w-full max-w-md p-8 space-y-6 rounded-lg shadow-lg">
  

          <div className="space-y-4">
            <GoogleSignInButton />

            <div className="flex items-center space-x-2">
              <hr className="flex-1 border-gray-600" />
              <span className="text-gray-400">or</span>
              <hr className="flex-1 border-gray-600" />
            </div>

            <CredentialsForm />

            <p className="text-sm text-gray-400">
              Admin credentials:
              <br />
              <span className="text-gray-300">admin@demo.com, admin123</span>
            </p>
          </div>

          <div className="text-center">
            <p className="text-gray-400">
              Don&apos;t have an account?{" "}
              <Link href="/auth/signup" className="text-blue-500 hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
    </Suspense>
  );
};

export default SignIn;
