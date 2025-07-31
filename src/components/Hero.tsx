import React from 'react';
import { TrendingUp, Shield, Globe, ArrowRight, MessageCircle } from 'lucide-react';

interface HeroProps {
  onGetStarted: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onGetStarted }) => {
  return (
    <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Democratizing Equity
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-green-400">
              Through Blockchain
            </span>
          </h1>
          
          <p className="text-xl text-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed">
            Invest in groundbreaking startups, receive tokenized equity, and participate in the future of decentralized finance. 
            Transparent, secure, and accessible to everyone.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button
              onClick={onGetStarted}
              className="inline-flex items-center px-8 py-4 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 transform hover:scale-105 transition-all duration-200 shadow-lg"
            >
              Launch Your Project
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
            
            <button className="inline-flex items-center px-8 py-4 border-2 border-blue-300 text-blue-100 font-semibold rounded-xl hover:bg-blue-800 hover:border-blue-200 transition-all duration-200">
              Explore Investments
            </button>
            
            <div className="flex items-center text-blue-200 text-sm mt-4">
              <MessageCircle className="h-4 w-4 mr-2" />
              <span>Need help? Click the assistant icon for guidance</span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center p-6 rounded-xl bg-white/10 backdrop-blur-sm">
              <TrendingUp className="h-12 w-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Smart Equity Distribution</h3>
              <p className="text-blue-100 text-sm">Automated tokenized equity distribution based on investment contributions and project milestones.</p>
            </div>
            
            <div className="text-center p-6 rounded-xl bg-white/10 backdrop-blur-sm">
              <Shield className="h-12 w-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Blockchain Security</h3>
              <p className="text-blue-100 text-sm">Immutable smart contracts ensure transparent and secure transactions for all stakeholders.</p>
            </div>
            
            <div className="text-center p-6 rounded-xl bg-white/10 backdrop-blur-sm">
              <Globe className="h-12 w-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Global Access</h3>
              <p className="text-blue-100 text-sm">Participate in investment opportunities worldwide without traditional geographical limitations.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};