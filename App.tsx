
import React, { useState, useEffect, useCallback } from 'react';
import { TEACHERS } from './constants';
import { Registration, TeacherStatus } from './types';
import RegistrationForm from './components/RegistrationForm';
import RegistrationList from './components/RegistrationList';
import { auth, db, googleProvider, signInWithPopup, signOut, onAuthStateChanged } from './firebase';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy
} from 'firebase/firestore';
import { User } from 'firebase/auth';
import ErrorBoundary from './components/ErrorBoundary';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

const handleFirestoreError = (error: unknown, operationType: OperationType, path: string | null) => {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
};

const App: React.FC = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [activeTab, setActiveTab] = useState<'register' | 'list'>('register');
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Firestore listener
  useEffect(() => {
    if (!user) {
      setRegistrations([]);
      return;
    }

    const q = query(collection(db, 'registrations'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const regs: Registration[] = [];
      snapshot.forEach((doc) => {
        regs.push({ id: doc.id, ...doc.data() } as Registration);
      });
      setRegistrations(regs);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'registrations');
    });

    return () => unsubscribe();
  }, [user]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed", error);
      setNotification({ type: 'error', message: 'Đăng nhập thất bại. Vui lòng thử lại.' });
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const handleRegister = useCallback(async (studentName: string, studentId: string, teacherId: string) => {
    if (!user) {
      setNotification({ type: 'error', message: 'Vui lòng đăng nhập để đăng ký.' });
      return;
    }

    // Validation
    const teacherRegs = registrations.filter(r => r.teacherId === teacherId);
    if (teacherRegs.length >= 2) {
      setNotification({ type: 'error', message: 'Giáo viên này đã nhận đủ số lượng sinh viên.' });
      return;
    }

    const alreadyRegistered = registrations.find(r => r.studentId === studentId);
    if (alreadyRegistered) {
      setNotification({ type: 'error', message: 'Mã số sinh viên này đã đăng ký rồi.' });
      return;
    }

    try {
      const newRegistration = {
        studentName,
        studentId,
        teacherId,
        timestamp: Date.now(),
        uid: user.uid
      };

      await addDoc(collection(db, 'registrations'), newRegistration);
      setNotification({ type: 'success', message: 'Đăng ký giáo viên hướng dẫn thành công!' });
      setTimeout(() => setActiveTab('list'), 1500);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'registrations');
    }
  }, [registrations, user]);

  const handleDelete = useCallback(async (regId: string) => {
    if (!user) return;
    
    const reg = registrations.find(r => r.id === regId);
    if (reg?.uid !== user.uid) {
      setNotification({ type: 'error', message: 'Bạn không có quyền hủy đăng ký này.' });
      return;
    }

    if (window.confirm("Bạn có chắc chắn muốn hủy đăng ký này?")) {
      try {
        await deleteDoc(doc(db, 'registrations', regId));
        setNotification({ type: 'success', message: 'Đã hủy đăng ký thành công.' });
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `registrations/${regId}`);
      }
    }
  }, [registrations, user]);

  const getTeacherStatus = (): TeacherStatus[] => {
    return TEACHERS.map(t => ({
      ...t,
      currentRegistrations: registrations.filter(r => r.teacherId === t.id).length
    }));
  };

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-700"></div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-slate-50 flex flex-col">
        {/* Header */}
        <header className="bg-indigo-700 text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight">Hệ Thống Đăng Ký</h1>
                <p className="mt-1 text-indigo-100 font-medium">Lựa chọn Giáo viên hướng dẫn cho Đồ án/Khóa luận</p>
              </div>
              <div className="mt-4 md:mt-0 flex items-center space-x-4">
                {user ? (
                  <div className="flex items-center space-x-3">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-bold">{user.displayName}</p>
                      <button onClick={handleLogout} className="text-xs text-indigo-200 hover:text-white underline">Đăng xuất</button>
                    </div>
                    {user.photoURL && <img src={user.photoURL} alt="" className="h-10 w-10 rounded-full border-2 border-white/20" referrerPolicy="no-referrer" />}
                  </div>
                ) : (
                  <button 
                    onClick={handleLogin}
                    className="bg-white text-indigo-700 px-6 py-2 rounded-lg font-bold shadow-md hover:bg-indigo-50 transition-all flex items-center"
                  >
                    <i className="fab fa-google mr-2"></i> Đăng nhập Google
                  </button>
                )}
              </div>
            </div>
            
            {user && (
              <div className="mt-6 flex space-x-2">
                <button 
                  onClick={() => setActiveTab('register')}
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${activeTab === 'register' ? 'bg-white text-indigo-700' : 'bg-indigo-600 hover:bg-indigo-50'}`}
                >
                  <i className="fas fa-edit mr-2"></i>Đăng ký
                </button>
                <button 
                  onClick={() => setActiveTab('list')}
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${activeTab === 'list' ? 'bg-white text-indigo-700' : 'bg-indigo-600 hover:bg-indigo-50'}`}
                >
                  <i className="fas fa-list-ul mr-2"></i>Danh sách
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-grow container mx-auto px-4 py-8">
          {/* Notification Toast */}
          {notification && (
            <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-xl flex items-center space-x-3 animate-bounce ${notification.type === 'success' ? 'bg-green-100 text-green-800 border-l-4 border-green-500' : 'bg-red-100 text-red-800 border-l-4 border-red-500'}`}>
              <i className={`fas ${notification.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
              <span className="font-medium">{notification.message}</span>
            </div>
          )}

          {!user ? (
            <div className="max-w-2xl mx-auto text-center py-20">
              <div className="bg-white p-12 rounded-3xl shadow-xl border border-slate-200">
                <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
                  <i className="fas fa-lock"></i>
                </div>
                <h2 className="text-3xl font-bold text-slate-800 mb-4">Vui lòng đăng nhập</h2>
                <p className="text-slate-600 mb-8 text-lg">Bạn cần đăng nhập bằng tài khoản Google để có thể đăng ký giáo viên hướng dẫn và xem danh sách đăng ký.</p>
                <button 
                  onClick={handleLogin}
                  className="bg-indigo-600 text-white px-10 py-4 rounded-xl font-bold text-xl shadow-lg hover:bg-indigo-700 transition-all transform hover:-translate-y-1"
                >
                  <i className="fab fa-google mr-3"></i> Đăng nhập ngay
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Status Sidebar */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
                  <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                    <i className="fas fa-users-viewfinder text-indigo-600 mr-2"></i>
                    Trạng thái các slot
                  </h2>
                  <div className="space-y-4">
                    {getTeacherStatus().map(t => (
                      <div key={t.id} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="font-semibold text-slate-700 truncate mr-2" title={t.name}>{t.name}</span>
                          <span className={`font-medium ${t.currentRegistrations >= t.maxSlots ? 'text-red-500' : 'text-green-600'}`}>
                            {t.currentRegistrations}/{t.maxSlots}
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-500 ${t.currentRegistrations >= t.maxSlots ? 'bg-red-500' : 'bg-indigo-500'}`} 
                            style={{ width: `${(t.currentRegistrations / t.maxSlots) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-100">
                  <h3 className="font-bold text-indigo-900 mb-2">Quy định đăng ký:</h3>
                  <ul className="text-sm text-indigo-800 space-y-2 list-disc list-inside">
                    <li>Mỗi giảng viên chỉ nhận tối đa 02 sinh viên.</li>
                    <li>Sinh viên chỉ được đăng ký 01 giảng viên duy nhất.</li>
                    <li>Cần nhập chính xác Mã số sinh viên (MSSV).</li>
                    <li>Trong trường hợp hết chỗ, vui lòng liên hệ văn phòng khoa.</li>
                  </ul>
                </div>
              </div>

              {/* Tab Content */}
              <div className="lg:col-span-2">
                {activeTab === 'register' ? (
                  <div className="bg-white rounded-xl shadow-md p-8 border border-slate-200">
                    <h2 className="text-2xl font-bold text-slate-800 mb-6">Thông tin đăng ký mới</h2>
                    <RegistrationForm teachers={getTeacherStatus()} onSubmit={handleRegister} />
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                      <h2 className="text-2xl font-bold text-slate-800">Danh sách đăng ký</h2>
                      <span className="bg-indigo-100 text-indigo-800 py-1 px-3 rounded-full text-sm font-bold">
                        Tổng: {registrations.length}
                      </span>
                    </div>
                    <RegistrationList 
                      registrations={registrations} 
                      teachers={TEACHERS} 
                      onDelete={handleDelete}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="bg-slate-800 text-slate-400 py-8 mt-12">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-sm">© 2024 Khoa Công nghệ Thông tin - Hệ thống Đăng ký Giáo viên Hướng dẫn</p>
            <div className="mt-4 flex justify-center space-x-6">
              <a href="#" className="hover:text-white transition-colors">Hỗ trợ</a>
              <a href="#" className="hover:text-white transition-colors">Quy định</a>
              <a href="#" className="hover:text-white transition-colors">Liên hệ</a>
            </div>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  );
};

export default App;
