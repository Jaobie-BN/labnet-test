import { useState, useEffect, useRef } from 'react';
import type { Device } from '../types';

interface TerminalProps {
  device: Device;
}


interface CommandHistory {
  command: string;
  output: string;
  prompt?: string;
}

export default function Terminal({ device }: TerminalProps) {
  const [history, setHistory] = useState<CommandHistory[]>([{
    command: '',
    output: `Connected to ${device.name} (${device.type})\n${new Date().toLocaleString()}`,
    prompt: ''
  }]);
  const [currentInput, setCurrentInput] = useState('');
  const [mode, setMode] = useState<'USER' | 'PRIVILEGED' | 'CONFIG'>('USER');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount and click
  useEffect(() => {
    inputRef.current?.focus();
  }, [device.id]); // Re-focus when device changes

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const getPrompt = () => {
    // Current prompt calculation based on current state
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

  const handleCommand = (cmd: string) => {
    const trimmedCmd = cmd.trim();
    const currentPrompt = getPrompt();
    let output = '';
    
    // Basic Command Handler
    if (trimmedCmd === '') {
       // Do nothing just newline
    } else if (trimmedCmd === 'help' || trimmedCmd === '?') {
      output = `
Available commands:
  enable    Enter privileged mode
  disable   Exit privileged mode
  configure terminal (conf t)  Enter configuration mode
  exit      Exit current mode
  ping      Simulate ping
  show      Show system information
  clear     Clear terminal screen
      `;
    } else if (trimmedCmd === 'clear') {
      setHistory([]);
      return;
    } else if ((trimmedCmd === 'enable' || trimmedCmd === 'en') && device.type !== 'PC') {
      if (mode === 'USER') {
        setMode('PRIVILEGED');
      }
    } else if (trimmedCmd === 'disable' && device.type !== 'PC') {
      if (mode === 'PRIVILEGED') {
        setMode('USER');
      }
    } else if ((trimmedCmd === 'configure terminal' || trimmedCmd === 'conf t') && device.type !== 'PC') {
      if (mode === 'PRIVILEGED') {
        setMode('CONFIG');
      } else {
        output = '% Invalid input detected at marker.';
      }
    } else if (trimmedCmd === 'exit') {
      if (mode === 'CONFIG') setMode('PRIVILEGED');
      else if (mode === 'PRIVILEGED') setMode('USER');
    } else if (trimmedCmd.startsWith('ping')) {
      output = 'Sending 5, 100-byte ICMP Echos to 8.8.8.8, timeout is 2 seconds:\n!!!!!\nSuccess rate is 100 percent (5/5)';
    } else {
       output = device.type === 'PC' 
         ? `'${trimmedCmd}' is not recognized as an internal or external command.`
         : '% Unknown command or computer name, or unable to find computer address';
    }

    setHistory(prev => [...prev, { command: cmd, output, prompt: currentPrompt }]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCommand(currentInput);
      setCurrentInput('');
    }
  };

  return (
    <div 
      className="flex flex-col h-full w-full bg-black text-white font-mono text-sm p-4 overflow-hidden"
      onClick={() => inputRef.current?.focus()}
    >
      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1">
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
        {/* Active Line */}
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
           />
        </div>
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
