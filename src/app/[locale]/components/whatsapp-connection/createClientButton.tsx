"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { Dialog } from "@headlessui/react";
import { toast } from "react-toastify";
import { useTranslations, useLocale } from "next-intl";

export default function CreateClientButton({maxPhonesConnected}: {maxPhonesConnected: number}) {
  const { data: session } = useSession();
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [numberOfPhonesConnected, setNumberOfPhonesConnected] = useState<number>(0);
  const [isOpen, setIsOpen] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);
  const previousPhonesConnectedRef = useRef<number | null>(null); // Ref to store the previous number of connected phones
  
  const currentLocale = useLocale();
  
  const t = useTranslations("whatsapp_connection");
  
  const togglePopup = () => {
    setIsOpen(!isOpen);

    // Clear interval when closing the dialog
    if (!isOpen && intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }
  };

  

  const fetchQRCode = async () => {
    try {
      const response = await fetch("/api/whatsapp-part/generate-qr");
      const data = await response.json();
  
      if (response.ok) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
  
        const newNumberOfPhonesConnected = data.numberOfPhonesConnected;
   
        setNumberOfPhonesConnected(newNumberOfPhonesConnected);

        // Compare with the previous value stored in the ref
        if (previousPhonesConnectedRef.current !== null && newNumberOfPhonesConnected !== previousPhonesConnectedRef.current) {
          const moreNumbers = newNumberOfPhonesConnected > previousPhonesConnectedRef.current;
          
          const message = moreNumbers  
              ? t("phone_connected_successfully")
              : t("phone_detached_successfully");
          
          toast.success(message, {
            autoClose: 8000
          });

          await new Promise((resolve) => setTimeout(resolve, 8000));

          if (moreNumbers) {
            window.location.href = `/${currentLocale}/whatsapp-screen`;
            return;
          }
  
          // Reload the page after the toast notification
          setTimeout(() => {
            window.location.reload();
          }, 1500); // Delay for toast visibility
        }
  
        // Update the ref with the new value
        previousPhonesConnectedRef.current = newNumberOfPhonesConnected;
  
        // Smooth fade effect before updating QR code
        setFadeOut(true);
        setTimeout(() => {
          setQrCode(data.qrCodeString);
          setFadeOut(false);
        }, 300);
      } else {
        console.error(`Error on generate QR code endpoint: ${data.error}`);
        // toast.error("Failed to generate QR code. Please try again.");
      }
    } catch (error) {
      console.error("Failed to fetch QR code:", error);
      //toast.error("An error occurred while fetching the QR code.");
    }
  };

  const handleGenerateQRCode = async () => {
    if (!session) {
      toast.error(t("you_need_to_be_logged_in_to_generate_a_qr_code"));
      return;
    }

    await fetchQRCode();
    togglePopup();

    // Start polling every 7 seconds to refresh the QR code
    intervalIdRef.current = setInterval(fetchQRCode, 7000);
  };

  useEffect(() => {
    // Clear interval on component unmount
    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
      }
    };
  }, []);

  return (
    <div>
      <button onClick={handleGenerateQRCode} className="px-5 py-3 bg-green-600 hover:bg-green-700 text-white rounded-full flex items-center gap-2">
        {t("connect_a_new_phone")} <img src="/WhatsAppLogo.png" alt="Whatsapp Logo" className="w-8 h-8" />
      </button>

      <Dialog open={isOpen} onClose={togglePopup} className="fixed inset-0 z-10 overflow-y-auto">
        <div className="min-h-screen px-4 text-center">
          <div className="fixed inset-0 bg-black opacity-30" onClick={togglePopup} />
          <span className="inline-block h-screen align-middle" aria-hidden="true">
            &#8203;
          </span>
          <div className="inline-block w-full max-w-sm p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded">
            <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 text-center">
              {t("scan_this_qr_code_to_connect_your_phone")}
              <br />
              {t("you_have_out_of_phones_connected", {numberOfPhonesConnected, maxPhonesConnected})}
            </Dialog.Title>

            <div className="mt-4 flex justify-center">
              {qrCode ? (
                <img
                  src={qrCode}
                  alt="QR Code"
                  className={`w-full h-auto transition-opacity duration-300 ${
                    fadeOut ? "opacity-0" : "opacity-100"
                  }`}
                />
              ) : (
                  <p className="text-black text-2xl my-32 font-bold italic">{t("generating_qr_code")}</p>
              )}
            </div>

            <p className="text-black text-center font-bold italic">*{t("please_wait_a_bit_after_successfully_scanning_the_code")}</p>

            <div className="mt-4">
              <button onClick={togglePopup} className="px-4 py-2 bg-red-500 text-white rounded-full mx-auto block text-center">
                {t("close")}
              </button>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
