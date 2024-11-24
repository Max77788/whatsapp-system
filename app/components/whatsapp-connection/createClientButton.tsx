"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";

import { useRef } from "react";

export default function CreateClientButton() {
  const { data: session } = useSession();
  const [qrCode, setQrCode] = useState(null);
  const [numberOfPhonesConnected, setNumberOfPhonesConnected] = useState(0);
  const [previousPhonesConnected, setPreviousPhonesConnected] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [fadeOut, setFadeOut] = useState(false); // For smooth transition effect
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null); // Create a ref for the interval ID

  const togglePopup = () => setIsOpen(!isOpen);

  const fetchQRCode = async () => {
    try {
      const response = await fetch("/api/whatsapp-part/generate-qr");
      const data = await response.json();

      if (response.ok) {
        // Check if the number of phones connected has changed
        if (previousPhonesConnected !== null && data.numberOfPhonesConnected !== previousPhonesConnected) {
          location.reload(); // Reload if the number has changed
        }

        // Update the previous number of phones connected
        setPreviousPhonesConnected(data.numberOfPhonesConnected);

        // Smooth fade effect before updating QR code
        setFadeOut(true);
        setTimeout(() => {
          setQrCode(data.qrCodeString);
          setNumberOfPhonesConnected(data.numberOfPhonesConnected);
          setFadeOut(false);
        }, 300); // Duration of the fade-out
      } else {
        console.error(`Error on generate QR code endpoint: ${data.error}`);
      }
    } catch (error) {
      console.error("Failed to fetch QR code:", error);
    }
  };

  const handleGenerateQRCode = async () => {
    if (!session) {
      alert("You need to be logged in to generate a QR code");
      return;
    }
    await fetchQRCode();
    togglePopup();

    // Start polling every 7 seconds to refresh the QR code
    intervalIdRef.current = setInterval(fetchQRCode, 7000);

    // Clear interval on close
    return () => clearInterval(intervalIdRef.current!);
  };

  useEffect(() => {
    // Clear interval if dialog is closed
    if (!isOpen && intervalIdRef.current) clearInterval(intervalIdRef.current);
  }, [isOpen]);

  return (
    <div>
      <button onClick={handleGenerateQRCode} className="px-4 py-2 bg-blue-500 text-white rounded">
        Connect a New Phone
      </button>

      <Dialog open={isOpen} onClose={togglePopup} className="fixed inset-0 z-10 overflow-y-auto">
        <div className="min-h-screen px-4 text-center">
          <div className="fixed inset-0 bg-black opacity-30" onClick={togglePopup} />
          
          <span className="inline-block h-screen align-middle" aria-hidden="true">&#8203;</span>

          <div className="inline-block w-full max-w-sm p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded">
            <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 text-center">
              Scan this QR code to connect your phone
              You have {numberOfPhonesConnected} out of 5 phones connected
            </Dialog.Title>

            <div className="mt-4 flex justify-center">
              {qrCode ? (
                <img
                  src={qrCode}
                  alt="QR Code"
                  className={`w-full h-auto transition-opacity duration-300 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}
                />
              ) : (
                <p>Generating QR code...</p>
              )}
            </div>

            <div className="mt-4">
              <button onClick={togglePopup} className="px-4 py-2 bg-red-500 text-white rounded">
                Close
              </button>
            </div>
            
          </div>
          
        </div>
        
      </Dialog>
    </div>
  );
}
