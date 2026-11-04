import { Component, ChangeDetectionStrategy, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ReportService } from '../../../../core/services/report.service';
import { ReportSchedule } from '../../../../core/models/report.models';

@Component({
  selector: 'app-schedule-builder',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './schedule-builder.component.html',
  styleUrl: './schedule-builder.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScheduleBuilderComponent implements OnInit {
  private reportService = inject(ReportService);
  private router = inject(Router);

  frequency = signal<'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM'>('WEEKLY');
  activeDays = signal<string[]>(['MON']);
  executionTime = signal<string>('08:00:00 UTC');
  timezone = signal<string>('UTC - Coordinated Universal Time (UTC+00:00)');
  cronExpression = signal<string>('0 0 8 ? * MON');

  // Channels
  sftpEnabled = signal<boolean>(true);
  swiftMqEnabled = signal<boolean>(true);
  portalInboxEnabled = signal<boolean>(true);

  // Expiry
  effectiveStartDate = signal<string>('2026-05-19');
  expiryOption = signal<'INDEFINITE' | 'EXECUTIONS' | 'SPECIFIC_DATE'>('INDEFINITE');
  holidayHandling = signal<string>('Execute On Next Business Day - Citi Global Banking Calendar');
  failoverPolicy = signal<string>('Immediate Retrigger upon Gateway Recovery');

  isSubmitting = signal<boolean>(false);
  successMessage = signal<string | null>(null);

  daysList = [
    { key: 'MON', label: 'Mon', initial: 'M' },
    { key: 'TUE', label: 'Tue', initial: 'T' },
    { key: 'WED', label: 'Wed', initial: 'W' },
    { key: 'THU', label: 'Thu', initial: 'T' },
    { key: 'FRI', label: 'Fri', initial: 'F' },
    { key: 'SAT', label: 'Sat', initial: 'S' },
    { key: 'SUN', label: 'Sun', initial: 'S' }
  ];

  ngOnInit(): void {}

  setFrequency(freq: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM'): void {
    this.frequency.set(freq);
    if (freq === 'DAILY') {
      this.cronExpression.set('0 0 8 ? * *');
    } else if (freq === 'WEEKLY') {
      this.cronExpression.set('0 0 8 ? * MON');
    } else if (freq === 'MONTHLY') {
      this.cronExpression.set('0 0 8 1 * ?');
    }
  }

  toggleDay(dayKey: string): void {
    const current = [...this.activeDays()];
    const index = current.indexOf(dayKey);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(dayKey);
    }
    this.activeDays.set(current);
    if (this.frequency() === 'WEEKLY') {
      this.cronExpression.set(`0 0 8 ? * ${current.join(',') || 'MON'}`);
    }
  }

  isDayActive(dayKey: string): boolean {
    return this.activeDays().includes(dayKey);
  }

  submitSchedule(): void {
    this.isSubmitting.set(true);
    const schedulePayload: ReportSchedule = {
      criteriaId: 'CRIT-USD-EOD-20260518',
      frequency: this.frequency(),
      cronExpression: this.cronExpression(),
      executionTimeUtc: this.executionTime(),
      activeDays: this.activeDays(),
      timezone: this.timezone(),
      exportFormat: 'PDF',
      effectiveStartDate: this.effectiveStartDate(),
      expiryOption: this.expiryOption(),
      holidayHandling: this.holidayHandling(),
      failoverPolicy: this.failoverPolicy(),
      status: 'PENDING_APPROVAL',
      createdBy: 'J. Vance (Tier 4 Maker)'
    };

    this.reportService.createSchedule(schedulePayload).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        this.successMessage.set(`Schedule submitted! Status: PENDING_APPROVAL. Dual control verification queued for Checker.`);
        setTimeout(() => {
          this.router.navigate(['/delivery']);
        }, 1500);
      },
      error: () => {
        this.isSubmitting.set(false);
      }
    });
  }
}
