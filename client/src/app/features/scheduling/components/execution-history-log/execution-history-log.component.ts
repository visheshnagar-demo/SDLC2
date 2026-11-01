import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScheduleHistory } from '../../../../core/models/schedule.models';

@Component({
  selector: 'app-execution-history-log',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './execution-history-log.component.html',
  styleUrl: './execution-history-log.component.scss'
})
export class ExecutionHistoryLogComponent {
  @Input() history: ScheduleHistory[] = [];
}
