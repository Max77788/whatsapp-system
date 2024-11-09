"use client";
import { FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
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
        name: formData.get("name")    
      });
      ref.current?.reset();
      if(r?.error){
        setError(r.error);
        return;
      } else {
        return router.push("/auth/signin");
      }
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
         <CredentialsRegistrationForm/>
      </div>
      <div className="flex-flex-col-items-center w-1/3-mt-10-p-10-shadow-md">
      <p className="mt-5">Already have an account? <Link href="/auth/signin">Sign in</Link></p>
      </div>
    </div>
  );
};

export default SignUp;
