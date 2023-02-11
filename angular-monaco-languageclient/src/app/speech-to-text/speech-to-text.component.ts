import { AfterViewInit, Component, ElementRef, Input, EventEmitter, Output, ViewChild } from '@angular/core';
import { fromEvent, Observable } from "rxjs";
import { delay, takeUntil, tap } from "rxjs/operators";

declare const webkitSpeechRecognition: any;

@Component({
  selector: 'app-speech-to-text',
  templateUrl: './speech-to-text.component.html',
  styleUrls: ['./speech-to-text.component.scss']
})
export class SpeechToTextComponent implements AfterViewInit {
  recognition: any;
  transcript = '';
  positionLibrary = ['go to line', 'next line', 'previous line', 'line end', 'left', 'right']
  @Output() sendTranscript = new EventEmitter<string>();
  @Output() updatePosition = new EventEmitter();
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
    "divide": '/',
    "division": '/',
    "multiplication": '*',
    "into": '*',
    "multiply": '*',
    "add": '+',
    "plus": '+',
    "minus": '-',
    "substract": '-',
    "semicolon": ';',
    'tab': '\t',
    "equal": '=',
    "equals": '=',
    "colon": ':'
  }

  textToNumber = {
    'one': 1,
    'two': 2,
    'three': 3,
    'four': 4,
    'five': 5,
    // 'one ': 1,
    // 'two ': 2,
    // 'three ': 3,
    // 'four ': 4,
    // 'five ': 5
  }

  result = "";

  constructor() {
    this.recognition = new webkitSpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;

    this.recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          let input = event.results[i][0].transcript.toLowerCase()
          input = input.replace(/(\.|\?|,)/g, ' ');
          this.getMatchingText(input);
        }
      }
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
    const numberPart = input.match(/\d+/) == null ? null : input.match(/\d+/)[0]
    const textPart = input.replace(/[0-9]/g, '');
    return { numberPart, textPart }
  }

  directionCleanup(input) {
    if (input.indexOf('right') > -1 || input.indexOf('left') > -1) {
      Object.keys(this.textToNumber).forEach((txt) => {

      })
    }
  }

  getMatchingText(input) {
    let bestMatch = input
    let minMatch = 80
    let matchFound = false
    const ans = this.cleanupInput(input)
    const numberPart = ans.numberPart;
    const textPart = ans.textPart
    console.log("CLEANUP VALUES: ", ans)
    this.positionLibrary.forEach((txt) => {
      const matchpercent = this.percentageMatch(textPart, txt);
      console.log("MATCHED VALUES: ", matchpercent, txt, textPart)
      if (matchpercent > minMatch) {
        minMatch = matchpercent;
        bestMatch = txt
        matchFound = true
      }
    })
    if (matchFound) {
      this.updatePosition.emit({ type: bestMatch, pos: parseInt(numberPart, 10) });
      return
    }
    minMatch = 70
    Object.keys(this.libraryMultiWord).forEach((txt) => {
      const matchpercent = this.percentageMatch(textPart, txt);
      console.log("MATCHED VALUES: ", matchpercent, txt, textPart)
      if (matchpercent > minMatch) {
        minMatch = matchpercent;
        bestMatch = txt
        matchFound = true
      }
    })
    if (matchFound) {
      this.sendTranscript.emit(this.libraryMultiWord[bestMatch]);
      if (bestMatch.indexOf('bracket') > -1) {
        this.updatePosition.emit({ type: 'left', pos: 1 })
      }
      return
    }
    this.splitInputMatch(input)
  }

  splitInputMatch(input) {
    let words = input.trim().split(" ");
    for (let i = 0; i < words.length; i++) {
      let textPart = words[i]
      if (!!this.librarySingleWord[input]) {
        this.sendTranscript.emit(this.librarySingleWord[input]);
        continue
      }
      let bestMatch = textPart
      let minMatch = 70
      let matchFound = false
      Object.keys(this.librarySingleWord).forEach((txt) => {
        const matchpercent = this.percentageMatch(textPart, txt);
        console.log("MATCHED VALUES: ", matchpercent, txt, '|', textPart)
        if (matchpercent > minMatch) {
          minMatch = matchpercent;
          bestMatch = txt
          matchFound = true
        }
      })
      if (matchFound) {
        this.librarySingleWord[textPart] = this.librarySingleWord[bestMatch]
        this.sendTranscript.emit(this.librarySingleWord[bestMatch] + ' ');
        continue
      }
      this.sendTranscript.emit(bestMatch + ' ');
    }
  }

  private percentageMatch(str1 = '', str2 = '') {
    const track = Array(str2.length + 1).fill(null).map(() =>
      Array(str1.length + 1).fill(null));
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
          track[j - 1][i - 1] + indicator, // substitution
        );
      }
    }
    const distance = track[str2.length][str1.length];
    const bigger = Math.max(str1.length, str2.length)
    return (bigger - distance) * 100 / bigger
  };

  onClick() {
    // this.mouseDown$.pipe(
    //   delay(40000),
    //   takeUntil(this.mouseUp$)
    // )
    //   .subscribe(res => console.log('LONG CLICK'));
  }

  ngAfterViewInit() {
    fromEvent(this.el.nativeElement, 'mousedown').subscribe(() => {
      this.listening = true;
      this.startSpeechRecognition();
    });
    fromEvent(this.el.nativeElement, 'mouseup').subscribe(() => {
      this.listening = false;
      this.stopSpeechRecognition();
    });
  }
}

