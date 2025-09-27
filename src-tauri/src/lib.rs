use std::fs;
use std::path::Path;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct FileItem {
    name: String,
    path: String,
    is_directory: bool,
    children: Option<Vec<FileItem>>,
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
        .invoke_handler(tauri::generate_handler![greet, read_folder_contents, test_read_file, read_subdirectory])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
