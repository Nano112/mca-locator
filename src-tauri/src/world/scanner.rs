use std::collections::HashMap;
use std::path::{Path, PathBuf};
use std::fs::{self, File};
use std::io::Read;
use std::sync::{Arc, Mutex};
use std::sync::mpsc::channel;
use std::thread;
use fastnbt::{from_bytes, Value};
use rayon::prelude::*;
use tauri::Window;
use mca::RegionReader;
use serde::Serialize;

#[derive(Serialize, Clone)]
pub struct ChunkInfo {
    x: i32,
    z: i32,
    size: usize,
    dominant_biome: i32, // Most present biome ID as a number
}

#[derive(Serialize, Clone)]
pub struct RegionAnalysis {
    file_name: String,
    chunks: Vec<ChunkInfo>,
}

#[derive(Serialize, Clone)]
pub struct AnalysisResult {
    regions: Vec<RegionAnalysis>,
}


#[derive(Debug, PartialEq, PartialOrd)]
struct RegionCoordinate {
    x: i32,
    z: i32,
}

impl RegionCoordinate {
    fn distance_to(&self, other: &RegionCoordinate) -> f64 {
        (((self.x - other.x).pow(2) + (self.z - other.z).pow(2)) as f64).sqrt()
    }
}

#[tauri::command]
pub fn analyze_mca_folder(window: Window, path: String) -> Result<(), String> {
    let path = PathBuf::from(path);

    let regions = Arc::new(Mutex::new(Vec::new()));
    let (tx, rx) = channel();

    let path_clone = path.clone();
    let window_clone = window.clone();
    thread::spawn(move || {
        let mut entries: Vec<_> = match fs::read_dir(&path_clone) {
            Ok(dir) => dir
                .filter_map(|entry| entry.ok())
                .filter(|entry| entry.path().is_file())
                .filter(|entry| entry.path().extension().and_then(|s| s.to_str()) == Some("mca"))
                .collect(),
            Err(_) => return, // Handle error by exiting early
        };

        entries = entries.into_iter().filter(|entry| {
            let binding = entry.file_name();
            let file_name = binding.to_str().unwrap();
            let coords = parse_region_coordinates(file_name).unwrap();
            coords.distance_to(&RegionCoordinate { x: 0, z: 0 }) < 100.0
        }).collect();

        // Generate spiral coordinates up to a certain limit
        let spiral_coords = generate_spiral_coordinates(100); // Adjust limit as necessary

        // Sort files by proximity to the spiral pattern
        entries.sort_by_key(|entry| {
            parse_region_coordinates(entry.file_name().to_str().unwrap())
                .map(|coords| {
                    spiral_coords
                        .iter()
                        .position(|c| *c == coords) // Dereference `c` here
                        .unwrap_or(usize::MAX)
                })
                .unwrap_or(usize::MAX)
        });

        // Use rayon's parallel iterator to process entries in parallel
        entries.into_par_iter().for_each(|entry| {
            let file_path = entry.path();
            if let Some(region_name) = file_path.to_str() {
                if let Ok(analysis) = analyze_region(region_name) {
                    let mut regions_guard = regions.lock().unwrap();
                    regions_guard.push(analysis.clone());

                    tx.send(analysis).unwrap();
                }
            }
        });

        window_clone.emit("analysis-completed", {}).unwrap();
    });

    let window_clone = window.clone();
    thread::spawn(move || {
        for analysis in rx {
            window_clone.emit("region-analyzed", analysis).unwrap();
        }
    });

    Ok(())
}


#[tauri::command]
pub fn get_mca_file_count(path: String) -> Result<usize, String> {
    let path = Path::new(&path);
    if !path.is_dir() {
        return Err("The provided path is not a directory".into());
    }

    let count = fs::read_dir(path)
        .map_err(|e| e.to_string())?
        .filter(|entry| {
            entry.as_ref().ok().map_or(false, |e| {
                e.path().is_file() && e.path().extension().and_then(|s| s.to_str()) == Some("mca")
            })
        })
        .count();

    Ok(count)
}


