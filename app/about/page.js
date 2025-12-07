"use client"

import Navbar from '@/components/Navbar'
import { motion } from 'framer-motion';
import AnimatedBg from '@/components/AnimatedBg';
import Footer from '@/components/Footer';
import GradientText from '@/components/GradientText';
import Link from 'next/link';
import { Instagram, HomeIcon } from 'lucide-react';

export default function About() {
    return (
        <>
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
              About: The Fluxon Standard.
            </GradientText>
          </div>
          
          <p className="text-xl md:text-2xl font-light max-w-4xl mx-auto opacity-80">
            {/* Placeholder: Your one-sentence mission */}
            {/* Harnessing the speed of client-side architecture to deliver academic PDF tools with precision. */}
            The project which is developed for PDF minimal operations for academic purpose mainly
          </p>
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
            <h2 className="text-2xl font-semibold text-indigo-400 mb-4">
              01. The Origin & Philosophy
            </h2>
            {/* Placeholder: Detailed text blocks */}
            <p className="mb-6 leading-relaxed opacity-90">
              [ Placeholder for your story: The academic landscape is slow and often data-hungry. Fluxon was born from the need for immediate, secure utility, eliminating server wait times and the risk of data breaches. ]
            </p>
            <p className="leading-relaxed opacity-90">
              [ Placeholder: Our philosophy centers on **zero data retention**. Every merge, split, and conversion happens entirely within your browser, ensuring maximum speed and complete digital safety. ]
            </p>
          </div>

          {/* Column 2: What Makes Us Different / Features */}
          <div>
            <h2 className="text-2xl font-semibold text-indigo-400 mb-6">
              02. Unmatched Precision & Privacy
            </h2>
            
            {/* Differentiator List */}
            <ul className="space-y-4">
              <li className="flex items-start">
                <span className="text-green-400 text-2xl mr-3 leading-none">•</span>
                <div>
                  <strong className="text-white">Client-Side Guarantee:</strong> No files ever leave your device. Speed meets absolute privacy.
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 text-2xl mr-3 leading-none">•</span>
                <div>
                  <strong className="text-white">Predictable Power:</strong> Consistent, high-speed manipulation regardless of server load.
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 text-2xl mr-3 leading-none">•</span>
                <div>
                  <strong className="text-white">Minimalist Focus:</strong> Only the essential tools for academic efficiency. No bloat, just function.
                </div>
              </li>
            </ul>
            
            {/* Quote Block (Replicates your landing page card style) */}
            <blockquote className="mt-8 p-4 border border-indigo-500/30 bg-indigo-500/5 rounded-lg text-lg italic opacity-85">
              "We didn't just build a tool; we redefined the trust model for digital academic assistance."
            </blockquote>

          </div>

        </section>

        {/* ➡️ Optional: Call to Action */}
        <section className="flex justify-center items-center flex-col mt-24">
          <Link href="/" className="mt-4 flex py-3 px-8 text-lg font-semibold rounded-full shadow-lg transition duration-300 ease-in-out 
            bg-linear-to-r from-emerald-600 to-blue-600 hover:from-fuchsia-500 hover:to-red-500">
            <HomeIcon className='text-amber-400 mr-5'/> Go to Home &rarr;
          </Link>
          <br/>
          <Link href="https://www.instagram.com/miznotfound/#" target='_blank' rel='noopener noreferrer nofollow' className="flex mt-4 py-3 px-8 text-lg font-thin rounded-full shadow-lg transition duration-300 ease-in-out 
            bg-linear-to-r from-emerald-600 to-blue-600 hover:from-fuchsia-500 hover:to-red-500" aria-label="Follow me on Instagram">
            <Instagram className='text-pink-400 mr-5'/> Find me on social &rarr;
          </Link>
        </section>

      </main>
        </motion.div>
        <Footer bridge={'I appreciate your interest'} name={'About'}/>
        </>
    )
}