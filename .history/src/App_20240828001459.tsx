import React, { useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { open } from "@tauri-apps/api/dialog";
import { Button } from "@/components/ui/button";

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
		<div className="bg-background text-foreground min-h-screen p-4">
			<Button onClick={openFolder} className="mb-4">
				Select MCA Folder
			</Button>

			{mcaFiles.length > 0 && (
				<Table className="mb-4">
					<TableHeader>
						<TableRow>
							<TableHead>File Name</TableHead>
							<TableHead>Action</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{mcaFiles.map((file, index) => (
							<TableRow key={index}>
								<TableCell>{file.split("/").pop()}</TableCell>
								<TableCell>
									<Button
										variant="outline"
										size="sm"
										onClick={() => analyzeRegion(file)}
									>
										Analyze
									</Button>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			)}

			{analysis && (
				<div>
					<h2 className="text-2xl font-bold mb-2">
						Analysis for {analysis.file_name}
					</h2>
					<p className="mb-2">Total chunks: {analysis.chunks.length}</p>
					<Accordion type="single" collapsible className="w-full">
						{analysis.chunks.map((chunk, index) => (
							<AccordionItem key={index} value={`chunk-${index}`}>
								<AccordionTrigger>
									Chunk {chunk.x}, {chunk.z}
								</AccordionTrigger>
								<AccordionContent>
									<p>Size: {chunk.size} bytes</p>
									<p>Compression: {chunk.compression}</p>
								</AccordionContent>
							</AccordionItem>
						))}
					</Accordion>
				</div>
			)}
		</div>
	);
}

export default App;
