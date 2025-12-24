import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProjectListPanel } from '../../src/components/panels/ProjectListPanel';
import { type ProjectSummary } from '../../src/services/DataService';

// Sample test data
const mockProjects: ProjectSummary[] = [
  {
    name: 'Checkout Flow',
    path: '/projects/checkout',
    scenarioCount: 5,
    overallStatus: 'pass',
  },
  {
    name: 'Auth Module',
    path: '/projects/auth',
    scenarioCount: 3,
    overallStatus: 'fail',
  },
  {
    name: 'Dashboard',
    path: '/projects/dashboard',
    scenarioCount: 2,
    overallStatus: 'never_run',
  },
];

describe('ProjectListPanel', () => {
  describe('Loading state', () => {
    it('renders loading indicator when loading is true', () => {
      render(
        <ProjectListPanel
          projects={[]}
          selectedProject={null}
          onSelect={vi.fn()}
          loading={true}
        />
      );

      expect(screen.getByText('Loading projects...')).toBeInTheDocument();
    });

    it('displays "Projects" header during loading', () => {
      render(
        <ProjectListPanel
          projects={[]}
          selectedProject={null}
          onSelect={vi.fn()}
          loading={true}
        />
      );

      expect(screen.getByText('Projects')).toBeInTheDocument();
    });
  });

  describe('Error state', () => {
    it('renders error message when error is provided', () => {
      const errorMessage = 'Failed to load projects from filesystem';
      render(
        <ProjectListPanel
          projects={[]}
          selectedProject={null}
          onSelect={vi.fn()}
          error={errorMessage}
        />
      );

      expect(screen.getByText('Error loading projects')).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  describe('Empty state', () => {
    it('renders empty state when no projects exist', () => {
      render(
        <ProjectListPanel
          projects={[]}
          selectedProject={null}
          onSelect={vi.fn()}
        />
      );

      expect(screen.getByText('No projects found')).toBeInTheDocument();
      expect(
        screen.getByText('Initialize a project with /harshjudge:setup')
      ).toBeInTheDocument();
    });

    it('displays correct count in header when empty', () => {
      render(
        <ProjectListPanel
          projects={[]}
          selectedProject={null}
          onSelect={vi.fn()}
        />
      );

      expect(screen.getByText('Projects (0)')).toBeInTheDocument();
    });
  });

  describe('Project list rendering', () => {
    it('renders all projects in the list', () => {
      render(
        <ProjectListPanel
          projects={mockProjects}
          selectedProject={null}
          onSelect={vi.fn()}
        />
      );

      expect(screen.getByText('Checkout Flow')).toBeInTheDocument();
      expect(screen.getByText('Auth Module')).toBeInTheDocument();
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    it('displays correct project count in header', () => {
      render(
        <ProjectListPanel
          projects={mockProjects}
          selectedProject={null}
          onSelect={vi.fn()}
        />
      );

      expect(screen.getByText('Projects (3)')).toBeInTheDocument();
    });

    it('displays scenario count for each project', () => {
      render(
        <ProjectListPanel
          projects={mockProjects}
          selectedProject={null}
          onSelect={vi.fn()}
        />
      );

      expect(screen.getByText('5 scenarios')).toBeInTheDocument();
      expect(screen.getByText('3 scenarios')).toBeInTheDocument();
      expect(screen.getByText('2 scenarios')).toBeInTheDocument();
    });

    it('uses singular "scenario" for count of 1', () => {
      const singleScenarioProject: ProjectSummary[] = [
        {
          name: 'Single Test',
          path: '/projects/single',
          scenarioCount: 1,
          overallStatus: 'pass',
        },
      ];

      render(
        <ProjectListPanel
          projects={singleScenarioProject}
          selectedProject={null}
          onSelect={vi.fn()}
        />
      );

      expect(screen.getByText('1 scenario')).toBeInTheDocument();
    });
  });

  describe('Alphabetical sorting', () => {
    it('sorts projects alphabetically by name', () => {
      render(
        <ProjectListPanel
          projects={mockProjects}
          selectedProject={null}
          onSelect={vi.fn()}
        />
      );

      const listItems = screen.getAllByRole('option');
      expect(listItems).toHaveLength(3);

      // Auth Module should come first, then Checkout Flow, then Dashboard
      expect(listItems[0]).toHaveTextContent('Auth Module');
      expect(listItems[1]).toHaveTextContent('Checkout Flow');
      expect(listItems[2]).toHaveTextContent('Dashboard');
    });
  });

  describe('Selection behavior', () => {
    it('highlights selected project with aria-selected', () => {
      render(
        <ProjectListPanel
          projects={mockProjects}
          selectedProject="/projects/auth"
          onSelect={vi.fn()}
        />
      );

      const selectedItem = screen.getByRole('option', { selected: true });
      expect(selectedItem).toHaveTextContent('Auth Module');
    });

    it('calls onSelect when project is clicked', () => {
      const handleSelect = vi.fn();
      render(
        <ProjectListPanel
          projects={mockProjects}
          selectedProject={null}
          onSelect={handleSelect}
        />
      );

      fireEvent.click(screen.getByText('Checkout Flow'));
      expect(handleSelect).toHaveBeenCalledWith('/projects/checkout');
    });

    it('calls onSelect when Enter key is pressed', () => {
      const handleSelect = vi.fn();
      render(
        <ProjectListPanel
          projects={mockProjects}
          selectedProject={null}
          onSelect={handleSelect}
        />
      );

      const firstProject = screen.getByText('Auth Module').closest('li');
      fireEvent.keyDown(firstProject!, { key: 'Enter' });
      expect(handleSelect).toHaveBeenCalledWith('/projects/auth');
    });

    it('calls onSelect when Space key is pressed', () => {
      const handleSelect = vi.fn();
      render(
        <ProjectListPanel
          projects={mockProjects}
          selectedProject={null}
          onSelect={handleSelect}
        />
      );

      const firstProject = screen.getByText('Auth Module').closest('li');
      fireEvent.keyDown(firstProject!, { key: ' ' });
      expect(handleSelect).toHaveBeenCalledWith('/projects/auth');
    });
  });

  describe('Status indicators', () => {
    it('renders status badges for projects with runs', () => {
      render(
        <ProjectListPanel
          projects={mockProjects}
          selectedProject={null}
          onSelect={vi.fn()}
        />
      );

      // Only projects with pass/fail status should have status badges
      // 'never_run' projects should not show status badges
      const listItems = screen.getAllByRole('option');

      // First two projects (Auth Module, Checkout Flow) have pass/fail status
      // Dashboard has 'never_run' so no badge
      const passFailBadges = screen.getAllByRole('img');
      expect(passFailBadges.length).toBe(2); // Only pass and fail projects
    });
  });

  describe('Accessibility', () => {
    it('has accessible listbox role', () => {
      render(
        <ProjectListPanel
          projects={mockProjects}
          selectedProject={null}
          onSelect={vi.fn()}
        />
      );

      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('has aria-label on the list', () => {
      render(
        <ProjectListPanel
          projects={mockProjects}
          selectedProject={null}
          onSelect={vi.fn()}
        />
      );

      expect(screen.getByRole('listbox')).toHaveAttribute(
        'aria-label',
        'Projects'
      );
    });

    it('list items have option role', () => {
      render(
        <ProjectListPanel
          projects={mockProjects}
          selectedProject={null}
          onSelect={vi.fn()}
        />
      );

      const options = screen.getAllByRole('option');
      expect(options).toHaveLength(3);
    });

    it('items are focusable with tabIndex', () => {
      render(
        <ProjectListPanel
          projects={mockProjects}
          selectedProject={null}
          onSelect={vi.fn()}
        />
      );

      const options = screen.getAllByRole('option');
      options.forEach((option) => {
        expect(option).toHaveAttribute('tabIndex', '0');
      });
    });
  });
});
