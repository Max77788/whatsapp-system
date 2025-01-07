"use client";

import { signIn } from 'next-auth/react';
import { FormEvent, useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { register } from "@/actions/register";
import { toast } from 'react-toastify';
import { useLocale, useTranslations } from 'next-intl';

import { useLocation } from "react-router-dom";


export default function CredentialsRegistrationForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const ref = useRef<HTMLFormElement>(null);
  const currentLocale = useLocale();
  const t = useTranslations('signin');

  const location = useLocation();
  const toastId = "SignUpToast";

  useEffect(() => {
      // Dismiss the toast when the location changes
      return () => {
        toast.dismiss(toastId);
      };
    }, [location]);

  const handleSubmit = async (formData: FormData) => {
    toast.info(t("signingUp"), {
      autoClose: 6500,
      toastId
    });
    
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
  <label htmlFor="email" className="mb-2 text-sm font-medium text-gray-900 dark:text-white self-start">{t('fullName')}</label>
  <input type="text" name="name" placeholder={t('fullNamePlaceholder')} required className="mb-4 p-2 border border-gray-300 rounded-md w-full text-black"/>

  <label htmlFor="email" className="mb-2 text-sm font-medium text-gray-900 dark:text-white self-start">{t('email')}</label>
  <input type="email" name="email" placeholder={t('emailPlaceholder')} required className="mb-4 p-2 border border-gray-300 rounded-md w-full text-black"/>
  <div className="relative w-full mb-4">
    <label htmlFor="password" className="mb-2 text-sm font-medium text-gray-900 dark:text-white self-start">{t('password')}</label>
    <input 
      type={showPassword ? "text" : "password"} 
      name="password" 
      placeholder={t('passwordPlaceholder')} 
      required 
      minLength={8}
      className="p-2 border border-gray-300 rounded-md w-full text-black"
    />
    <button
      type="button"
      className={`absolute ${ currentLocale === 'he' ? 'left-2' : 'right-2' } bottom-2 text-gray-500 hover:text-gray-700`}
      onClick={() => setShowPassword(!showPassword)}
    >
      {showPassword ? "🫥" : "👁️"}
    </button>
  </div>
    <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded w-full">{t('signUp')}</button>
  </form>
  )
}
