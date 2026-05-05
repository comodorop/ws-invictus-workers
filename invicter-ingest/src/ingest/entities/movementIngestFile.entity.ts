export class MovementIngestFileEntity {
  id?: string;

  company_id: string;

  file_id: string;
  file_name: string;

  uploaded_by?: string;

  status:
    | 'PENDING'
    | 'PROCESSING'
    | 'COMPLETED'
    | 'COMPLETED_WITH_ERRORS'
    | 'FAILED';

  total_records?: number;
  success_records?: number;
  error_records?: number;

  created_at: Date;
  started_at?: Date;
  completed_at?: Date;
}
