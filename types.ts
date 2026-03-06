
export interface Teacher {
  id: string;
  name: string;
  title: string;
  maxSlots: number;
}

export interface Registration {
  id: string;
  studentName: string;
  studentId: string;
  teacherId: string;
  timestamp: number;
  uid: string;
}

export interface TeacherStatus extends Teacher {
  currentRegistrations: number;
}
