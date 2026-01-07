
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Activity, 
  Server,  
  LogOut, 
  FileText, 
  LayoutDashboard,
  CheckCircle2,
  AlertCircle,
  Monitor,
  Router,
  ArrowRightLeft
} from 'lucide-react';
import type { Lab, SystemStats, User } from '../types';
import { getAllLabs, getSystemStats } from '../services/labService';
import { ThemeToggle } from '../components/ThemeToggle';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

const Dashboard = ({ user, onLogout }: DashboardProps) => {
  const navigate = useNavigate();
  const [labs, setLabs] = useState<Lab[]>([]);
  const [stats, setStats] = useState<SystemStats>({ activeUsers: 0, totalUsers: 0, availableLabs: 0, unavailableLabs: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [labsData, statsData] = await Promise.all([getAllLabs(), getSystemStats()]);
        setLabs(labsData);
        setStats(statsData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const StatusBadge = ({ status }: { status: 'AVAILABLE' | 'UNAVAILABLE' }) => (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
      status === 'AVAILABLE' 
        ? 'bg-status-success/10 text-status-success border border-status-success/20' 
        : 'bg-status-warning/10 text-status-warning border border-status-warning/20'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status === 'AVAILABLE' ? 'bg-status-success' : 'bg-status-warning'}`} />
      {status === 'UNAVAILABLE' ? 'UNAVAILABLE' : status}
    </span>
  );

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg-app text-text-primary">
        <div className="animate-spin w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-app text-text-primary font-sans">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-bg-app/80 backdrop-blur-md border-b border-border-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="bg-linear-to-br from-brand-secondary to-red-600 p-2 rounded-lg shadow-lg shadow-orange-900/20">
                <Server className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight text-text-primary">
                Network<span className="text-brand-secondary">Lab</span>
              </span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#" className="flex items-center gap-2 text-text-primary font-medium hover:text-brand-secondary transition-colors">
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </a>

              <a href="#" className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors">
                <FileText className="w-4 h-4" /> Documents
              </a>
            </div>

            <div className="flex items-center gap-4">
              <ThemeToggle />
              <div className="flex flex-col items-end mr-2">
                <span className="text-sm font-medium text-text-primary">{user.name}</span>
                <span className="text-xs text-brand-secondary font-mono">{user.email}</span>
              </div>
              <button 
                onClick={onLogout}
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
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Active Users', value: stats.activeUsers, icon: Activity, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
            { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
            { label: 'Available Labs', value: stats.availableLabs, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
            { label: 'Unavailable Labs', value: stats.unavailableLabs, icon: AlertCircle, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
          ].map((stat, i) => (
            <div key={i} className={`p-4 rounded-xl border ${stat.border} ${stat.bg} backdrop-blur-sm relative overflow-hidden group`}>
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110">
                <stat.icon className="w-16 h-16" />
              </div>
              <p className={`text-sm font-medium ${stat.color} mb-1`}>{stat.label}</p>
              <h3 className="text-3xl font-bold text-text-primary tracking-tight">{stat.value}</h3>
            </div>
          ))}
        </div>

        {/* Lab Sets */}
        <div className="space-y-8">
          {[1].map((setNum) => (
            <div key={setNum}>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
                  <span className="w-1 h-6 bg-brand-secondary rounded-full" />
                  Lab Set {setNum}
                </h2>
                <span className="text-sm text-text-muted bg-bg-surface px-3 py-1 rounded-full border border-bg-surface-hover">
                  Devices: {setNum === 1 ? '01-03' : '04-06'}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {labs.filter(l => l.set === setNum).map(lab => (
                  <div key={lab.id} className="bg-bg-surface border border-border-subtle rounded-xl p-5 hover:border-brand-secondary/30 transition-all duration-300 shadow-lg hover:shadow-orange-900/10 group">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-text-primary mb-1 group-hover:text-brand-secondary transition-colors">{lab.name}</h3>
                        <p className="text-xs text-text-secondary font-mono">ID: {lab.id.toUpperCase()}</p>
                      </div>
                      <StatusBadge status={lab.status} />
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-6">
                      {lab.devices.map(device => (
                        <div key={device.id} className="flex items-center gap-2 p-2 rounded-lg bg-bg-app border border-border-subtle">
                          <div className={`w-2 h-2 rounded-full ${device.status === 'AVAILABLE' ? 'bg-status-success shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-status-warning'}`} />
                          <span className="text-xs font-mono text-text-secondary">{device.name}</span>
                          <span className="ml-auto">
                            {device.type === 'ROUTER' 
                              ? <Router className="w-3 h-3 text-text-secondary" /> 
                              : device.type === 'SWITCH' 
                                ? <ArrowRightLeft className="w-3 h-3 text-text-secondary" />
                                : <Monitor className="w-3 h-3 text-text-secondary" />
                            }
                          </span>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => navigate(`/lab/${lab.id}`)}
                      className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                        lab.status === 'AVAILABLE'
                          ? 'bg-brand-primary hover:bg-brand-primary-hover text-white shadow-lg shadow-indigo-900/20'
                          : 'bg-status-warning/10 hover:bg-status-warning/20 text-status-warning border border-status-warning/20'
                      }`}
                    >
                      Access Lab Environment
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
