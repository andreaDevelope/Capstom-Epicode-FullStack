export interface iPayPalResponse {
  id: string;
  status: string;
  links: { href: string; rel: string; method: string }[];
}
