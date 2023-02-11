import { AfterViewInit, Component, ElementRef, Input, EventEmitter, Output, ViewChild, HostListener } from '@angular/core';
import { fromEvent, Observable } from "rxjs";

declare const webkitSpeechRecognition: any;

@Component({
  selector: "app-speech-to-text",
  templateUrl: "./speech-to-text.component.html",
  styleUrls: ["./speech-to-text.component.scss"],
})
export class SpeechToTextComponent implements AfterViewInit {
  recognition: any;
  transcript = "";
  positionLibrary = [
    "go to line",
    "next line",
    "previous line",
    "line end",
    "left",
    "right",
  ];
  wordList = [];
  @Output() sendTranscript = new EventEmitter<string>();
  @Output() updatePosition = new EventEmitter();
  @Output() clear = new EventEmitter();
  @Output() undo = new EventEmitter();
  @Output() redo = new EventEmitter();
  @ViewChild('el', { static: false }) el: ElementRef;

  mouseDown$: Observable<any>;
  mouseUp$: Observable<any>;
  listening = false;
  libraryMultiWord = {
    "small bracket": "()",
    "curly bracket": "{}",
    "square bracket": '[]',
    "angle bracket": '<>',
    "new line": '\n',
    "not equals": '!=',
    "greater than": '>',
    "less than": '<',
    "semi colon": ';',
  };

  librarySingleWord = {
    "integer": "int",
    "space": " ",
    "tab": "\t"
  }

  textToNumber = {
    'one': 1,
    'two': 2,
    'three': 3,
    'four': 4,
    'five': 5,
  }

  operators = {
    "not equals": '!=',
    "not equal to": '!=',
    "greater than equal to": '>',
    "less than equal to": '<',
    "greater than": '>',
    "less than": '<',
    "equals to": '=',
    "equals": '=',
    "equal to": '=',
    "equal": '=',
    "comma": ",",
    "semi colon": ';',
    "semicolon": ';',
    "colon": ':',
    "pipe": '|',
    "ampersand": "&",
    "and operator": '&&',
    "or operator": '||',
    "not operator": '!',
    "hyphen": '-',
    "divide": '/',
    "division": '/',
    "multiplication": '*',
    "into": '*',
    "multiply": '*',
    "add": '+',
    "plus": '+',
    "minus": '-',
    "substract": '-',
    "back slash": "\\",
    "forward slash": '/',
    "dot": "."
  }

  codeSnippets = {
    "if": {
      code: "if(){\n",
      beforeCode: () => { },
      action: () => {
        this.updatePosition.emit({
          type: "previous line",
        });
        this.updatePosition.emit({
          type: "line end",
        });
        this.updatePosition.emit({
          type: "left",
          pos: 2
        });
      },
    },
    "else": {
      code: "else{\n",
      beforeCode: () => { },
    },
    "else if": {
      code: "else if(){\n",
      beforeCode: () => { },
      action: () => {
        this.updatePosition.emit({
          type: "previous line",
        });
        this.updatePosition.emit({
          type: "line end",
        });
        this.updatePosition.emit({
          type: "left",
          pos: 2
        });
      },
    },
    "while": {
      code: "while(){\n",
      beforeCode: () => { },
      action: () => {
        this.updatePosition.emit({
          type: "previous line",
        });
        this.updatePosition.emit({
          type: "line end",
        });
        this.updatePosition.emit({
          type: "left",
          pos: 2
        });
      },
    },
    "for": {
      code: "for(){\n",
      beforeCode: () => { },
      action: () => {
        this.updatePosition.emit({
          type: "previous line",
        });
        this.updatePosition.emit({
          type: "line end",
        });
        this.updatePosition.emit({
          type: "left",
          pos: 2
        });
      },
    },
    "single quotes": {
      code: "''",
      beforeCode: () => { },
      action: () => {
        this.updatePosition.emit({
          type: "left",
          pos: 1
        });
      },
    },
    "double quotes": {
      code: '""',
      beforeCode: () => { },
      action: () => {
        this.updatePosition.emit({
          type: "left",
          pos: 1
        });
      },
    },
    "see out": {
      code: "cout << ",
      action: () => { },
    },
    "see in": {
      code: "cin >> ",
      beforeCode: () => { },
      action: () => { },
    },
    "include imports": {
      code: "#include<bits/stdc++.h>\nusing namespace std;\n",
      beforeCode: () => {
        this.updatePosition.emit({ type: 'cache position' })
        this.updatePosition.emit({
          type: "go to line",
          pos: 1
        });
      },
      action: () => {
        this.updatePosition.emit({ type: 'use cache position' })
      }
    }
  };

