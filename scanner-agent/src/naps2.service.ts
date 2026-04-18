import { spawn } from 'child_process';
import { mkdirSync } from 'fs';
import { dirname } from 'path';
import { AgentConfig, Naps2RunResult } from './types';

export class Naps2Service {
  constructor(private readonly config: AgentConfig) {}

  async scanToPdf(pdfPath: string): Promise<Naps2RunResult> {
    mkdirSync(dirname(pdfPath), { recursive: true });

    const args = this.buildCommandArgs(pdfPath);

    return new Promise<Naps2RunResult>((resolve, reject) => {
      const processHandle = spawn(this.config.naps2Path, args, {
        windowsHide: true,
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      let stdout = '';
      let stderr = '';

      processHandle.stdout.on('data', (chunk: unknown) => {
        stdout += String(chunk);
      });

      processHandle.stderr.on('data', (chunk: unknown) => {
        stderr += String(chunk);
      });

      processHandle.on('error', (error: Error) => reject(error));

      processHandle.on('close', (exitCode: number | null) => {
        const code = exitCode ?? 1;
        const result: Naps2RunResult = { exitCode: code, stdout, stderr };

        if (code !== 0) {
          reject(new Error(`NAPS2 exited with code ${code}. stderr: ${stderr || '(empty)'}`));
          return;
        }

        resolve(result);
      });
    });
  }

  private buildCommandArgs(pdfPath: string): string[] {
    if (this.config.naps2Arguments) {
      const dynamic = this.parseCommandLikeArgs(
        this.config.naps2Arguments.replace('{output}', pdfPath),
      );
      return dynamic;
    }

    return ['-o', pdfPath, '-a', '-f'];
  }

  private parseCommandLikeArgs(raw: string): string[] {
    const args: string[] = [];
    let token = '';
    let inQuotes = false;

    for (let index = 0; index < raw.length; index += 1) {
      const char = raw[index] ?? '';

      if (char === '"') {
        inQuotes = !inQuotes;
        continue;
      }

      if (!inQuotes && /\s/.test(char)) {
        if (token.length > 0) {
          args.push(token);
          token = '';
        }
        continue;
      }

      token += char;
    }

    if (token.length > 0) {
      args.push(token);
    }

    return args;
  }
}
