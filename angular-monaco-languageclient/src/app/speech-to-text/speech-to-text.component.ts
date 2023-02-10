import {AfterViewInit, Component, ElementRef, EventEmitter, Output, ViewChild} from '@angular/core';
import {fromEvent, Observable} from "rxjs";
import {delay, takeUntil, tap} from "rxjs/operators";

declare const webkitSpeechRecognition: any;

@Component({
  selector: 'app-speech-to-text',
  templateUrl: './speech-to-text.component.html',
  styleUrls: ['./speech-to-text.component.scss']
})
export class SpeechToTextComponent implements AfterViewInit{
  recognition: any;
  transcript = '';
  @Output() sendTranscript = new EventEmitter<string>();
  @ViewChild('el', { static: false }) el: ElementRef;
  mouseDown$: Observable<any>;
  mouseUp$: Observable<any>;
  listening = false;
  constructor() {
    this.recognition = new webkitSpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          this.transcript += event.results[i][0].transcript;
          this.sendTranscript.emit(event.results[i][0].transcript);
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

  onClick() {
    this.mouseDown$.pipe(
      delay(40000),
      takeUntil(this.mouseUp$)
    )
      .subscribe(res => console.log('LONG CLICK'));
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

