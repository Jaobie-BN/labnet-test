import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Server, 
  LogOut, 
  LayoutDashboard,
  Users,
  Activity,
  CheckCircle2,
  AlertCircle,
  Monitor,
  ArrowLeft,
  Zap,
  UserCog,
  Power,
  Clock
} from 'lucide-react';
import { getDashboardStats, forceReleaseLab, type SystemStats } from '../../services/adminService';
import { getAllLabs } from '../../services/labService';
import type { Lab } from '../../types/lab';
import { ThemeToggle } from '../../components/ThemeToggle';
import { getCurrentUser, logout } from '../../services/auth.service';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [labs, setLabs] = useState<Lab[]>([]);
  const [loading, setLoading] = useState(true);
  const [releasingLab, setReleasingLab] = useState<string | null>(null);
  const user = getCurrentUser();

  const fetchData = async () => {
    try {
      const [statsData, labsData] = await Promise.all([
        getDashboardStats(),
        getAllLabs()
      ]);
      setStats(statsData);
      setLabs(labsData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Auto refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleForceRelease = async (labId: string) => {
    if (!confirm('Are you sure you want to force release this lab? This will disconnect current users.')) return;
    setReleasingLab(labId);
    try {
      await forceReleaseLab(labId);
      fetchData();
    } catch (error) {
      console.error('Failed to release lab:', error);
      alert('Failed to release lab');
    } finally {
      setReleasingLab(null);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg-app text-text-primary">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full"></div>
          <span className="text-text-secondary">Loading admin panel...</span>
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

              <a href="/admin/dashboard" className="flex items-center gap-2 text-text-primary font-medium border-b-2 border-purple-400 pb-0.5">
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </a>
              <a href="/admin/users" className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors">
                <UserCog className="w-4 h-4" /> Users
              </a>
            </div>

            <div className="flex items-center gap-4">
              <ThemeToggle />
              <div className="hidden sm:flex flex-col items-end mr-2">
                <span className="text-sm font-medium text-text-primary">{user?.name}</span>
                <span className="text-xs text-purple-400 font-mono">{user?.email}</span>
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
            System Overview
          </h1>
          <p className="text-text-secondary mt-2 ml-5">Monitor and manage your network lab infrastructure</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {[
              { 
                label: 'Active Users', 
                value: stats.activeUsers, 
                icon: Activity, 
                color: 'text-emerald-400', 
                bg: 'bg-emerald-500/10', 
                border: 'border-emerald-500/20',
                glow: 'shadow-emerald-500/20'
              },
              { 
                label: 'Total Users', 
                value: stats.totalUsers, 
                icon: Users, 
                color: 'text-blue-400', 
                bg: 'bg-blue-500/10', 
                border: 'border-blue-500/20',
                glow: 'shadow-blue-500/20'
              },
              { 
                label: 'Available Labs', 
                value: stats.availableLabs, 
                icon: CheckCircle2, 
                color: 'text-indigo-400', 
                bg: 'bg-indigo-500/10', 
                border: 'border-indigo-500/20',
                glow: 'shadow-indigo-500/20'
              },
              { 
                label: 'Busy Labs', 
                value: stats.unavailableLabs, 
                icon: AlertCircle, 
                color: 'text-orange-400', 
                bg: 'bg-orange-500/10', 
                border: 'border-orange-500/20',
                glow: 'shadow-orange-500/20'
              },
            ].map((stat, i) => (
              <div 
                key={i} 
                className={`p-5 rounded-xl border ${stat.border} ${stat.bg} backdrop-blur-sm relative overflow-hidden group hover:shadow-lg ${stat.glow} transition-all duration-300`}
              >
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-300">
                  <stat.icon className="w-20 h-20" />
                </div>
                <p className={`text-sm font-medium ${stat.color} mb-1`}>{stat.label}</p>
                <h3 className="text-4xl font-bold text-text-primary tracking-tight">{stat.value}</h3>
              </div>
            ))}
          </div>
        )}

        {/* Labs Management Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
                <span className="w-1 h-6 bg-purple-500 rounded-full"></span>
                Lab Status Control
              </h2>
              <span className="text-xs text-text-muted bg-bg-surface px-3 py-1.5 rounded-full border border-border-subtle">
                <Clock className="w-3 h-3 inline mr-1" />
                Auto-refresh: 30s
              </span>
            </div>
            <button 
              onClick={() => fetchData()}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary bg-bg-surface border border-border-subtle rounded-lg hover:border-purple-500/30 transition-all duration-200"
            >
              <Zap className="w-4 h-4" />
              Refresh Now
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {labs.map((lab) => (
              <div 
                key={lab.id} 
                className={`bg-bg-surface border rounded-xl p-5 transition-all duration-300 hover:shadow-lg group ${
                  lab.status === 'AVAILABLE' 
                    ? 'border-border-subtle hover:border-emerald-500/30 hover:shadow-emerald-500/10' 
                    : 'border-orange-500/30 hover:border-orange-500/50 hover:shadow-orange-500/10'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-lg ${
                      lab.status === 'AVAILABLE' 
                        ? 'bg-emerald-500/10' 
                        : 'bg-orange-500/10'
                    }`}>
                      <Server className={`w-5 h-5 ${
                        lab.status === 'AVAILABLE' 
                          ? 'text-emerald-400' 
                          : 'text-orange-400'
                      }`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-text-primary group-hover:text-purple-400 transition-colors">
                        {lab.name}
                      </h3>
                      <p className="text-xs text-text-muted font-mono">ID: {lab.id.toUpperCase()}</p>
                    </div>
                  </div>
                  
                  {/* Status Indicator */}
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
                    lab.status === 'AVAILABLE'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      lab.status === 'AVAILABLE' ? 'bg-emerald-400 animate-pulse' : 'bg-orange-400'
                    }`}></span>
                    {lab.status}
                  </span>
                </div>

                {/* Devices Count */}
                <div className="flex items-center gap-2 mb-4 text-sm text-text-secondary">
                  <Monitor className="w-4 h-4" />
                  <span>{lab.devices?.length || 0} devices</span>
                </div>

                {/* Action Button */}
                {lab.status === 'UNAVAILABLE' && (
                  <button
                    onClick={() => handleForceRelease(lab.id)}
                    disabled={releasingLab === lab.id}
                    className="w-full py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {releasingLab === lab.id ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full"></div>
                        Releasing...
                      </>
                    ) : (
                      <>
                        <Power className="w-4 h-4" />
                        Force Release Lab
                      </>
                    )}
                  </button>
                )}
                
                {lab.status === 'AVAILABLE' && (
                  <div className="w-full py-2.5 px-4 rounded-lg text-sm font-medium text-center text-emerald-400/60 bg-emerald-500/5 border border-emerald-500/10">
                    <CheckCircle2 className="w-4 h-4 inline mr-2" />
                    Ready for use
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-10 p-6 bg-bg-surface border border-border-subtle rounded-xl">
          <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-400" />
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <button 
              onClick={() => navigate('/admin/users')}
              className="flex items-center gap-3 p-4 rounded-lg bg-bg-app border border-border-subtle hover:border-purple-500/30 hover:bg-purple-500/5 transition-all duration-200 group"
            >
              <div className="p-2 rounded-lg bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
                <UserCog className="w-5 h-5 text-purple-400" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-text-primary">Manage Users</p>
                <p className="text-xs text-text-muted">View & delete users</p>
              </div>
            </button>
            
            <button 
              onClick={() => navigate('/')}
              className="flex items-center gap-3 p-4 rounded-lg bg-bg-app border border-border-subtle hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all duration-200 group"
            >
              <div className="p-2 rounded-lg bg-indigo-500/10 group-hover:bg-indigo-500/20 transition-colors">
                <LayoutDashboard className="w-5 h-5 text-indigo-400" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-text-primary">User Dashboard</p>
                <p className="text-xs text-text-muted">Switch to user view</p>
              </div>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
