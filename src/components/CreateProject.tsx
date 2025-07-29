import React, { useState } from 'react';
import { ArrowLeft, Upload, FileText, DollarSign, Users, Calendar } from 'lucide-react';
import { useWeb3 } from '../hooks/useWeb3';
import { ContractService } from '../services/contractService';

interface CreateProjectProps {
  onBack: () => void;
}

export const CreateProject: React.FC<CreateProjectProps> = ({ onBack }) => {
  const { provider, signer, chainId, isConnected } = useWeb3();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    fundingGoal: '',
    equityOffered: '',
    minInvestment: '',
    duration: '30',
    teamSize: '',
    revenue: '',
    website: '',
  });

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const totalSteps = 3;

  const categories = [
    'Technology', 'Healthcare', 'Fintech', 'E-commerce', 'AI/ML', 
    'Blockchain', 'IoT', 'Sustainability', 'Education', 'Other'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected || !provider || !signer || !chainId) {
      setSubmitError('Please connect your wallet first');
      return;
    }
    
    createProject();
  };

  const createProject = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      const contractService = new ContractService(provider!, signer!, chainId!);
      
      const result = await contractService.createProject({
        name: formData.title,
        symbol: formData.title.replace(/\s+/g, '').toUpperCase().slice(0, 5),
        description: formData.description,
        category: formData.category,
        fundingGoal: formData.fundingGoal,
        equityPercentage: formData.equityOffered,
        minInvestment: formData.minInvestment,
        maxInvestment: formData.fundingGoal, // Set max to funding goal for simplicity
        fundingDuration: formData.duration,
      });
      
      if (result.success) {
        alert(`Project created successfully! Transaction: ${result.transactionHash}\nProject will be reviewed before going live.`);
        onBack();
      } else {
        setSubmitError(result.error || 'Failed to create project');
      }
    } catch (error: any) {
      console.error('Error creating project:', error);
      setSubmitError(error.message || 'Failed to create project');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Project Information</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Project Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your project name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Project Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe your project, its goals, and what makes it unique"
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Team Size</label>
                <input
                  type="number"
                  name="teamSize"
                  value={formData.teamSize}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Number of team members"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://yourproject.com"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Funding Details</h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Funding Goal ($) *</label>
                <input
                  type="number"
                  name="fundingGoal"
                  value={formData.fundingGoal}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="100000"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Equity Offered (%) *</label>
                <input
                  type="number"
                  name="equityOffered"
                  value={formData.equityOffered}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="10"
                  max="100"
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Investment ($) *</label>
                <input
                  type="number"
                  name="minInvestment"
                  value={formData.minInvestment}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="1000"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Duration (days) *</label>
                <select
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="30">30 days</option>
                  <option value="45">45 days</option>
                  <option value="60">60 days</option>
                  <option value="90">90 days</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Annual Revenue ($)</label>
              <input
                type="number"
                name="revenue"
                value={formData.revenue}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="500000"
              />
            </div>

            {formData.fundingGoal && formData.equityOffered && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Valuation Summary</h3>
                <div className="text-blue-800 space-y-1">
                  <p>Pre-money Valuation: ${((parseFloat(formData.fundingGoal) / parseFloat(formData.equityOffered)) * 100 - parseFloat(formData.fundingGoal)).toLocaleString()}</p>
                  <p>Post-money Valuation: ${((parseFloat(formData.fundingGoal) / parseFloat(formData.equityOffered)) * 100).toLocaleString()}</p>
                </div>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Review & Submit</h2>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Project Summary</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Title:</span>
                  <p className="font-medium">{formData.title}</p>
                </div>
                <div>
                  <span className="text-gray-500">Category:</span>
                  <p className="font-medium">{formData.category}</p>
                </div>
                <div>
                  <span className="text-gray-500">Funding Goal:</span>
                  <p className="font-medium">${parseFloat(formData.fundingGoal || '0').toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-gray-500">Equity Offered:</span>
                  <p className="font-medium">{formData.equityOffered}%</p>
                </div>
                <div>
                  <span className="text-gray-500">Min Investment:</span>
                  <p className="font-medium">${parseFloat(formData.minInvestment || '0').toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-gray-500">Duration:</span>
                  <p className="font-medium">{formData.duration} days</p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-900 mb-2">Before Submission</h3>
              <ul className="text-yellow-800 text-sm space-y-1">
                <li>• Your project will undergo a review process (2-5 business days)</li>
                <li>• Legal documents and smart contracts will be generated</li>
                <li>• KYC verification is required for project creators</li>
                <li>• Platform fee: 2.5% of funds raised</li>
              </ul>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <label className="flex items-center">
                <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" required />
                <span className="ml-2 text-sm text-gray-700">
                  I agree to the <a href="#" className="text-blue-600 hover:underline">Terms of Service</a> and 
                  <a href="#" className="text-blue-600 hover:underline ml-1">Privacy Policy</a>
                </span>
              </label>
            </div>
            
            {!isConnected && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 text-sm">
                  Please connect your wallet to create a project.
                </p>
              </div>
            )}
            
            {submitError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 text-sm">{submitError}</p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={onBack}
        className="inline-flex items-center text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to Home
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Create New Project</h1>
            <span className="text-sm text-gray-500">Step {step} of {totalSteps}</span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {renderStep()}

          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={prevStep}
              disabled={step === 1}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {step < totalSteps ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={!isConnected || isSubmitting}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creating Project...' : 'Submit Project'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};