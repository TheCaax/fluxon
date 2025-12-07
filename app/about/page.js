"use client"

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar'
import { motion } from 'framer-motion';
import AnimatedBg from '@/components/AnimatedBg';
import Footer from '@/components/Footer';
import GradientText from '@/components/GradientText';
import Link from 'next/link';
import { Instagram, HomeIcon, ArrowDown } from 'lucide-react';

const Colr = ({ text, color }) => {
  return (
    <span style={{ color: color }}>
      {text}
    </span>
  );
};

export default function About() {
    return (
        <>
        <title>About - know the reason to build this | Fluxon</title>
        <Navbar/>
        <AnimatedBg/>
        <motion.div  
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.2 }} 
        className='text-center mt-30'>
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">

        {/* 🚀 Section 1: Hero/Mission Statement */}
        <section className="text-center mb-20">
          <div className="mb-6">
            <GradientText size="3xl">
              About Me <span className='text-xl'>(fluxon)</span>
            </GradientText> 
          </div>
          
          <p className="text-xl font-light mx-auto opacity-80">
            <span className='text-amber-500'>"</span>
            This initiative is developed to provide minimal control over PDF focusing academic purposes
            <span className='text-amber-500'>"</span>
          </p>
        </section>

        <section className="flex justify-center items-center flex-row m-5">
          
          <br/>
          <Link href="https://www.instagram.com/miznotfound/#" target='_blank' rel='noopener noreferrer nofollow' className="flex m-2 py-3 px-8 text-lg font-thin rounded-full shadow-lg transition duration-300 ease-in-out 
            bg-linear-to-r from-emerald-600 to-blue-600 hover:from-fuchsia-500 hover:to-red-500" aria-label="Follow me on Instagram">
            <Instagram className='text-pink-400 mr-5'/> Connect with my developer &rarr;
          </Link>
        </section>

        {/* --- 🌈 Neon Divider --- */}
        <div className="relative my-20 h-px">
          <div 
            className="absolute inset-0 bg-linear-to-r from-transparent via-indigo-500/80 to-transparent shadow-neon"
            style={{ 
              boxShadow: '0 0 10px rgba(76, 110, 245, 0.8), 0 0 20px rgba(76, 110, 245, 0.4)'
            }}
          ></div>
        </div>
        {/* The inline style is used here for the specific "neon glow" effect */}
        
        {/* 📚 Section 2: Detailed Content Grid */}
        <section className="grid md:grid-cols-2 gap-16 lg:gap-24">

          {/* Column 1: Core Story / Why We Exist */}
          <div>
            <h2 className="text-3xl bg-clip-text font-semibold bg-linear-to-r from-cyan-500 via-red-400 to-cyan-500 text-transparent mb-4">
              My Origin & Purpose
            </h2>
            {/* Placeholder: Detailed text blocks */}
            <p className="m-4 leading-relaxed opacity-90">
              I’m <Colr text={'Fluxon, '} color={'#00ffff'}/> and I’m delighted you stopped by. Unlike large, complicated stuff, I was designed to be your <Colr text={'Minimalist'} color={'yellow'}/>, go-to tool for all things PDF. My origin story is pretty simple: I was brought to life by <Colr text={'Caax'} color={'#51a9fc'}/>, a <Colr text={'passionate hobbyist'} color={'#40c253'}/> coder who, like many people, noticed how frustrating minor PDF tasks could be. My developer, Caax was searching for a fun, meaningful web app project and decided to focus on fixing those little annoyances—that’s where I came in! I exist because powerful file tools shouldn't be locked behind paywalls or buried under complex menus. My mission is to be simple, efficient, and always completely free for you to use.
            </p>
            <hr width='100%'/>
            <p className="m-4 leading-relaxed opacity-90">
              I was custom-built using the powerful combination of <Colr text={'JS'} color={'#ffff00'}/> and the <Colr text={'Next.js'} color={'pink'}/> framework. My core functions are made for practicality and include the essentials you need most: I can merge multiple files (with the unique option for neat color inversion), arrange content by composing various pages onto printable sheets, accurately split large documents, and quickly convert any PDF into an image format. I take care of the heavy lifting so you can get back to your work in just a few clicks.
            </p>
            <hr width='100%'/>
            <p className="m-4 leading-relaxed opacity-90">
              Ultimately, I am a labor of love—a direct result of Caax's dedication to coding and his desire to give back to the online community. Caax built me for you to have immediate, hassle-free access to moderate-quality PDF utilities. So go ahead, put me to the test! Thank you for visiting Fluxon; I'm here to streamline your workflow and help you manipulate your next PDF with ease.
            </p>
          </div>

          {/* Column 2: What Makes Us Different / Features */}
          <div>
            <h2 className="text-3xl font-semibold bg-clip-text bg-linear-to-r from-cyan-500 via-red-400 to-cyan-500 text-transparent mb-6">
              The features I provide
            </h2>
            
            {/* Differentiator List */}
            <ul className="space-y-4">
              <li className="flex items-start">
                <span className="text-green-400 text-2xl mr-3 leading-none">•</span>
                <div>
                  <strong className="text-white">Client-Side Upload:</strong> I am developed for client-side processing. Speed meets absolute privacy.
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 text-2xl mr-3 leading-none">•</span>
                <div>
                  <strong className="text-white">Predictable Flow:</strong> Providing you moderate but applicable editing I am regardless of server request and response.
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 text-2xl mr-3 leading-none">•</span>
                <div>
                  <strong className="text-white">Minimalist Focus:</strong> Only the essential tools for academic efficiency. Not massive, just summation of some function and libraries.
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 text-2xl mr-3 leading-none">•</span>
                <div>
                  <strong className="text-white">Used Components:</strong> I was built by Caax using Next.js.
                </div>
              </li>
            </ul>
            
            {/* Quote Block (Replicates your landing page card style) */}
            <div className="mt-8 p-4 border border-indigo-500/30 bg-indigo-500/5 rounded-lg text-lg italic opacity-85">
              "We didn't just build a tool; we redefined the trust model for digital academic assistance."
            </div>
            {" "}
            <hr width="100%"/>
            <h2 className="m-5 text-3xl bg-clip-text font-semibold bg-linear-to-r from-purple-500 via-amber-600 to-cyan-500 text-transparent mb-4">
              T&C
            </h2>
            <p className='m-6 leading-relaxed opacity-90'>
              Hi there! Because I'm a completely free tool built by Caax out of passion, I need to be straightforward with you: I am provided "as-is," meaning I come without any formal guarantees. <Colr text={"Please use trusted one if you know that you may fallen into problem"} color={'yellow'}/>. I cannot be held responsible if something goes wrong—like a rare system glitch, file corruption, or data loss.
            </p>
            <p className='m-6 leading-relaxed opacity-90'>
              It is absolutely essential that you always keep a backup of your original PDF files before letting me work on them. By clicking "Upload" or "Process," you are agreeing to take personal responsibility for your files, understanding that Caax (my developer) and I are free from liability for any issues that may arise. Thanks for understanding, and let's get manipulating!
            </p>
            
          </div>

        </section>

        {/* ➡️ Optional: Call to Action */}
        <section className='flex justify-center items-center flex-row mt-20'>
            <Link href="/" className="m-2 flex py-3 px-8 text-lg font-semibold rounded-full shadow-lg transition duration-300 ease-in-out 
            bg-linear-to-r from-emerald-600 to-blue-600 hover:from-cyan-500 hover:to-amber-500">
            <HomeIcon className='text-amber-400 mr-5'/> Go to Home &rarr;
          </Link>
        </section>

      </main>
        </motion.div>
        <Footer bridge={'I appreciate your interest'} name={'About'}/>
        </>
    )
}