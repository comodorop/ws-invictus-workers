export class MovementEntity {
  id?: string;
  company_id: string;
  amount: number;
  date: string;
  is_fiscal: boolean;
  description: string;
  account_type: string;
  currency: string;
  category_type: string;
  accounting_code: string;
  metadata: any;
  created_at?: Date;
}
