import Hero from './hero/Hero';
import Features from './features/Features';

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Hero />
      <Features />
    </div>
  );
};

export default Home;
