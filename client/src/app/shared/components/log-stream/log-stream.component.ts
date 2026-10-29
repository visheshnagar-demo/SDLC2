import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MigrationLogEntry } from '../../../core/models/models';

@Component({
  selector: 'app-log-stream',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './log-stream.component.html',
  styleUrls: ['./log-stream.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LogStreamComponent implements AfterViewChecked {
  @Input() logs: MigrationLogEntry[] = [];
  @Input() batchId = 'BATCH-LIVE-01';
  @Input() isStreaming = false;

  @Output() clearLogs = new EventEmitter<void>();
  @Output() downloadLogs = new EventEmitter<void>();

  @ViewChild('logContainer') private logContainer?: ElementRef;
  autoScroll = true;

  ngAfterViewChecked(): void {
    if (this.autoScroll && this.logContainer) {
      this.scrollToBottom();
    }
  }

  private scrollToBottom(): void {
    try {
      this.logContainer!.nativeElement.scrollTop = this.logContainer!.nativeElement.scrollHeight;
    } catch (err) {}
  }

  toggleAutoScroll(): void {
    this.autoScroll = !this.autoScroll;
  }

  onClear(): void {
    this.clearLogs.emit();
  }

  onDownload(): void {
    this.downloadLogs.emit();
  }
}
