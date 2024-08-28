use rayon::ThreadPoolBuilder;
use num_cpus;
use std::path::Path;
use crate::db::DbConnection;
use crate::world::{analyze_mca_folder, analyze_region};
use crate::world::scanner::get_mca_file_count;

mod error;
mod world;
mod db;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let num_cpus = num_cpus::get();
    let num_threads = if num_cpus > 2 { num_cpus - 2 } else { 1 };
    ThreadPoolBuilder::new().num_threads(num_threads).build_global()?;

    let conn = db::init_db(Path::new("minecraft_world.db"))?;

    tauri::Builder::default()
        .manage(conn)
        .invoke_handler(tauri::generate_handler![
            analyze_mca_folder,
            get_mca_file_count,
            analyze_region
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");

    Ok(())
}