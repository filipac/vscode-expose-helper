import { spawn, ChildProcess, spawnSync } from 'child_process';

type ServerEvent = 'data' | 'error' | 'close';

type ServerEventHandler = (data: string) => void;

export interface ExposeServerConfig {
  extensionPath: string;
  executablePath: string;
  rootPath: string;
  relativePath: string;
}

export default class ExposeServer {
  private process?: ChildProcess;
  private listeners: Array<[ServerEvent, ServerEventHandler]> = [];
  private config?: ExposeServerConfig;
  private overrideExecutablePath?: string;

  constructor() {}

  on(event: ServerEvent, handler: ServerEventHandler): void {
    this.listeners.push([event, handler]);
  }

  start(config: ExposeServerConfig): void {
    this.throwIfExposeIsNotAvailable(
      config.executablePath,
      config.rootPath,
      config.extensionPath
    );

    this.config = config;

    this.process = spawn(
      this.overrideExecutablePath || config.executablePath,
      this.getProcessArgs(config),
      {
        cwd: config.rootPath,
      }
    );

    this.setupProcessListeners();
  }

  stop(): void {
    this.process?.kill();
    this.process = undefined;
  }

  isRunning() {
    return !!this.process;
  }

  getCurrentConfig(): ExposeServerConfig | undefined {
    return this.config;
  }

  private throwIfExposeIsNotAvailable(
    executablePath: string,
    rootPath: string,
    extensionPath: string
  ): void {
    const { status } = spawnSync(executablePath, ['--version'], {
      cwd: rootPath,
    });

    if (status !== 0) {
      this.overrideExecutablePath = `${extensionPath}/bin/expose`;
      //   throw new Error(
      //     'Expose binary not found. Make sure composer bin folder is in your PATH.'
      //   );
    }
  }

  private getProcessArgs(config: ExposeServerConfig): string[] {
    const args: string[] = [];

    return args;
  }

  private setupProcessListeners() {
    this.listeners.forEach(([event, eventHandler]) => {
      this.setupSingleProcessListener(event, eventHandler);
    });
  }

  private setupSingleProcessListener(
    event: ServerEvent,
    eventHandler: ServerEventHandler
  ) {
    if (event === 'data') {
      this.process?.stdout?.on(event, (data: Buffer): void => {
        eventHandler(data.toString());
      });
      this.process?.stderr?.on(event, (data: Buffer): void => {
        eventHandler(data.toString());
      });
    } else if (event === 'error') {
      this.process?.on(event, (error: Error) => {
        eventHandler(error.stack || error.message);
      });
    } else {
      this.process?.on(event, eventHandler);
    }
  }
}
