import React from 'react';
import { TrendingUp, Users, Calendar, DollarSign, Settings, Eye } from 'lucide-react';

interface CreatorDashboardProps {
  onNavigateToProject: (projectId: string) => void;
}

export const CreatorDashboard: React.FC<CreatorDashboardProps> = ({ onNavigateToProject }) => {
  const mockProjects = [
    {
      id: '1',
      title: 'EcoTech Solutions',
      status: 'Active',
      raised: 125000,
      goal: 200000,
      investors: 45,
      daysLeft: 25,
      equity: 12
    },
    {
      id: '2',
      title: 'AI Medical Platform',
      status: 'Under Review',
      raised: 0,
      goal: 500000,
      investors: 0,
      daysLeft: 0,
      equity: 8
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Creator Dashboard</h1>
        <p className="text-gray-600">Manage your projects and track funding progress</p>
      </div>

      {/* Overview Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Active Projects</p>
              <p className="text-2xl font-bold text-gray-900">1</p>
            </div>
            <Calendar className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Raised</p>
              <p className="text-2xl font-bold text-gray-900">$125K</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Investors</p>
              <p className="text-2xl font-bold text-gray-900">45</p>
            </div>
            <Users className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900">62.5%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Projects List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Your Projects</h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {mockProjects.map((project) => {
            const fundingPercentage = (project.raised / project.goal) * 100;
            
            return (
              <div key={project.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 mr-3">{project.title}</h3>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        project.status === 'Active' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {project.status}
                      </span>
                    </div>
                    
                    {project.status === 'Active' && (
                      <>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-500">Raised</p>
                            <p className="font-semibold">${project.raised.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Goal</p>
                            <p className="font-semibold">${project.goal.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Investors</p>
                            <p className="font-semibold">{project.investors}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Days Left</p>
                            <p className="font-semibold">{project.daysLeft}</p>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <div className="flex justify-between text-sm text-gray-500 mb-1">
                            <span>Progress</span>
                            <span>{fundingPercentage.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full"
                              style={{ width: `${Math.min(fundingPercentage, 100)}%` }}
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-6">
                    <button
                      onClick={() => onNavigateToProject(project.id)}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </button>
                    {project.status === 'Active' && (
                      <button className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                        <Settings className="h-4 w-4 mr-1" />
                        Manage
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mt-8">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <div>
                  <p className="font-medium text-gray-900">New investment received - $5,000</p>
                  <p className="text-sm text-gray-500">From investor: 0x1234...5678</p>
                </div>
              </div>
              <div className="text-sm text-gray-500">2 hours ago</div>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <div>
                  <p className="font-medium text-gray-900">Project milestone completed</p>
                  <p className="text-sm text-gray-500">MVP development phase finished</p>
                </div>
              </div>
              <div className="text-sm text-gray-500">1 day ago</div>
            </div>
            
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                <div>
                  <p className="font-medium text-gray-900">EcoTech Solutions approved for listing</p>
                  <p className="text-sm text-gray-500">Your project is now live on the platform</p>
                </div>
              </div>
              <div className="text-sm text-gray-500">3 days ago</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};