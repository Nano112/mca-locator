import { useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { open } from "@tauri-apps/api/dialog";
import "./App.css";

function App() {
	const [mcaFiles, setMcaFiles] = useState([]);
	const [selectedFile, setSelectedFile] = useState(null);
	const [analysis, setAnalysis] = useState(null);

	async function openFolder() {
		const selected = await open({
			directory: true,
			multiple: false,
		});

		if (selected) {
			const files = await invoke("list_mca_files", { path: selected });
			setMcaFiles(files.map((file) => `${selected}/${file}`));
		}
	}

	async function analyzeRegion(filePath) {
		setSelectedFile(filePath);
		const result = await invoke("analyze_region", { filePath });
		setAnalysis(result);
	}

	return (
		<div className="container">
			<h1>Minecraft Region Analyzer</h1>

			<div className="row">
				<button onClick={openFolder}>Select MCA Folder</button>
			</div>

			{mcaFiles.length > 0 && (
				<div>
					<h2>MCA Files Found:</h2>
					<ul>
						{mcaFiles.map((file, index) => (
							<li key={index}>
								{file}
								<button onClick={() => analyzeRegion(file)}>Analyze</button>
							</li>
						))}
					</ul>
				</div>
			)}

			{analysis && (
				<div>
					<h2>Analysis for {analysis.file_name}</h2>
					<p>Total chunks: {analysis.chunks.length}</p>
					<h3>Chunk Information:</h3>
					<ul>
						{analysis.chunks.slice(0, 10).map((chunk, index) => (
							<li key={index}>
								Chunk ({chunk.x}, {chunk.z}): Status - {chunk.status}, Biomes -{" "}
								{chunk.biomes.join(", ")}
							</li>
						))}
					</ul>
					{analysis.chunks.length > 10 && (
						<p>... and {analysis.chunks.length - 10} more chunks</p>
					)}
				</div>
			)}
		</div>
	);
}

export default App;
