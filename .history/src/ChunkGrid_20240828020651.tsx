import React, { useEffect, useRef, useState } from "react";
import * as echarts from "echarts";
import { getBiomeColor, getBiomeName } from "./biomeUtils"; // Adjust the path as necessary

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
			let minX = Infinity;
			let maxX = -Infinity;
			let minY = Infinity;
			let maxY = -Infinity;

			regions.forEach((region) => {
				region.chunks.forEach((chunk) => {
					gridData.push({
						x: chunk.x,
						y: chunk.z,
						color: getBiomeColor(chunk.dominant_biome),
						chunkInfo: chunk,
					});

					// Update min and max for X and Y to handle negative coordinates
					if (chunk.x < minX) minX = chunk.x;
					if (chunk.x > maxX) maxX = chunk.x;
					if (chunk.z < minY) minY = chunk.z;
					if (chunk.z > maxY) maxY = chunk.z;
				});
			});

			const option = {
				tooltip: {
					trigger: "item",
					formatter: (params) => {
						const chunkInfo = params.data[3];
						const biomeName =
							chunkInfo.dominant_biome !== undefined
								? getBiomeName(chunkInfo.dominant_biome)
								: "N/A";
						return `Chunk: (${params.data[0]}, ${params.data[1]})<br/>Biome: ${biomeName}`;
					},
				},
				xAxis: {
					type: "value",
					min: minX - 1, // Extend slightly to avoid clipping
					max: maxX + 1, // Extend slightly to avoid clipping
					splitLine: {
						show: false,
					},
				},
				yAxis: {
					type: "value",
					min: minY - 1, // Extend slightly to avoid clipping
					max: maxY + 1, // Extend slightly to avoid clipping
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
						filterMode: "none",
					},
					{
						type: "inside",
						yAxisIndex: 0,
						filterMode: "none",
					},
					{
						type: "slider",
						xAxisIndex: 0,
						filterMode: "none",
					},
					{
						type: "slider",
						yAxisIndex: 0,
						filterMode: "none",
					},
				],
				grid: {
					containLabel: true,
				},
			};

			chartInstance.on("click", function (params) {
				const chunkInfo = params.data[3];
				if (chunkInfo) {
					setSelectedChunk(chunkInfo);
				}
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
					<p>
						Chunk Dominant Biome: {getBiomeName(selectedChunk.dominant_biome)} (
						ID:{selectedChunk.dominant_biome} )
					</p>
					{/* <pre>{JSON.stringify(selectedChunk.nbt_json, null, 2)}</pre> */}
				</div>
			)}
		</div>
	);
};

export default ChunkGrid;
