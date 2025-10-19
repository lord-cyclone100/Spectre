import { useState, useEffect, useRef } from "react";
import { useTerminal } from "../store/store";
import { invoke } from "@tauri-apps/api/core";

const TerminalTab = ({ terminal, isActive, onSelect, onClose }) => {
  return (
    <div className={`flex items-center gap-2 px-3 py-1 text-sm border-r border-[#4a9eff]/20 cursor-pointer transition-colors ${
      isActive ? 'bg-[#0a0a0f] text-[#4a9eff]' : 'bg-[#0f0f1e] text-[#6bb6ff] hover:bg-[#4a9eff]/10'
    }`}>
      <span onClick={onSelect} className="flex-1">
        {terminal.shellType === 'powershell' ? 'PowerShell' : 'Command Prompt'} 
        <span className="text-xs opacity-60 ml-1">({terminal.id.slice(-4)})</span>
      </span>
      <button 
        onClick={onClose}
        className="text-base hover:text-[#ff6b6b] hover:bg-[#4a9eff]/20 rounded w-5 h-5 flex items-center justify-center transition-colors"
        title="Close terminal"
      >
        ×
      </button>
    </div>
  );
};

const TerminalSession = ({ terminal }) => {
  const [input, setInput] = useState("");
  const [currentDirectory, setCurrentDirectory] = useState(terminal.workingDirectory || "");
  const outputRef = useRef(null);
  const { updateTerminalOutput, updateTerminalDirectory } = useTerminal();

  useEffect(() => {
    // Auto-scroll to bottom when new output is added
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [terminal.output]);

  useEffect(() => {
    // Set initial directory from terminal's working directory
    if (terminal.workingDirectory) {
      setCurrentDirectory(terminal.workingDirectory);
      updateTerminalDirectory(terminal.id, terminal.workingDirectory);
    } else {
      // Get current directory when terminal starts if no working directory is set
      getCurrentDir();
    }
  }, [terminal.id, terminal.workingDirectory]);

  const getCurrentDir = async () => {
    try {
      const dir = await invoke("get_current_directory", {
        sessionId: terminal.id,
        shellType: terminal.shellType
      });
      setCurrentDirectory(dir);
      updateTerminalDirectory(terminal.id, dir);
    } catch (error) {
      console.error("Error getting current directory:", error);
    }
  };

  const executeCommand = async () => {
    if (!input.trim()) return;

    const command = input.trim();
    setInput("");

    // Add command to output
    const commandOutput = {
      type: "command",
      content: `${currentDirectory}> ${command}`,
      timestamp: new Date().toLocaleTimeString()
    };
    updateTerminalOutput(terminal.id, commandOutput);

    try {
      const result = await invoke("execute_terminal_command", {
        sessionId: terminal.id,
        command: command,
        shellType: terminal.shellType,
        workingDirectory: currentDirectory || terminal.workingDirectory
      });

      // Add result to output
      const resultOutput = {
        type: result.is_error ? "error" : "output",
        content: result.output.trim(),
        timestamp: new Date().toLocaleTimeString()
      };
      updateTerminalOutput(terminal.id, resultOutput);

      // Update current directory if command might have changed it
      if (command.toLowerCase().startsWith('cd ') || command.toLowerCase() === 'cd') {
        setTimeout(getCurrentDir, 100);
      }

    } catch (error) {
      const errorOutput = {
        type: "error",
        content: `Error: ${error}`,
        timestamp: new Date().toLocaleTimeString()
      };
      updateTerminalOutput(terminal.id, errorOutput);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      executeCommand();
    }
  };

  const getPrompt = () => {
    const shortDir = currentDirectory.split('\\').pop() || currentDirectory;
    return terminal.shellType === 'powershell' 
      ? `PS ${shortDir}>`
      : `${shortDir}>`;
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0a0f] text-[#4a9eff] font-mono text-sm">
      {/* Terminal Output */}
      <div 
        ref={outputRef}
        className="flex-1 p-3 overflow-y-auto space-y-1"
        style={{ minHeight: 0 }}
      >
        {/* Welcome message */}
        <div className="text-[#6bb6ff] text-xs">
          {terminal.shellType === 'powershell' ? 'Windows PowerShell' : 'Command Prompt'}
        </div>
        <div className="text-[#6bb6ff] text-xs mb-2">
          Working Directory: {currentDirectory}
        </div>
        
        {/* Command output */}
        {terminal.output && terminal.output.map((item, index) => (
          <div key={index} className={`whitespace-pre-wrap ${
            item.type === 'command' ? 'text-[#4a9eff]' :
            item.type === 'error' ? 'text-[#ff6b6b]' : 'text-[#8cc5ff]'
          }`}>
            {item.content}
          </div>
        ))}
      </div>
      
      {/* Input line */}
      <div className="p-3 border-t border-[#4a9eff]/30 flex items-center gap-2 bg-[#0f0f1e]">
        <span className="text-[#4a9eff] font-semibold">{getPrompt()}</span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1 bg-transparent text-[#4a9eff] outline-none placeholder:text-[#6bb6ff]/50"
          placeholder="Enter command..."
          autoFocus
        />
      </div>
    </div>
  );
};

export const Terminal = () => {
  const { 
    terminals, 
    activeTerminalId, 
    isTerminalVisible, 
    setActiveTerminal, 
    removeTerminal,
    setTerminalVisible 
  } = useTerminal();

  const activeTerminal = terminals.find(t => t.id === activeTerminalId);

  if (!isTerminalVisible || terminals.length === 0) {
    return null;
  }

  return (
    <div className="absolute bottom-0 left-0 right-0 h-80 border-t border-[#4a9eff] bg-[#0a0a0f] flex flex-col z-50 shadow-2xl shadow-[#4a9eff]/20">
      {/* Terminal tabs */}
      <div className="flex items-center bg-[#0f0f1e] border-b border-[#4a9eff]/30">
        <div className="flex">
          {terminals.map((terminal) => (
            <TerminalTab
              key={terminal.id}
              terminal={terminal}
              isActive={terminal.id === activeTerminalId}
              onSelect={() => setActiveTerminal(terminal.id)}
              onClose={() => removeTerminal(terminal.id)}
            />
          ))}
        </div>
        <div className="flex-1"></div>
        <button
          onClick={() => setTerminalVisible(false)}
          className="px-3 py-1 text-[#4a9eff] hover:bg-[#4a9eff]/20 transition-colors text-lg"
          title="Hide terminal"
        >
          ×
        </button>
      </div>
      
      {/* Active terminal */}
      {activeTerminal && <TerminalSession terminal={activeTerminal} />}
    </div>
  );
};