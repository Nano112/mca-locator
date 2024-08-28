import React, { useEffect, useRef } from "react";
import * as echarts from "echarts";

const ChunkGrid = ({ regions }) => {
	const chartRef = useRef(null);

	useEffect(() => {
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
						symbolSize: 10,
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

			return () => {
				chartInstance.dispose();
			};
		}
	}, [regions]);

	// take all the possible space and stay square and centered
	return (
		<div
			ref={chartRef}
			style={{ height: "100%", width: "100%" }}
			className="h-full w-full"
		/>
	);
};

export default ChunkGrid;
