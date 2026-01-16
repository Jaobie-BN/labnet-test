import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, 
  LayoutDashboard,
  Monitor,
  ArrowLeft,
  UserCog,
  Search,
  Trash2,
  ShieldCheck,
  User,
  Mail,
  Crown,
  AlertTriangle
} from 'lucide-react';
import { getAllUsers, deleteUser } from '../../services/adminService';
import type { User as UserType } from '../../types/auth';
import { ThemeToggle } from '../../components/ThemeToggle';
import { getCurrentUser, logout } from '../../services/auth.service';

const UserManagement: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingUser, setDeletingUser] = useState<string | null>(null);
  const currentUser = getCurrentUser();

  const fetchUsers = async () => {
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete "${userName}"? This action cannot be undone.`)) return;
    setDeletingUser(id);
    try {
      await deleteUser(id);
      setUsers(users.filter(u => u.id !== id));
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('Failed to delete user');
    } finally {
      setDeletingUser(null);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const adminCount = users.filter(u => u.role === 'admin').length;
  const userCount = users.filter(u => u.role === 'user').length;

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg-app text-text-primary">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full"></div>
          <span className="text-text-secondary">Loading users...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-app text-text-primary font-sans">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-bg-app/80 backdrop-blur-md border-b border-border-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="bg-linear-to-br from-purple-500 to-indigo-600 p-2 rounded-lg shadow-lg shadow-purple-900/30">
                <Monitor className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight text-text-primary">
                Admin<span className="text-purple-400">Panel</span>
              </span>
            </div>
            
            <div className="hidden md:flex items-center gap-6">
              <button 
                onClick={() => navigate('/')}
                className="flex items-center gap-2 text-text-secondary hover:text-brand-secondary transition-colors px-3 py-2 rounded-lg hover:bg-bg-surface"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Dashboard
              </button>
              
              <div className="h-6 w-px bg-border-subtle"></div>

              <a href="/admin/dashboard" className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors">
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </a>
              <a href="/admin/users" className="flex items-center gap-2 text-text-primary font-medium border-b-2 border-purple-400 pb-0.5">
                <UserCog className="w-4 h-4" /> Users
              </a>
            </div>

            <div className="flex items-center gap-4">
              <ThemeToggle />
              <div className="hidden sm:flex flex-col items-end mr-2">
                <span className="text-sm font-medium text-text-primary">{currentUser?.name}</span>
                <span className="text-xs text-purple-400 font-mono">{currentUser?.email}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 rounded-lg bg-bg-surface hover:bg-red-500/10 hover:text-status-error text-text-secondary transition-all border border-transparent hover:border-red-500/20 shadow-sm"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary flex items-center gap-3">
            <span className="w-1.5 h-8 bg-purple-500 rounded-full"></span>
            User Management
          </h1>
          <p className="text-text-secondary mt-2 ml-5">Manage system users and permissions</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/10 backdrop-blur-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <User className="w-16 h-16" />
            </div>
            <p className="text-sm font-medium text-blue-400 mb-1">Total Users</p>
            <h3 className="text-3xl font-bold text-text-primary">{users.length}</h3>
          </div>
          
          <div className="p-4 rounded-xl border border-purple-500/20 bg-purple-500/10 backdrop-blur-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <Crown className="w-16 h-16" />
            </div>
            <p className="text-sm font-medium text-purple-400 mb-1">Administrators</p>
            <h3 className="text-3xl font-bold text-text-primary">{adminCount}</h3>
          </div>
          
          <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 backdrop-blur-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <ShieldCheck className="w-16 h-16" />
            </div>
            <p className="text-sm font-medium text-emerald-400 mb-1">Regular Users</p>
            <h3 className="text-3xl font-bold text-text-primary">{userCount}</h3>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-bg-surface border border-border-subtle focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-text-primary placeholder:text-text-muted transition-all"
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-bg-surface border border-border-subtle rounded-xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-bg-app border-b border-border-subtle">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-text-muted">
                      <div className="flex flex-col items-center gap-2">
                        <AlertTriangle className="w-8 h-8 text-text-muted" />
                        <span>No users found</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr 
                      key={user.id} 
                      className="hover:bg-bg-surface-hover transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            user.role === 'admin' 
                              ? 'bg-purple-500/20 text-purple-400' 
                              : 'bg-blue-500/20 text-blue-400'
                          }`}>
                            {user.role === 'admin' ? (
                              <Crown className="w-5 h-5" />
                            ) : (
                              <User className="w-5 h-5" />
                            )}
                          </div>
                          <span className="font-medium text-text-primary">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-text-secondary">
                          <Mail className="w-4 h-4 text-text-muted" />
                          <span className="font-mono text-sm">{user.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                          user.role === 'admin' 
                            ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' 
                            : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        }`}>
                          {user.role === 'admin' ? (
                            <ShieldCheck className="w-3.5 h-3.5" />
                          ) : (
                            <User className="w-3.5 h-3.5" />
                          )}
                          {(user.role ?? 'user').charAt(0).toUpperCase() + (user.role ?? 'user').slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {user.role !== 'admin' ? (
                          <button
                            onClick={() => handleDelete(user.id, user.name)}
                            disabled={deletingUser === user.id}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {deletingUser === user.id ? (
                              <>
                                <div className="animate-spin w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full"></div>
                                Deleting...
                              </>
                            ) : (
                              <>
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </>
                            )}
                          </button>
                        ) : (
                          <span className="text-xs text-text-muted italic px-3 py-2">Protected</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Footer */}
          <div className="px-6 py-4 bg-bg-app border-t border-border-subtle">
            <p className="text-sm text-text-muted">
              Showing {filteredUsers.length} of {users.length} users
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserManagement;
