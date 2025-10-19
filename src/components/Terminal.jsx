import { useState, useEffect, useRef } from "react";
import { useTerminal } from "../store/store";
import { invoke } from "@tauri-apps/api/core";

const TerminalTab = ({ terminal, isActive, onSelect, onClose }) => {
  return (
    <div className={`flex items-center gap-2 px-3 py-1 text-sm border-r border-base-300 cursor-pointer ${
      isActive ? 'bg-base-300' : 'bg-base-200 hover:bg-base-300'
    }`}>
      <span onClick={onSelect} className="flex-1">
        {terminal.shellType === 'powershell' ? 'PowerShell' : 'Command Prompt'} 
        <span className="text-xs text-gray-500 ml-1">({terminal.id.slice(-4)})</span>
      </span>
      <button 
        onClick={onClose}
        className="text-xs hover:text-red-500 ml-1"
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
    <div className="flex flex-col h-full bg-black text-green-400 font-mono text-sm">
      {/* Terminal Output */}
      <div 
        ref={outputRef}
        className="flex-1 p-2 overflow-y-auto space-y-1"
        style={{ minHeight: 0 }}
      >
        {/* Welcome message */}
        <div className="text-gray-400 text-xs">
          {terminal.shellType === 'powershell' ? 'Windows PowerShell' : 'Command Prompt'}
        </div>
        <div className="text-gray-400 text-xs mb-2">
          Working Directory: {currentDirectory}
        </div>
        
        {/* Command output */}
        {terminal.output && terminal.output.map((item, index) => (
          <div key={index} className={`whitespace-pre-wrap ${
            item.type === 'command' ? 'text-white' :
            item.type === 'error' ? 'text-red-400' : 'text-green-400'
          }`}>
            {item.content}
          </div>
        ))}
      </div>
      
      {/* Input line */}
      <div className="p-2 border-t border-gray-700 flex items-center gap-2">
        <span className="text-white font-bold">{getPrompt()}</span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1 bg-transparent text-green-400 outline-none"
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
    <div className="absolute bottom-0 left-0 right-0 h-80 border-t border-base-300 bg-base-100 flex flex-col z-50">
      {/* Terminal tabs */}
      <div className="flex items-center bg-base-200 border-b border-base-300">
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
          className="px-2 py-1 text-sm hover:bg-base-300"
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