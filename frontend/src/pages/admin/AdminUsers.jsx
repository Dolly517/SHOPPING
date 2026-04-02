import { useEffect, useState } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { FiEdit2, FiTrash2, FiChevronLeft, FiChevronRight, FiX } from 'react-icons/fi';
import { MdAdminPanelSettings, MdPerson } from 'react-icons/md';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [editUser, setEditUser] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/users', { params: { page, pageSize: 12 } });
      setUsers(data.users);
      setPages(data.pages);
      setTotal(data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [page]);

  const updateRole = async (userId, role) => {
    try {
      await api.put(`/admin/users/${userId}`, { role });
      toast.success('User role updated!');
      setEditUser(null);
      fetchUsers();
    } catch (err) {
      toast.error('Failed to update user');
    }
  };

  const deleteUser = async (userId) => {
    try {
      await api.delete(`/admin/users/${userId}`);
      toast.success('User deleted');
      setDeleteConfirm(null);
      fetchUsers();
    } catch (err) {
      toast.error('Failed to delete user');
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <p className="text-sm text-gray-500">{total} users total</p>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left py-3 px-4 font-semibold text-gray-600">User</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Email</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-600">Role</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Joined</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={5} className="py-12 text-center text-gray-400">Loading...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={5} className="py-12 text-center text-gray-400">No users found</td></tr>
              ) : users.map(user => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${user.role === 'admin' ? 'bg-yellow-100 text-yellow-700' : 'bg-primary-100 text-primary-700'}`}>
                        {user.name?.[0]?.toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-900">{user.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-500">{user.email}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`badge flex items-center gap-1 justify-center w-fit mx-auto ${user.role === 'admin' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                      {user.role === 'admin' ? <MdAdminPanelSettings className="w-3.5 h-3.5" /> : <MdPerson className="w-3.5 h-3.5" />}
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => setEditUser(user)} className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-200 transition-colors">
                        <FiEdit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setDeleteConfirm(user.id)} className="w-8 h-8 bg-red-100 text-red-600 rounded-lg flex items-center justify-center hover:bg-red-200 transition-colors">
                        <FiTrash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {pages > 1 && (
          <div className="flex flex-wrap items-center justify-center gap-2 p-4 border-t border-gray-100">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary py-1.5 px-3 disabled:opacity-40"><FiChevronLeft className="w-4 h-4" /></button>
            {[...Array(Math.min(pages, 5))].map((_, i) => (
              <button key={i} onClick={() => setPage(i + 1)} className={`w-8 h-8 rounded-lg text-sm font-medium ${page === i + 1 ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{i + 1}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="btn-secondary py-1.5 px-3 disabled:opacity-40"><FiChevronRight className="w-4 h-4" /></button>
          </div>
        )}
      </div>

      {/* Edit Role Modal */}
      {editUser && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-4 sm:p-6 max-w-sm w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Edit User Role</h3>
              <button onClick={() => setEditUser(null)}><FiX className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="flex items-center gap-3 mb-5 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center font-bold text-primary-600">{editUser.name?.[0]?.toUpperCase()}</div>
              <div>
                <p className="font-medium">{editUser.name}</p>
                <p className="text-sm text-gray-400">{editUser.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {['user', 'admin'].map(role => (
                <button
                  key={role}
                  onClick={() => updateRole(editUser.id, role)}
                  className={`py-2.5 rounded-lg border-2 font-medium text-sm capitalize transition-all ${editUser.role === role ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                >
                  {role === 'admin' ? <MdAdminPanelSettings className="inline w-4 h-4 mr-1" /> : <MdPerson className="inline w-4 h-4 mr-1" />}
                  {role}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-4 sm:p-6 max-w-sm w-full text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <FiTrash2 className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-bold mb-2">Delete User?</h3>
            <p className="text-gray-500 text-sm mb-4">This action cannot be undone.</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={() => deleteUser(deleteConfirm)} className="btn-danger flex-1">Delete</button>
              <button onClick={() => setDeleteConfirm(null)} className="btn-secondary flex-1">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
