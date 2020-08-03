import { getCurrentProfile } from "./utils/profile";
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

import * as cliCommands from "./nr1-cli-commands";
import pickChannel from "./utils/pick-channel";
import runCommand from "./utils/run-command";
import handleCreateCatalogResponse from "./response-handlers/create-catalog";
import getResponseHandlerForCreate from "./response-handlers/create-nerdpack";

/**********
 * TODO
 * Create and open a workspace on nr1Create
 * On all other commands, present a picker based on folders in the workspace that have an nr1.json
 *******/

let statusBarProfile: vscode.StatusBarItem;

const nr1Create = async ({ name, filePath }: any) =>
  runCommand(
    `cd ${filePath} && ${cliCommands.createNerdpack(name)}`,
    getResponseHandlerForCreate(name, filePath),
    "~"
  );

const nr1CreateCatalog = () =>
  runCommand(cliCommands.createCatalog(), handleCreateCatalogResponse);

const publishNerdpack = (channel: string) =>
  runCommand(cliCommands.publishNerdpack(channel));

const deployNerdpack = (channel: string) =>
  runCommand(cliCommands.deployNerdpack(channel));

const subscribeNerdpack = (channel: string) =>
  runCommand(cliCommands.subscribeNerdpack(channel));

const unsubscribeNerdpack = () => runCommand(cliCommands.unsubscribeNerdpack());

const nr1RunNerdpack = () => {
  var terminal = vscode.window.createTerminal("Nerdpack serve");
  terminal.show();
  terminal.sendText("nr1 nerdpack:serve");
  const uri = vscode.Uri.parse(
    "https://staging-one.newrelic.com?nerdpacks=local"
  );
  vscode.env.openExternal(uri);
};

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  statusBarProfile = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  );
  statusBarProfile.command = "vs-code-test.selectProfile";

  context.subscriptions.push(
    statusBarProfile,

    vscode.commands.registerCommand("vs-code-test.createCatalog", async () => {
      nr1CreateCatalog();
    }),

    vscode.commands.registerCommand("vs-code-test.catalogInfo", () =>
      runCommand(cliCommands.catalogInfo())
    ),

    vscode.commands.registerCommand("vs-code-test.catalogSubmit", () =>
      runCommand(cliCommands.catalogSubmit())
    ),

    vscode.commands.registerCommand("vs-code-test.runNerdpack", async () => {
      nr1RunNerdpack();
    }),

    vscode.commands.registerCommand("vs-code-test.createNerdpack", async () => {
      const nameInput = vscode.window.showInputBox({ prompt: "Nerdpack name" });
      const name = await nameInput;
      let filePath = vscode.workspace.rootPath;
      if (!filePath) {
        const selected = await vscode.window.showOpenDialog({
          canSelectFiles: false,
          canSelectFolders: true,
          canSelectMany: false,
          openLabel: "Select folder",
        });
        filePath = selected?.[0].path;
      }
      if (!filePath) {
        throw new Error("Have to select a file, please");
      }

      nr1Create({ name, filePath });
    })
  );

  updateStatusBarProfile();

  vscode.commands.registerCommand("vs-code-test.publishNerdpack", async () => {
    const channel = await pickChannel();
    publishNerdpack(channel);
  });

  vscode.commands.registerCommand("vs-code-test.deployNerdpack", async () => {
    const channel = await pickChannel();
    deployNerdpack(channel);
  });

  vscode.commands.registerCommand(
    "vs-code-test.subscribeNerdpack",
    async () => {
      const channel = await pickChannel();
      subscribeNerdpack(channel);
    }
  );

  vscode.commands.registerCommand(
    "vs-code-test.unsubscribeNerdpack",
    async () => {
      unsubscribeNerdpack();
    }
  );

  vscode.commands.registerCommand(
    "vs-code-test.selectProfile",
    cliCommands.selectProfile
  );
}

export function updateStatusBarProfile(): void {
  const currentProfile = getCurrentProfile();
  console.log(currentProfile);
  if (currentProfile) {
    statusBarProfile.text = currentProfile;
    statusBarProfile.show();
  } else {
    statusBarProfile.hide();
  }
}

// this method is called when your extension is deactivated
export function deactivate() {}
