import React, { useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { open } from "@tauri-apps/api/dialog";

function App() {
	const [analysisResult, setAnalysisResult] = useState(null);
	const [hoveredChunk, setHoveredChunk] = useState(null);
	const [zoomLevel, setZoomLevel] = useState(1);

	async function openFolder() {
		const selected = await open({
			directory: true,
			multiple: false,
		});

		if (selected) {
			try {
				const result = await invoke("analyze_mca_folder", { path: selected });
				setAnalysisResult(result);
				console.log("Full analysis result:", result);
			} catch (error) {
				console.error("Error analyzing folder:", error);
			}
		}
	}

	const CombinedChunkGrid = ({ regions }) => {
		const grid = Array(128)
			.fill()
			.map(() => Array(128).fill(null));

		regions.forEach((region) => {
			const [regionX, regionZ] = region.file_name
				.match(/r\.(-?\d+)\.(-?\d+)\.mca/)
				.slice(1)
				.map(Number);
			const baseX = (regionX + 2) * 32;
			const baseZ = (regionZ + 2) * 32;

			region.chunks.forEach((chunk) => {
				const gridX = baseX + chunk.x;
				const gridZ = baseZ + chunk.z;
				if (gridX >= 0 && gridX < 128 && gridZ >= 0 && gridZ < 128) {
					grid[gridZ][gridX] = { ...chunk, region: region.file_name };
				}
			});
		});

		const gridSize = 512 * zoomLevel;
		const cellSize = gridSize / 128;

		return (
			<div
				className="grid gap-0 border border-base-300 rounded-lg overflow-hidden"
				style={{
					gridTemplateColumns: `repeat(128, ${cellSize}px)`,
					gridTemplateRows: `repeat(128, ${cellSize}px)`,
					width: `${gridSize}px`,
					height: `${gridSize}px`,
				}}
			>
				{grid.map((row, z) =>
					row.map((chunk, x) => (
						<div
							key={`${x}-${z}`}
							className={`transition-colors duration-200 ${
								chunk
									? "bg-green-500 hover:bg-green-700"
									: "bg-gray-700 hover:bg-gray-600"
							}`}
							style={{
								width: `${cellSize}px`,
								height: `${cellSize}px`,
							}}
							onMouseEnter={() =>
								setHoveredChunk(chunk ? { ...chunk, gridX: x, gridZ: z } : null)
							}
							onMouseLeave={() => setHoveredChunk(null)}
						/>
					))
				)}
			</div>
		);
	};

	return (
		<div className="container mx-auto p-4 min-h-screen bg-base-200">
			<h1 className="text-4xl font-bold mb-8 text-center">MCA Analyzer</h1>
			<div className="flex flex-col md:flex-row gap-8">
				<div className="flex-1">
					<div className="card bg-base-100 shadow-xl">
						<div className="card-body">
							<h2 className="card-title">Control Panel</h2>
							<button className="btn btn-primary" onClick={openFolder}>
								Select MCA Folder
							</button>
							{analysisResult && (
								<div className="mt-4">
									<p>Regions analyzed: {analysisResult.regions.length}</p>
									<p>
										Total chunks:{" "}
										{analysisResult.regions.reduce(
											(acc, region) => acc + region.chunks.length,
											0
										)}
									</p>
								</div>
							)}
							<div className="mt-4 flex gap-2">
								<button
									className="btn btn-secondary"
									onClick={() => setZoomLevel(zoomLevel * 1.25)}
								>
									Zoom In
								</button>
								<button
									className="btn btn-secondary"
									onClick={() => setZoomLevel(zoomLevel * 0.8)}
								>
									Zoom Out
								</button>
							</div>
						</div>
					</div>
				</div>
				<div className="flex-1">
					<div className="card bg-base-100 shadow-xl">
						<div className="card-body">
							<h2 className="card-title">Chunk Visualization</h2>
							{analysisResult ? (
								<CombinedChunkGrid regions={analysisResult.regions} />
							) : (
								<p>Select a folder to visualize chunks</p>
							)}
						</div>
					</div>
				</div>
			</div>
			{hoveredChunk && (
				<div className="fixed bottom-4 right-4 card bg-base-100 shadow-xl">
					<div className="card-body">
						<h3 className="card-title">Chunk Info</h3>
						<p>Region: {hoveredChunk.region}</p>
						<p>
							Coordinates: ({hoveredChunk.x}, {hoveredChunk.z})
						</p>
						<p>
							Grid Position: ({hoveredChunk.gridX}, {hoveredChunk.gridZ})
						</p>
						<p>Size: {hoveredChunk.size} bytes</p>
					</div>
				</div>
			)}
		</div>
	);
}

export default App;
