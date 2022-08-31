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

  languageId = 'java';
  editorOptions = {
    theme: 'vs-dark'
  }
  model: NgxEditorModel = {
    value: this.getCode(),
    language: this.languageId,
    uri: URI.file('/usr/src/app/Solution.java')
  };
  authToken = 'R3YKZFKBVi';
  constructor() { }

  ngOnInit() {
  }

  monacoOnInit(editor) {
    // install Monaco language client services
    MonacoServices.install(editor);
    // create the web socket
    const url = this.createUrl();
    const webSocket = this.createWebSocket(url);
    // listen when the web socket is opened
    listen({
      webSocket,
      onConnection: (connection: MessageConnection) => {
        // create and start the language client
        const languageClient = this.createLanguageClient(connection);
        const disposable = languageClient.start();
        connection.onClose(() => disposable.dispose());
      }
    });
  }

  public createUrl(): string {
    switch (this.languageId) {
      case 'cpp':
        return 'ws://18.139.1.158:3000/cpp';
      case 'python':
        return 'ws://18.139.1.158:3000/python';
      case 'java':
        return `ws://localhost:3000/java?token=${this.authToken}`;
    }
  }

  public createLanguageClient(connection: MessageConnection): MonacoLanguageClient {
    return new MonacoLanguageClient({
      name: `${this.languageId.toUpperCase()} Client`,
      clientOptions: {
        // use a language id as a document selector
        documentSelector: [this.languageId],
        workspaceFolder: {
          uri: URI.file('/usr/src/app'),
          name: '/usr/src/app',
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
      maxRetries: Infinity,
      debug: false
    };
    return new ReconnectingWebSocket.default(socketUrl, [], socketOptions);
  }

  getCode() {
    return `import java.util.Random;
    public class Solution {
        public static void main (String[] args){
        }
    }`
  }

}
