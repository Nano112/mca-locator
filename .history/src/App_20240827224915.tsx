import { useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { open } from "@tauri-apps/api/dialog";
import "./App.css";

function App() {
	const [greetMsg, setGreetMsg] = useState("");
	const [name, setName] = useState("");
	const [mcaFiles, setMcaFiles] = useState([]);

	async function openFolder() {
		const selected = await open({
			directory: true,
			multiple: false,
		});

		if (selected) {
			const files = await invoke("list_mca_files", { path: selected });
			setMcaFiles(files);
		}
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
							<li key={index}>{file}</li>
						))}
					</ul>
				</div>
			)}

			<form
				className="row"
				onSubmit={(e) => {
					e.preventDefault();
					greet();
				}}
			>
				<input
					id="greet-input"
					onChange={(e) => setName(e.currentTarget.value)}
					placeholder="Enter a name..."
				/>
				<button type="submit">Greet</button>
			</form>

			<p>{greetMsg}</p>
		</div>
	);
}

export default App;
