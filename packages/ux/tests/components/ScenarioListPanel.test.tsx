import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ScenarioListPanel } from '../../src/components/panels/ScenarioListPanel';
import { type ScenarioSummary } from '@harshjudge/shared';

// Sample test data
const mockScenarios: ScenarioSummary[] = [
  {
    slug: 'login-flow',
    title: 'Login Flow',
    tags: ['auth', 'critical'],
    lastResult: 'pass',
    lastRun: '2025-01-02T10:00:00Z',
    totalRuns: 10,
    passRate: 90,
  },
  {
    slug: 'checkout-process',
    title: 'Checkout Process',
    tags: ['e2e', 'payments', 'cart', 'shipping'],
    lastResult: 'fail',
    lastRun: '2025-01-03T15:30:00Z',
    totalRuns: 5,
    passRate: 60,
  },
  {
    slug: 'user-profile',
    title: 'User Profile',
    tags: [],
    lastResult: null,
    lastRun: null,
    totalRuns: 0,
    passRate: 0,
  },
];

describe('ScenarioListPanel', () => {
  describe('Loading state', () => {
    it('renders loading indicator when loading is true', () => {
      render(
        <ScenarioListPanel
          scenarios={[]}
          selectedScenario={null}
          onSelect={vi.fn()}
          loading={true}
        />
      );

      expect(screen.getByText('Loading scenarios...')).toBeInTheDocument();
    });

    it('displays "Scenarios" header during loading', () => {
      render(
        <ScenarioListPanel
          scenarios={[]}
          selectedScenario={null}
          onSelect={vi.fn()}
          loading={true}
        />
      );

      expect(screen.getByText('Scenarios')).toBeInTheDocument();
    });
  });

  describe('Error state', () => {
    it('renders error message when error is provided', () => {
      const errorMessage = 'Failed to load scenarios';
      render(
        <ScenarioListPanel
          scenarios={[]}
          selectedScenario={null}
          onSelect={vi.fn()}
          error={errorMessage}
        />
      );

      expect(screen.getByText('Error loading scenarios')).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  describe('Empty state', () => {
    it('renders empty state when no scenarios exist', () => {
      render(
        <ScenarioListPanel
          scenarios={[]}
          selectedScenario={null}
          onSelect={vi.fn()}
        />
      );

      expect(screen.getByText('No scenarios')).toBeInTheDocument();
      expect(
        screen.getByText('Create scenarios with /harshjudge:init')
      ).toBeInTheDocument();
    });

    it('displays correct count in header when empty', () => {
      render(
        <ScenarioListPanel
          scenarios={[]}
          selectedScenario={null}
          onSelect={vi.fn()}
        />
      );

      expect(screen.getByText('Scenarios (0)')).toBeInTheDocument();
    });
  });

  describe('Scenario list rendering', () => {
    it('renders all scenarios in the list', () => {
      render(
        <ScenarioListPanel
          scenarios={mockScenarios}
          selectedScenario={null}
          onSelect={vi.fn()}
        />
      );

      expect(screen.getByText('Login Flow')).toBeInTheDocument();
      expect(screen.getByText('Checkout Process')).toBeInTheDocument();
      expect(screen.getByText('User Profile')).toBeInTheDocument();
    });

    it('displays correct scenario count in header', () => {
      render(
        <ScenarioListPanel
          scenarios={mockScenarios}
          selectedScenario={null}
          onSelect={vi.fn()}
        />
      );

      expect(screen.getByText('Scenarios (3)')).toBeInTheDocument();
    });

    it('displays tags for each scenario', () => {
      render(
        <ScenarioListPanel
          scenarios={mockScenarios}
          selectedScenario={null}
          onSelect={vi.fn()}
        />
      );

      // Login Flow tags
      expect(screen.getByText('auth')).toBeInTheDocument();
      expect(screen.getByText('critical')).toBeInTheDocument();

      // Checkout Process - first 3 tags shown
      expect(screen.getByText('e2e')).toBeInTheDocument();
      expect(screen.getByText('payments')).toBeInTheDocument();
      expect(screen.getByText('cart')).toBeInTheDocument();
      // 4th tag shows as +1 indicator
      expect(screen.getByText('+1')).toBeInTheDocument();
    });

    it('displays total runs and pass rate', () => {
      render(
        <ScenarioListPanel
          scenarios={mockScenarios}
          selectedScenario={null}
          onSelect={vi.fn()}
        />
      );

      expect(screen.getByText('10 runs · 90% pass')).toBeInTheDocument();
      expect(screen.getByText('5 runs · 60% pass')).toBeInTheDocument();
      expect(screen.getByText('No runs yet')).toBeInTheDocument();
    });
  });

  describe('Sorting by last run time', () => {
    it('sorts scenarios by last run (most recent first)', () => {
      render(
        <ScenarioListPanel
          scenarios={mockScenarios}
          selectedScenario={null}
          onSelect={vi.fn()}
        />
      );

      const listItems = screen.getAllByRole('option');
      expect(listItems).toHaveLength(3);

      // Checkout Process (Jan 3) should come first, then Login Flow (Jan 2), then User Profile (never)
      expect(listItems[0]).toHaveTextContent('Checkout Process');
      expect(listItems[1]).toHaveTextContent('Login Flow');
      expect(listItems[2]).toHaveTextContent('User Profile');
    });

    it('places never-run scenarios at the end', () => {
      render(
        <ScenarioListPanel
          scenarios={mockScenarios}
          selectedScenario={null}
          onSelect={vi.fn()}
        />
      );

      const listItems = screen.getAllByRole('option');
      expect(listItems[2]).toHaveTextContent('User Profile');
      expect(listItems[2]).toHaveTextContent('No runs yet');
    });
  });

  describe('Selection behavior', () => {
    it('highlights selected scenario with aria-selected', () => {
      render(
        <ScenarioListPanel
          scenarios={mockScenarios}
          selectedScenario="login-flow"
          onSelect={vi.fn()}
        />
      );

      const selectedItem = screen.getByRole('option', { selected: true });
      expect(selectedItem).toHaveTextContent('Login Flow');
    });

    it('calls onSelect when scenario is clicked', () => {
      const handleSelect = vi.fn();
      render(
        <ScenarioListPanel
          scenarios={mockScenarios}
          selectedScenario={null}
          onSelect={handleSelect}
        />
      );

      fireEvent.click(screen.getByText('Login Flow'));
      expect(handleSelect).toHaveBeenCalledWith('login-flow');
    });

    it('calls onSelect when Enter key is pressed', () => {
      const handleSelect = vi.fn();
      render(
        <ScenarioListPanel
          scenarios={mockScenarios}
          selectedScenario={null}
          onSelect={handleSelect}
        />
      );

      const firstScenario = screen.getByText('Checkout Process').closest('li');
      fireEvent.keyDown(firstScenario!, { key: 'Enter' });
      expect(handleSelect).toHaveBeenCalledWith('checkout-process');
    });

    it('calls onSelect when Space key is pressed', () => {
      const handleSelect = vi.fn();
      render(
        <ScenarioListPanel
          scenarios={mockScenarios}
          selectedScenario={null}
          onSelect={handleSelect}
        />
      );

      const firstScenario = screen.getByText('Checkout Process').closest('li');
      fireEvent.keyDown(firstScenario!, { key: ' ' });
      expect(handleSelect).toHaveBeenCalledWith('checkout-process');
    });
  });

  describe('Status badges', () => {
    it('renders status badges for each scenario', () => {
      render(
        <ScenarioListPanel
          scenarios={mockScenarios}
          selectedScenario={null}
          onSelect={vi.fn()}
        />
      );

      // Check status badges exist (rendered as img elements with aria-label)
      const statusBadges = screen.getAllByRole('img');
      expect(statusBadges.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Accessibility', () => {
    it('has accessible listbox role', () => {
      render(
        <ScenarioListPanel
          scenarios={mockScenarios}
          selectedScenario={null}
          onSelect={vi.fn()}
        />
      );

      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('has aria-label on the list', () => {
      render(
        <ScenarioListPanel
          scenarios={mockScenarios}
          selectedScenario={null}
          onSelect={vi.fn()}
        />
      );

      expect(screen.getByRole('listbox')).toHaveAttribute(
        'aria-label',
        'Scenarios'
      );
    });

    it('list items have option role', () => {
      render(
        <ScenarioListPanel
          scenarios={mockScenarios}
          selectedScenario={null}
          onSelect={vi.fn()}
        />
      );

      const options = screen.getAllByRole('option');
      expect(options).toHaveLength(3);
    });

    it('items are focusable with tabIndex', () => {
      render(
        <ScenarioListPanel
          scenarios={mockScenarios}
          selectedScenario={null}
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
