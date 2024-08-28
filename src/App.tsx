import React, { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { open } from "@tauri-apps/api/dialog";
import { listen, once } from "@tauri-apps/api/event";
import CanvasWorldMap from './CanvasWorldMap';


function App() {
  const [analysisResult, setAnalysisResult] = useState({ regions: [] });
  const [progress, setProgress] = useState(0);
  const [totalRegions, setTotalRegions] = useState(0);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
	  const unlisten = listen("region-analyzed", (event) => {
		console.log(event.payload);
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
    <div className="min-h-screen p-4 bg-base-200 text-base-content">
      <div className="container mx-auto">
        <h1 className="mb-8 text-5xl font-bold text-center text-primary">MCA Analyzer</h1>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="flex flex-col">
            <div className="flex-1 shadow-xl card bg-base-100">
              <div className="card-body">
                <h2 className="mb-4 text-2xl card-title">Control Panel</h2>
                <button
                  className={`btn btn-primary btn-lg ${processing ? "loading" : ""}`}
                  onClick={openFolder}
                  disabled={processing}
                >
                  {processing ? "Analyzing..." : "Select MCA Folder"}
                </button>
                {processing && (
                  <div className="mt-4">
                    <progress className="w-full progress progress-primary" value={progress} max={totalRegions}></progress>
                    <p className="mt-2 text-center">
                      Analyzed {progress} / {totalRegions} regions
                    </p>
                  </div>
                )}
                {analysisResult.regions.length > 0 && (
                  <div className="mt-4 shadow stats">
                    <div className="stat">
                      <div className="stat-title">Regions analyzed</div>
                      <div className="stat-value">{analysisResult.regions.length}</div>
                    </div>
                    <div className="stat">
                      <div className="stat-title">Total chunks</div>
                      <div className="stat-value">
                        {analysisResult.regions.reduce(
                          (acc, region) => acc + region.chunks.length,
                          0
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex-1 shadow-xl card bg-base-100">
              <div className="card-body">
                <h2 className="mb-4 text-2xl card-title">Chunk Visualization</h2>
                <div className="flex items-center justify-center flex-1 overflow-hidden rounded-lg bg-base-300">
                  {analysisResult.regions.length > 0 ? (
                    <CanvasWorldMap regions={analysisResult.regions} />
                  ) : (
                    <p className="text-lg text-base-content/60">Select a folder to visualize chunks</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;