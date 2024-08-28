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

	const CombinedChunkGrid = ({ regions }) => {
		const grid = Array(128)
			.fill()
			.map(() => Array(128).fill(null));

		regions.forEach((region) => {
			const [regionX, regionZ] = region.file_name
				.match(/r\.(-?\d+)\.(-?\d+)\.mca/)
				.slice(1)
				.map(Number);
			const baseX = (regionX + 2) * 32; // Offset by 2 to ensure positive coordinates
			const baseZ = (regionZ + 2) * 32;

			region.chunks.forEach((chunk) => {
				const gridX = baseX + chunk.x;
				const gridZ = baseZ + chunk.z;
				if (gridX >= 0 && gridX < 128 && gridZ >= 0 && gridZ < 128) {
					grid[gridZ][gridX] = { ...chunk, region: region.file_name };
				}
			});
		});

		return (
			<div
				className="grid grid-cols-128 gap-0"
				style={{ width: "512px", height: "512px" }}
			>
				{grid.map((row, z) =>
					row.map((chunk, x) => (
						<div
							key={`${x}-${z}`}
							className={`w-1 h-1 ${chunk ? "bg-green-500" : "bg-gray-700"}`}
							title={
								chunk
									? `Region: ${chunk.region}, Chunk ${chunk.x}, ${chunk.z}: ${chunk.size} bytes`
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
					<CombinedChunkGrid regions={analysisResult.regions} />
				</div>
			)}
		</div>
	);
}

export default App;
