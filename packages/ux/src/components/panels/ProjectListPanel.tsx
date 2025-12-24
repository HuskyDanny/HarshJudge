import { type FC, useMemo } from 'react';
import { type ProjectSummary } from '@/services/ApiDataService';
import { StatusBadge } from '../common/StatusBadge';
import { EmptyState, FolderIcon } from '../common/EmptyState';

interface ProjectListPanelProps {
  /** List of projects to display */
  projects: ProjectSummary[];
  /** Currently selected project path */
  selectedProject: string | null;
  /** Callback when a project is selected */
  onSelect: (projectPath: string) => void;
  /** Whether data is loading */
  loading?: boolean;
  /** Error message if any */
  error?: string | null;
}

/**
 * Panel displaying list of discovered HarshJudge projects
 */
export const ProjectListPanel: FC<ProjectListPanelProps> = ({
  projects,
  selectedProject,
  onSelect,
  loading = false,
  error = null,
}) => {
  // Sort projects alphabetically by name
  const sortedProjects = useMemo(() => {
    return [...projects].sort((a, b) => a.name.localeCompare(b.name));
  }, [projects]);

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <header className="flex items-center justify-between p-3 border-b border-gray-700">
          <h2 className="text-sm font-medium text-gray-400">Projects</h2>
        </header>
        <div className="flex items-center justify-center flex-1">
          <div className="text-sm text-gray-500">Loading projects...</div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col h-full">
        <header className="flex items-center justify-between p-3 border-b border-gray-700">
          <h2 className="text-sm font-medium text-gray-400">Projects</h2>
        </header>
        <EmptyState
          title="Error loading projects"
          description={error}
        />
      </div>
    );
  }

  // Empty state
  if (projects.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <header className="flex items-center justify-between p-3 border-b border-gray-700">
          <h2 className="text-sm font-medium text-gray-400">Projects (0)</h2>
        </header>
        <EmptyState
          icon={<FolderIcon />}
          title="No projects found"
          description="Initialize a project with /harshjudge:setup"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Panel header with count */}
      <header className="flex items-center justify-between p-3 border-b border-gray-700">
        <h2 className="text-sm font-medium text-gray-400">
          Projects ({projects.length})
        </h2>
      </header>

      {/* Project list */}
      <ul
        className="flex-1 overflow-y-auto"
        role="listbox"
        aria-label="Projects"
      >
        {sortedProjects.map((project, index) => {
          const isSelected = selectedProject === project.path;

          return (
            <li
              key={project.path}
              role="option"
              aria-selected={isSelected}
              data-index={index}
              className={`
                p-3 cursor-pointer border-b border-gray-800
                transition-colors duration-150
                hover:bg-gray-800
                focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500 focus-visible:outline-none
                ${isSelected ? 'bg-gray-800' : ''}
              `}
              onClick={() => onSelect(project.path)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelect(project.path);
                }
              }}
              tabIndex={0}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-200 truncate">
                  {project.name}
                </span>
                {/* Only show status badge if project has runs */}
                {project.overallStatus !== 'never_run' && (
                  <StatusBadge status={project.overallStatus as 'pass' | 'fail' | 'running'} />
                )}
              </div>
              <span className="text-xs text-gray-500">
                {project.scenarioCount} {project.scenarioCount === 1 ? 'scenario' : 'scenarios'}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
