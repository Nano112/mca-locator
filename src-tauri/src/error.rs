use std::fmt;
use mca::McaError;
use fastnbt::error::Error as FastNbtError;

#[derive(Debug)]
pub enum AnalyzerError {
    IoError(std::io::Error),
    McaError(McaError),
    FastNbtError(FastNbtError),
    OtherError(String),
}

impl fmt::Display for AnalyzerError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            AnalyzerError::IoError(e) => write!(f, "IO Error: {}", e),
            AnalyzerError::McaError(e) => write!(f, "MCA Error: {:?}", e),
            AnalyzerError::FastNbtError(e) => write!(f, "FastNBT Error: {}", e),
            AnalyzerError::OtherError(s) => write!(f, "Error: {}", s),
        }
    }
}

impl From<std::io::Error> for AnalyzerError {
    fn from(error: std::io::Error) -> Self {
        AnalyzerError::IoError(error)
    }
}

impl From<McaError> for AnalyzerError {
    fn from(error: McaError) -> Self {
        AnalyzerError::McaError(error)
    }
}

impl From<FastNbtError> for AnalyzerError {
    fn from(error: FastNbtError) -> Self {
        AnalyzerError::FastNbtError(error)
    }
}