import ExposeServer, { ExposeServerConfig } from '../ExposeServer';
import { ExtensionConfiguration } from '../extension';
import { platform } from 'os';
import VSCodeLogger, { Logger } from '../VSCodeLogger';
import { statusBarItem } from '../statusBar';
import { STOPPED, STARTED } from '../strings';

interface CommandControllerContext {
  extension: {
    path: string;
    getConfiguration(): ExtensionConfiguration;
  };
  notify(message: string): void;
  getRootPath(): string | undefined;
  getAbsolutePathToActiveFile(): string | undefined;
}

export default class CommandController {
  private server: ExposeServer;
  private logger: Logger = new VSCodeLogger('Expose Helper');

  constructor(private context: CommandControllerContext) {
    this.server = new ExposeServer();

    this.server.on('data', (data) => {
      statusBarItem.text = STARTED;
      this.logger.appendLine(data);
    });

    this.server.on('close', () => {
      statusBarItem.text = STOPPED;
      this.context.notify('Expose server stopped.');
    });

    this.server.on('error', (errorMessage) => {
      //   this.logger.show();
      this.logger.appendLine(errorMessage);
      this.server.stop();
      statusBarItem.text = STOPPED;
    });
  }

  toggleServer = (): void => {
    if (this.server.isRunning()) {
      this.stopServer();
    } else {
      this.serveProject();
    }
  };

  serveProject = (): void => {
    if (this.server.isRunning()) {
      throw Error('Expose is already running.');
    }

    this.logger.clear();
    // this.logger.show();

    this.startServer();
  };

  reloadServer = (): void => {
    if (this.server.isRunning()) {
      this.server.stop();
    }

    this.startServer();
  };

  serverIsRunning = (): boolean => {
    return this.server.isRunning();
  };

  stopServer = (): void => {
    if (this.server.isRunning()) {
      this.server.stop();
    }
  };

  private startServer() {
    this.server.start(this.getServerConfiguration());
    this.context.notify('Expose started');
  }

  private getServerConfiguration(): ExposeServerConfig {
    const extensionConfig = this.context.extension.getConfiguration();

    const relativePath = extensionConfig.relativePath || '.';

    return {
      executablePath: 'expose',
      rootPath: this.context.getRootPath()!, // TODO handle optionality
      extensionPath: this.context.extension.path,
      relativePath,
    };
  }

  private getExposeServerRouterPath(
    relativePath: string,
    routerPathFromConfig?: string
  ) {
    if (!routerPathFromConfig && platform() === 'win32') {
      process.env.PHP_SERVER_RELATIVE_PATH = relativePath;
      return `${this.context.extension.path}\\src\\server\\logger.php`;
    }

    return routerPathFromConfig;
  }
}
