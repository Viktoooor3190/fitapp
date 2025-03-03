import React from 'react';
import { RegisterForm } from '../components/RegisterForm';

export const RegisterPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">Become a Coach</h1>
          
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="md:flex">
              <div className="md:w-1/2 bg-blue-600 p-8 text-white">
                <h2 className="text-2xl font-bold mb-4">Join Our Coaching Platform</h2>
                <p className="mb-4">
                  Register today to get your own coaching portal with a custom subdomain.
                </p>
                
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Benefits:</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Your own branded coaching portal</li>
                    <li>Custom subdomain (yourname.fitapp.com)</li>
                    <li>Client management tools</li>
                    <li>Workout and nutrition planning</li>
                    <li>Secure payment processing</li>
                    <li>Mobile-friendly interface</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">How it works:</h3>
                  <ol className="list-decimal pl-5 space-y-1">
                    <li>Register with your details</li>
                    <li>Get your custom subdomain</li>
                    <li>Complete your profile</li>
                    <li>Start adding your coaching services</li>
                    <li>Invite clients to your portal</li>
                  </ol>
                </div>
              </div>
              
              <div className="md:w-1/2 p-8">
                <RegisterForm />
              </div>
            </div>
          </div>
          
          <div className="mt-8 text-center text-gray-600">
            <p>
              Already have an account? <a href="/login" className="text-blue-600 hover:underline">Log in</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}; 