'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { clientPromiseDb } from '@/lib/mongodb';
import { createK8sDeployment } from '@/lib/whatsAppService/kubernetes_part.mjs';

const CreateClientButton = (uniqueId: string) => {
  const { data: session } = useSession();

  const handleCreateClient = async () => {
    if (session) {
      const email = session?.user?.email; // Assuming the uniqueId is stored in session.user.id
      const db = await clientPromiseDb;
      const collection = db.collection('users');
      const user = await collection.findOne({ email: email });
      const uniqueId = user?.unique_id;

      let less_than_5_numbers;

      // add checking whether the user has more than 5 numbers attached

      less_than_5_numbers = true;

      try {
        if (less_than_5_numbers) {
          // createK8sDeployment(uniqueId);
          console.log('Client created successfully with unique id:', uniqueId);
        } else {
          console.log('User has more than 5 numbers attached');
        }
      } catch (error) {
        console.error('Error creating client:', error);
      }
    } else {
      console.error('No active session found');
    }
  };

  return (
    <button
      onClick={handleCreateClient}
      className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-colors duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 gap-2"
    >
      Create WhatsApp Client
    </button>
  );
};

export default CreateClientButton;
