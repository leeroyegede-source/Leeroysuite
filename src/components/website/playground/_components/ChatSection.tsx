import React from 'react'
import { ArrowUp, SendHorizontal, Layout, Paperclip, X, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Messages } from '../playground'
import { motion, AnimatePresence } from 'framer-motion'

type Props = {
  messages: Messages[],
  onSend: (input: string, image: string | null) => void,
  loading: boolean,
  chatLoader: boolean
}

const ChatSection = ({ messages, onSend, loading, chatLoader }: Props) => {
  const [input, setInput] = React.useState<string>("")
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    // Reset input value so same file can be selected again
    e.target.value = '';
  };

  const handleSend = () => {
    if (!input.trim() && !selectedImage) return;
    onSend(input, selectedImage);
    setInput("");
    setSelectedImage(null);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className='
    w-full md:max-w-[40%] lg:max-w-[30%]
    h-[88vh] flex flex-col
    border border-gray-200 dark:border-zinc-800
    bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl
    rounded-2xl overflow-hidden
    m-4 ml-0
    relative z-10 shadow-sm
    '>
      {/* Header Info */}
      <div className='p-4 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between bg-white/50 dark:bg-zinc-900/50'>
        <div>
          <h2 className='font-outfit font-bold text-xl tracking-tight'>Design Chat</h2>
          <p className='text-xs text-gray-500 dark:text-zinc-400 font-medium'>AI-Powered Assistant</p>
        </div>
      </div>

      {/* messages section */}
      <div 
        ref={scrollRef}
        className='flex-1 overflow-y-auto p-4 space-y-6 flex flex-col scroll-smooth scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-zinc-800'
      >
        {(chatLoader && messages?.length === 0) ?
          [1, 2, 3].map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="w-[60%] h-12 rounded-2xl opacity-50" />
              <Skeleton className="w-[80%] h-20 rounded-2xl opacity-30" />
            </div>
          ))
          :
          (messages?.length === 0) ? (
            <div className='flex-1 flex flex-col items-center justify-center text-center space-y-4 opacity-60'>
              <div className="p-6 rounded-3xl bg-blue-50 dark:bg-blue-900/20 rotate-12 transition-transform hover:rotate-0 duration-500">
                <SendHorizontal className="w-10 h-10 text-blue-500" />
              </div>
              <div className='max-w-[200px]'>
                <p className='text-sm font-semibold'>Ready to build something iconic?</p>
                <p className='text-xs mt-1 text-gray-500'>Describe your vision or upload a reference image to begin.</p>
              </div>
            </div>
          ) :
            messages?.map((msg, index) => (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                key={index} 
                className={`flex ${msg.role == 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`
                  group relative rounded-2xl max-w-[90%] break-words shadow-sm overflow-hidden transition-all duration-300
                  ${msg.role == 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none shadow-blue-500/20' 
                    : 'bg-white dark:bg-zinc-800 text-black dark:text-gray-100 border border-gray-100 dark:border-zinc-700/50 rounded-tl-none'}
                `}>
                  {msg.image && (
                    <div className="relative w-full overflow-hidden group/img">
                      <img 
                        src={msg.image} 
                        alt="Design Reference" 
                        className="w-full max-h-[350px] object-cover block transition-transform duration-500 group-hover/img:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/10 transition-colors" />
                    </div>
                  )}
                  {msg.content && (
                    <div className="p-3.5">
                      {msg.role !== 'user' && (msg.content.includes('```html') || /<\/?[a-z][\s\S]*>/i.test(msg.content)) ?
                        <div className="flex items-center gap-3 font-medium py-1">
                          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                            <Layout className="w-4 h-4" />
                          </div>
                          <div className='flex flex-col'>
                            <span className='text-sm font-bold'>New Design Generated</span>
                            <span className='text-[10px] opacity-60 uppercase'>Updated Viewport</span>
                          </div>
                        </div> :
                        <div className="text-[13px] leading-relaxed whitespace-pre-wrap font-medium">{msg.content}</div>
                      }
                    </div>
                  )}
                </div>
              </motion.div>
            ))
        }

        {loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className='flex items-start gap-3'
          >
            <div className='w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center animate-pulse'>
              <div className='w-4 h-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin' />
            </div>
            <div className='bg-blue-50/50 dark:bg-blue-900/10 p-3 px-4 rounded-2xl rounded-tl-none border border-blue-100 dark:border-blue-900/20'>
              <span className='text-xs font-medium text-blue-600 dark:text-blue-400'>AI is crafting your design...</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* footer input */}
      <div className='p-4 border-t border-gray-100 dark:border-zinc-800 space-y-4 bg-white/50 dark:bg-zinc-900/50'>
        {/* Image Preview Area */}
        <AnimatePresence>
          {selectedImage && (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="relative group w-24 h-24"
            >
              <img 
                src={selectedImage} 
                alt="Upload preview" 
                className="w-full h-full object-cover rounded-2xl border-2 border-blue-500 shadow-xl"
              />
              <button 
                onClick={() => setSelectedImage(null)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg hover:bg-red-600 transition-all hover:scale-110 active:scale-95"
              >
                <X size={12} strokeWidth={3} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className='relative flex items-end gap-2 bg-white/50 dark:bg-zinc-900/50 rounded-[28px] p-2 border border-gray-200 dark:border-zinc-800 focus-within:border-blue-500/50 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all shadow-sm'>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
            accept="image/*"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={openFileDialog}
            className="rounded-full h-11 w-11 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all shrink-0"
            disabled={loading}
          >
            <Paperclip size={22} />
          </Button>

          <textarea
            value={input}
            disabled={loading}
            placeholder='Ask for modifications or share a vibe...'
            rows={1}
            className='
              flex-1 resize-none bg-transparent py-3 px-1
              text-[14px] text-black placeholder-gray-400
              focus:outline-none focus:ring-0 border-none
              dark:text-white
              dark:placeholder-zinc-500
              min-h-[44px] max-h-40
              scrollbar-hide
              disabled:opacity-50
              font-medium
            '
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (!loading) {
                  handleSend();
                }
              }
            }}
          />
          <Button
            onClick={handleSend}
            size="icon"
            disabled={(!input.trim() && !selectedImage) || loading}
            className={`
              rounded-full w-11 h-11 transition-all duration-300 shrink-0
              ${(!input.trim() && !selectedImage) 
                ? 'bg-gray-200 dark:bg-zinc-700 text-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30 active:scale-90'}
            `}
          >
            <ArrowUp size={20} strokeWidth={2.5} />
          </Button>
        </div>
        <p className='text-[10px] text-center text-gray-400 dark:text-zinc-500 font-medium'>
          Press <span className='px-1 py-0.5 border border-gray-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-900'>Enter</span> to send
        </p>
      </div>
    </div>
  )
}

export default ChatSection
