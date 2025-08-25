import React, { useState, useEffect } from 'react';
import { useWeb3 } from './hooks/useWeb3';
import { useUserRole } from './hooks/useUserRole';
import { Header } from './components/Header';
import { LandingPage } from './components/LandingPage';
import { RoleSelection } from './components/RoleSelection';

// Import dashboard components (to be created)
// import { BackerDashboard } from './components/BackerDashboard';
// import { CreatorDashboard } from './components/CreatorDashboard';
// import { AdminDashboard } from './components/AdminDashboard';

export type Page = 'home' | 'projects' | 'create-project' | 'portfolio' | 'admin-dashboard' | 'creator-dashboard' | 'all-projects';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const { account, isConnected, connectWallet } = useWeb3();
  const { user, loading, createUserWithRole } = useUserRole(account);

  const handleRoleSelection = async (role: 'backer' | 'creator' | 'admin') => {
    if (account) {
      await createUserWithRole(account, role);
    }
  };

  const renderCurrentPage = () => {
    if (!isConnected) {
      return <LandingPage onConnectWallet={connectWallet} />;
    }

    if (!user && !loading) {
      return (
        <RoleSelection 
          onRoleSelect={handleRoleSelection}
          isLoading={loading}
        />
      );
    }

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your account...</p>
          </div>
        </div>
      );
    }

    // Render different dashboards based on user role and current page
    switch (currentPage) {
      case 'home':
        return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Welcome to EquityChain
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Your role: {user?.role.charAt(0).toUpperCase() + user?.role.slice(1)}
              </p>
              <div className="space-y-4">
                {user?.role === 'backer' && (
                  <>
                    <button
                      onClick={() => setCurrentPage('projects')}
                      className="block w-full max-w-md mx-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Browse Projects
                    </button>
                    <button
                      onClick={() => setCurrentPage('portfolio')}
                      className="block w-full max-w-md mx-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      View Portfolio
                    </button>
                  </>
                )}
                {user?.role === 'creator' && (
                  <>
                    <button
                      onClick={() => setCurrentPage('creator-dashboard')}
                      className="block w-full max-w-md mx-auto px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      My Projects
                    </button>
                    <button
                      onClick={() => setCurrentPage('create-project')}
                      className="block w-full max-w-md mx-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Create New Project
                    </button>
                  </>
                )}
                {user?.role === 'admin' && (
                  <>
                    <button
                      onClick={() => setCurrentPage('admin-dashboard')}
                      className="block w-full max-w-md mx-auto px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Admin Dashboard
                    </button>
                    <button
                      onClick={() => setCurrentPage('all-projects')}
                      className="block w-full max-w-md mx-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      All Projects
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {currentPage.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </h2>
              <p className="text-gray-600 mb-4">This page is under development.</p>
              <button
                onClick={() => setCurrentPage('home')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Back to Home
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {isConnected && user && (
        <Header 
          user={user}
          currentPage={currentPage}
          onNavigate={setCurrentPage}
        />
      )}
      {renderCurrentPage()}
    </div>
  );
}

export default App;