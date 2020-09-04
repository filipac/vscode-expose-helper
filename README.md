# Expose Helper

This is a simple extension to run the [Expose PHP server](https://github.com/beyondcode/expose) directly from VSCode. It comes bundled with latest Expose binary if you do not have it installed globally with composer.

This is still WIP, I just needed something simple to get started, there are plenty of features we can implement.

## Features

- Commands to serve, stop or reload the expose server.
  ![commands](https://raw.githubusercontent.com/filipac/vscode-expose-helper/master/static/commands.png)
- Status bar indicator that shows if expose is running. On click it toggles.
- ![status bar](https://raw.githubusercontent.com/filipac/vscode-expose-helper/master/static/status.png)
- Embedded expose binary if `expose` is not in your PATH.
