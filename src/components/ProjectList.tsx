import React from 'react';
import { Clock, Users, TrendingUp, ExternalLink } from 'lucide-react';
import { useWeb3 } from '../hooks/useWeb3';
import { ContractService } from '../services/contractService';
import { mockProjects } from '../data/mockData';

interface ProjectListProps {
  onProjectClick: (projectId: string) => void;
}

export const ProjectList: React.FC<ProjectListProps> = ({ onProjectClick }) => {
  const { provider, chainId, isConnected } = useWeb3();
  const [projects, setProjects] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchProjects = async () => {
      if (!provider || !chainId || !isConnected) {
        // Use mock data when not connected
        setProjects(mockProjects);
        setLoading(false);
        return;
      }

      try {
        const contractService = new ContractService(provider, await provider.getSigner(), chainId);
        const result = await contractService.getApprovedProjects();
        
        if (result.success && result.projects) {
          setProjects(result.projects);
        } else {
          // Fallback to mock data
          setProjects(mockProjects);
        }
      } catch (contractError) {
        console.log('Contract not deployed or accessible, using mock data');
        setProjects(mockProjects);
      } catch (error) {
        console.error('Error fetching projects:', error);
        setProjects(mockProjects);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [provider, chainId, isConnected]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Investment Opportunities</h2>
        <p className="text-lg text-gray-600">Discover innovative startups seeking equity funding through our platform</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map((project) => {
          const fundingPercentage = (project.currentFunding / project.fundingGoal) * 100;
          
          return (
            <div
              key={project.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 cursor-pointer group"
              onClick={() => onProjectClick(project.id)}
            >
              <div className="relative">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-48 object-cover rounded-t-xl"
                />
                <div className="absolute top-4 left-4">
                  <span className="inline-flex px-3 py-1 bg-white/90 text-sm font-medium text-gray-900 rounded-full">
                    {project.category}
                  </span>
                </div>
                <div className="absolute top-4 right-4">
                  <ExternalLink className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {project.title}
                </h3>
                
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {project.description}
                </p>

                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-500 mb-2">
                    <span>Funding Progress</span>
                    <span>{fundingPercentage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(fundingPercentage, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <span className="text-gray-500">Raised</span>
                    <p className="font-semibold text-gray-900">${project.currentFunding.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Goal</span>
                    <p className="font-semibold text-gray-900">${project.fundingGoal.toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    <span>{project.investors} investors</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{project.daysLeft} days left</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <span className="text-gray-500">Min Investment</span>
                    <p className="font-semibold text-gray-900">${project.minInvestment.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center text-green-600">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    <span className="text-sm font-medium">{project.equityOffered}% equity</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};