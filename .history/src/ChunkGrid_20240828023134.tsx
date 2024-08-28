import React, { useEffect, useRef, useState } from "react";
import * as echarts from "echarts";
import { getBiomeColor, getBiomeName } from "./biomeUtils"; // Adjust the path as necessary

const ChunkGrid = ({ regions }) => {
	const chartRef = useRef(null);
	const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
	const [selectedChunk, setSelectedChunk] = useState(null);
	const [gridData, setGridData] = useState([]); // Store the grid data incrementally
	const [zoomState, setZoomState] = useState(null);

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

		const chartInstance = echarts.init(chartRef.current);

		// Initialize the chart only once
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
				min: -Infinity, // No fixed min/max, adapt to new data
				max: Infinity,
				splitLine: {
					show: false,
				},
			},
			yAxis: {
				type: "value",
				min: -Infinity, // No fixed min/max, adapt to new data
				max: Infinity,
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
					data: gridData,
					encode: {
						x: 0,
						y: 1,
						color: 2,
						itemName: 3,
					},
				},
			],
			dataZoom: zoomState || [
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

		chartInstance.setOption(option);

		window.addEventListener("resize", handleResize);
		chartInstance.resize();

		return () => {
			window.removeEventListener("resize", handleResize);
			chartInstance.dispose();
		};
	}, []); // Initialize once

	useEffect(() => {
		if (!chartRef.current || regions.length === 0) return;

		const newGridData = [];
		let minX = Infinity;
		let maxX = -Infinity;
		let minY = Infinity;
		let maxY = -Infinity;

		regions.forEach((region) => {
			region.chunks.forEach((chunk) => {
				const dataPoint = {
					x: chunk.x,
					y: chunk.z,
					color: getBiomeColor(chunk.dominant_biome),
					chunkInfo: chunk,
				};

				newGridData.push([
					dataPoint.x,
					dataPoint.y,
					dataPoint.color,
					dataPoint.chunkInfo,
				]);

				// Update min and max for X and Y to handle negative coordinates
				if (chunk.x < minX) minX = chunk.x;
				if (chunk.x > maxX) maxX = chunk.x;
				if (chunk.z < minY) minY = chunk.z;
				if (chunk.z > maxY) maxY = chunk.z;
			});
		});

		// Append new data to the existing gridData
		setGridData((prevGridData) => {
			const updatedData = [...prevGridData, ...newGridData];
			const chartInstance = echarts.getInstanceByDom(chartRef.current);
			chartInstance.setOption({
				series: [{ data: updatedData }],
				xAxis: {
					min: minX - 1,
					max: maxX + 1,
				},
				yAxis: {
					min: minY - 1,
					max: maxY + 1,
				},
			});
			return updatedData;
		});
	}, [regions]);

	return (
		<div>
			<div
				ref={chartRef}
				style={{
					width: `${containerSize.width}px`,
					height: `${containerSize.height}px`,
					minHeight: "600px", // Increased size for better visibility
					minWidth: "600px", // Increased size for better visibility
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
				</div>
			)}
		</div>
	);
};

export default ChunkGrid;
