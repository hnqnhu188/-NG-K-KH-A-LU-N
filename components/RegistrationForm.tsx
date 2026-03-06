
import React, { useState } from 'react';
import { TeacherStatus } from '../types';

interface Props {
  teachers: TeacherStatus[];
  onSubmit: (name: string, id: string, teacherId: string) => void;
}

const RegistrationForm: React.FC<Props> = ({ teachers, onSubmit }) => {
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !studentId.trim() || !selectedTeacher) return;
    onSubmit(name.trim(), studentId.trim(), selectedTeacher);
    // Form is not cleared immediately to show success, App handles tab change
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-2">Họ và tên Sinh viên</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <i className="fas fa-user"></i>
            </span>
            <input
              type="text"
              id="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              placeholder="Nguyễn Văn A"
            />
          </div>
        </div>

        <div>
          <label htmlFor="studentId" className="block text-sm font-semibold text-slate-700 mb-2">Mã số sinh viên (MSSV)</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <i className="fas fa-id-card"></i>
            </span>
            <input
              type="text"
              id="studentId"
              required
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              placeholder="Ví dụ: 20211234"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-3">Chọn Giáo viên hướng dẫn</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teachers.map((teacher) => {
            const isFull = teacher.currentRegistrations >= teacher.maxSlots;
            return (
              <label 
                key={teacher.id}
                className={`relative flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  selectedTeacher === teacher.id 
                    ? 'border-indigo-600 bg-indigo-50' 
                    : isFull 
                    ? 'border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed' 
                    : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="teacher"
                  value={teacher.id}
                  disabled={isFull}
                  checked={selectedTeacher === teacher.id}
                  onChange={(e) => setSelectedTeacher(e.target.value)}
                  className="sr-only"
                />
                <div className="flex-1">
                  <p className="font-bold text-slate-800 leading-tight mb-1">{teacher.name}</p>
                  <p className="text-xs text-slate-500 italic mb-2">{teacher.title}</p>
                  <div className="flex items-center text-xs">
                    <span className={`px-2 py-0.5 rounded-full ${isFull ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {isFull ? 'Đã hết chỗ' : `Còn ${teacher.maxSlots - teacher.currentRegistrations} slot`}
                    </span>
                  </div>
                </div>
                {selectedTeacher === teacher.id && (
                  <div className="ml-2 text-indigo-600">
                    <i className="fas fa-check-circle text-xl"></i>
                  </div>
                )}
              </label>
            );
          })}
        </div>
      </div>

      <div className="pt-4">
        <button
          type="submit"
          disabled={!name || !studentId || !selectedTeacher}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg transition-all transform hover:-translate-y-1 active:translate-y-0"
        >
          XÁC NHẬN ĐĂNG KÝ
        </button>
      </div>
    </form>
  );
};

export default RegistrationForm;
