/* eslint-disable @next/next/no-img-element */
import React from 'react';

// This layout component wraps the authentication pages (like login, sign up)
const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    // Main container for the full-screen layout
    <main className="flex min-h-screen w-full">
      
      {/* Left Side: Branding and Illustration */}
      <section className='hidden min-h-screen w-2/5 flex-col justify-between bg-[#F85A5A] p-12 text-white md:flex'>
        <div>
          {/* Using your Logo.svg from the public folder */}
          <img src="/Logo.svg" alt="StoreIt Logo" className="h-12 w-auto" />
          
          <div className='mt-16'>
            <h1 className='text-4xl font-extrabold leading-tight'>
              Manage your files <br /> the best way
            </h1>
            <p className='mt-4 text-lg text-white/90'>
              Awesome, we have created the perfect place for you to store all your documents.
            </p>
          </div>
        </div>
        
        <div>
          {/* Using your Illustration.svg from the public folder */}
          <img
            src="/Illustration.svg"
            alt="File management illustration"
            className='mx-auto h-auto w-full max-w-sm transition-transform duration-300 ease-in-out hover:scale-105'
          />
        </div>
      </section>
      
      {/* Right Side: Form Content */}
      <section className='flex flex-1 flex-col items-center justify-center bg-white p-8 lg:p-16'>
        {/* This is where the actual page content (e.g., the Create Account form) will be rendered */}
        {children}
      </section>

    </main>
  );
}

export default AuthLayout;

