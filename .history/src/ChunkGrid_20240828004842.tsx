import React, { useEffect, useRef, useState } from "react";
import * as echarts from "echarts";

const ChunkGrid = ({ regions }) => {
	const chartRef = useRef(null);
	const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

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
				const [regionX, regionZ] = region.file_name
					.match(/r\.(-?\d+)\.(-?\d+)\.mca/)
					.slice(1)
					.map(Number);
				const baseX = (regionX + 2) * 32;
				const baseZ = (regionZ + 2) * 32;

				region.chunks.forEach((chunk) => {
					const gridX = baseX + chunk.x;
					const gridZ = baseZ + chunk.z;
					if (gridX >= 0 && gridX < 128 && gridZ >= 0 && gridZ < 128) {
						gridData.push({
							name: `Chunk (${gridX}, ${gridZ})`,
							value: [gridX, gridZ],
							itemStyle: {
								color: "green", // Color for chunks with data
							},
						});
					}
				});
			});

			const option = {
				tooltip: {
					trigger: "item",
					formatter: (params) => {
						return `Chunk: ${params.name}<br/>Position: (${params.value[0]}, ${params.value[1]})`;
					},
				},
				xAxis: {
					type: "value",
					min: 0,
					max: 128,
					splitLine: {
						show: false,
					},
				},
				yAxis: {
					type: "value",
					min: 0,
					max: 128,
					splitLine: {
						show: false,
					},
				},
				series: [
					{
						type: "scatter",
						symbol: "rect",
						symbolSize: (value) => {
							// Calculate the size of each square
							return 512 / 128;
						},
						data: gridData,
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
			};

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
		<div
			ref={chartRef}
			style={{
				width: `${containerSize.width}px`,
				height: `${containerSize.height}px`,
				minHeight: "400px",
				minWidth: "400px",
			}}
		/>
	);
};

export default ChunkGrid;
