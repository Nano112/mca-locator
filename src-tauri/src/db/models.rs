use serde::{Serialize, Deserialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Chunk {
    pub id: Option<i64>,
    pub x: i32,
    pub z: i32,
    pub biome: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Entity {
    pub id: Option<i64>,
    pub chunk_id: i64,
    pub entity_type: String,
    pub x: f64,
    pub y: f64,
    pub z: f64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Block {
    pub id: Option<i64>,
    pub chunk_id: i64,
    pub block_type: String,
    pub x: i32,
    pub y: i32,
    pub z: i32,
}

#[derive(Serialize, Clone)]
pub struct ChunkInfo {
    pub x: i32,
    pub z: i32,
    pub size: usize,
    pub dominant_biome: i32,
}

#[derive(Serialize, Clone)]
pub struct RegionAnalysis {
    pub file_name: String,
    pub chunks: Vec<ChunkInfo>,
}