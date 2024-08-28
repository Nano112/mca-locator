import React, { useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { open } from "@tauri-apps/api/dialog";
import {
	MantineProvider,
	Button,
	Table,
	Accordion,
	Text,
	Container,
	Title,
	ColorSchemeProvider,
	ColorScheme,
	Switch,
	Group,
} from "@mantine/core";
import { useColorScheme } from "@mantine/hooks";

function App() {
	const [mcaFiles, setMcaFiles] = useState([]);
	const [selectedFile, setSelectedFile] = useState(null);
	const [analysis, setAnalysis] = useState(null);
	const preferredColorScheme = useColorScheme();
	const [colorScheme, setColorScheme] = useState(preferredColorScheme);

	const toggleColorScheme = (value) => {
		setColorScheme(value || (colorScheme === "dark" ? "light" : "dark"));
	};

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
		<ColorSchemeProvider
			colorScheme={colorScheme}
			toggleColorScheme={toggleColorScheme}
		>
			<MantineProvider
				theme={{ colorScheme }}
				withGlobalStyles
				withNormalizeCSS
			>
				<Container>
					<Group position="apart" mb="md">
						<Title order={1}>Minecraft Region Analyzer</Title>
						<Switch
							checked={colorScheme === "dark"}
							onChange={() => toggleColorScheme()}
							size="lg"
							onLabel="🌙"
							offLabel="☀️"
						/>
					</Group>

					<Button onClick={openFolder} mb="md">
						Select MCA Folder
					</Button>

					{mcaFiles.length > 0 && (
						<Table mb="md">
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
											<Button size="xs" onClick={() => analyzeRegion(file)}>
												Analyze
											</Button>
										</td>
									</tr>
								))}
							</tbody>
						</Table>
					)}

					{analysis && (
						<div>
							<Title order={2} mb="sm">
								Analysis for {analysis.file_name}
							</Title>
							<Text mb="sm">Total chunks: {analysis.chunks.length}</Text>
							<Accordion>
								{analysis.chunks.map((chunk, index) => (
									<Accordion.Item key={index} value={`chunk-${index}`}>
										<Accordion.Control>
											Chunk {chunk.x}, {chunk.z}
										</Accordion.Control>
										<Accordion.Panel>
											<Text>Size: {chunk.size} bytes</Text>
											<Text>Compression: {chunk.compression}</Text>
										</Accordion.Panel>
									</Accordion.Item>
								))}
							</Accordion>
						</div>
					)}
				</Container>
			</MantineProvider>
		</ColorSchemeProvider>
	);
}

export default App;
