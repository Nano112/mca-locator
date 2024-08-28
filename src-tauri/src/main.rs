extern crate core;

use rayon::ThreadPoolBuilder;
use num_cpus;

mod error;
mod commands;

fn main() {
    let num_cpus = num_cpus::get();

    let num_threads = if num_cpus > 2 { num_cpus - 2 } else { 1 };

    ThreadPoolBuilder::new().num_threads(num_threads).build_global().unwrap();

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            commands::analyze_region,
            commands::get_mca_file_count,
            commands::analyze_mca_folder
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}