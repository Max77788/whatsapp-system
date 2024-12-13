"use client";

import { usePathname } from 'next/navigation';

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const locales = ['en','he']; // Define supported locales
  const currentLocale = pathname.split('/')[1];
  
  return (
    <div>
      {locales.map((loc) => (
        <button
          key={loc}
          onClick={() => {
            const newPath = pathname.replace(`/${currentLocale}`, `/${loc}`);
            window.location.href = newPath || `/${loc}`;
          }}
          disabled={currentLocale === loc}
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 
            ${currentLocale === loc 
              ? 'bg-green-600 text-white cursor-not-allowed opacity-50' 
              : 'bg-transparent border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white hover:scale-105'
            } mr-2`}
        >
          {loc.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
