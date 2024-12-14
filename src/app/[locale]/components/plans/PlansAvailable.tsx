'use client';

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';

type Plan = {
  id: string;
  name: string;
  price: number;
  aiIncluded: boolean;
  messageLimit: number;
  maxWaAccsNumber: number;
};

export default function PlansAvailable() {
  const t = useTranslations('plans');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const currentLocale = useLocale();

  // Fetch plans from the API
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await fetch('/api/admin/plans/get-all');
        if (!res.ok) throw new Error('Failed to fetch plans');
        const data: Plan[] = await res.json();
        setPlans(data);
      } catch (error) {
        console.error('Error fetching plans:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  if (loading) {
    return (
      null
    );
  }

  if (!loading) {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-extrabold text-center mb-12">{t('ourPlans')}</h1>
      <div className="grid grid-cols-1 gap-8 justify-items-center">
        <div className="relative flex flex-col items-center border rounded-full shadow-lg w-72 p-8 hover:shadow-xl transition-shadow duration-300">
          <h2 className="text-3xl font-bold mb-4 text-center">{plans[0]?.name}</h2>
          <p className="text-5xl font-extrabold mb-6 text-center">
            {plans[0]?.price}
            <span className="text-lg font-medium"> {t('currency')}</span>
          </p>
          <div className="text-white space-y-8">
            <p className="flex items-center">
              <CheckCircleIcon style={{ color: 'green', fontSize: '24px' }} />
              {t('aiIncluded')}: {plans[0]?.aiIncluded ? t('yes') : t('no')}
            </p>
            <p className="flex items-center">
              <CheckCircleIcon style={{ color: 'green', fontSize: '24px' }} />
              {t('maxWhatsAppAccounts')}: {plans[0]?.maxWaAccsNumber}
            </p>
            <p className="flex items-center">
              <CheckCircleIcon style={{ color: 'green', fontSize: '24px' }} />
              {t('messageLimit')}: {plans[0]?.messageLimit || t('noLimit')}
            </p>
          </div>
          <a
            href={`/${currentLocale}/auth/signin`}
            className="bg-gradient-to-r bg-green-600 text-white font-semibold px-8 py-3 rounded-full shadow-md hover:text-white mt-4"
          >
            {t('getStarted')}
          </a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 justify-items-center">
          {plans.slice(1).map((plan) => (
            <div
              key={plan.id}
              className="relative flex flex-col items-center border rounded-full shadow-lg w-72 p-8 hover:shadow-xl transition-shadow duration-300"
            >
              <h2 className="text-3xl font-bold mb-4 text-center">{plan.name}</h2>
              <p className="text-5xl font-extrabold mb-6 text-center">
                {plan.price}
                <span className="text-lg font-medium"> {t('currency')}</span>
              </p>
              <div className="text-white space-y-8">
                <p className="flex items-center">
                  <CheckCircleIcon style={{ color: 'green', fontSize: '24px' }} />
                  {t('aiIncluded')}: {plan.aiIncluded ? t('yes') : t('no')}
                </p>
                <p className="flex items-center">
                  <CheckCircleIcon style={{ color: 'green', fontSize: '24px' }} />
                  {t('maxWhatsAppAccounts')}: {plan.maxWaAccsNumber}
                </p>
                <p className="flex items-center">
                  <CheckCircleIcon style={{ color: 'green', fontSize: '24px' }} />
                  {t('messageLimit')}: {plan.messageLimit || t('noLimit')}
                </p>
              </div>
              <a
                href={`/${currentLocale}/auth/signin`}
                className="bg-gradient-to-r bg-green-600 text-white font-semibold px-8 py-3 rounded-full shadow-md hover:text-white mt-4"
              >
                {t('getStarted')}
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
}
