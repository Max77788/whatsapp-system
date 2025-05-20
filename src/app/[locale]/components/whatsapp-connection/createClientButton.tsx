"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { Dialog } from "@headlessui/react";
import { toast } from "react-toastify";
import { useTranslations, useLocale } from "next-intl";

export default function CreateClientButton({maxPhonesConnected}: {maxPhonesConnected: number}) {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [numberOfPhonesConnected, setNumberOfPhonesConnected] = useState<number>(0);

  const currentLocale = useLocale();
  const t = useTranslations("whatsapp_connection");

  const togglePopup = () => {
    setIsOpen(!isOpen);
  };

  const handleConnectPhone = async () => {
    if (!phoneNumber) {
      toast.error(t("please_enter_phone_number"));
      return;
    }

    setIsLoading(true);
    try {
      // Call the API to connect the phone number
      const response = await fetch("/api/whatsapp-part/connect-phone", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phoneNumber }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(t("phone_connected_successfully"));
        setNumberOfPhonesConnected(prev => prev + 1);
        setPhoneNumber("");
        setIsOpen(false);
      } else {
        toast.error(data.error || t("failed_to_connect_phone"));
      }
    } catch (error) {
      console.error("Error connecting phone:", error);
      toast.error(t("an_error_occurred"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={togglePopup}
        disabled={numberOfPhonesConnected >= maxPhonesConnected}
        className={`px-4 py-2 text-white rounded-md ${
          numberOfPhonesConnected >= maxPhonesConnected
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {t("connect_a_new_phone")}
      </button>

      <Dialog
        open={isOpen}
        onClose={togglePopup}
        className="fixed inset-0 z-10 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen">
          <div className="fixed inset-0 bg-black opacity-30" />

          <div className="relative bg-white rounded-md p-6 max-w-md w-full mx-4">
            <Dialog.Title className="text-lg font-medium mb-4">
              {t("connect_whatsapp_phone")}
            </Dialog.Title>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("phone_number")}
              </label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder={t("enter_phone_number")}
                className="w-full px-3 py-2 text-black border border-gray-300 rounded-md"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={togglePopup}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                {t("close")}
              </button>
              <button
                onClick={handleConnectPhone}
                disabled={isLoading}
                className="px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-green-400"
              >
                {isLoading ? t("connecting") : t("connect")}
              </button>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
