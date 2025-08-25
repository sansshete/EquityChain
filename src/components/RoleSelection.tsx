import React, { useState } from 'react';
import { Users, Lightbulb, Shield, ArrowRight } from 'lucide-react';
import { User } from '../lib/firestore';

interface RoleSelectionProps {
  onRoleSelect: (role: User['role']) => void;
  isLoading: boolean;
}

export const RoleSelection: React.FC<RoleSelectionProps> = ({ onRoleSelect, isLoading }) => {
  const [selectedRole, setSelectedRole] = useState<User['role'] | null>(null);

  const roles = [
    {
      id: 'backer' as const,
      title: 'Backer',
      description: 'Invest in projects and receive equity tokens',
      icon: Users,
      features: [
        'Browse and invest in projects',
        'Receive equity tokens automatically',
        'Vote on project milestones',
        'Track your investment portfolio',
        'Request refunds if needed'
      ],
      color: 'blue'
    },
    {
      id: 'creator' as const,
      title: 'Creator',
      description: 'Launch projects and raise funding',
      icon: Lightbulb,
      features: [
        'Create funding campaigns',
        'Set milestones and goals',
        'Manage project updates',
        'Release funds after approval',
        'Communicate with backers'
      ],
      color: 'green'
    },
    {
      id: 'admin' as const,
      title: 'Admin',
      description: 'Manage platform and approve projects',
      icon: Shield,
      features: [
        'Review and approve projects',
        'Manage platform settings',
        'Monitor project compliance',
        'Handle disputes',
        'Platform analytics'
      ],
      color: 'purple'
    }
  ];

  const handleRoleSelect = () => {
    if (selectedRole) {
      onRoleSelect(selectedRole);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Role</h1>
          <p className="text-xl text-gray-600">Select how you'd like to participate in our equity crowdfunding platform</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {roles.map((role) => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.id;
            
            return (
              <div
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={`bg-white rounded-xl p-8 cursor-pointer transition-all duration-200 border-2 ${
                  isSelected 
                    ? `border-${role.color}-500 shadow-lg transform scale-105` 
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                }`}
              >
                <div className="text-center mb-6">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-${role.color}-100 mb-4`}>
                    <Icon className={`h-8 w-8 text-${role.color}-600`} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{role.title}</h3>
                  <p className="text-gray-600">{role.description}</p>
                </div>

                <div className="space-y-3">
                  {role.features.map((feature, index) => (
                    <div key={index} className="flex items-center text-sm text-gray-700">
                      <div className={`w-2 h-2 rounded-full bg-${role.color}-500 mr-3`}></div>
                      {feature}
                    </div>
                  ))}
                </div>

                {isSelected && (
                  <div className={`mt-6 p-3 bg-${role.color}-50 rounded-lg border border-${role.color}-200`}>
                    <p className={`text-sm text-${role.color}-800 font-medium`}>
                      ✓ Selected - Click continue to proceed
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="text-center">
          <button
            onClick={handleRoleSelect}
            disabled={!selectedRole || isLoading}
            className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Setting up your account...' : 'Continue'}
            <ArrowRight className="ml-2 h-5 w-5" />
          </button>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>You can change your role later in your account settings</p>
        </div>
      </div>
    </div>
  );
};