import React, { useEffect, useState } from 'react';
import { getDashboardStats, forceReleaseLab, type SystemStats } from '../../services/adminService';
import { getAllLabs } from '../../services/labService';
import type { Lab } from '../../types/lab';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [labs, setLabs] = useState<Lab[]>([]);
  const [loading, setLoading] = useState(true);

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
  }, []);

  const handleForceRelease = async (labId: string) => {
    if (!confirm('Are you sure you want to force release this lab? This will disconnect current users.')) return;
    try {
      await forceReleaseLab(labId);
      // Refresh data
      fetchData();
    } catch (error) {
      console.error('Failed to release lab:', error);
      alert('Failed to release lab');
    }
  };

  if (loading) return <div className="p-8 text-white">Loading...</div>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white mb-8">Admin Dashboard</h1>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-gray-400 text-sm font-medium">Active Users</h3>
            <p className="text-3xl font-bold text-white mt-2">{stats.activeUsers}</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-gray-400 text-sm font-medium">Total Users</h3>
            <p className="text-3xl font-bold text-white mt-2">{stats.totalUsers}</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-gray-400 text-sm font-medium">Available Labs</h3>
            <p className="text-3xl font-bold text-green-400 mt-2">{stats.availableLabs}</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-gray-400 text-sm font-medium">Busy Labs</h3>
            <p className="text-3xl font-bold text-red-400 mt-2">{stats.unavailableLabs}</p>
          </div>
        </div>
      )}

      {/* Labs Management */}
      <h2 className="text-xl font-bold text-white mb-4">Lab Status Control</h2>
      <div className="grid grid-cols-1 gap-4">
        {labs.map((lab) => (
          <div key={lab.id} className="bg-gray-800 p-4 rounded-lg flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">{lab.name}</h3>
              <p className={`text-sm ${lab.status === 'AVAILABLE' ? 'text-green-400' : 'text-red-400'}`}>
                Status: {lab.status}
              </p>
              {lab.status === 'UNAVAILABLE' && (
                  <p className="text-xs text-gray-500 mt-1">
                      Check devices for connected users
                  </p>
              )}
            </div>
            {lab.status === 'UNAVAILABLE' && (
              <button
                onClick={() => handleForceRelease(lab.id)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
              >
                Force Release
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
