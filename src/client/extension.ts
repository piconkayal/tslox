import * as path from "path";
import { workspace, ExtensionContext } from "vscode";
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind,
} from "vscode-languageclient/node";

let client: LanguageClient;

export function activate(context: ExtensionContext) {
  console.log("Lox Language Extension activating...");
  
  const serverModule = context.asAbsolutePath(
    path.join("dist", "server", "server.js")
  );

  const debugOptions = { execArgv: ["--nolazy", "--inspect=6009"] };

  const serverOptions: ServerOptions = {
    run: { module: serverModule, transport: TransportKind.ipc },
    debug: {
      module: serverModule,
      transport: TransportKind.ipc,
      options: debugOptions,
    },
  };

  const clientOptions: LanguageClientOptions = {
    documentSelector: [{ scheme: "file", language: "lox" }],
    synchronize: {
      fileEvents: workspace.createFileSystemWatcher("**/*.lox"),
    },
  };

  client = new LanguageClient(
    "loxLanguageServer",
    "Lox Language Server",
    serverOptions,
    clientOptions
  );

  client.start();
  console.log("Lox Language Extension activated");
}

export function deactivate(): Thenable<void> | undefined {
  if (!client) {
    return undefined;
  }
  return client.stop();
}
