"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useLocale, useTranslations } from "next-intl";

export default function UserCredentialsForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [connectedUsername, setConnectedUsername] = useState<string | null>(
    null
  );
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const t = useTranslations("instagram_connection");
  const currentLocale = useLocale();

  // Fetch the connected Instagram account on component mount
  useEffect(() => {
    const fetchConnectedAccount = async () => {
      try {
        const response = await fetch("/api/user/find-user");
        const user = await response.json();

        if (response.ok && user?.instaAcc?.username) {
          setConnectedUsername(user.instaAcc.username); // Set the connected username
        } else {
          setConnectedUsername(null); // No account connected
        }
        setIsLoading(false);
      } catch (error) {
        console.error(t("fetch_error"), error);
      }
    };

    fetchConnectedAccount();
  }, []);

  const handleSave = async () => {
    if (!username || !password) {
      toast.error(t("fill_credentials_error"));
      return;
    }

    try {
      const response = await fetch("/api/insta/save-credentials", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        toast.success(t("save_success"));
        setTimeout(() => {
          window.location.reload();
        }, 1500); // Delay for toast visibility before reloading
      } else {
        const data = await response.json();
        toast.error(`${t("save_error")}: ${data.message || t("default_error")}`);
      }
    } catch (error) {
      console.error(t("save_error"), error);
      toast.error(t("general_error"));
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch("/api/insta/delete-credentials", {
        method: "DELETE",
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        toast.success(t("delete_success"));
        setConnectedUsername(null); // Clear the connected username
        setTimeout(() => {
          window.location.reload();
        }, 1500); // Delay for toast visibility before reloading
      } else {
        const data = await response.json();
        toast.error(`${t("delete_error")}: ${data.message || t("default_error")}`);
      }
    } catch (error) {
      console.error(t("delete_error"), error);
      toast.error(t("general_error"));
    }
  };

  if (isLoading) {
    return <div className="max-w-md mx-auto p-6 bg-white shadow-xl rounded text-center">
      <div className="animate-pulse flex flex-col items-center">
        <div className="h-16 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-16 w-12 bg-gray-200 rounded"></div>
      </div>
    </div>
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-xl rounded text-center">
      <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4 flex items-center justify-center gap-2">
        {t("manage_connection")} <img src="/insta-logo.webp" alt="Insta Logo" className="w-8 h-8" />
      </h3>

      {connectedUsername ? (
        <div className="mb-4 text-green-600 font-medium">
          {t("connected_as")} {connectedUsername}
        </div>
      ) : (
        <div className="mb-4 text-gray-600">{t("no_account_connected")}</div>
      )}

      <div className="space-y-4">
        <input
          type="text"
          placeholder={t("username_placeholder")}
          value={connectedUsername || username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-600"
        />
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder={t("password_placeholder")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-600"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className={`absolute top-1/2 transform -translate-y-1/2 ${currentLocale === "he" ? "left-3" : "right-3"}`}
          >
            {showPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <div className="mt-4 space-y-4 flex flex-col gap-2">
        {!connectedUsername && (
          <button
            onClick={handleSave}
            className="px-5 py-3 bg-green-600 hover:bg-green-700 text-white rounded-full min-w-[150px]"
        >
            {t("save_credentials")}
        </button>
        )}
        {connectedUsername && (
            <button
            onClick={handleDelete}
            className="px-5 py-3 bg-red-500 hover:bg-red-600 text-white rounded-full min-w-[150px]"
            >
            {t("delete_credentials")}
            </button>
                )}
      </div>
    </div>
  );
}
