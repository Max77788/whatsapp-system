'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CredentialsForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData(e.target as HTMLFormElement);

    const signInResponse = await signIn('credentials', {
      email: data.get('email'),
      password: data.get('password'),
      redirect: false,
    });

    if (signInResponse && !signInResponse.error) {
      router.push('/dashboard');
    } else {
        console.log("Error:", signInResponse);
      setError('Invalid email or password');
    }
  }
  return (
    <form 
    className="flex flex-col items-center justify-center w-full max-w-md mt-5 p-0 shadow-md mx-auto"
    onSubmit={handleSubmit}
    >
    
    {error && <span className="text-red-500 font-semibold inline-block">{error}</span>}
    <input type="email" name="email" placeholder="Email" required className="mb-4 p-2 border border-gray-300 rounded-md w-full"/>
    <input type="password" name="password" placeholder="Password" required className="mb-4 p-2 border border-gray-300 rounded-md w-full"/>
      <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full">Sign In</button>
    </form>
  );
}
