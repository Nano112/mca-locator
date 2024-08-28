import React, { useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { open } from "@tauri-apps/api/dialog";

function App() {
	const [analysisResult, setAnalysisResult] = useState(null);

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

	const ChunkGrid = ({ chunks }) => {
		const grid = Array(32)
			.fill()
			.map(() => Array(32).fill(null));
		chunks.forEach((chunk) => {
			grid[chunk.z][chunk.x] = chunk;
		});

		return (
			<div className="grid grid-cols-32 gap-0">
				{grid.map((row, z) =>
					row.map((chunk, x) => (
						<div
							key={`${x}-${z}`}
							className={`w-4 h-4 ${chunk ? "bg-green-500" : "bg-gray-700"}`}
							title={
								chunk
									? `Chunk ${x}, ${z}: ${chunk.size} bytes`
									: `Empty chunk ${x}, ${z}`
							}
						/>
					))
				)}
			</div>
		);
	};

	return (
		<div className="container mx-auto p-4">
			<button className="btn btn-primary mb-4" onClick={openFolder}>
				Select MCA Folder
			</button>

			{analysisResult && (
				<div>
					<h2 className="text-2xl font-bold mb-4">Analysis Results</h2>
					{analysisResult.regions.map((region, index) => (
						<div key={index} className="mb-8">
							<h3 className="text-xl font-semibold mb-2">{region.file_name}</h3>
							<ChunkGrid chunks={region.chunks} />
						</div>
					))}
				</div>
			)}
		</div>
	);
}

export default App;
