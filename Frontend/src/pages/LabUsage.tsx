import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Settings,  
  Save, 
  RefreshCw, 
  Server,
  Network,
  Monitor,
  ArrowRightLeft,
  Router,
  Terminal as TerminalIcon
} from 'lucide-react';
import type { Device, Lab } from '../types';
import { getLabById } from '../services/labService';
import Terminal from '../components/Terminal';
import PCConfiguration from '../components/PCConfiguration';
import { ThemeToggle } from '../components/ThemeToggle';

const LabUsage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [lab, setLab] = useState<Lab | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLab = async () => {
      try {
        if (id) {
          const labData = await getLabById(id);
          setLab(labData || null);
        }
      } catch (error) {
        console.error('Failed to fetch lab:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLab();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg-app text-text-primary">
        <div className="animate-spin w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!lab) {
      return (
          <div className="flex h-screen items-center justify-center bg-bg-app text-text-primary flex-col gap-4">
              <h2 className="text-2xl font-bold text-status-error">Lab Not Found</h2>
              <p>The lab with ID "{id}" does not exist or is unavailable.</p>
              <button 
                  onClick={() => navigate('/')}
                  className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary-hover"
              >
                  Back to Dashboard
              </button>
          </div>
      );
  }

  return (
    <div className="flex h-screen bg-bg-app text-text-primary overflow-hidden font-sans">
      {/* Sidebar Control Panel */}
      <aside className="w-80 bg-bg-surface border-r border-border-subtle flex flex-col">
        <div className="p-6 border-b border-border-subtle">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back to Dashboard</span>
          </button>
          
          <div className="flex items-center gap-3 mb-2">
             <div className="p-2 bg-brand-primary/20 rounded-lg">
                <Settings className="w-5 h-5 text-brand-primary" />
             </div>
             <div>
                <h2 className="text-lg font-bold text-text-primary">Control Panel</h2>
                <div className="flex items-center gap-1.5">
                   <span className="w-2 h-2 rounded-full bg-status-success animate-pulse" />
                   <span className="text-xs text-status-success font-mono">Connected</span>
                </div>
             </div>
          </div>
        </div>

        <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
          <div className="space-y-6">
            {/* Selected Lab Info */}
            <div className="bg-bg-app rounded-xl p-4 border border-border-subtle">
               <h3 className="text-xs uppercase tracking-wider text-text-muted font-bold mb-3">Active Session</h3>
               <div className="flex items-center gap-3 mb-2">
                 <Server className="w-8 h-8 text-brand-secondary" />
                 <div>
                    <div className="text-text-primary font-bold text-lg">{lab.name}</div>
                    <div className="text-xs text-text-secondary font-mono">ID: {lab.id.toUpperCase()}</div>
                 </div>
               </div>
               <div className="mt-3 flex items-center justify-between text-sm bg-bg-surface p-2 rounded-lg border border-border-subtle">
                  <span className="text-text-secondary">Time Remaining:</span>
                  <span className="text-text-primary font-mono">01:59:45</span>
               </div>
            </div>

            {/* Device List */}
            <div>
               <h3 className="text-xs uppercase tracking-wider text-text-muted font-bold mb-3">Device Configuration</h3>
               <div className="space-y-2">
                  {lab.devices.map(device => (
                     <button 
                       key={device.id} 
                       onClick={() => setSelectedDevice(device)}
                       className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all group ${
                         selectedDevice?.id === device.id 
                           ? 'bg-brand-primary/20 border-brand-primary/50 shadow-lg shadow-indigo-900/20' 
                           : 'bg-bg-app hover:bg-bg-surface-hover border-transparent hover:border-border-highlight'
                       }`}
                     >
                        <div className={`p-1.5 rounded-md ${
                          selectedDevice?.id === device.id
                            ? 'bg-brand-primary text-white' 
                            : 'bg-brand-primary/10 text-brand-primary group-hover:text-brand-primary-hover'
                        }`}>
                           {device.type === 'ROUTER' ? (
                             <Router className="w-4 h-4" />
                           ) : device.type === 'SWITCH' ? (
                             <ArrowRightLeft className="w-4 h-4" />
                           ) : (
                             <Monitor className="w-4 h-4" />
                           )}
                        </div>
                        <div className="text-left">
                           <div className={`text-sm font-medium ${
                             selectedDevice?.id === device.id ? 'text-text-primary' : 'text-text-secondary group-hover:text-text-primary'
                           }`}>{device.name}</div>
                           <div className="text-[10px] text-text-muted uppercase">{device.type}</div>
                        </div>
                        <div className="ml-auto">
                           <div className={`w-1.5 h-1.5 rounded-full ${
                             device.status === 'AVAILABLE' ? 'bg-status-success' : 'bg-status-warning'
                           }`} />
                        </div>
                     </button>
                  ))}
               </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-border-subtle bg-bg-app/50">
           <button className="w-full py-2 bg-status-error/10 hover:bg-status-error/20 text-status-error border border-status-error/20 rounded-lg text-sm font-medium transition-colors">
              Terminate Session
           </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-bg-app">
         <header className="h-14 border-b border-border-subtle flex items-center justify-between px-6 bg-bg-surface/50">
            <div className="flex items-center gap-2 text-text-secondary text-sm">
               {selectedDevice ? (
                 selectedDevice.type === 'PC' ? (
                   <>
                     <Monitor className="w-4 h-4" />
                     <span>Configuration: <span className="text-text-primary font-mono">{selectedDevice.name}</span></span>
                   </>
                 ) : (
                   <>
                     <TerminalIcon className="w-4 h-4" />
                     <span>Terminal: <span className="text-text-primary font-mono">{selectedDevice.name}</span></span>
                     {selectedDevice.connectedUsers && selectedDevice.connectedUsers.length > 0 && (
                        <div className="flex items-center gap-2 ml-4">
                           <span className="text-xs text-text-secondary">Also viewing:</span>
                           <div className="flex items-center gap-2">
                              {selectedDevice.connectedUsers.map((user) => (
                                 <div
                                    key={user.id}
                                    className="flex items-center gap-2 px-2 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20"
                                 >
                                    <div className="w-4 h-4 rounded-full bg-brand-primary flex items-center justify-center text-[8px] text-white font-bold">
                                       {user.name.charAt(0)}
                                    </div>
                                    <span className="text-xs text-brand-primary font-medium">{user.name}</span>
                                 </div>
                              ))}
                           </div>
                        </div>
                     )}
                   </>
                 )
               ) : (
                 <>
                   <Network className="w-4 h-4" />
                   <span>Network Topology Visualization</span>
                 </>
               )}
            </div>
            <div className="flex items-center gap-2">
               <ThemeToggle />
               <button className="p-2 text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover rounded-lg transition-colors">
                  <Save className="w-4 h-4" />
               </button>
               <button className="p-2 text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover rounded-lg transition-colors">
                  <RefreshCw className="w-4 h-4" />
               </button>
            </div>
         </header>

         <div className="flex-1 flex relative overflow-hidden">
            {selectedDevice ? (
               selectedDevice.type === 'PC' ? (
                 <PCConfiguration key={selectedDevice.id} device={selectedDevice} />
               ) : (
                 <Terminal key={selectedDevice.id} device={selectedDevice} />
               )
            ) : (
               <div className="flex-1 p-8 flex items-center justify-center relative">
                 {/* Grid Background */}
                 <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" 
                      style={{ 
                         backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', 
                         backgroundSize: '24px 24px' 
                      }} 
                 />
                 
                  <div className="text-center z-10">
                     <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-indigo-500/10 mb-6 animate-pulse">
                        <Network className="w-10 h-10 text-indigo-400" />
                     </div>
                     <h2 className="text-2xl font-bold text-text-primary mb-2">Environment Ready</h2>
                     <p className="text-text-secondary max-w-md mx-auto">
                        Select a device from the control panel to begin configuration or interact with the topology viewer.
                     </p>
                  </div>
                </div>
             )}
         </div>
      </main>
    </div>
  );
};

export default LabUsage;
