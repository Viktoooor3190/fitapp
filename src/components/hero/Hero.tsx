import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20">
        <div className="absolute inset-0 bg-grid-white/[0.2] bg-grid animate-grid-movement" />
        
        {/* Moving Gradient Overlay */}
        <div 
          className="absolute inset-0 animate-gradient-xy"
          style={{
            background: 'linear-gradient(115deg, #4f46e5 0%, #0ea5e9 25%, #6366f1 50%, #0ea5e9 75%, #4f46e5 100%)',
            backgroundSize: '400% 400%',
            opacity: '0.3',
          }}
        />

        {/* Decorative Shapes */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-32 h-32 border-2 border-white/20 rounded-lg transform rotate-45 animate-float-diagonal" />
          <div className="absolute bottom-20 right-20 w-40 h-40 border-2 border-white/20 rounded-lg transform -rotate-12 animate-float-diagonal-reverse" />
          <div className="absolute top-1/2 left-10 w-24 h-24 border-2 border-white/20 rounded-lg transform rotate-12 animate-float-horizontal" />
          <div className="absolute top-40 right-32 w-28 h-28 border-2 border-white/20 rounded-lg transform -rotate-45 animate-float-circular" />
          <div className="absolute bottom-32 left-32 w-20 h-20 border-2 border-white/20 rounded-lg transform rotate-3 animate-float-circular-reverse" />
          <div className="absolute top-1/3 right-1/4 w-36 h-36 border-2 border-white/20 rounded-lg transform -rotate-6 animate-float-horizontal-reverse" />
        </div>
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-6 text-center">
        <h1 className="text-6xl md:text-7xl font-extrabold text-white mb-6 animate-fade-in-up">
          Transform Your
          <span className="bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
            {" "}Coaching Business
          </span>
        </h1>
        
        <p className="text-2xl md:text-3xl text-gray-200 mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in-up-delay">
          Take your coaching to the next level with AI-powered automation, client tracking, 
          and personalized fitness solutions—all under your own brand.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-6 animate-fade-in-up-delay-2">
          <button className="px-8 py-4 text-lg font-semibold rounded-xl bg-gradient-to-r from-blue-500 to-blue-700 text-white transform transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
            Get Started
          </button>
          <button className="px-8 py-4 text-lg font-semibold rounded-xl border-2 border-white text-white backdrop-blur-sm transform transition-all hover:bg-white/10 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2">
            Learn More
          </button>
        </div>
      </div>

      {/* Animated Blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500/20 rounded-full mix-blend-multiply filter blur-xl animate-float-diagonal" />
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-xl animate-float-circular" />
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-pink-500/20 rounded-full mix-blend-multiply filter blur-xl animate-float-diagonal-reverse" />
      </div>
    </div>
  );
};

export default Hero; 