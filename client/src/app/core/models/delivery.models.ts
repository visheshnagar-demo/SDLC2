export interface DeliveryOption {
  id: string;
  name: string;
  description: string;
  deliveryType: 'E-Mail' | 'E-MAIL' | string;
  securityMethod: string;
  emailRecipients: string;
  emailSubject: string;
  emailMessage?: string;
  messageText?: string;
  fileName: string;
  authStatus: 'PENDING_AUTHORIZATION' | 'AUTHORIZED' | 'PENDING_REPAIR' | 'REPAIR_REQUIRED' | 'REJECTED' | string;
  authLevel?: string;
  makerId?: string;
  makerUsername?: string;
  makerName?: string;
  checkerId?: string;
  checkerUsername?: string;
  authorizerId?: string;
  authorizerName?: string;
  authorizerComment?: string;
  rejectionReason?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DeliveryOptionRequest {
  name: string;
  description: string;
  deliveryType: string;
  securityMethod: string;
  emailRecipients: string;
  emailSubject: string;
  emailMessage?: string;
  fileName: string;
}

export type DeliveryOptionCreateRequest = DeliveryOptionRequest;

export interface AuthorizationRequest {
  action: 'AUTHORIZE' | 'SEND_TO_REPAIR' | 'REJECT' | string;
  comment?: string;
}

export type MakerCheckerActionRequest = AuthorizationRequest;

export interface TabCountsResponse {
  all: number;
  toAuthorize: number;
  toSubmit: number;
}
