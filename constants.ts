
import { Teacher } from './types';

export const TEACHERS: Teacher[] = [
  { id: '1', name: 'TS. TRẦN KIỀU MỸ AN', title: 'Tiến sĩ', maxSlots: 2 },
  { id: '2', name: 'PGS.TS PHẠM VŨ PHI HỔ', title: 'Phó Giáo sư, Tiến sĩ', maxSlots: 2 },
  { id: '3', name: 'TS. NGUYỄN XUÂN HỒNG', title: 'Tiến sĩ', maxSlots: 2 },
  { id: '4', name: 'TS. TRƯƠNG TRẦN MINH NHẬT', title: 'Tiến sĩ', maxSlots: 2 },
  { id: '5', name: 'TS. PHAN THỊ TUYẾT NGA', title: 'Tiến sĩ', maxSlots: 2 },
  { id: '6', name: 'TS. NGUYỄN TRƯỜNG SA', title: 'Tiến sĩ', maxSlots: 2 },
  { id: '7', name: 'PGS.TS NGUYỄN THANH TÙNG', title: 'Phó Giáo sư, Tiến sĩ', maxSlots: 2 },
];

export const MAX_SLOTS_PER_TEACHER = 2;
export const LOCAL_STORAGE_KEY = 'teacher_registrations_v1';
