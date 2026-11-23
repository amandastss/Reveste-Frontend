export type OrderPaymentState = 'success' | 'pending' | 'failure'

export interface OrderPaymentResult {
  state: OrderPaymentState
  message: string
}

export function classifyOrderPaymentStatus(status: unknown): OrderPaymentResult
