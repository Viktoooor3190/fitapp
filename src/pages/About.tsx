import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const AboutPage = () => {
  const teamMembers = [
    {
      name: "Alex Rivera",
      role: "Founder & AI Engineer",
      bio: "Former Google AI researcher bringing automation to coaching",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex"
    },
    {
      name: "Dr. Lisa Chen",
      role: "Head of Fitness Science",
      bio: "PhD in Sports Science, ensuring evidence-based training methodologies",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa"
    },
    {
      name: "Marcus Johnson",
      role: "Lead Fitness Coach",
      bio: "Elite trainer with experience transforming thousands of lives",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus"
    }
  ];

  const advantages = [
    {
      title: "AI-Driven Coaching Automation",
      description: "Save time with automated workout plans",
      icon: "🤖"
    },
    {
      title: "Real-Time Client Analytics",
      description: "Keep track of every client's journey",
      icon: "📊"
    },
    {
      title: "Your Brand, Your Platform",
      description: "Clients train under your subdomain",
      icon: "💼"
    },
    {
      title: "Science-Backed Methods",
      description: "Proven fitness strategies designed by experts",
      icon: "🧬"
    }
  ];

  const testimonials = [
    {
      name: "Sarah M.",
      title: "Certified Personal Trainer",
      text: "FitApp made managing my clients effortless! Now I can focus on coaching instead of spreadsheets and tracking. My business has grown faster than ever!",
      rating: 5,
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"
    },
    {
      name: "James K.",
      title: "Online Fitness Coach",
      text: "I love how FitApp personalizes each client's journey while letting me retain full control. It's like having an AI assistant for my coaching!",
      rating: 5,
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=James"
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
              Helping Fitness Coaches
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Build & Scale Their Business</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              At FitApp, we empower fitness professionals with smart automation, AI-driven tools, 
              and business growth solutions—so you can focus on coaching, not admin work.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <span className="text-3xl mr-3">💡</span> Our Mission
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                We help coaches like you streamline client management, deliver exceptional 
                training experiences, and grow revenue effortlessly.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <span className="text-3xl mr-3">🌟</span> Our Vision
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                To be the #1 platform that enables fitness coaches to scale their business, 
                reach more clients, and provide AI-enhanced coaching that drives real results.
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Why FitApp */}
      <div className="py-20 bg-gray-50 dark:bg-gray-900/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6 flex items-center justify-center">
              <span className="text-4xl mr-3">📖</span> Why FitApp?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
              We started with a simple idea: coaches need better tools to manage clients, 
              customize training, and automate repetitive tasks. FitApp was built to help 
              you scale your fitness business without the tech hassle.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              👥 Meet Our Team
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              The experts behind your fitness business transformation
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto">
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg text-center"
              >
                <img 
                  src={member.image} 
                  alt={member.name}
                  className="w-32 h-32 rounded-full mx-auto mb-6"
                />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {member.name}
                </h3>
                <p className="text-blue-600 dark:text-blue-400 font-medium mb-4">
                  {member.role}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  {member.bio}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Advantages */}
      <div className="py-20 bg-gray-50 dark:bg-gray-900/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              🚀 Why Coaches Love FitApp
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {advantages.map((advantage, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg text-center"
              >
                <span className="text-4xl mb-4 block">{advantage.icon}</span>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {advantage.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {advantage.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              💬 What Coaches Say
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg"
              >
                <div className="flex items-center mb-4">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full mr-4"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {testimonial.name}
                    </h3>
                    <p className="text-blue-600 dark:text-blue-400">
                      {testimonial.title}
                    </p>
                    <div className="text-yellow-400 mt-1">
                      {"⭐".repeat(testimonial.rating)}
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 italic">
                  "{testimonial.text}"
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="py-20 bg-gray-50 dark:bg-gray-900/50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Ready to grow your fitness coaching business with smarter tools?
          </h2>
          <div className="flex justify-center gap-4">
            <Link 
              to="/signup"
              className="px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-lg font-semibold"
            >
              Sign Up Now
            </Link>
            <Link 
              to="/features"
              className="px-8 py-4 border-2 border-blue-600 text-blue-600 rounded-xl hover:bg-blue-50 transition-colors text-lg font-semibold"
            >
              Explore Features
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage; 