import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Output,
  ViewChild,
} from "@angular/core";
import { fromEvent, Observable } from "rxjs";
import { delay, takeUntil, tap } from "rxjs/operators";

declare const webkitSpeechRecognition: any;

const cppCollection = {
  semicolon: ";",
};

@Component({
  selector: "app-speech-to-text",
  templateUrl: "./speech-to-text.component.html",
  styleUrls: ["./speech-to-text.component.scss"],
})
export class SpeechToTextComponent implements AfterViewInit {
  recognition: any;
  transcript = "";
  @Output() sendTranscript = new EventEmitter<string>();
  @ViewChild("el", { static: false }) el: ElementRef;
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
          let updatedTranscript = this.updateTranscript(
            event.results[i][0].transcript
          );
          this.transcript = updatedTranscript;
          this.sendTranscript.emit(this.transcript);
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
    this.mouseDown$
      .pipe(delay(40000), takeUntil(this.mouseUp$))
      .subscribe((res) => console.log("LONG CLICK"));
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

  updateTranscript(text) {
    let words = text.trim().split(" ");
    for (let i = 0; i < words.length; i++) {
      if (cppCollection[words[i]]) {
        words[i] = cppCollection[words[i]];
      }
    }
    return words.join(" ");
  }
}
