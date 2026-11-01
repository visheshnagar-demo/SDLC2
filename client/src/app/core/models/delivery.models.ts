export interface DeliveryOption {
  id: string;
  name: string;
  description: string;
  deliveryType: 'E-Mail';
  securityMethod: string;
  emailRecipients: string;
  emailSubject: string;
  messageText: string;
  fileName: string;
  authStatus: 'PENDING_AUTHORIZATION' | 'AUTHORIZED' | 'PENDING_REPAIR' | 'REJECTED';
  authLevel: string;
  makerId: string;
  makerName: string;
  authorizerId?: string;
  authorizerName?: string;
  authorizerComment?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryOptionCreateRequest {
  name: string;
  description: string;
  deliveryType: string;
  securityMethod: string;
  emailRecipients: string;
  emailSubject: string;
  messageText: string;
  fileName: string;
}

export interface MakerCheckerActionRequest {
  action: 'AUTHORIZE' | 'SEND_TO_REPAIR' | 'REJECT';
  comment?: string;
}
