use std::fs;
use std::path::Path;
use std::process::Command;
use std::sync::{Arc, Mutex};
use std::collections::HashMap;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct FileItem {
    name: String,
    path: String,
    is_directory: bool,
    children: Option<Vec<FileItem>>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TerminalSession {
    id: String,
    shell_type: String,
    working_directory: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TerminalOutput {
    output: String,
    is_error: bool,
}

// Global state for managing terminal sessions (simplified for now)
lazy_static::lazy_static! {
    static ref TERMINAL_COUNTER: Arc<Mutex<u32>> = Arc::new(Mutex::new(0));
}

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn read_folder_contents(folder_path: String) -> Result<Vec<FileItem>, String> {
    println!("Reading folder contents for: {}", folder_path);
    let result = read_directory_shallow(&folder_path);
    match &result {
        Ok(items) => println!("Successfully read {} items", items.len()),
        Err(e) => println!("Error reading folder: {}", e),
    }
    result
}

#[tauri::command]
fn test_read_file(file_path: String) -> Result<String, String> {
    println!("Attempting to read file: {}", file_path);
    match std::fs::read_to_string(&file_path) {
        Ok(content) => {
            println!("Successfully read file, length: {}", content.len());
            Ok(content)
        },
        Err(e) => {
            println!("Error reading file: {}", e);
            Err(e.to_string())
        }
    }
}

#[tauri::command]
async fn create_terminal_session(shell_type: String, working_directory: Option<String>) -> Result<TerminalSession, String> {
    // Generate simple session ID
    let mut counter = TERMINAL_COUNTER.lock().unwrap();
    *counter += 1;
    let session_id = format!("terminal_{}", *counter);
    drop(counter);
    
    let work_dir = working_directory.unwrap_or_else(|| std::env::current_dir().unwrap().to_string_lossy().to_string());
    
    println!("Creating terminal session: {} with shell: {}", session_id, shell_type);
    
    let session = TerminalSession {
        id: session_id.clone(),
        shell_type: shell_type.clone(),
        working_directory: work_dir.clone(),
    };
    
    Ok(session)
}

#[tauri::command]
async fn execute_terminal_command(session_id: String, command: String, shell_type: String, working_directory: String) -> Result<TerminalOutput, String> {
    println!("Executing command '{}' in session: {}", command, session_id);
    
    let output = if shell_type == "powershell" {
        Command::new("powershell")
            .args(&["-Command", &command])
            .current_dir(&working_directory)
            .output()
            .map_err(|e| e.to_string())?
    } else {
        // Default to cmd
        Command::new("cmd")
            .args(&["/C", &command])
            .current_dir(&working_directory)
            .output()
            .map_err(|e| e.to_string())?
    };
    
    let stdout = String::from_utf8_lossy(&output.stdout).to_string();
    let stderr = String::from_utf8_lossy(&output.stderr).to_string();
    
    if !stderr.is_empty() {
        Ok(TerminalOutput {
            output: stderr,
            is_error: true,
        })
    } else {
        Ok(TerminalOutput {
            output: stdout,
            is_error: false,
        })
    }
}

#[tauri::command]
async fn get_current_directory(_session_id: String, shell_type: String) -> Result<String, String> {
    let command = if shell_type == "powershell" {
        "Get-Location | Select-Object -ExpandProperty Path"
    } else {
        "cd"
    };
    
    let output = if shell_type == "powershell" {
        Command::new("powershell")
            .args(&["-Command", command])
            .output()
            .map_err(|e| e.to_string())?
    } else {
        Command::new("cmd")
            .args(&["/C", command])
            .output()
            .map_err(|e| e.to_string())?
    };
    
    let result = String::from_utf8_lossy(&output.stdout).trim().to_string();
    Ok(result)
}

// New command for lazy loading subdirectories
#[tauri::command]
fn read_subdirectory(dir_path: String) -> Result<Vec<FileItem>, String> {
    println!("Reading subdirectory: {}", dir_path);
    read_directory_shallow(&dir_path)
}

// Only read immediate children, not recursive
fn read_directory_shallow(dir_path: &str) -> Result<Vec<FileItem>, String> {
    let path = Path::new(dir_path);
    
    if !path.exists() {
        return Err("Directory does not exist".to_string());
    }
    
    if !path.is_dir() {
        return Err("Path is not a directory".to_string());
    }
    
    let mut items = Vec::new();
    
    let entries = fs::read_dir(path).map_err(|e| e.to_string())?;
    
    for entry in entries {
        let entry = entry.map_err(|e| e.to_string())?;
        let entry_path = entry.path();
        let file_name = entry.file_name().to_string_lossy().to_string();
        
        // Skip hidden files (starting with .)
        if file_name.starts_with('.') {
            continue;
        }
        
        let is_directory = entry_path.is_dir();
        let path_str = entry_path.to_string_lossy().to_string();
        
        // Log the path for debugging
        println!("Processing path: {}", path_str);
        
        let children = if is_directory {
            // For directories, set children to None initially (lazy loading)
            None
        } else {
            None
        };
        
        items.push(FileItem {
            name: file_name,
            path: path_str,
            is_directory,
            children,
        });
    }
    
    // Sort items: directories first, then files, both alphabetically
    items.sort_by(|a, b| {
        match (a.is_directory, b.is_directory) {
            (true, false) => std::cmp::Ordering::Less,
            (false, true) => std::cmp::Ordering::Greater,
            _ => a.name.to_lowercase().cmp(&b.name.to_lowercase()),
        }
    });
    
    Ok(items)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet, 
            read_folder_contents, 
            test_read_file, 
            read_subdirectory,
            create_terminal_session,
            execute_terminal_command,
            get_current_directory
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
