"use client";

import Image from "next/image";
import { signIn } from "next-auth/react";
import { toast } from 'react-toastify';
import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from "next-intl";
import { useTranslations } from "next-intl";

import { useEffect } from "react"

import { useLocation } from "react-router-dom";

export function GoogleSignInButton() {
    const currentLocale = useLocale();
    const t = useTranslations('signin');

    const toastId = "googleSignInToast"; // Unique toast ID

    const pathname = usePathname(); // Get the current path

    useEffect(() => {
        // Dismiss the toast when the pathname changes
        return () => {
            toast.dismiss(toastId);
        };
    }, [pathname]);

    const handleClick = () => {
        signIn('google', {
            callbackUrl: `/${currentLocale}/dashboard`,
        });
        toast.info(t('signingInWithGoogle'), {
            autoClose: 6500,
            toastId
        });
    }
    
    return (
        <div className="flex justify-center">
            <button 
            onClick={handleClick}
            className="bg-white hover:bg-gray-300 text-black font-bold py-2 px-6 rounded flex items-center justify-center border border-gray-300"
            >
            <Image src="/Google__G__logo.svg.png" alt="Google" width={20} height={20} className="mr-2"/>
            <span>{t('continueWithGoogle')}</span>
            </button>
        </div>
    );
}