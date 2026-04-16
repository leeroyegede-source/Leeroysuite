"use client"

import { Button } from '@/components/ui/button'
import { CalendarCheck, CreditCard, LayoutGrid, LogIn, SendHorizontal, Sparkles, Paperclip, X } from 'lucide-react'
import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

const suggestions = [
  {
    label: 'Auth Login Form',
    prompt: 'Create a modern login form featuring email/password inputs, password strength indicator, OAuth buttons, and a glassmorphic card design with soft glow accents.',
    icon: LogIn,
    color: 'from-pink-500/20 to-rose-500/20',
    border: 'border-pink-500/30'
  },
  {
    label: 'Billing Settings',
    prompt: 'Create a modern billing settings UI with subscription overview, plan cards, invoice history table, and a payment method section. Make it clean, minimal, and responsive.',
    icon: CreditCard,
    color: 'from-indigo-500/20 to-blue-500/20',
    border: 'border-indigo-500/30'
  },
  {
    label: 'Event Scheduler',
    prompt: 'Create a modern event scheduler module with a calendar sidebar, event list, color-coded tags, and an elegant modal for creating new events.',
    icon: CalendarCheck,
    color: 'from-emerald-500/20 to-teal-500/20',
    border: 'border-emerald-500/30'
  },
  {
    label: 'Workspace Dashboard',
    prompt: 'Create a modern workspace dashboard with a sidebar, project cards, quick-action buttons, and recent activity feed. Use subtle gradients, neumorphism-inspired shadows, and clear hierarchy.',
    icon: LayoutGrid,
    color: 'from-amber-500/20 to-orange-500/20',
    border: 'border-amber-500/30'
  },
];

const Hero = () => {
  const [userInput, setUserInput] = useState<string>("")
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const CreateNewProject = async () => {
    if (!userInput.trim() && !selectedImage) return;
    
    // Pass image via localStorage because it's too large for query strings
    if (selectedImage) {
      localStorage.setItem('initialImage', selectedImage);
    } else {
      localStorage.removeItem('initialImage');
    }

    router.push(`/playground?userprompt=${encodeURIComponent(userInput)}`)
  }

  // Handle shift+enter to submit
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      CreateNewProject();
    }
  }

  return (
    <div className='relative flex flex-col items-center min-h-[80vh] justify-center overflow-hidden w-full py-20' style={{ fontFamily: '"Outfit", sans-serif' }}>

      {/* Import the font */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
      `}} />

      {/* Universal background blobs are now handled in Layout.tsx for full-screen cinematic coverage */}

      <div className="z-10 flex flex-col items-center w-full px-4 max-w-5xl mx-auto">
        {/* Header and Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center"
        >
          <h2 className='font-extrabold text-5xl md:text-7xl tracking-tight text-slate-900 dark:text-white mb-6 drop-shadow-sm'>
            Bring your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">imagination</span><br />to reality.
          </h2>
          <p className='mt-4 text-xl text-slate-600 dark:text-slate-400 font-light max-w-2xl mx-auto'>
            Describe any web interface. Our AI will instantly design, build, and deploy it. No coding required.
          </p>
        </motion.div>

        {/* Input Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className='w-full max-w-3xl mt-12 relative group'
        >
          {/* Glowing border effect mapped to focus */}
          <div className={`absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-[2rem] blur-md opacity-20 group-hover:opacity-40 transition duration-500 ${isFocused ? 'opacity-60 blur-xl' : ''}`}></div>

          <div 
            className='relative w-full p-1 rounded-[2.5rem] bg-white/60 dark:bg-zinc-950/60 backdrop-blur-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] dark:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.8)] transition-all duration-300'
            style={{ border: 'none' }}
          >
            <div className="flex flex-col p-8" style={{ border: 'none' }}>
              <AnimatePresence>
                {selectedImage && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="relative w-24 h-24 mb-4"
                  >
                    <img 
                      src={selectedImage} 
                      alt="Upload preview" 
                      className="w-full h-full object-cover rounded-2xl border-2 border-indigo-500 shadow-lg"
                    />
                    <button 
                      onClick={() => setSelectedImage(null)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-all"
                    >
                      <X size={14} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
              <textarea
                placeholder='Dream up a design... e.g. "A sleek dark-mode dashboard for a fintech app"'
                value={userInput}
                onChange={(event) => setUserInput(event.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onKeyDown={handleKeyDown}
                style={{ border: 'none', outline: 'none', boxShadow: 'none' }}
                className='
                    w-full h-32 resize-none
                    bg-transparent
                    text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500
                    text-lg md:text-xl font-medium
                    leading-relaxed focus:outline-none focus:ring-0
                '
              />
              <div className={`flex justify-between items-center mt-4`} style={{ border: 'none' }}>
                <div className="flex items-center gap-4" style={{ border: 'none' }}>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload} 
                    className="hidden" 
                    accept="image/*"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 rounded-full text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all"
                  >
                    <Paperclip size={22} />
                  </button>
                  <div className="px-4 py-1.5 rounded-full bg-slate-100/50 dark:bg-white/5 text-xs text-slate-500 dark:text-slate-400 font-medium tracking-wide" style={{ border: 'none' }}>
                    Shift + Enter to submit
                  </div>
                </div>
                <button
                  disabled={!userInput.trim() && !selectedImage}
                  onClick={CreateNewProject}
                  className={`
                    relative overflow-hidden group/btn px-8 py-4 rounded-full font-bold transition-all duration-300 flex items-center justify-center gap-2
                    ${!userInput.trim() && !selectedImage
                      ? 'bg-slate-200/50 dark:bg-white/5 text-slate-400 dark:text-white/20 cursor-not-allowed'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-105 active:scale-95 shadow-xl shadow-indigo-500/20'
                    }
                  `}
                  style={{ border: 'none' }}
                >
                  <span className="relative z-10 tracking-wide">Generate</span>
                  <SendHorizontal className="w-4 h-4 relative z-10 transition-transform group-hover/btn:translate-x-1" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Suggestion List */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className='mt-12 flex flex-wrap justify-center gap-4 w-full max-w-4xl'
          style={{ border: 'none' }}
        >
          {suggestions.map((suggestion, index) => (
            <motion.button 
              key={index}
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setUserInput(suggestion.prompt)}
              className={`
                flex items-center gap-3 px-6 py-3 rounded-2xl
                bg-white/30 dark:bg-white/5 backdrop-blur-xl
                transition-all duration-300
                hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] dark:hover:shadow-black/50
                relative overflow-hidden
                group
              `}
              style={{ border: 'none' }}
            >
              {/* Card hover gradient background */}
              <div className={`absolute inset-0 bg-gradient-to-r ${suggestion.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>

              <div className={`p-2 rounded-xl bg-gradient-to-br ${suggestion.color} group-hover:scale-110 transition-transform duration-300 relative z-10`}>
                <suggestion.icon className="w-4 h-4 text-slate-700 dark:text-slate-300" />
              </div>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 relative z-10">
                {suggestion.label}
              </span>
            </motion.button>
          ))}
        </motion.div>
      </div>
    </div>
  )
}

export default Hero

