/**
 * Browser-compatible DataService that fetches data via HTTP API
 * This replaces the Node.js DataService for browser environments
 */
import type {
  ScenarioSummary,
  ScenarioDetail,
  RunSummary,
} from '@harshjudge/shared';

export interface ProjectSummary {
  path: string;
  name: string;
  scenarioCount: number;
  overallStatus: 'pass' | 'fail' | 'never_run';
}

export interface RunDetail {
  runId: string;
  scenarioSlug: string;
  result: import('@harshjudge/shared').RunResult | null;
  evidencePaths: string[];
}

export class ApiDataService {
  private baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  private async fetchJson<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}/api${endpoint}`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    return response.json();
  }

  async getProjects(): Promise<ProjectSummary[]> {
    return this.fetchJson<ProjectSummary[]>('/projects');
  }

  async getScenarios(projectPath: string): Promise<ScenarioSummary[]> {
    const encoded = encodeURIComponent(projectPath);
    return this.fetchJson<ScenarioSummary[]>(`/projects/${encoded}/scenarios`);
  }

  async getScenarioDetail(projectPath: string, scenarioSlug: string): Promise<ScenarioDetail | null> {
    const encodedProject = encodeURIComponent(projectPath);
    const encodedScenario = encodeURIComponent(scenarioSlug);
    return this.fetchJson<ScenarioDetail | null>(`/projects/${encodedProject}/scenarios/${encodedScenario}`);
  }

  async getRunHistory(projectPath: string, scenarioSlug: string): Promise<RunSummary[]> {
    const encodedProject = encodeURIComponent(projectPath);
    const encodedScenario = encodeURIComponent(scenarioSlug);
    return this.fetchJson<RunSummary[]>(`/projects/${encodedProject}/scenarios/${encodedScenario}/runs`);
  }

  async getRunDetail(projectPath: string, scenarioSlug: string, runId: string): Promise<RunDetail | null> {
    const encodedProject = encodeURIComponent(projectPath);
    const encodedScenario = encodeURIComponent(scenarioSlug);
    const encodedRun = encodeURIComponent(runId);
    return this.fetchJson<RunDetail | null>(`/projects/${encodedProject}/scenarios/${encodedScenario}/runs/${encodedRun}`);
  }
}
