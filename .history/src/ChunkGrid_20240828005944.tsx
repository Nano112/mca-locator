import React, { useEffect, useRef, useState } from "react";
import * as echarts from "echarts";

const biomeColors = {
	0: "#A0A0A0", // Example: Biome ID 0 (plains)
	1: "#00FF00", // Example: Biome ID 1 (forest)
	// Add more biome colors as needed
};

const ChunkGrid = ({ regions }) => {
	const chartRef = useRef(null);
	const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
	const [selectedChunk, setSelectedChunk] = useState(null);

	useEffect(() => {
		const handleResize = () => {
			if (chartRef.current) {
				const parent = chartRef.current.parentElement;
				const newSize = Math.min(parent.clientWidth, parent.clientHeight);
				setContainerSize({ width: newSize, height: newSize });
			}
		};

		window.addEventListener("resize", handleResize);
		handleResize(); // Initial size setting

		if (chartRef.current && regions) {
			const chartInstance = echarts.init(chartRef.current);

			const gridData = [];
			regions.forEach((region) => {
				region.chunks.forEach((chunk) => {
					gridData.push({
						x: chunk.x,
						y: chunk.z,
						color: biomeColors[chunk.dominant_biome] || "#000000",
						chunkInfo: chunk,
					});
				});
			});

			const option = {
				tooltip: {
					trigger: "item",
					formatter: (params) => {
						return `Chunk: (${params.data.x}, ${params.data.y})<br/>Biome: ${params.data.chunkInfo.dominant_biome}`;
					},
				},
				xAxis: {
					type: "value",
					min: 0,
					max: 32,
					splitLine: {
						show: false,
					},
				},
				yAxis: {
					type: "value",
					min: 0,
					max: 32,
					splitLine: {
						show: false,
					},
				},
				series: [
					{
						type: "custom",
						renderItem: (params, api) => {
							const x = api.value(0);
							const y = api.value(1);
							const size = api.size([1, 1]);
							const color = api.value(2);

							return {
								type: "rect",
								shape: {
									x: api.coord([x, y])[0],
									y: api.coord([x, y])[1],
									width: size[0],
									height: size[1],
								},
								style: {
									fill: color,
								},
							};
						},
						data: gridData.map((chunk) => [
							chunk.x,
							chunk.y,
							chunk.color,
							chunk.chunkInfo,
						]),
						encode: {
							x: 0,
							y: 1,
							color: 2,
							itemName: 3,
						},
					},
				],
				dataZoom: [
					{
						type: "inside",
						xAxisIndex: 0,
						yAxisIndex: 0,
					},
				],
			};

			chartInstance.on("click", function (params) {
				setSelectedChunk(params.data[3]); // params.data[3] contains the chunkInfo
			});

			chartInstance.setOption(option);

			window.addEventListener("resize", handleResize);
			chartInstance.resize();

			return () => {
				window.removeEventListener("resize", handleResize);
				chartInstance.dispose();
			};
		}
	}, [regions]);

	return (
		<div>
			<div
				ref={chartRef}
				style={{
					width: `${containerSize.width}px`,
					height: `${containerSize.height}px`,
					minHeight: "400px",
					minWidth: "400px",
				}}
			/>
			{selectedChunk && (
				<div className="chunk-info">
					<h3>Chunk Info</h3>
					<p>X: {selectedChunk.x}</p>
					<p>Z: {selectedChunk.z}</p>
					<p>Size: {selectedChunk.size} bytes</p>
					<pre>{JSON.stringify(selectedChunk.nbt_json, null, 2)}</pre>
				</div>
			)}
		</div>
	);
};

export default ChunkGrid;
