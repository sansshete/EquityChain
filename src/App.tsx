import React, { useState } from 'react';
import { useWeb3 } from './hooks/useWeb3';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ProjectList } from './components/ProjectList';
import { ProjectDetail } from './components/ProjectDetail';
import { InvestorDashboard } from './components/InvestorDashboard';
import { CreateProject } from './components/CreateProject';
import { CreatorDashboard } from './components/CreatorDashboard';
import { AIAssistant } from './components/AIAssistant';

export type Page = 'home' | 'project' | 'investor-dashboard' | 'create-project' | 'creator-dashboard';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const { isConnected } = useWeb3();

  const navigateToProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    setCurrentPage('project');
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'project':
        return (
          <ProjectDetail 
            projectId={selectedProjectId!} 
            onBack={() => setCurrentPage('home')}
            isConnected={isConnected}
          />
        );
      case 'investor-dashboard':
        return <InvestorDashboard onNavigateToProject={navigateToProject} />;
      case 'create-project':
        return <CreateProject onBack={() => setCurrentPage('home')} />;
      case 'creator-dashboard':
        return <CreatorDashboard onNavigateToProject={navigateToProject} />;
      default:
        return (
          <>
            <Hero onGetStarted={() => setCurrentPage('create-project')} />
            <ProjectList onProjectClick={navigateToProject} />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        currentPage={currentPage}
        onNavigate={setCurrentPage}
      />
      {renderCurrentPage()}
      <AIAssistant 
        isOpen={isAssistantOpen}
        onToggle={() => setIsAssistantOpen(!isAssistantOpen)}
      />
    </div>
  );
}

export default App;