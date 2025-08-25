import React from 'react';
import { TrendingUp, Shield, Globe, ArrowRight, Users, Lightbulb, BarChart3 } from 'lucide-react';

interface LandingPageProps {
  onConnectWallet: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onConnectWallet }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Equity Crowdfunding
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-green-400">
              Reimagined
            </span>
          </h1>
          
          <p className="text-xl text-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed">
            A decentralized platform for equity crowdfunding with milestone-based fund release, 
            backer voting, and automatic token distribution. Built on blockchain for transparency and trust.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button
              onClick={onConnectWallet}
              className="inline-flex items-center px-8 py-4 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 transform hover:scale-105 transition-all duration-200 shadow-lg"
            >
              Connect Wallet to Start
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-16">
            <div className="text-center p-6 rounded-xl bg-white/10 backdrop-blur-sm">
              <Users className="h-12 w-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">For Backers</h3>
              <p className="text-blue-100 text-sm">Invest in innovative projects, receive equity tokens, and vote on milestones.</p>
            </div>
            
            <div className="text-center p-6 rounded-xl bg-white/10 backdrop-blur-sm">
              <Lightbulb className="h-12 w-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">For Creators</h3>
              <p className="text-blue-100 text-sm">Launch your project, set milestones, and receive funding as you achieve goals.</p>
            </div>
            
            <div className="text-center p-6 rounded-xl bg-white/10 backdrop-blur-sm">
              <Shield className="h-12 w-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Secure & Transparent</h3>
              <p className="text-blue-100 text-sm">Smart contracts ensure funds are released only when milestones are approved by backers.</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="text-center p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
              <TrendingUp className="h-8 w-8 text-green-400 mx-auto mb-3" />
              <h4 className="text-md font-semibold mb-2">Milestone-Based Funding</h4>
              <p className="text-blue-100 text-sm">Funds are released incrementally as project milestones are achieved and approved by token holders.</p>
            </div>
            
            <div className="text-center p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
              <BarChart3 className="h-8 w-8 text-blue-400 mx-auto mb-3" />
              <h4 className="text-md font-semibold mb-2">Backer Voting</h4>
              <p className="text-blue-100 text-sm">Token holders vote on milestone completion, ensuring accountability and project success.</p>
            </div>
            
            <div className="text-center p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
              <Globe className="h-8 w-8 text-purple-400 mx-auto mb-3" />
              <h4 className="text-md font-semibold mb-2">ERC-20 Equity Tokens</h4>
              <p className="text-blue-100 text-sm">Receive tradeable equity tokens proportional to your investment automatically upon contribution.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};