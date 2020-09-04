import * as vscode from 'vscode';
import { STOPPED } from './strings';
export let statusBarItem: vscode.StatusBarItem;

statusBarItem = vscode.window.createStatusBarItem(
  vscode.StatusBarAlignment.Left,
  100
);
statusBarItem.command = 'extension.expose-helper.toggleServer';

export function updateStatusBarItem(): void {
  statusBarItem.show();
  statusBarItem.text = STOPPED;
}
