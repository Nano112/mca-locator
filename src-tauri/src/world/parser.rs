use fastnbt::{from_bytes, Value};
use crate::db::models::{Chunk, Entity, Block};
use crate::db::DbConnection;
use anyhow::Result;
use std::collections::HashMap;

pub fn parse_chunk_data(data: &[u8], conn: &DbConnection) -> Result<()> {
    let root: Value = from_bytes(data)?;

    if let Value::Compound(root_compound) = root {
        if let Some(Value::Compound(level)) = root_compound.get("Level") {
            let x_pos = level.get("xPos").and_then(|v| if let Value::Int(x) = v { Some(*x) } else { None }).unwrap_or(0);
            let z_pos = level.get("zPos").and_then(|v| if let Value::Int(z) = v { Some(*z) } else { None }).unwrap_or(0);

            
        }
    }

    Ok(())
}


