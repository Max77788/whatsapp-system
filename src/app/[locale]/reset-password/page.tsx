"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";

function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();
  const currentLocale = useLocale();
  const t = useTranslations('signin');

  if (!token) {
    router.push(`/${currentLocale}/auth/signin?notification=invalid-token`);
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (password.length < 8) {
      setMessage("Password must be at least 8 characters long.");
      return;
    }

    const response = await fetch("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, newPassword: password }),
      headers: { "Content-Type": "application/json" },
    });

    const result = await response.text();
    if (result === "Password updated successfully") { 
        router.push(`/${currentLocale}/auth/signin?notification=password-updated`);
    } else {
        setMessage(result);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4 w-full max-w-md">
        <input
          type="text"
          placeholder={t('enterNewPassword')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="p-2 border rounded text-black w-64"
        />
        <button type="submit" className="p-2 bg-green-600 hover:bg-green-700 text-white rounded w-64">{t('resetPassword')}</button>
      </form>
      {message && <p className="mt-4 text-red-500 w-64 text-center">{message}</p>}
    </div>
  );
}

export default function ResetPassword() {
  const t = useTranslations('signin');

  return (
    <Suspense fallback={<div>{t('loading')}</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
