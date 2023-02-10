import { Component, OnInit } from '@angular/core';
import { NgxEditorModel } from 'ngx-monaco-editor';
import { listen, MessageConnection } from 'vscode-ws-jsonrpc';
import { MonacoLanguageClient, CloseAction, ErrorAction, MonacoServices, createConnection } from 'monaco-languageclient';
const ReconnectingWebSocket = require('reconnecting-websocket');
import { URI } from 'vscode-uri';
@Component({
  selector: 'app-monaco-editor',
  templateUrl: './monaco-editor.component.html',
  styleUrls: ['./monaco-editor.component.scss']
})
export class MonacoEditorComponent implements OnInit {

  languageId = 'python';
  translatedText: string;
  editorOptions = {
    theme: 'vs-dark'
  }
  workspaceIndex = Math.round(Math.random() * 1000);
  model: NgxEditorModel = {
    value: this.getCode(),
    language: this.languageId,
    uri: URI.file(`/usr/src/codes/${this.workspaceIndex}/Solution.py`)
  };
  authToken = 'R3YKZFKBVi';
  meditor = null
  cursorPosition = 0;
  constructor() { }

  ngOnInit() {
    setTimeout(() => {
      const modelUri = URI.file(`/usr/src/codes/${this.workspaceIndex}/Solution.py`)
      this.meditor.getModel(modelUri)?.dispose();
      const model = monaco.editor.createModel(
        this.getCode(),
        this.languageId,
        URI.file(`/usr/src/codes/${this.workspaceIndex}/Solution.py`)
      )
      this.meditor.setModel(model)
    }, 1000);
  }

  setText(text: string) {
    this.meditor.trigger('keyboard', 'type', { text: text });
  }
  monacoOnInit(editor) {
    // install Monaco language client services
    MonacoServices.install(editor, { rootUri: '/usr/src/codes' });
    this.meditor = editor
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
      case 'cpp':
        return 'ws://localhost:3003/cpp';
      case 'python':
        // return 'ws://a056ff91160074e4ca8b8620ba1b0bfb-314635842.ap-southeast-1.elb.amazonaws.com/python';
        return 'ws://localhost:3002/python';
      case 'java':
        // return `ws://localhost:3002/java?token=${this.authToken}`;
        return `ws://localhost:3002/java?token=${this.authToken}`;
    }
  }

  setPosition(data) {
    const type = data.type
    const pos = data.pos
    console.log("SETTING POSITION: ", data)
    if (type === 'go to position') {
      this.cursorPosition = pos;
    }
    if (type === 'new line') {
      this.cursorPosition++;
    }
    const position = { lineNumber: this.cursorPosition, column: 1 };
    console.log(this.meditor?.getPosition(), position)
    this.meditor.setPosition(position);
    this.meditor.focus();
  }

  public createLanguageClient(connection: MessageConnection): MonacoLanguageClient {
    return new MonacoLanguageClient({
      name: `${this.languageId.toUpperCase()} Client`,
      clientOptions: {
        // use a language id as a document selector
        documentSelector: [this.languageId],
        workspaceFolder: {
          uri: URI.file(`/usr/src/codes`),
          name: 'workspace',
          index: 0
        },
        // disable the default error handler
        errorHandler: {
          error: () => ErrorAction.Continue,
          closed: () => CloseAction.DoNotRestart
        }
      },
      // create a language client connection from the JSON RPC connection on demand
      connectionProvider: {
        get: (errorHandler, closeHandler) => {
          return Promise.resolve(createConnection(<any>connection, errorHandler, closeHandler));
        }
      }
    });
  }

  public createWebSocket(socketUrl: string): WebSocket {
    const socketOptions = {
      maxReconnectionDelay: 10000,
      minReconnectionDelay: 1000,
      reconnectionDelayGrowFactor: 1.3,
      connectionTimeout: 10000,
      maxRetries: 2,
      debug: false
    };
    return new ReconnectingWebSocket.default(socketUrl, [], socketOptions);
  }

  getCode() {
    return ``;
  }

}
