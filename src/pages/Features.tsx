import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const FeaturesPage = () => {
  const mainFeatures = [
    {
      title: "Smart Client Programming",
      description: "An intuitive system that helps you design personalized workout and nutrition plans for your clients.",
      icon: "💡",
      benefits: [
        "AI-powered adaptive workout generation",
        "Customizable training routines for strength, weight loss, and more",
        "Built-in video demonstrations to guide clients"
      ]
    },
    {
      title: "Client Progress Tracking",
      description: "Easily monitor and optimize client performance.",
      icon: "📊",
      benefits: [
        "Visual analytics for workouts, progress, and adherence",
        "Weekly & monthly trends to improve training efficiency",
        "Integration with wearables for real-time tracking"
      ]
    },
    {
      title: "Community & Business Growth",
      description: "Keep your clients engaged while expanding your brand.",
      icon: "🤝",
      benefits: [
        "Run leaderboards and fitness challenges to boost motivation",
        "Offer in-app messaging and progress feedback",
        "Your branding on every client's experience via your subdomain"
      ]
    }
  ];

  const upcomingFeatures = [
    {
      title: "Automated Meal Planning",
      description: "AI-generated meal plans tailored for your clients",
      icon: "🔥"
    },
    {
      title: "Client Scheduling & Reminders",
      description: "Manage appointments and automate follow-ups",
      icon: "📅"
    },
    {
      title: "Live Workout Sessions",
      description: "Train clients in real-time via integrated video calls",
      icon: "🎥"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="relative pt-32 pb-20 overflow-hidden">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Powerful Features to Grow Your
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Coaching Business</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Provide world-class fitness coaching with tools designed to enhance client experience, 
              save time, and boost revenue.
            </p>
            <div className="flex justify-center gap-4">
              <Link to="/signup" className="px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-lg font-semibold">
                Get Started
              </Link>
              <button className="px-8 py-4 border-2 border-blue-600 text-blue-600 rounded-xl hover:bg-blue-50 transition-colors text-lg font-semibold">
                Explore More
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Features */}
      <div className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-1 gap-16 max-w-4xl mx-auto">
            {mainFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="relative bg-white dark:bg-gray-800 p-10 rounded-2xl shadow-lg"
              >
                <div className="flex items-start gap-6">
                  <span className="text-5xl">{feature.icon}</span>
                  <div>
                    <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                      {feature.description}
                    </p>
                    <ul className="space-y-4">
                      {feature.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                          <span className="text-green-500 text-xl">✔</span>
                          <span className="text-lg">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Coming Soon Section */}
      <div className="py-20 bg-gray-50 dark:bg-gray-900/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center max-w-4xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              🚀 More Features Coming Soon!
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-12">
              We're constantly evolving to help you scale your coaching business. 
              Upcoming features include:
            </p>
            
            <div className="grid md:grid-cols-3 gap-8">
              {upcomingFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg"
                >
                  <span className="text-4xl mb-4 block">{feature.icon}</span>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>

            <p className="mt-12 text-lg text-gray-600 dark:text-gray-400">
              👉 Have a feature suggestion? Let us know!
            </p>
          </motion.div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Ready to scale your fitness coaching?
          </h2>
          <Link 
            to="/signup"
            className="px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-lg font-semibold"
          >
            Join Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FeaturesPage; 