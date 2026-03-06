
import React from 'react';
import { Registration, Teacher } from '../types';

interface Props {
  registrations: Registration[];
  teachers: Teacher[];
  onDelete: (id: string) => void;
}

const RegistrationList: React.FC<Props> = ({ registrations, teachers, onDelete }) => {
  const getTeacherName = (id: string) => {
    return teachers.find(t => t.id === id)?.name || 'Không xác định';
  };

  const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(new Date(timestamp));
  };

  if (registrations.length === 0) {
    return (
      <div className="p-12 text-center text-slate-500">
        <i className="fas fa-folder-open text-5xl mb-4 text-slate-200"></i>
        <p className="text-lg">Chưa có sinh viên nào đăng ký.</p>
        <p className="text-sm">Hãy là người đầu tiên đăng ký giáo viên hướng dẫn!</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">STT</th>
            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Sinh viên</th>
            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">MSSV</th>
            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Giáo viên hướng dẫn</th>
            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Thời gian</th>
            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {[...registrations].sort((a, b) => b.timestamp - a.timestamp).map((reg, index) => (
            <tr key={reg.id} className="hover:bg-slate-50 transition-colors group">
              <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                {registrations.length - index}
              </td>
              <td className="px-6 py-4">
                <div className="text-sm font-bold text-slate-900">{reg.studentName}</div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded inline-block">
                  {reg.studentId}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm font-medium text-slate-700">
                   <i className="fas fa-chalkboard-user mr-2 text-slate-400"></i>
                   {getTeacherName(reg.teacherId)}
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-slate-500">
                {formatDate(reg.timestamp)}
              </td>
              <td className="px-6 py-4 text-right">
                <button 
                  onClick={() => onDelete(reg.id)}
                  className="text-slate-400 hover:text-red-500 transition-colors p-2"
                  title="Hủy đăng ký"
                >
                  <i className="fas fa-trash-alt"></i>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RegistrationList;
