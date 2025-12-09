import { mkdir, writeFile, readFile, access, readdir } from 'fs/promises';
import { dirname, join } from 'path';
import yaml from 'js-yaml';

/**
 * Service for filesystem operations.
 * All file operations in handlers should go through this service.
 */
export class FileSystemService {
  private basePath: string;

  constructor(basePath: string = process.cwd()) {
    this.basePath = basePath;
  }

  /**
   * Resolves a relative path against the base path.
   */
  private resolve(path: string): string {
    return join(this.basePath, path);
  }

  /**
   * Creates a directory recursively if it doesn't exist.
   */
  async ensureDir(path: string): Promise<void> {
    await mkdir(this.resolve(path), { recursive: true });
  }

  /**
   * Checks if a path exists.
   */
  async exists(path: string): Promise<boolean> {
    try {
      await access(this.resolve(path));
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Writes an object as YAML to a file.
   */
  async writeYaml(path: string, data: object): Promise<void> {
    const content = yaml.dump(data, { indent: 2 });
    await this.writeFile(path, content);
  }

  /**
   * Reads and parses a YAML file.
   */
  async readYaml<T>(path: string): Promise<T> {
    const content = await readFile(this.resolve(path), 'utf-8');
    return yaml.load(content) as T;
  }

  /**
   * Writes an object as JSON to a file.
   */
  async writeJson(path: string, data: object): Promise<void> {
    const content = JSON.stringify(data, null, 2);
    await this.writeFile(path, content);
  }

  /**
   * Reads and parses a JSON file.
   */
  async readJson<T>(path: string): Promise<T> {
    const content = await readFile(this.resolve(path), 'utf-8');
    return JSON.parse(content) as T;
  }

  /**
   * Writes string or binary data to a file.
   * Creates parent directories if they don't exist.
   */
  async writeFile(path: string, data: string | Buffer): Promise<void> {
    const fullPath = this.resolve(path);
    await mkdir(dirname(fullPath), { recursive: true });
    await writeFile(fullPath, data);
  }

  /**
   * Reads a file as a string (default) or Buffer (binary mode).
   * Supports both relative paths (resolved against basePath) and absolute paths.
   */
  async readFile(path: string): Promise<string>;
  async readFile(path: string, binary: true): Promise<Buffer>;
  async readFile(path: string, binary?: boolean): Promise<string | Buffer> {
    // Detect absolute paths (Windows C:\... or Unix /...)
    const isAbsolute = /^[A-Z]:[/\\]/i.test(path) || path.startsWith('/');
    const fullPath = isAbsolute ? path : this.resolve(path);

    if (binary) {
      return readFile(fullPath);
    }
    return readFile(fullPath, 'utf-8');
  }

  /**
   * Lists subdirectories in a directory.
   */
  async listDirs(path: string): Promise<string[]> {
    const entries = await readdir(this.resolve(path), { withFileTypes: true });
    return entries.filter((e) => e.isDirectory()).map((e) => e.name);
  }

  /**
   * Lists files (not directories) in a directory.
   */
  async listFiles(path: string): Promise<string[]> {
    const entries = await readdir(this.resolve(path), { withFileTypes: true });
    return entries.filter((e) => e.isFile()).map((e) => e.name);
  }
}
