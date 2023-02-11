import { NgxMonacoEditorConfig } from 'ngx-monaco-editor';

export const MonacoConfig: NgxMonacoEditorConfig = {
    baseUrl: 'assets', // configure base path for monaco editor
    defaultOptions: { scrollBeyondLastLine: false }, // pass default options to be used
    onMonacoLoad: monacoOnLoad
};

export function monacoOnLoad() {
    // here monaco object will be available as window.monaco use this function to extend monaco editor functionalities.
    console.log((<any>window).monaco);

    // register Monaco languages
    monaco.languages.register({
        id: 'java',
        extensions: ['.java'],
        aliases: ['JAVA', 'java']
    });
    (window as any).monaco.editor.defineTheme('ninjasDark', {
        base: 'vs-dark',
        inherit: true,
        rules: [
            { token: 'comment', foreground: '#6272a4' },
            { token: 'identifier', foreground: '#50fa7b' },
            { token: 'keyword.float', foreground: '#ffb86c' },
            { token: 'keyword.double', foreground: '#ffb86c' },
            { token: 'keyword.int', foreground: '#ffb86c' },
            { token: 'keyword.void', foreground: '#ffb86c' },
            { token: 'string', foreground: '#f1fa8c' },
            { token: 'keyword', foreground: '#ff79c6' },
            { token: 'delimiter', foreground: '#ffffff' },
            { token: 'number', foreground: '#bd93f9' },
        ],
        colors: {
            'editor.foreground': '#ffffff',
            'editor.background': '#192134',
            'editor.lineHighlightBackground': '#333446',
            'editorLineNumber.foreground': '#777782',
            'editorLineNumber.background': '#2b354a',
        },
    });
}