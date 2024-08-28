extern crate core;

mod error;
mod commands;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            commands::analyze_region,
            commands::analyze_mca_folder
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}