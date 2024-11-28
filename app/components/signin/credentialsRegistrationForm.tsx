"use client";

import { signIn } from 'next-auth/react';
import { FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { register } from "@/actions/register";
import { toast } from 'react-toastify';

export default function CredentialsRegistrationForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
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
        console.log(`User registered successfully`);
        toast.success("Please check your email for verification.");
        return {success: true};
      }
};
return(
  <form 
  ref={ref}
  className="flex flex-col items-center justify-center w-full max-w-md mt-5 p-0 shadow-md mx-auto"
  action={(formData) => { 
    handleSubmit(formData); 
    return; // Ensure it returns void
  }}
  >
  {error && !error.includes('client') && <span className="mb-1 text-red-500 font-semibold inline-block">{error}</span>}
  <label htmlFor="email" className="mb-2 text-sm font-medium text-gray-900 dark:text-white self-start">Full Name</label>
  <input type="text" name="name" placeholder="Full Name" required className="mb-4 p-2 border border-gray-300 rounded-md w-full text-black"/>

  <label htmlFor="email" className="mb-2 text-sm font-medium text-gray-900 dark:text-white self-start">Email</label>
  <input type="email" name="email" placeholder="Email" required className="mb-4 p-2 border border-gray-300 rounded-md w-full text-black"/>
  <div className="relative w-full mb-4">
    <label htmlFor="password" className="mb-2 text-sm font-medium text-gray-900 dark:text-white self-start">Password</label>
    <input 
      type={showPassword ? "text" : "password"} 
      name="password" 
      placeholder="Password (at least 8 characters)" 
      required 
      minLength={8}
      className="p-2 border border-gray-300 rounded-md w-full text-black"
    />
    <button
      type="button"
      className="absolute right-2 bottom-2 text-gray-500 hover:text-gray-700"
      onClick={() => setShowPassword(!showPassword)}
    >
      {showPassword ? "🫥" : "👁️"}
    </button>
  </div>
    <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded w-full">Sign Up</button>
  </form>
  )
}
