"use client";

import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';


export async function loginIsRequiredClient() {
    if (typeof window !== 'undefined') {
      const session = await useSession();
      const router = useRouter();
      if (!session) {
        toast.error('You must be signed in to view this page');
        router.push("/auth/signin");
      }
    }
  }

