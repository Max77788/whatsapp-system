"use client";

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CredentialsForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("admin@demo.com");
  const [password, setPassword] = useState("admin123");

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
        console.log("Error:", signInResponse?.error);
      setError(`${signInResponse?.error}`);
    }
  }
  return (
    <form 
    className="flex flex-col items-center justify-center w-full max-w-md mt-5 p-0 shadow-md mx-auto"
    onSubmit={handleSubmit}
    >
    
    {error && <span className="mb-1 text-red-500 font-semibold inline-block">{error}</span>}
    <label htmlFor="email" className="mb-2 text-sm font-medium text-gray-900 dark:text-white self-start">Email</label>
    <input type="email" 
    name="email" 
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    placeholder="Email" 
    required 
    className="mb-4 p-2 border border-gray-300 rounded-md w-full text-black"/>
    <div className="relative w-full mb-4">
      <label htmlFor="password" className="mb-2 text-sm font-medium text-gray-900 dark:text-white self-start">Password</label>
      <input 
        type={showPassword ? "text" : "password"} 
        name="password" 
        placeholder="Password" 
        value={password}
          onChange={(e) => setPassword(e.target.value)}
        required 
        className="p-2 border border-gray-300 rounded-md w-full text-black"
      />
      <button
        type="button"
        className="absolute right-2 bottom-2 text-gray-500 hover:text-gray-700"
        onClick={() => setShowPassword(!showPassword)}
      >
        {showPassword ? "🫥" : "👁️"}
      </button>
    </div>
      <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full">Sign In</button>
    </form>
  );
}
