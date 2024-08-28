pub mod models;

use rusqlite::{Connection, Result};
use std::path::Path;
use std::sync::{Arc, Mutex};

pub type DbConnection = Arc<Mutex<Connection>>;

pub fn init_db(path: &Path) -> Result<DbConnection> {
    let conn = Connection::open(path)?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS chunks (
            id INTEGER PRIMARY KEY,
            x INTEGER NOT NULL,
            z INTEGER NOT NULL,
            biome TEXT NOT NULL
        )",
        [],
    )?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS entities (
            id INTEGER PRIMARY KEY,
            chunk_id INTEGER NOT NULL,
            entity_type TEXT NOT NULL,
            x REAL NOT NULL,
            y REAL NOT NULL,
            z REAL NOT NULL,
            FOREIGN KEY(chunk_id) REFERENCES chunks(id)
        )",
        [],
    )?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS blocks (
            id INTEGER PRIMARY KEY,
            chunk_id INTEGER NOT NULL,
            block_type TEXT NOT NULL,
            x INTEGER NOT NULL,
            y INTEGER NOT NULL,
            z INTEGER NOT NULL,
            FOREIGN KEY(chunk_id) REFERENCES chunks(id)
        )",
        [],
    )?;

    Ok(Arc::new(Mutex::new(conn)))
}