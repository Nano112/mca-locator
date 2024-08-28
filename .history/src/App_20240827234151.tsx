import React, { useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { open } from "@tauri-apps/api/dialog";
import { ChevronDown, ChevronUp, Folder, FileText } from "lucide-react";

export default function App() {
	const [mcaFiles, setMcaFiles] = useState([]);
	const [selectedFile, setSelectedFile] = useState(null);
	const [analysis, setAnalysis] = useState(null);
	const [expandedChunks, setExpandedChunks] = useState({});

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
			// Optionally, you can set an error state here and display it to the user
		}
	}

	const toggleChunkExpansion = (index) => {
		setExpandedChunks((prev) => ({ ...prev, [index]: !prev[index] }));
	};

	const renderChunkInfo = (chunk) => {
		return (
			<div className="mt-2 ml-4 text-sm">
				{chunk.x_pos !== undefined && <p>X: {chunk.x_pos}</p>}
				{chunk.z_pos !== undefined && <p>Z: {chunk.z_pos}</p>}
				{chunk.y_pos !== undefined && <p>Y: {chunk.y_pos}</p>}
				{chunk.status && (
					<p>
						Status: {chunk.status.namespace}:{chunk.status.key}
					</p>
				)}
				{chunk.data_version !== undefined && (
					<p>Data Version: {chunk.data_version}</p>
				)}
				{chunk.last_update !== undefined && (
					<p>Last Update: {new Date(chunk.last_update).toLocaleString()}</p>
				)}
				{chunk.inhabited_time !== undefined && (
					<p>Inhabited Time: {chunk.inhabited_time}</p>
				)}
				{chunk.sections && <p>Sections: {chunk.sections.length}</p>}
				{chunk.block_entities && (
					<p>Block Entities: {chunk.block_entities.length}</p>
				)}
			</div>
		);
	};

	return (
		<div className="container mx-auto p-4 max-w-4xl">
			<h1 className="text-3xl font-bold mb-6 text-center text-blue-600">
				Minecraft Region Analyzer
			</h1>

			<div className="mb-8">
				<button
					onClick={openFolder}
					className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center justify-center w-full"
				>
					<Folder className="mr-2" />
					Select MCA Folder
				</button>
			</div>

			{mcaFiles.length > 0 && (
				<div className="mb-8">
					<h2 className="text-2xl font-semibold mb-4">MCA Files Found:</h2>
					<ul className="space-y-2">
						{mcaFiles.map((file, index) => (
							<li
								key={index}
								className="flex items-center justify-between bg-gray-100 p-3 rounded"
							>
								<span className="flex items-center">
									<FileText className="mr-2 text-gray-600" />
									{file.split("/").pop()}
								</span>
								<button
									onClick={() => analyzeRegion(file)}
									className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-sm"
								>
									Analyze
								</button>
							</li>
						))}
					</ul>
				</div>
			)}

			{analysis && (
				<div className="bg-white shadow-md rounded-lg p-6">
					<h2 className="text-2xl font-semibold mb-4">
						Analysis for {analysis.file_name}
					</h2>
					<p className="mb-4">Total chunks: {analysis.chunks.length}</p>
					<h3 className="text-xl font-semibold mb-2">Chunk Information:</h3>
					<ul className="space-y-4">
						{analysis.chunks.slice(0, 10).map((chunk, index) => (
							<li key={index} className="border-b pb-2">
								<div
									className="flex justify-between items-center cursor-pointer"
									onClick={() => toggleChunkExpansion(index)}
								>
									<span className="font-medium">Chunk {index + 1}</span>
									{expandedChunks[index] ? <ChevronUp /> : <ChevronDown />}
								</div>
								{expandedChunks[index] && renderChunkInfo(chunk)}
							</li>
						))}
					</ul>
					{analysis.chunks.length > 10 && (
						<p className="mt-4 text-gray-600">
							... and {analysis.chunks.length - 10} more chunks
						</p>
					)}
				</div>
			)}
		</div>
	);
}
