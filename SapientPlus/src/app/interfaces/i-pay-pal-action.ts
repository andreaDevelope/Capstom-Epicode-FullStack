import { iPayPalOrder } from './i-pay-pal-order';
import { iPayPalResponse } from './i-pay-pal-response';

export interface iPayPalAction {
  order: {
    create: (order: iPayPalOrder) => Promise<string>;
    capture: () => Promise<iPayPalResponse>;
  };
}
