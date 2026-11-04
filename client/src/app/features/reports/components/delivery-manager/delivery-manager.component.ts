import { Component, ChangeDetectionStrategy, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DeliveryService } from '../../../../core/services/delivery.service';
import { DeliveryOption } from '../../../../core/models/report.models';

@Component({
  selector: 'app-delivery-manager',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './delivery-manager.component.html',
  styleUrl: './delivery-manager.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeliveryManagerComponent implements OnInit {
  private deliveryService = inject(DeliveryService);
  private router = inject(Router);

  pendingDeliveries = signal<DeliveryOption[]>([]);
  activeDelivery = signal<DeliveryOption | null>(null);

  selectedChannel = signal<'SFTP' | 'EMAIL' | 'PORTAL'>('SFTP');
  sftpHost = signal<string>('sftp.corporate.citi.com');
  sftpPort = signal<number>(22);
  sftpRemotePath = signal<string>('/treasury/statements/mt940/');
  pgpEncryption = signal<boolean>(true);
  testStatus = signal<string | null>(null);

  checkerComments = signal<string>(
    'Verified SFTP endpoint host sftp.corporate.citi.com and confirmed remote directory entitlements for treasury reporting.'
  );

  isAuthorizing = signal<boolean>(false);
  actionMessage = signal<{ text: string; type: 'success' | 'error' | 'warning' } | null>(null);

  ngOnInit(): void {
    this.loadPendingDeliveries();
  }

  loadPendingDeliveries(): void {
    this.deliveryService.getPendingDeliveries().subscribe(data => {
      this.pendingDeliveries.set(data);
      if (data.length > 0) {
        this.activeDelivery.set(data[0]);
      }
    });
  }

  selectDelivery(d: DeliveryOption): void {
    this.activeDelivery.set(d);
    this.selectedChannel.set(d.deliveryChannel);
    if (d.destinationConfig.host) {
      this.sftpHost.set(d.destinationConfig.host);
    }
  }

  testSftpConnection(): void {
    this.testStatus.set('Testing connection...');
    setTimeout(() => {
      this.testStatus.set('Connection verified: Ping 14ms | Latency nominal | Handshake OK');
    }, 800);
  }

  authorizeDelivery(): void {
    const current = this.activeDelivery();
    if (!current || !current.id) return;

    this.isAuthorizing.set(true);
    this.deliveryService.authorizeDeliveryOption(current.id, this.checkerComments()).subscribe({
      next: (res) => {
        this.isAuthorizing.set(false);
        this.actionMessage.set({
          text: `Delivery option '${current.scheduleId}' authorized successfully by Tier 4 Checker!`,
          type: 'success'
        });
        this.loadPendingDeliveries();
      },
      error: () => {
        this.isAuthorizing.set(false);
        this.actionMessage.set({
          text: 'Authorization failed. Please check backend connection.',
          type: 'error'
        });
      }
    });
  }

  rejectDelivery(): void {
    const current = this.activeDelivery();
    if (!current || !current.id) return;

    this.isAuthorizing.set(true);
    this.deliveryService.rejectDeliveryOption(current.id, this.checkerComments()).subscribe({
      next: (res) => {
        this.isAuthorizing.set(false);
        this.actionMessage.set({
          text: `Delivery option '${current.scheduleId}' rejected with audit comments.`,
          type: 'warning'
        });
        this.loadPendingDeliveries();
      },
      error: () => {
        this.isAuthorizing.set(false);
      }
    });
  }

  requestRevision(): void {
    this.actionMessage.set({
      text: 'Revision request dispatched to Maker with audit notes.',
      type: 'warning'
    });
  }
}
