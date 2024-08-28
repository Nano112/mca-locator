import React, { useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { open } from "@tauri-apps/api/dialog";

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
		try {
			const result = await invoke("analyze_region", { filePath });
			setAnalysis(result);
			console.log("Full analysis result:", result);
		} catch (error) {
			console.error("Error analyzing region:", error);
		}
	}

	return (
		<div className="container mx-auto p-4">
			<button className="btn btn-primary mb-4" onClick={openFolder}>
				Select MCA Folder
			</button>

			{mcaFiles.length > 0 && (
				<div className="overflow-x-auto mb-4">
					<table className="table w-full">
						<thead>
							<tr>
								<th>File Name</th>
								<th>Action</th>
							</tr>
						</thead>
						<tbody>
							{mcaFiles.map((file, index) => (
								<tr key={index}>
									<td>{file.split("/").pop()}</td>
									<td>
										<button
											className="btn btn-sm btn-outline"
											onClick={() => analyzeRegion(file)}
										>
											Analyze
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}

			{analysis && (
				<div>
					<h2 className="text-2xl font-bold mb-2">
						Analysis for {analysis.file_name}
					</h2>
					<p className="mb-2">Total chunks: {analysis.chunks.length}</p>
					<div className="space-y-2">
						{analysis.chunks.map((chunk, index) => (
							<div key={index} className="collapse collapse-arrow bg-base-200">
								<input type="radio" name="my-accordion-2" />
								<div className="collapse-title text-xl font-medium">
									Chunk {chunk.x}, {chunk.z}
								</div>
								<div className="collapse-content">
									<p>Size: {chunk.size} bytes</p>
									<p>Compression: {chunk.compression}</p>
								</div>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
}

export default App;