  constructor() {
    this.recognition = new webkitSpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;

    this.recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          let input = event.results[i][0].transcript.toLowerCase()
          input = input.replace(/(\.|\?|,)/g, ' ');
          input = this.directionCleanup(input);
          input = this.replaceOperators(input)
          this.getMatchingText(input);
        }
      }
      console.log("List", this.wordList);
    };
  }

  startSpeechRecognition() {
    this.recognition.start();
  }

  stopSpeechRecognition() {
    this.recognition.stop();
  }

  cleanupInput(input) {
    console.log("INPUT VALUES: ", input)
    const numberPart = input.match(/\d+/) == null ? 1 : input.match(/\d+/)[0]
    const textPart = input.replace(/[0-9]/g, '').trim();
    return { numberPart, textPart }
  }

  directionCleanup(input) {
    if (input.indexOf('right') > -1 || input.indexOf('left') > -1 || input.indexOf('go to line')) {
      Object.keys(this.textToNumber).forEach((txt) => {
        input = input.replaceAll(txt, this.textToNumber[txt])

      })
    }
    return input
  }

  removeSpace(input) {
    input = input.replaceAll("  ", " ");
    for (var i = 1; i < input.length; i++) {
      var ch = input[i];
      console.log("REPLACE CHECK: ", input[i], input[i - 1])
      if (Object.values(this.operators).indexOf(ch) > -1) {
        if (input[i - 1] === ' ') {
          input = this.setCharAt(input, i - 1, "`")
        }
        if (i < input.length - 1 && input[i + 1] === ' ') {
          input = this.setCharAt(input, i + 1, "`")
        }
      }
    }
    return input.replaceAll("`", "");
  }

  setCharAt(str, index, chr) {
    if (index > str.length - 1) return str;
    return str.substring(0, index) + chr + str.substring(index + 1);
  }

  replaceOperators(input) {
    Object.keys(this.operators).forEach((op) => {
      input = input.replaceAll(op, this.operators[op]);
    })
    return this.removeSpace(input)
  }

  getMatchingText(input) {
    let bestMatch = input
    let minMatch = 80
    let matchFound = false
    const ans = this.cleanupInput(input)
    const numberPart = ans.numberPart;
    const textPart = ans.textPart
    console.log("CLEANUP VALUES: ", ans)

    // CHECK FOR UNDO REDO CLEAR
    if (this.percentageMatch(textPart, 'clear') > minMatch) {
      this.clear.emit();
      return;
    }
    if (this.percentageMatch(textPart, 'undo') > minMatch) {
      this.undo.emit();
      return;
    }
    if (this.percentageMatch(textPart, 'redo') > minMatch) {
      this.redo.emit();
      return;
    }

    // CHECK FOR POSITION CHANGING COMMANDS
    this.positionLibrary.forEach((txt) => {
      const matchpercent = this.percentageMatch(textPart, txt);
      console.log("MATCHED VALUES: ", matchpercent, txt, textPart);
      if (matchpercent > minMatch) {
        minMatch = matchpercent;
        bestMatch = txt;
        matchFound = true;
      }
    });
    if (matchFound) {
      this.updatePosition.emit({
        type: bestMatch,
        pos: parseInt(numberPart, 10),
      });
      return;
    }

    if (this.codeSnippetsMatch(input)) {
      return;
    }

    // CHECK FOR MULTI WORD COMMANDS
    minMatch = 70
    Object.keys(this.libraryMultiWord).forEach((txt) => {
      const matchpercent = this.percentageMatch(textPart, txt);
      console.log("MATCHED VALUES: ", matchpercent, txt, textPart);
      if (matchpercent > minMatch) {
        minMatch = matchpercent;
        bestMatch = txt;
        matchFound = true;
      }
    });
    if (matchFound) {
      this.sendTranscript.emit(this.libraryMultiWord[bestMatch]);
      if (bestMatch.indexOf("bracket") > -1) {
        this.updatePosition.emit({ type: "left", pos: 1 });
      }
      return;
    }

    // CHECK FOR SINGLE WORD
    this.splitInputMatch(input)
  }

  splitInputMatch(input) {
    let words = input.trim().split(" ");
    for (let i = 0; i < words.length; i++) {
      let textPart = words[i].trim();
      if (!!this.librarySingleWord[input]) {
        this.sendTranscript.emit(this.librarySingleWord[input]);
        continue;
      }
      let bestMatch = textPart;
      let minMatch = 70;
      let matchFound = false;
      Object.keys(this.librarySingleWord).forEach((txt) => {
        const matchpercent = this.percentageMatch(textPart, txt);
        console.log("MATCHED VALUES: ", matchpercent, txt, "|", textPart);
        if (matchpercent > minMatch) {
          minMatch = matchpercent;
          bestMatch = txt;
          matchFound = true;
        }
      });
      if (matchFound) {
        this.librarySingleWord[textPart] = this.librarySingleWord[bestMatch]
        this.sendTranscript.emit(this.librarySingleWord[bestMatch]);
      } else {
        this.sendTranscript.emit(bestMatch);
      }
      if (i < words.length - 1) {
        this.sendTranscript.emit(' ');
      }
    }
  }

  codeSnippetsMatch(transcript) {
    console.log("----", transcript);
    transcript = transcript.trim()
    if (!!this.codeSnippets[transcript]) {
      this.codeSnippets[transcript].beforeCode()
      this.sendTranscript.emit(this.codeSnippets[transcript].code);
      this.codeSnippets[transcript].action()
      return true
    }
  }

  private percentageMatch(str1 = "", str2 = "") {
    const track = Array(str2.length + 1)
      .fill(null)
      .map(() => Array(str1.length + 1).fill(null));
    for (let i = 0; i <= str1.length; i += 1) {
      track[0][i] = i;
    }
    for (let j = 0; j <= str2.length; j += 1) {
      track[j][0] = j;
    }
    for (let j = 1; j <= str2.length; j += 1) {
      for (let i = 1; i <= str1.length; i += 1) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        track[j][i] = Math.min(
          track[j][i - 1] + 1, // deletion
          track[j - 1][i] + 1, // insertion
          track[j - 1][i - 1] + indicator // substitution
        );
      }
    }
    const distance = track[str2.length][str1.length];
    const bigger = Math.max(str1.length, str2.length);
    return ((bigger - distance) * 100) / bigger;
  }

  onClick() {
    // this.mouseDown$.pipe(
    //   delay(40000),
    //   takeUntil(this.mouseUp$)
    // )
    //   .subscribe(res => console.log('LONG CLICK'));
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (event.code === 'Space' && !this.listening) {
      this.listening = true;
      this.startSpeechRecognition();
    }
  }
  @HostListener('window:keyup', ['$event'])
  handleKeyUp(event: KeyboardEvent) {
    if (event.code === 'Space' && this.listening) {
      this.listening = false;
      this.stopSpeechRecognition();
    }
  }

  ngAfterViewInit() {
    fromEvent(this.el.nativeElement, "mousedown").subscribe(() => {
      this.listening = true;
      this.startSpeechRecognition();
    });
    fromEvent(this.el.nativeElement, "mouseup").subscribe(() => {
      this.listening = false;
      this.stopSpeechRecognition();
    });
  }
}
