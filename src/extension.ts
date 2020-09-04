// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { statusBarItem, updateStatusBarItem } from './statusBar';
import CommandController from './commands/CommandController';
import { normalize } from 'path';
// @ts-ignore
import * as commondir from 'commondir';

const ErrorHandler = withErrorHandler((error) => {
  vscode.window.showErrorMessage(error.message);
});

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  const controller = new CommandController(
    getCommandControllerContext(context.extensionPath)
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'extension.expose-helper.serveProject',
      ErrorHandler(controller.serveProject)
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'extension.expose-helper.reloadServer',
      ErrorHandler(controller.reloadServer)
    )
  );
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'extension.expose-helper.stopServer',
      ErrorHandler(controller.stopServer)
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'extension.expose-helper.toggleServer',
      ErrorHandler(controller.toggleServer)
    )
  );

  context.subscriptions.push(statusBarItem);

  updateStatusBarItem();
}

// this method is called when your extension is deactivated
export function deactivate() {}

function getCommandControllerContext(extensionPath: string) {
  return {
    extension: {
      path: extensionPath,
      getConfiguration: getExtensionConfiguration,
    },
    notify: vscode.window.showInformationMessage,
    getRootPath,
    getAbsolutePathToActiveFile: () =>
      vscode.window.activeTextEditor?.document.fileName,
  };
}

export interface ExtensionConfiguration {
  relativePath?: string;
}

function getExtensionConfiguration(): ExtensionConfiguration {
  const config = vscode.workspace.getConfiguration('expose-helper');

  return {};
}

export function getRootPath() {
  const absolutePathsOfWorkspaceFolders =
    vscode.workspace.workspaceFolders?.map(
      (workspaceFolder) => workspaceFolder.uri.fsPath
    ) || [];

  if (absolutePathsOfWorkspaceFolders.length === 0) {
    return;
  }

  return absolutePathsOfWorkspaceFolders.length > 0
    ? normalize(commondir(absolutePathsOfWorkspaceFolders))
    : undefined;
}

export function withErrorHandler(errorHandler: (error: Error) => void) {
  return (fn: Function) => (...args: any[]) => {
    try {
      return fn(...args);
    } catch (error) {
      errorHandler(error);
    }
  };
}
