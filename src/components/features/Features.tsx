import { useEffect, useRef } from 'react';

const Features = () => {
  const features = [
    {
      title: "AI-Powered Workouts",
      description: "Smart workout recommendations tailored to your goals and progress",
      icon: (
        <svg className="w-10 h-10 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2a10 10 0 100 20 10 10 0 000-20z"/>
          <path d="M12 16l4-4-4-4"/>
          <path d="M8 12h8"/>
        </svg>
      )
    },
    {
      title: "Personalized Plans",
      description: "Custom fitness programs designed for your unique journey",
      icon: (
        <svg className="w-10 h-10 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 11l3 3L22 4"/>
          <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
        </svg>
      )
    },
    {
      title: "Progress Tracking",
      description: "Visual insights and analytics to monitor your improvements",
      icon: (
        <svg className="w-10 h-10 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M2 20h20"/>
          <path d="M5 17l4-8 4 2 4-10 4 16"/>
        </svg>
      )
    }
  ];

  const featureRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add('animate-slide-in-right');
              entry.target.classList.remove('animate-slide-out-left', 'opacity-0', '-translate-x-20');
            }, index * 200);
          } else {
            if (entry.boundingClientRect.y < 0) {
              entry.target.classList.remove('animate-slide-in-right');
              entry.target.classList.add('animate-slide-out-left');
            } else {
              entry.target.classList.remove('animate-slide-in-right');
              entry.target.classList.add('opacity-0', '-translate-x-20');
            }
          }
        });
      },
      {
        threshold: 0.2,
        rootMargin: '-50px 0px -50px 0px',
      }
    );

    featureRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section className="relative py-20 bg-gray-50 dark:bg-gray-900">
      {/* Curved divider */}
      <div className="absolute top-0 inset-x-0 -translate-y-full h-16 w-full">
        <svg 
          className="absolute bottom-0 w-full h-full text-gray-50 dark:text-gray-900" 
          viewBox="0 0 1440 48" 
          fill="currentColor" 
          preserveAspectRatio="none"
        >
          <path d="M0 48h1440C1440 48 1440 0 720 0C0 0 0 48 0 48z"/>
        </svg>
      </div>

      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Revolutionize Your Fitness Journey
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Experience the future of fitness with our cutting-edge features designed to transform your workout routine
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <div 
              key={index}
              ref={el => featureRefs.current[index] = el}
              className="opacity-0 -translate-x-20 relative group bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5 rounded-2xl transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left" />
              <div className="relative">
                <div className="mb-4 inline-block bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features; 