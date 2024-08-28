import React, { useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { open } from "@tauri-apps/api/dialog";
import ChunkGrid from "./ChunkGrid"; // Import the ECharts component

function App() {
	const [analysisResult, setAnalysisResult] = useState(null);
	const [hoveredChunk, setHoveredChunk] = useState(null);

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

	return (
		<div className="container  p-4 min-h-screen bg-base-200">
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
						</div>
					</div>
				</div>
				<div className="flex-1">
					<div className="card bg-base-100 shadow-xl">
						<div className="card-body">
							<h2 className="card-title">Chunk Visualization</h2>
							{analysisResult ? (
								<ChunkGrid regions={analysisResult.regions} />
							) : (
								<p>Select a folder to visualize chunks</p>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default App;
