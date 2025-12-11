"use client"

import {FileText, Sparkles, Lock, Zap, ArrowRight, ArrowDownIcon} from "lucide-react";
import React, { useState, useEffect } from "react";
import AnimatedBg from "@/components/AnimatedBg";
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import StarTwinkle from "@/components/StarTwinkle";

export default function Overview() {
  const router = useRouter();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    // const handleMouseMove = (e) => {
    //   setMousePosition({ x: e.clientX, y: e.clientY });
    // };

    window.addEventListener("scroll", handleScroll);
    // window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      // window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const features = [
    {
      icon: <FileText className="w-8 h-8" />,
      title: "Smart PDF Operations",
      description: "Moderate methods to bind pages technically",
    },
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "Minimal Toolkit",
      description: "A set of toolkit for minimal edits",
    },
    {
      icon: <Lock className="w-8 h-8" />,
      title: "Secure Processing",
      description: "To make files secure, we need your memory",
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Accelerated workflow",
      description: "Merge, split, and N-up PDFs in seconds",
    },
  ];

  return (
    <>
    <Navbar/>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.2 }}
        className="min-h-screen overflow-hidden"
      >
        {/* Animated background gradient */}
        <AnimatedBg />
        <StarTwinkle/>

        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center px-6 pt-20">
          <div
            className="max-w-6xl mx-auto text-center"
            style={{
              transform: `translateY(${scrollY}px)`,
              opacity: 1 - scrollY / 400,
            }}
          >
            {/* Animated badge */}
            <div className="mt-8 inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 backdrop-blur-sm mb-8">
              <ArrowDownIcon className="w-6 h-6 text-pink-400 animate-bounce" />
            </div>

            {/* Main heading with gradient animation */}
            <h1 className="text-2xl md:text-7xl font-bold mb-6 leading-tight">
              {" "}
              <span className="bg-linear-to-r from-cyan-400 via-pink-400 to-emerald-400 bg-clip-text text-transparent animate-pulse">
                A Minimal
              </span>{" "}
              <span className="bg-linear-to-r from-green-400 via-yellow-400 to-red-400 bg-clip-text text-transparent animate-pulse">
                {" "}
                Solution
              </span>
              <br />
              <span className="bg-linear-to-r from-pink-500 via-blue-400 to-green-400 bg-clip-text text-transparent animate-pulse">
              for your{" "}
              Academic{" "}
              stuffs
              </span>
              <span className="text-cyan-400">.</span>
            </h1>

            {/* Subtitle with glassmorphism */}
            <p className="text-lg md:text-xl text-gray-300 max-w-4xl mx-auto mb-12 leading-relaxed backdrop-blur-sm bg-white/5 p-6 rounded-2xl border border-white/10">
              Transform pages into seamless narratives with unmatched precision.
              Harness the predictable power of client-side PDF manipulation,
              where every merge, split, and pdf to image occurs with acceleration
              and privacy.
            </p>

            {/* CTA Button with enhanced effects */}
            <button
              onClick={() => router.push("/about")}
              className="group relative px-8 py-4 rounded-full bg-linear-to-r from-cyan-500 to-red-500 hover:from-green-400 hover:to-emerald-400 text-white font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-green-500/50 overflow-hidden"
            >
              <span className="relative z-10 flex items-center space-x-2">
                <span>Why this is?</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-linear-to-r from-green-600 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>
        </section>

        {/* Features Section */}
        <section className="relative py-20 px-6">
          <div
            className="max-w-7xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 bg-linear-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Core Competence
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="group relative backdrop-blur-xl bg-white/5 border border-purple-500/20 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-500/30"
                  style={{
                    animationDelay: `${index * 100}ms`,
                  }}
                >
                  {/* Animated gradient border on hover */}
                  <div className="absolute inset-0 rounded-2xl bg-linear-to-r from-purple-500 to-cyan-500 opacity-0 group-hover:opacity-20 transition-opacity blur-xl" />

                  <div className="relative z-10">
                    <div className="w-16 h-16 rounded-xl bg-linear-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <div className="text-purple-400 group-hover:text-cyan-400 transition-colors">
                        {feature.icon}
                      </div>
                    </div>

                    <h3 className="text-xl font-semibold mb-2 text-white group-hover:text-transparent group-hover:bg-linear-to-r group-hover:from-purple-400 group-hover:to-cyan-400 group-hover:bg-clip-text transition-all">
                      {feature.title}
                    </h3>

                    <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="relative py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="backdrop-blur-xl bg-linear-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/20 rounded-3xl p-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                {[
                  { value: "100+", label: "PDFs Processed" },
                  { value: "9/10", label: "Accuracy Rate" },
                  { value: "<1s", label: "Processing Time" },
                ].map((stat, index) => (
                  <div key={index} className="group cursor-pointer">
                    <div className="text-4xl md:text-6xl font-bold bg-linear-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform">
                      {stat.value}
                    </div>
                    <div className="text-gray-400 text-lg group-hover:text-white transition-colors">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
        {/* Quote Block (Replicates your landing page card style) */}
          <div className="max-w-7xl m-auto mb-10 text-center flex justify-center items-center p-4 border border-indigo-500/30 bg-indigo-500/5 rounded-lg text-lg opacity-85">
            Suggestion: Please use Fluxon for non-essential PDF files that
            contain no sensitive data.
          </div>{" "}
      </motion.div>
      <Footer bridge={'Do more with your stuff'} name={'Overview'} />
    </>
  );
}
