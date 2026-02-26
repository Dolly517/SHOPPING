import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FiUser, FiMail, FiPhone, FiMapPin, FiLock, FiSave } from 'react-icons/fi';

export default function ProfilePage() {
  const { user, updateProfile, loading } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    password: '',
    confirmPassword: '',
  });
  const [activeTab, setActiveTab] = useState('profile');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password && formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    const data = { name: formData.name, email: formData.email, phone: formData.phone, address: formData.address };
    if (formData.password) data.password = formData.password;
    await updateProfile(data);
    setFormData(p => ({ ...p, password: '', confirmPassword: '' }));
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>
      <div className="card overflow-hidden">
        <div className="bg-gradient-to-r from-primary-600 to-secondary-600 p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-white font-bold text-2xl">{user?.name?.[0]?.toUpperCase()}</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{user?.name}</h2>
              <p className="text-primary-100">{user?.email}</p>
              <span className={`badge mt-1 ${user?.role === 'admin' ? 'bg-yellow-400 text-yellow-900' : 'bg-white/20 text-white'}`}>{user?.role}</span>
            </div>
          </div>
        </div>

        <div className="flex border-b border-gray-100">
          {[{ id: 'profile', label: 'Profile Info', icon: FiUser }, { id: 'security', label: 'Security', icon: FiLock }].map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)} className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${activeTab === id ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700'}`}>
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {activeTab === 'profile' && (
            <>
              {[
                { name: 'name', label: 'Full Name', icon: FiUser, type: 'text' },
                { name: 'email', label: 'Email', icon: FiMail, type: 'email' },
                { name: 'phone', label: 'Phone', icon: FiPhone, type: 'tel' },
              ].map(({ name, label, icon: Icon, type }) => (
                <div key={name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <div className="relative">
                    <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input type={type} value={formData[name]} onChange={e => setFormData(p => ({ ...p, [name]: e.target.value }))} className="input-field pl-10" />
                  </div>
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <div className="relative">
                  <FiMapPin className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                  <textarea value={formData.address} onChange={e => setFormData(p => ({ ...p, address: e.target.value }))} rows={3} className="input-field pl-10 resize-none" placeholder="Your shipping address" />
                </div>
              </div>
            </>
          )}

          {activeTab === 'security' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input type="password" value={formData.password} onChange={e => setFormData(p => ({ ...p, password: e.target.value }))} className="input-field pl-10" placeholder="Leave blank to keep current" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input type="password" value={formData.confirmPassword} onChange={e => setFormData(p => ({ ...p, confirmPassword: e.target.value }))} className="input-field pl-10" placeholder="Confirm new password" />
                </div>
              </div>
            </>
          )}

          <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2 py-2.5">
            <FiSave className="w-4 h-4" /> {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
