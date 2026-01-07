import { useState } from 'react';
import type { Device } from '../types';
import { Save, Monitor, AlertCircle, CheckCircle2 } from 'lucide-react';

interface PCConfigurationProps {
  device: Device;
}

interface NetworkConfig {
  ip: string;
  subnet: string;
  gateway: string;
}

export default function PCConfiguration({ device }: PCConfigurationProps) {
  const [config, setConfig] = useState<NetworkConfig>({
    ip: '',
    subnet: '',
    gateway: ''
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'IDLE' | 'SUCCESS' | 'ERROR'>('IDLE');

  const handleChange = (field: keyof NetworkConfig, value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }));
    if (saveStatus !== 'IDLE') setSaveStatus('IDLE');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const payload = {
      deviceId: device.id,
      config: config
    };

    console.log('Sending Configuration Payload:', JSON.stringify(payload, null, 2));

    setIsSaving(false);
    setSaveStatus('SUCCESS');
  };

  return (
    <div className="w-full h-full bg-bg-app text-text-primary p-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-md bg-bg-surface border border-border-subtle rounded-2xl shadow-xl overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-border-subtle bg-bg-surface-hover flex items-center gap-4">
          <div className="p-3 bg-brand-primary/20 rounded-xl">
            <Monitor className="w-6 h-6 text-brand-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-text-primary tracking-tight">{device.name} Configuration</h2>
            <p className="text-sm text-text-secondary">Network Interface Settings</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="p-6 space-y-6">
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary ml-1">IP Address</label>
              <input 
                type="text" 
                placeholder="e.g. 192.168.1.10"
                value={config.ip}
                onChange={(e) => handleChange('ip', e.target.value)}
                className="w-full bg-bg-app border border-border-subtle rounded-lg px-4 py-2.5 text-text-primary focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all font-mono placeholder:text-text-muted"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary ml-1">Subnet Mask</label>
              <input 
                type="text" 
                placeholder="e.g. 255.255.255.0"
                value={config.subnet}
                onChange={(e) => handleChange('subnet', e.target.value)}
                className="w-full bg-bg-app border border-border-subtle rounded-lg px-4 py-2.5 text-text-primary focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all font-mono placeholder:text-text-muted"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary ml-1">Default Gateway</label>
              <input 
                type="text" 
                placeholder="e.g. 192.168.1.1"
                value={config.gateway}
                onChange={(e) => handleChange('gateway', e.target.value)}
                className="w-full bg-bg-app border border-border-subtle rounded-lg px-4 py-2.5 text-text-primary focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all font-mono placeholder:text-text-muted"
              />
            </div>
          </div>

          {/* Feedback */}
          {saveStatus === 'SUCCESS' && (
             <div className="p-3 bg-status-success/10 border border-status-success/20 rounded-lg flex items-center gap-2 text-status-success text-sm animate-in fade-in slide-in-from-top-1">
                <CheckCircle2 className="w-4 h-4" />
                Configuration saved to console successfully.
             </div>
          )}
          {saveStatus === 'ERROR' && (
             <div className="p-3 bg-status-error/10 border border-status-error/20 rounded-lg flex items-center gap-2 text-status-error text-sm">
                <AlertCircle className="w-4 h-4" />
                Failed to save configuration.
             </div>
          )}

          <div className="pt-2">
            <button 
              type="submit" 
              disabled={isSaving}
              className="w-full py-2.5 bg-brand-primary hover:bg-brand-primary-hover text-white rounded-lg font-semibold shadow-lg shadow-indigo-900/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Configuration
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
