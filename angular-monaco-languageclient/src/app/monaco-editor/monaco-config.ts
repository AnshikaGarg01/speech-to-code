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
}