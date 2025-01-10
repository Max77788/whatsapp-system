"use client";

import { Suspense, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import Link from "next/link";
import { GoogleSignInButton } from "../../components/signin/authButtons";
import CredentialsForm from "../../components/signin/credentialsForm";
import { createK8sDeployment } from "@/lib/whatsAppService/kubernetes_part.mjs";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";

// Component to handle search parameters and show notifications
const SearchParamsHandler = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const notificationProcessedRef = useRef(false); 

  const currentLocale = useLocale();

  const t = useTranslations('signinNotifications');

  useEffect(() => {
    if (searchParams.toString()) {
      router.replace(`/${currentLocale}/auth/signin`);
    }

    const notification = searchParams.get("notification");
    if (notification && !notificationProcessedRef.current) {
      notificationProcessedRef.current = true;
    
    switch (notification) {
      case "login-required":
        toast.error(t('loginRequired'));
        break;
      case "loggedOut":
        toast.info(t('loggedOut'));
        document.cookie = "loggedOut=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        console.log("loggedOut cookie deleted");
        break;
      case "email-verified":
        toast.success(t('emailVerified'),
      {
        autoClose: 5000
      });
        break;
      case "invalid-token":
        toast.error(t('invalidToken'));
        break;
      case "password-updated":
        toast.success(t('passwordUpdated'));
        break;
      case "use-google-signup":
        toast.info(t('useGoogleSignup'));
        break;
      default:
        break;
    }
    }
  }, [router, searchParams]);

  return null; // No UI, just handles side effects
};

const SignIn = () => {
  const t = useTranslations('signin');  
  const currentLocale = useLocale();

  return (
    <Suspense fallback={<div>Loading...</div>}>
      {/* SearchParamsHandler to manage URL params and notifications */}
      <SearchParamsHandler />

      {/* Main Sign-In Page */}
        <div className="w-full max-w-md p-8 space-y-6 rounded-lg shadow-lg">
  

          <div className="space-y-4">

            <GoogleSignInButton />

           <div className="flex items-center gap-1">
              <hr className="flex-1 border-gray-600" />
              <span className="text-gray-400">{t('or')}</span>
              <hr className="flex-1 border-gray-600" />
            </div>

            
            <CredentialsForm />

            {/*
            <p className="text-sm text-gray-400">
              Admin credentials:
              <br />
              <span className="text-gray-300">admin@demo.com, admin123</span>
            </p>
            */}
          </div>

          <div className="text-center">
            <p className="text-gray-600">
              {t('dontHaveAnAccount')}
              <Link href={`/${currentLocale}/auth/signup`} className="hover:underline">
                {t('signUp')}
              </Link>
            </p>
            <p><a href={`/${currentLocale}/forgot-password`} className="hover:underline">
                {t('forgotPassword')}
              </a>
            </p>
          </div>
        </div>
    </Suspense>
  );
};

export default SignIn;
