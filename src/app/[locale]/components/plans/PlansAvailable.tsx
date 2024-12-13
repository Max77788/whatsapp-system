'use client';

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useEffect, useState } from 'react';

type Plan = {
  id: string;
  name: string;
  price: number;
  aiIncluded: boolean;
  messageLimit: number;
  maxWaAccsNumber: number;
};

export default function PlansAvailable() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

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
      <div className="p-4">
        <h1 className="text-4xl font-extrabold text-center mb-4">Our Plans</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 justify-items-center">
            <div className="animate-pulse space-y-5">
              <div className="relative flex flex-col items-center border rounded-full shadow-lg w-72 p-8">
                <div className="h-8 bg-gray-300 rounded w-3/4 mb-4"></div>
                <div className="h-10 bg-gray-300 rounded w-1/2 mb-6"></div>
                <div className="text-white space-y-8">
                  <div className="flex items-center">
                    <CheckCircleIcon style={{ color: 'green', fontSize: '24px' }} />
                    <div className="h-4 bg-gray-300 rounded w-1/2 ml-2"></div>
                  </div>
                  <div className="flex items-center">
                    <CheckCircleIcon style={{ color: 'green', fontSize: '24px' }} />
                    <div className="h-4 bg-gray-300 rounded w-1/2 ml-2"></div>
                  </div>
                  <div className="flex items-center">
                    <CheckCircleIcon style={{ color: 'green', fontSize: '24px' }} />
                    <div className="h-4 bg-gray-300 rounded w-1/2 ml-2"></div>
                  </div>
                </div>
                <div className="h-10 bg-gray-300 rounded w-1/2 mt-4"></div>
              </div>
            </div>


            <div className="animate-pulse space-y-5">
              <div className="relative flex flex-col items-center border rounded-full shadow-lg w-72 p-8">
                <div className="h-8 bg-gray-300 rounded w-3/4 mb-4"></div>
                <div className="h-10 bg-gray-300 rounded w-1/2 mb-6"></div>
                <div className="text-white space-y-8">
                  <div className="flex items-center">
                    <CheckCircleIcon style={{ color: 'green', fontSize: '24px' }} />
                    <div className="h-4 bg-gray-300 rounded w-1/2 ml-2"></div>
                  </div>
                  <div className="flex items-center">
                    <CheckCircleIcon style={{ color: 'green', fontSize: '24px' }} />
                    <div className="h-4 bg-gray-300 rounded w-1/2 ml-2"></div>
                  </div>
                  <div className="flex items-center">
                    <CheckCircleIcon style={{ color: 'green', fontSize: '24px' }} />
                    <div className="h-4 bg-gray-300 rounded w-1/2 ml-2"></div>
                  </div>
                </div>
                <div className="h-10 bg-gray-300 rounded w-1/2 mt-4"></div>
              </div>
            </div>


            <div className="animate-pulse space-y-5">
              <div className="relative flex flex-col items-center border rounded-full shadow-lg w-72 p-8">
                <div className="h-8 bg-gray-300 rounded w-3/4 mb-4"></div>
                <div className="h-10 bg-gray-300 rounded w-1/2 mb-6"></div>
                <div className="text-white space-y-8">
                  <div className="flex items-center">
                    <CheckCircleIcon style={{ color: 'green', fontSize: '24px' }} />
                    <div className="h-4 bg-gray-300 rounded w-1/2 ml-2"></div>
                  </div>
                  <div className="flex items-center">
                    <CheckCircleIcon style={{ color: 'green', fontSize: '24px' }} />
                    <div className="h-4 bg-gray-300 rounded w-1/2 ml-2"></div>
                  </div>
                  <div className="flex items-center">
                    <CheckCircleIcon style={{ color: 'green', fontSize: '24px' }} />
                    <div className="h-4 bg-gray-300 rounded w-1/2 ml-2"></div>
                  </div>
                </div>
                <div className="h-10 bg-gray-300 rounded w-1/2 mt-4"></div>
              </div>
            </div>


        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-4xl font-extrabold text-center mb-12">Our Plans</h1>
      <div className="grid grid-cols-1 gap-8 justify-items-center">
        <div className="relative flex flex-col items-center border rounded-full shadow-lg w-72 p-8 hover:shadow-xl transition-shadow duration-300">
          <h2 className="text-3xl font-bold mb-4 text-center">{plans[0]?.name}</h2>
          <p className="text-5xl font-extrabold mb-6 text-center">
            {plans[0]?.price}
            <span className="text-lg font-medium"> NIS</span>
          </p>
          <div className="text-white space-y-8">
            <p className="flex items-center">
              <CheckCircleIcon style={{ color: 'green', fontSize: '24px' }} />
              AI Included: {plans[0]?.aiIncluded ? 'Yes' : 'No'}
            </p>
            <p className="flex items-center">
              <CheckCircleIcon style={{ color: 'green', fontSize: '24px' }} />
              Max WhatsApp Accounts: {plans[0]?.maxWaAccsNumber}
            </p>
            <p className="flex items-center">
              <CheckCircleIcon style={{ color: 'green', fontSize: '24px' }} />
              Message Limit: {plans[0]?.messageLimit || 'No Limit'}
            </p>
          </div>
          <a
            href="/auth/signin"
            className="bg-gradient-to-r bg-green-600 text-white font-semibold px-8 py-3 rounded-full shadow-md hover:text-white mt-4"
          >
            Get Started
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
                <span className="text-lg font-medium"> NIS</span>
              </p>
              <div className="text-white space-y-8">
                <p className="flex items-center">
                  <CheckCircleIcon style={{ color: 'green', fontSize: '24px' }} />
                  AI Included: {plan.aiIncluded ? 'Yes' : 'No'}
                </p>
                <p className="flex items-center">
                  <CheckCircleIcon style={{ color: 'green', fontSize: '24px' }} />
                  Max WhatsApp Accounts: {plan.maxWaAccsNumber}
                </p>
                <p className="flex items-center">
                  <CheckCircleIcon style={{ color: 'green', fontSize: '24px' }} />
                  Message Limit: {plan.messageLimit || 'No Limit'}
                </p>
              </div>
              <a
                href="/auth/signin"
                className="bg-gradient-to-r bg-green-600 text-white font-semibold px-8 py-3 rounded-full shadow-md hover:text-white mt-4"
              >
                Get Started
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
      
  


  
  );
}
