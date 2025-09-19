// types/leave.ts
export interface LeaveApplication {
  id?: string;
  reason: string;
  duration: 'half-day' | 'full-day';
  startDate: string;
  endDate?: string;
  status?: 'pending' | 'approved' | 'rejected';
  createdAt?: string;
}

export interface LeaveFormData {
  reason: string;
  duration: 'half-day' | 'full-day';
  startDate: string;
  endDate?: string;
}