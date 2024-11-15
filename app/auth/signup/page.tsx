"use client";

import { FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { register } from "@/actions/register";
import { GoogleSignInButton } from "../../components/signin/authButtons";
import CredentialsRegistrationForm from "../../components/signin/credentialsRegistrationForm";

const SignUp = () => {
  const [error, setError] = useState<string>();
  const router = useRouter();
  const ref = useRef<HTMLFormElement>(null);

  const handleSubmit = async (formData: FormData) => {
    const r = await register({
      email: formData.get("email"),
      password: formData.get("password"),
      name: formData.get("name"),
    });
    ref.current?.reset();
    if (r?.error) {
      setError(r.error);
      return;
    } else {
      return router.push("/auth/signin");
    }
  };

  return (
      <div className="w-full max-w-md mx-auto p-6 space-y-6 rounded-lg shadow-lg mt-4">
        <div className="space-y-4">
          <GoogleSignInButton />

          <div className="flex items-center space-x-2">
            <hr className="flex-1 border-gray-600" />
            <span className="text-gray-400">or</span>
            <hr className="flex-1 border-gray-600" />
          </div>

          {/* Render the CredentialsRegistrationForm here */}
          <CredentialsRegistrationForm />

          {/* Display error message if there is one */}
          {error && <p className="text-red-500 text-center">{error}</p>}
        </div>

        <div className="text-center">
          <p className="text-gray-400">
            Already have an account?{" "}
            <Link href="/auth/signin" className="text-blue-500 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
  );
};

export default SignUp;
