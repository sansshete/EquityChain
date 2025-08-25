import React from 'react';
import { Coins, User, Plus, BarChart3, Wallet, Shield, Users, Lightbulb } from 'lucide-react';
import { useWeb3 } from '../hooks/useWeb3';
import { User as UserType } from '../lib/firestore';

interface HeaderProps {
  user: UserType | null;
  onNavigate: (page: string) => void;
  currentPage: string;
}

export const Header: React.FC<HeaderProps> = ({ user, onNavigate, currentPage }) => {
  const { account, isConnected, isConnecting, connectWallet, disconnectWallet } = useWeb3();

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getRoleIcon = (role: UserType['role']) => {
    switch (role) {
      case 'admin': return Shield;
      case 'creator': return Lightbulb;
      case 'backer': return Users;
      default: return User;
    }
  };

  const getRoleColor = (role: UserType['role']) => {
    switch (role) {
      case 'admin': return 'text-purple-600 bg-purple-100';
      case 'creator': return 'text-green-600 bg-green-100';
      case 'backer': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getNavigationItems = () => {
    if (!user) return [];

    switch (user.role) {
      case 'admin':
        return [
          { id: 'admin-dashboard', label: 'Admin Dashboard', icon: Shield },
          { id: 'all-projects', label: 'All Projects', icon: BarChart3 },
        ];
      case 'creator':
        return [
          { id: 'creator-dashboard', label: 'My Projects', icon: Lightbulb },
          { id: 'create-project', label: 'Create Project', icon: Plus },
          { id: 'projects', label: 'Browse Projects', icon: BarChart3 },
        ];
      case 'backer':
        return [
          { id: 'projects', label: 'Browse Projects', icon: BarChart3 },
          { id: 'portfolio', label: 'My Portfolio', icon: User },
        ];
      default:
        return [];
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div 
            className="flex items-center cursor-pointer"
            onClick={() => onNavigate('home')}
          >
            <Coins className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">EquityChain</span>
          </div>

          {user && (
            <nav className="hidden md:flex space-x-8">
              {getNavigationItems().map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`text-sm font-medium transition-colors flex items-center ${
                      currentPage === item.id 
                        ? 'text-blue-600 border-b-2 border-blue-600 pb-1' 
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-1" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          )}

          <div className="flex items-center space-x-4">
            {user && (
              <div className="flex items-center space-x-2">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                  {React.createElement(getRoleIcon(user.role), { className: "h-3 w-3 mr-1" })}
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </div>
              </div>
            )}
            
            {isConnected ? (
              <div className="flex items-center space-x-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg">
                <Wallet className="h-4 w-4" />
                <span className="text-sm font-medium">{formatAddress(account!)}</span>
                <button
                  onClick={disconnectWallet}
                  className="text-xs text-green-600 hover:text-green-800 ml-2"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                disabled={isConnecting}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <Wallet className="h-4 w-4 mr-2" />
                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};