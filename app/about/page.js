"use client";

import { GradientInkBackground, MouseAnimation } from "@/components/Animation";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import Footer from "@/components/Footer";
import GradientText from "@/components/GradientText";
import Link from "next/link";
import {
  Instagram,
  HomeIcon,
  Merge,
  Image,
  Form,
  SquareSplitHorizontal,
} from "lucide-react";

const Colr = ({ text, color }) => {
  return <span style={{ color: color }}>{text}</span>;
};

export default function About() {
  const features = [
    {
      icon: <Merge className="w-8 h-8" />,
      title: "Merge PDF",
      description: "Merge more files into one",
    },
    {
      icon: <Form className="w-8 h-8" />,
      title: "Compose to sheet",
      description: "Make PDF doc printer-friendly",
    },
    {
      icon: <SquareSplitHorizontal className="w-8 h-8" />,
      title: "Split PDF",
      description: "Break files into pieces",
    },
    {
      icon: <Image className="w-8 h-8" />,
      title: "PDF to Image",
      description: "Covert PDF pages into images",
    },
  ];
  return (
    <>
      <title>About - know the reason to build this | Fluxon</title>
      <Navbar />
      <GradientInkBackground/>
      <MouseAnimation/>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.2 }}
        className="text-center mt-30"
      >
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          {/* 🚀 Section 1: Hero/Mission Statement */}
          <section className="text-center mb-20">
            <div className="mb-6">
              <GradientText size="3xl">
                {/* About Me <span className='text-xl'>(fluxon)</span> */}
                Behind The Thought
              </GradientText>
            </div>

            <p className="text-xl font-light mx-auto opacity-80">
              <span className="text-amber-500">"</span>
              This initiative is developed to provide minimal control over PDF
              focusing academic purposes
              <span className="text-amber-500">"</span>
            </p>
          </section>
          <section className="flex justify-center items-center m-5">
            <br />
            <Link
              href="https://www.instagram.com/miznotfound/#"
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="flex m-2 py-3 px-8 text-lg font-thin rounded-full shadow-lg transition duration-300 ease-in-out 
            bg-linear-to-r from-emerald-600 to-blue-600 hover:from-fuchsia-500 hover:to-red-500"
              aria-label="Follow me on Instagram"
            >
              <Instagram className="text-pink-400 mr-3 w-5 h-5 sm:w-6 sm:h-6 md:mr-5 lg:w-7 lg:h-7" /> Help me to improve &rarr;
            </Link>
          </section>
          {/* --- 🌈 Neon Divider --- */}
          <div className="relative my-20 h-px">
            <div
              className="absolute inset-0 bg-linear-to-r from-transparent via-yellow-500/80 to-transparent shadow-neon"
              style={{
                boxShadow:
                  "0 0 10px rgba(76, 110, 245, 0.8), 0 0 20px rgba(76, 110, 245, 0.4)",
              }}
            ></div>
          </div>
          {/* The inline style is used here for the specific "neon glow" effect */}
          {/* 📚 Section 2: Detailed Content Grid */}
          <section className="inline-block text-center p-5">
            {/* Column 1: Core Story / Why We Exist */}
            <div className="m-5">
              <h2 className="text-4xl font-semibold text-fuchsia-500 mb-5">
                My Origin & Purpose
              </h2>
              {/* Placeholder: Detailed text blocks */}
              <p className="m-4 leading-relaxed opacity-90">
                Hi, I’m Fluxon. I’m a minimalist PDF tool created to make small,
                annoying PDF tasks effortless. My developer, Caax, built me as a
                hobby project after realizing how overly complicated most PDF
                utilities are. I focus only on essential features like merging
                files, optional color inversion, page composing, splitting
                documents, and converting PDFs to images. I’m built with
                JavaScript and Next.js, with some AI assistance for tougher
                parts. I’m completely free to use, with no paywalls or bloated
                menus. My goal is to stay simple, fast, and practical for
                everyday tasks. Even though my developer is preparing for
                medical, he still built me with care and intention. I
                exist to save you time and reduce the friction of operating
                PDFs. Put me to use—I’m here to make your workflow smoother.
              </p>
            </div>
            {/* another hr */}
            <div className="relative my-20 h-px">
              <div
                className="absolute inset-0 bg-linear-to-r from-transparent via-cyan-500/50 to-transparent shadow-neon"
                style={{
                  boxShadow:
                    "0 0 10px rgba(76, 110, 245, 0.8), 0 0 20px rgba(76, 110, 245, 0.4)",
                }}
              ></div>
            </div>

            {/* Column 2: What Makes Us Different / Features */}
            <div className="text-center m-8">
              <h2 className="pt-5 text-4xl font-semibold text-emerald-400 mb-6">
                Features That I provide
              </h2>

              <div className="text-left grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="group relative backdrop-blur-xl bg-white/5 border border-purple-500/20 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-500/30"
                    style={{
                      animationDelay: `${index * 100}ms`,
                    }}
                  >
                    {/* Animated gradient border on hover */}
                    <div className="absolute inset-0 rounded-2xl bg-linear-to-r from-cyan-500 to-blue-500 opacity-0 group-hover:opacity-20 transition-opacity blur-xl" />

                    <div className="relative z-10">
                      <div className="w-16 h-16 rounded-xl bg-linear-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <div className="text-yellow-400 group-hover:text-emerald-400 transition-colors">
                          {feature.icon}
                        </div>
                      </div>

                      <h3 className="text-xl font-semibold mb-2 text-white group-hover:text-transparent group-hover:bg-linear-to-r group-hover:from-cyan-300 group-hover:to-amber-400 group-hover:bg-clip-text transition-all">
                        {feature.title}
                      </h3>

                      <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {/* Another H rule */}
              <div className="relative my-20 h-px">
                <div
                  className="absolute inset-0 bg-linear-to-r from-transparent via-purple-400/80 to-transparent shadow-neon"
                  style={{
                    boxShadow:
                      "0 0 10px rgba(76, 110, 245, 0.8), 0 0 20px rgba(76, 110, 245, 0.4)",
                  }}
                ></div>
              </div>

              <h2 className="mt-15 text-4xl bg-clip-text font-semibold text-cyan-500 mb-4">
                A Message for You
              </h2>
              <p className="m-6 leading-relaxed opacity-90">
                Hi there! Because I'm a completely free tool built by Caax out
                of passion, I need to be straightforward with you: I am provided
                "as-is," meaning I come without any formal guarantees.{" "}
                <Colr
                  text={
                    "Please use trusted sites if you know that you may fallen into problem"
                  }
                  color={"pink"}
                />
                . I cannot be held responsible if something goes wrong—like a
                rare system glitch, file corruption, or data loss.
              </p>
              <p className="m-6 leading-relaxed opacity-90">
                It is absolutely essential that you always keep a backup of your
                original PDF files before letting me work on them. By clicking
                "Upload" or "Process," you are agreeing to take personal
                responsibility for your files, understanding that Caax (my
                developer) and I are free from liability for any issues that may
                arise. Thanks for understanding, and let's get manipulating!
              </p>
            </div>
          </section>
          {/* ➡️ Optional: Call to Action */}
          <section className="flex justify-center items-center flex-row mt-10">
            <Link
              href="/"
              className="m-2 flex py-3 px-8 text-lg font-semibold rounded-full shadow-lg transition duration-300 ease-in-out 
            bg-linear-to-r from-emerald-600 to-blue-600 hover:from-cyan-500 hover:to-amber-500"
            >
              <HomeIcon className="text-amber-400 mr-5" /> Go to Home &rarr;
            </Link>
          </section>
        </main>
      </motion.div>
      <Footer bridge={"I appreciate your interest"} name={"About"} />
    </>
  );
}
