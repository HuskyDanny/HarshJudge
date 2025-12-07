import { type FC, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { ThreeColumnLayout } from '@/components/layout/ThreeColumnLayout';
import { ProjectListPanel } from '@/components/panels/ProjectListPanel';
import { ScenarioListPanel } from '@/components/panels/ScenarioListPanel';
import { ScenarioDetailPanel } from '@/components/panels/ScenarioDetailPanel';
import { RunDetailPanel } from '@/components/panels/RunDetailPanel';
import { EmptyState, DocumentIcon } from '@/components/common/EmptyState';
import { useProjects, useScenarios } from '@/hooks';
import { FileWatcherProvider } from '@/contexts/FileWatcherContext';

/**
 * Main application component with 3-column layout
 */
export const App: FC = () => {
  return (
    <FileWatcherProvider basePath=".">
      <AppContent />
    </FileWatcherProvider>
  );
};

/**
 * App content wrapped in FileWatcherProvider
 */
const AppContent: FC = () => {
  // Project data from file system
  const { projects, loading: projectsLoading, error: projectsError } = useProjects('.');

  // Selection state
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [selectedRun, setSelectedRun] = useState<string | null>(null);

  // Scenario data for selected project
  const {
    scenarios,
    loading: scenariosLoading,
    error: scenariosError,
  } = useScenarios(selectedProject);

  // Clear scenario and run selection when project changes
  const handleProjectSelect = (projectPath: string) => {
    setSelectedProject(projectPath);
    setSelectedScenario(null);
    setSelectedRun(null);
  };

  // Clear run selection when scenario changes
  const handleScenarioSelect = (slug: string) => {
    setSelectedScenario(slug);
    setSelectedRun(null);
  };

  // Back from run detail to scenario detail
  const handleBackToScenario = () => {
    setSelectedRun(null);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-100">
      {/* Header */}
      <Header />

      {/* Main content area */}
      <main className="flex-1 overflow-hidden">
        <ThreeColumnLayout
          leftPanel={
            <ProjectListPanel
              projects={projects}
              selectedProject={selectedProject}
              onSelect={handleProjectSelect}
              loading={projectsLoading}
              error={projectsError}
            />
          }
          middlePanel={
            selectedProject ? (
              <ScenarioListPanel
                scenarios={scenarios}
                selectedScenario={selectedScenario}
                onSelect={handleScenarioSelect}
                loading={scenariosLoading}
                error={scenariosError}
              />
            ) : (
              <ScenarioListPlaceholder />
            )
          }
          rightPanel={
            selectedRun && selectedProject && selectedScenario ? (
              <RunDetailPanel
                projectPath={selectedProject}
                scenarioSlug={selectedScenario}
                runId={selectedRun}
                onBack={handleBackToScenario}
              />
            ) : (
              <ScenarioDetailPanel
                projectPath={selectedProject}
                scenarioSlug={selectedScenario}
                onRunSelect={setSelectedRun}
              />
            )
          }
        />
      </main>
    </div>
  );
};

/**
 * Placeholder for when no project is selected
 */
const ScenarioListPlaceholder: FC = () => {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-3 border-b border-gray-700">
        <h2 className="text-sm font-medium text-gray-400">Scenarios</h2>
      </div>
      <EmptyState
        icon={<DocumentIcon />}
        title="Select a project"
        description="Choose a project to view its test scenarios"
      />
    </div>
  );
};

