import { Component, EventEmitter, Input, Output } from '@angular/core';

declare const webkitSpeechRecognition: any;

@Component({
  selector: 'app-speech-to-text',
  templateUrl: './speech-to-text.component.html',
  styleUrls: ['./speech-to-text.component.scss']
})
export class SpeechToTextComponent {
  recognition: any;
  transcript = '';
  positionLibrary = ['go to line', 'new line']
  @Output() sendTranscript = new EventEmitter<string>();
  @Output() updatePosition = new EventEmitter();

  constructor() {
    this.recognition = new webkitSpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          const input = event.results[i][0].transcript
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
    const numberPart = input.match(/\d+/)[0]
    const textPart = input.replace(/[0-9]/g, '');
    return { numberPart, textPart }
  }

  getMatchingText(input) {
    let bestMatch = input
    let minMatch = 70
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
      console.log("UPDATING POSITION: ", parseInt(numberPart, 10))
      this.updatePosition.emit({ updatePosition: bestMatch, pos: parseInt(numberPart, 10) });
      return
    }
    this.sendTranscript.emit(bestMatch);
    return
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
}

