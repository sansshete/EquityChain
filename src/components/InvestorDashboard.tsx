import React from 'react';
import { TrendingUp, DollarSign, PieChart, Clock, ExternalLink, ArrowUpRight } from 'lucide-react';

interface InvestorDashboardProps {
  onNavigateToProject: (projectId: string) => void;
}

export const InvestorDashboard: React.FC<InvestorDashboardProps> = ({ onNavigateToProject }) => {
  const mockInvestments = [
    { id: '1', project: 'EcoTech Solutions', amount: 5000, equity: 0.25, currentValue: 6500, status: 'Active' },
    { id: '2', project: 'AI Medical Diagnostics', amount: 10000, equity: 0.50, currentValue: 12800, status: 'Active' },
    { id: '3', project: 'Quantum Computing Labs', amount: 7500, equity: 0.30, currentValue: 8200, status: 'Active' },
  ];

  const totalInvested = mockInvestments.reduce((sum, inv) => sum + inv.amount, 0);
  const totalCurrentValue = mockInvestments.reduce((sum, inv) => sum + inv.currentValue, 0);
  const totalReturn = totalCurrentValue - totalInvested;
  const returnPercentage = ((totalReturn / totalInvested) * 100);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Investment Portfolio</h1>
        <p className="text-gray-600">Track your equity investments and portfolio performance</p>
      </div>

      {/* Portfolio Overview */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Invested</p>
              <p className="text-2xl font-bold text-gray-900">${totalInvested.toLocaleString()}</p>
            </div>
            <DollarSign className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Current Value</p>
              <p className="text-2xl font-bold text-gray-900">${totalCurrentValue.toLocaleString()}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Returns</p>
              <p className={`text-2xl font-bold ${totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${totalReturn.toLocaleString()}
              </p>
            </div>
            <ArrowUpRight className={`h-8 w-8 ${totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">ROI</p>
              <p className={`text-2xl font-bold ${returnPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {returnPercentage >= 0 ? '+' : ''}{returnPercentage.toFixed(1)}%
              </p>
            </div>
            <PieChart className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Investment List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Your Investments</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Investment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Equity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Value</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">P&L</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mockInvestments.map((investment) => {
                const pnl = investment.currentValue - investment.amount;
                const pnlPercentage = (pnl / investment.amount) * 100;
                
                return (
                  <tr key={investment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{investment.project}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                      ${investment.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                      {investment.equity}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                      ${investment.currentValue.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`${pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {pnl >= 0 ? '+' : ''}${pnl.toLocaleString()}
                        <span className="text-sm ml-1">({pnlPercentage >= 0 ? '+' : ''}{pnlPercentage.toFixed(1)}%)</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        {investment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => onNavigateToProject(investment.id)}
                        className="text-blue-600 hover:text-blue-800 flex items-center"
                      >
                        View <ExternalLink className="h-4 w-4 ml-1" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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
                  <p className="font-medium text-gray-900">Investment confirmed in EcoTech Solutions</p>
                  <p className="text-sm text-gray-500">Transaction: 0x1234...5678</p>
                </div>
              </div>
              <div className="text-sm text-gray-500">2 hours ago</div>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <div>
                  <p className="font-medium text-gray-900">Quarterly dividend received from AI Medical</p>
                  <p className="text-sm text-gray-500">Amount: $125.50</p>
                </div>
              </div>
              <div className="text-sm text-gray-500">1 day ago</div>
            </div>
            
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                <div>
                  <p className="font-medium text-gray-900">New milestone achieved by Quantum Computing Labs</p>
                  <p className="text-sm text-gray-500">Patent approval received</p>
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