export interface iPayPalOrder {
  purchase_units: {
    amount: {
      value: string;
      currency_code: string;
    };
    description: string;
  }[];
}