#[tauri::command]
pub fn analyze_region(file_path: &str) -> Result<RegionAnalysis, String> {
    let path = Path::new(file_path);
    let file_name = path.file_name().and_then(|n| n.to_str()).unwrap_or("").to_string();

    let mut file = File::open(path).map_err(|e| e.to_string())?;
    let mut data = Vec::new();
    file.read_to_end(&mut data).map_err(|e| e.to_string())?;

    let region = RegionReader::new(&data).map_err(|e| e.to_string())?;

    let chunks: Vec<ChunkInfo> = (0..32)
        .into_par_iter()
        .flat_map(|x| {
            (0..32)
                .into_par_iter()
                .filter_map(|z| {
                    let chunk = region.get_chunk(x, z).ok()??;
                    let decompressed = chunk.decompress().ok()?;

                    // Selective NBT parsing
                    let (x_pos, z_pos, biomes) = parse_chunk_data(&decompressed)?;

                    // Early bailout condition
                    if x_pos.abs() > 1000 || z_pos.abs() > 1000 {
                        return None;
                    }

                    let dominant_biome = calculate_dominant_biome(biomes);

                    Some(ChunkInfo {
                        x: x_pos,
                        z: z_pos,
                        size: decompressed.len(),
                        dominant_biome,
                    })
                })
                .collect::<Vec<ChunkInfo>>()
        })
        .collect();

    Ok(RegionAnalysis {
        file_name,
        chunks,
    })
}


fn parse_chunk_data(data: &[u8]) -> Option<(i32, i32, Vec<i32>)> {
    let root: Value = from_bytes(data).ok()?;

    if let Value::Compound(root_compound) = root {
        if let Some(Value::Compound(level)) = root_compound.get("Level") {
            let x_pos = level.get("xPos").and_then(|v| if let Value::Int(x) = v { Some(*x) } else { None })?;
            let z_pos = level.get("zPos").and_then(|v| if let Value::Int(z) = v { Some(*z) } else { None })?;

            let biomes = if let Some(Value::IntArray(biomes)) = level.get("Biomes") {
                biomes.clone()
            } else {
                return None;
            };

            return Some((x_pos, z_pos, biomes.to_vec()));
        }
    }

    None
}

// Optimized biome calculation
pub(crate) fn calculate_dominant_biome(biomes: Vec<i32>) -> i32 {
    let mut biome_counts = HashMap::new();
    let mut max_count = 0;
    let mut dominant_biome = -1;

    for biome in biomes {
        let count = biome_counts.entry(biome).or_insert(0);
        *count += 1;
        if *count > max_count {
            max_count = *count;
            dominant_biome = biome;
        }
    }

    dominant_biome
}

fn generate_spiral_coordinates(limit: i32) -> Vec<RegionCoordinate> {
    let mut coords = Vec::new();
    let mut x = 0;
    let mut z = 0;
    let mut dx = 0;
    let mut dz = -1;
    let mut t = 0;
    let max_t = limit * 2;

    for _ in 0..max_t {
        if (-limit <= x && x <= limit) && (-limit <= z && z <= limit) {
            coords.push(RegionCoordinate { x, z });
        }

        if x == z || (x < 0 && x == -z) || (x > 0 && x == 1 - z) {
            let temp = dx;
            dx = -dz;
            dz = temp;
        }

        x += dx;
        z += dz;
        t += 1;
    }

    coords
}

fn parse_region_coordinates(file_name: &str) -> Option<RegionCoordinate> {
    let parts: Vec<&str> = file_name.trim_end_matches(".mca").split('.').collect();
    if parts.len() == 3 && parts[0] == "r" {
        let x = parts[1].parse().ok()?;
        let z = parts[2].parse().ok()?;
        Some(RegionCoordinate { x, z })
    } else {
        None
    }
}
