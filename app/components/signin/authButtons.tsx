"use client";

import Image from "next/image";
import { signIn } from "next-auth/react";
import { toast } from 'react-toastify';

export function GoogleSignInButton() {
    const handleClick = () => {
        signIn('google');
        toast.success('Signed in with Google');
    }
    return (
        <div className="flex justify-center">
            <button 
            onClick={handleClick}
            className="bg-white hover:bg-gray-300 text-black font-bold py-2 px-6 rounded flex items-center justify-center border border-gray-300"
            >
            <Image src="/Google__G__logo.svg.png" alt="Google" width={20} height={20} className="mr-2"/>
            <span>Continue with Google</span>
            </button>
        </div>
    );
}