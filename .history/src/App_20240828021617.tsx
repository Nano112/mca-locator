import React, { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { open } from "@tauri-apps/api/dialog";
import { listen, once } from "@tauri-apps/api/event";
import ChunkGrid from "./ChunkGrid"; // Import the ECharts component

function App() {
	const [analysisResult, setAnalysisResult] = useState({ regions: [] });
	const [progress, setProgress] = useState(0);
	const [totalRegions, setTotalRegions] = useState(0);
	const [processing, setProcessing] = useState(false);

	useEffect(() => {
		const unlisten = listen("region-analyzed", (event) => {
			setAnalysisResult((prevResult) => ({
				...prevResult,
				regions: [...prevResult.regions, event.payload],
			}));
			setProgress((prevProgress) => prevProgress + 1);
		});

		const completeUnlisten = once("analysis-completed", () => {
			setProcessing(false);
		});

		return () => {
			unlisten.then((fn) => fn());
			completeUnlisten.then((fn) => fn());
		};
	}, []);

	async function openFolder() {
		const selected = await open({
			directory: true,
			multiple: false,
		});

		if (selected) {
			try {
				setProcessing(true);
				setProgress(0);
				setAnalysisResult({ regions: [] });

				// Get the total number of files to process
				const entries = await invoke("get_mca_file_count", { path: selected });
				setTotalRegions(entries);

				await invoke("analyze_mca_folder", { path: selected });
			} catch (error) {
				console.error("Error analyzing folder:", error);
				setProcessing(false);
			}
		}
	}

	return (
		<div className="p-4 min-h-screen bg-base-200">
			<h1 className="text-4xl font-bold mb-8 text-center">MCA Analyzer</h1>
			<div className="flex flex-col md:flex-row gap-8 h-full">
				<div className="flex-1 flex flex-col">
					<div className="card bg-base-100 shadow-xl flex-1">
						<div className="card-body flex flex-col">
							<h2 className="card-title">Control Panel</h2>
							<button
								className={`btn btn-primary ${
									processing ? "btn-disabled" : ""
								}`}
								onClick={openFolder}
								disabled={processing}
							>
								Select MCA Folder
							</button>
							{processing && (
								<div className="mt-4">
									<p>
										Progress: {progress} / {totalRegions} regions analyzed
									</p>
								</div>
							)}
							{analysisResult.regions.length > 0 && (
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
				<div className="flex-1 flex flex-col h-full">
					<div className="card bg-base-100 shadow-xl flex-1">
						<div className="card-body flex flex-col h-full">
							<h2 className="card-title">Chunk Visualization</h2>
							<div className="flex-1 flex items-center justify-center">
								{analysisResult.regions.length > 0 ? (
									<ChunkGrid regions={analysisResult.regions} />
								) : (
									<p>Select a folder to visualize chunks</p>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default App;
