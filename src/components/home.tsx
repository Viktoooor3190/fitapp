

interface HomeProps {
  user?: {
    name: string;
    email: string;
    avatar: string;
  };
}

const Home = ({
  user = {
    name: "Sarah Wilson",
    email: "sarah@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
  },
}: HomeProps) => {
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <main className="flex-1 overflow-auto">
        <div className="p-6 space-y-6">
          <div className="flex flex-col items-center justify-center min-h-[80vh]">
            <img 
              src={user.avatar} 
              alt="User Avatar" 
              className="w-24 h-24 rounded-full mb-4"
            />
            <div className="text-center space-y-2">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
                Welcome back, {user.name}
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                Welcome to your fitness journey!
              </p>
              <p className="text-gray-500 dark:text-gray-500">
                {user.email}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
