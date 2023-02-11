import { Component, OnInit } from "@angular/core";
import { NgxEditorModel } from "ngx-monaco-editor";
import { listen, MessageConnection } from "vscode-ws-jsonrpc";
import {
  MonacoLanguageClient,
  CloseAction,
  ErrorAction,
  MonacoServices,
  createConnection,
} from "monaco-languageclient";
const ReconnectingWebSocket = require("reconnecting-websocket");
import { URI } from "vscode-uri";
@Component({
  selector: "app-monaco-editor",
  templateUrl: "./monaco-editor.component.html",
  styleUrls: ["./monaco-editor.component.scss"],
})
export class MonacoEditorComponent implements OnInit {
  languageId = "cpp";
  translatedText: string;
  editorOptions = {
    theme: "vs-dark",
    tabSize: 2,
  };
  workspaceIndex = Math.round(Math.random() * 1000);
  model: NgxEditorModel = {
    value: this.getCode(),
    language: this.languageId,
    uri: URI.file(`/usr/src/codes/${this.workspaceIndex}/Solution.cpp`),
  };
  authToken = 'R3YKZFKBVi';
  meditor = null

  constructor() {
  }

  ngOnInit() {
    setTimeout(() => {
      const modelUri = URI.file(
        `/usr/src/codes/${this.workspaceIndex}/Solution.cpp`
      );
      this.meditor.getModel(modelUri)?.dispose();
      const model = monaco.editor.createModel(
        this.getCode(),
        this.languageId,
        URI.file(`/usr/src/codes/${this.workspaceIndex}/Solution.cpp`)
      );
      this.meditor.setModel(model);
    }, 1000);
  }

  setText(text: string) {
    this.meditor.trigger("keyboard", "type", { text: text });
    this.meditor.focus();
  }

  monacoOnInit(editor) {
    // install Monaco language client services
    MonacoServices.install(editor, { rootUri: "/usr/src/codes" });
    this.meditor = editor;
    // create the web socket
    // const url = this.createUrl();
    // const webSocket = this.createWebSocket(url);
    // // listen when the web socket is opened
    // listen({
    //   webSocket,
    //   onConnection: (connection: MessageConnection) => {
    //     // create and start the language client
    //     const languageClient = this.createLanguageClient(connection);
    //     console.log("CLIENT:", languageClient)
    //     const disposable = languageClient.start();
    //     connection.onClose(() => disposable.dispose());
    //   }
    // });
  }

  public createUrl(): string {
    switch (this.languageId) {
      case "cpp":
        return "ws://localhost:3003/cpp";
      case "python":
        // return 'ws://a056ff91160074e4ca8b8620ba1b0bfb-314635842.ap-southeast-1.elb.amazonaws.com/python';
        return "ws://localhost:3002/python";
      case "java":
        // return `ws://localhost:3002/java?token=${this.authToken}`;
        return `ws://localhost:3002/java?token=${this.authToken}`;
    }
  }

  setPosition(data) {
    const type = data.type;
    const pos = data.pos;
    let lineNumber = this.meditor?.getPosition().lineNumber;
    let column = this.meditor?.getPosition().column;
    console.log("SETTING POSITION: ", data);
    if (type === "go to line") {
      lineNumber = pos;
      column = 0;
    }
    if (type === "next line") {
      lineNumber++;
      column = 0;
    }
    if (type === "previous line") {
      lineNumber--;
    }
    if (type === 'left') {
      column = isNaN(column) ? column - 1 : column - pos
    }
    if (type === 'right') {
      column = isNaN(column) ? column + 1 : column + pos
    }
    if (type === "line end") {
      column =
        this.meditor
          .getModel(
            URI.file(`/usr/src/codes/${this.workspaceIndex}/Solution.cpp`)
          )
          .getLineContent(lineNumber).length + 1;
    }
    const position = { lineNumber: lineNumber, column: column };
    console.log(this.meditor?.getPosition(), position)
    this.meditor.setPosition(position);
    this.meditor.focus();
    this.meditor.focus();
  }

  clearText() {
    this.meditor.focus();
    this.meditor.executeEdits('', [{
      range: {
        startLineNumber: this.meditor.getPosition().lineNumber,
        startColumn: this.meditor.getPosition().column - 1,
        endLineNumber: this.meditor.getPosition().lineNumber,
        endColumn: this.meditor.getPosition().column
      },
      text: ''
    }]);
    this.meditor.focus();
  }

  undoText() {
    this.meditor.focus();
    this.meditor.getModel().undo();
    this.meditor.focus();
  }
  redoText() {
    this.meditor.focus();
    this.meditor.getModel().redo();
    this.meditor.focus();
  }

  public createLanguageClient(
    connection: MessageConnection
  ): MonacoLanguageClient {
    return new MonacoLanguageClient({
      name: `${this.languageId.toUpperCase()} Client`,
      clientOptions: {
        // use a language id as a document selector
        documentSelector: [this.languageId],
        workspaceFolder: {
          uri: URI.file(`/usr/src/codes`),
          name: "workspace",
          index: 0,
        },
        // disable the default error handler
        errorHandler: {
          error: () => ErrorAction.Continue,
          closed: () => CloseAction.DoNotRestart,
        },
      },
      // create a language client connection from the JSON RPC connection on demand
      connectionProvider: {
        get: (errorHandler, closeHandler) => {
          return Promise.resolve(
            createConnection(<any>connection, errorHandler, closeHandler)
          );
        },
      },
    });
  }

  public createWebSocket(socketUrl: string): WebSocket {
    const socketOptions = {
      maxReconnectionDelay: 10000,
      minReconnectionDelay: 1000,
      reconnectionDelayGrowFactor: 1.3,
      connectionTimeout: 10000,
      maxRetries: 2,
      debug: false,
    };
    return new ReconnectingWebSocket.default(socketUrl, [], socketOptions);
  }

  getCode() {
    // return '';
    return `int longestUnivaluePath(BinaryTreeNode<int> *root) {
  // Write yout code here
  // return maximum Longest Path Value
}`;
  }
}
