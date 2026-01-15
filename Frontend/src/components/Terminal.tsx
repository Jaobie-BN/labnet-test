import { useState, useEffect, useRef, useCallback } from 'react';
import type { Device } from '../types';

interface TerminalProps {
  device: Device;
  labId: string;
}

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

interface CommandHistory {
  command: string;
  output: string;
  prompt?: string;
}

// WebSocket URL - use environment variable or default
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3000/ws/terminal';

export default function Terminal({ device, labId }: TerminalProps) {
  const [history, setHistory] = useState<CommandHistory[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [mode] = useState<'USER' | 'PRIVILEGED' | 'CONFIG'>('USER');
  
  const wsRef = useRef<WebSocket | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const outputBufferRef = useRef<string>('');

  // Get user info
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Get current prompt based on mode (regular function, not useCallback)
  const getPrompt = () => {
    if (device.type === 'PC') {
      return `C:\\Users\\${device.name}>`;
    }

    const hostname = device.name;
    switch (mode) {
      case 'CONFIG':
        return `${hostname}(config)#`;
      case 'PRIVILEGED':
        return `${hostname}#`;
      case 'USER':
      default:
        return `${hostname}>`;
    }
  };

  // Add output message to history (regular function)
  const addOutput = (text: string) => {
    setHistory(prev => [...prev, { command: '', output: text, prompt: '' }]);
  };

  // Process output buffer
  const processOutputBuffer = () => {
    const buffer = outputBufferRef.current;
    if (!buffer) return;

    const lines = buffer.split('\n');
    outputBufferRef.current = lines[lines.length - 1];
    
    const completeLines = lines.slice(0, -1);
    if (completeLines.length > 0) {
      setHistory(prev => [
        ...prev,
        { command: '', output: completeLines.join('\n'), prompt: '' }
      ]);
    }
  };

  // Handle messages from server
  const handleServerMessage = (message: {
    type: string;
    deviceId?: string;
    data?: string;
    error?: string;
  }) => {
    switch (message.type) {
      case 'connected':
        setConnectionStatus('connected');
        if (message.data) {
          addOutput(message.data);
        }
        addOutput(`Connected to ${device.name}`);
        addOutput(`Type 'help' for available commands, or use device CLI directly.`);
        break;

      case 'disconnected':
        setConnectionStatus('disconnected');
        addOutput('Disconnected from device.');
        break;

      case 'output':
        if (message.data) {
          outputBufferRef.current += message.data;
          processOutputBuffer();
        }
        break;

      case 'error':
        setConnectionStatus('error');
        addOutput(`Error: ${message.error}`);
        break;

      case 'pong':
        break;
    }
  };

  // Send device connect command
  const sendDeviceConnect = () => {
    if (wsRef.current?.readyState !== WebSocket.OPEN) return;

    const portPath = device.serialPort || `/dev/netlab_${device.id}`;
    const baudRate = device.baudRate || 9600;

    wsRef.current.send(JSON.stringify({
      type: 'connect',
      deviceId: device.id,
      portPath,
      baudRate,
      userId: user.id || 'anonymous',
      username: user.name || 'Anonymous',
      labId: labId
    }));
  };

  // Connect to WebSocket and device
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      sendDeviceConnect();
      return;
    }

    setConnectionStatus('connecting');
    setHistory(prev => [...prev, { command: '', output: `Connecting to ${device.name}...`, prompt: '' }]);

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('[Terminal] WebSocket connected');
      
      // Identify user and join lab first
      ws.send(JSON.stringify({
        type: 'join',
        labId: labId,
        userId: user.id || 'anonymous',
        username: user.name || 'Anonymous'
      }));

      // Then connect to device
      sendDeviceConnect();
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        handleServerMessage(message);
      } catch (error) {
        console.error('[Terminal] Failed to parse message:', error);
      }
    };


    ws.onerror = (error) => {
      console.error('[Terminal] WebSocket error:', error);
      setConnectionStatus('error');
      setHistory(prev => [...prev, { command: '', output: 'Connection error. Please check if the server is running.', prompt: '' }]);
    };

    ws.onclose = () => {
      console.log('[Terminal] WebSocket closed');
      setConnectionStatus('disconnected');
      wsRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [device.id]);

  // Send command to device
  const sendCommand = (cmd: string) => {
    if (wsRef.current?.readyState !== WebSocket.OPEN || connectionStatus !== 'connected') {
      addOutput('Not connected. Reconnecting...');
      connect();
      return;
    }

    wsRef.current.send(JSON.stringify({
      type: 'command',
      command: cmd,
    }));

    setHistory(prev => [...prev, { command: cmd, output: '', prompt: getPrompt() }]);
  };

  // Handle local commands
  const handleLocalCommand = (cmd: string): boolean => {
    const trimmed = cmd.trim().toLowerCase();
    
    if (trimmed === 'clear' || trimmed === 'cls') {
      setHistory([]);
      return true;
    }
    
    if (trimmed === 'reconnect') {
      connect();
      return true;
    }

    if (trimmed === 'disconnect') {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'disconnect' }));
      }
      return true;
    }

    if (trimmed === 'help') {
      addOutput(`
Local Commands:
  clear / cls    Clear terminal screen
  reconnect      Reconnect to device
  disconnect     Disconnect from device
  help           Show this help

Device commands are sent directly to ${device.name}.
`);
      return true;
    }

    return false;
  };

  // Handle Enter key
  const handleSubmit = () => {
    const cmd = currentInput;
    setCurrentInput('');

    if (handleLocalCommand(cmd)) {
      return;
    }

    sendCommand(cmd);
  };

  // Handle key down
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  // Connect when device changes
  useEffect(() => {
    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect]);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, [device.id]);

  // Get status indicator color
  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'bg-emerald-500';
      case 'connecting':
        return 'bg-yellow-500 animate-pulse';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div 
      className="flex flex-col h-full w-full bg-black text-white font-mono text-sm overflow-hidden"
      onClick={() => inputRef.current?.focus()}
    >
      {/* Status Bar */}
      <div className="flex items-center gap-2 px-4 py-2 bg-gray-900 border-b border-gray-700">
        <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
        <span className="text-gray-400 text-xs uppercase">{connectionStatus}</span>
        <span className="text-gray-600">|</span>
        <span className="text-gray-400 text-xs">{device.name}</span>
        {device.serialPort && (
          <>
            <span className="text-gray-600">|</span>
            <span className="text-gray-500 text-xs">{device.serialPort}</span>
          </>
        )}
      </div>

      {/* Terminal Output */}
      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1 p-4">
        {history.map((entry, i) => (
          <div key={i} className="whitespace-pre-wrap wrap-break-word">
            {entry.command && (
              <div className="flex gap-2 text-gray-400">
                <span>{entry.prompt}</span> 
                <span className="text-white">{entry.command}</span>
              </div>
            )}
            {entry.output && (
              <div className="text-gray-300 ml-0">{entry.output}</div>
            )}
          </div>
        ))}
        
        {/* Active Input Line */}
        <div className="flex items-center gap-2">
          <span className="text-emerald-500 font-bold whitespace-nowrap">{getPrompt()}</span>
          <input
            ref={inputRef}
            type="text"
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-none outline-none text-white focus:ring-0 p-0"
            autoComplete="off"
            autoFocus
            disabled={connectionStatus === 'connecting'}
          />
        </div>
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
