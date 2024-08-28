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
						gridData.push([gridX, gridZ]); // Store grid coordinates
					}
				});
			});

			const option = {
				tooltip: {
					trigger: "item",
					formatter: (params) => {
						return `Chunk: (${params.value[0]}, ${params.value[1]})`;
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
						type: "custom",
						renderItem: (params, api) => {
							const x = api.value(0);
							const y = api.value(1);
							const size = api.size([1, 1]);

							return {
								type: "rect",
								shape: {
									x: api.coord([x, y])[0],
									y: api.coord([x, y])[1],
									width: size[0],
									height: size[1],
								},
								style: {
									fill: "green",
								},
							};
						},
						data: gridData,
					},
				],
				dataZoom: [
					{
						type: "inside",
						xAxisIndex: [0],
						yAxisIndex: [0],
						filterMode: "none",
						zoomOnMouseWheel: false, // Disables the mouse wheel zoom
						moveOnMouseWheel: true, // Enables moving with mouse wheel
						moveOnMouseMove: true, // Enables moving with mouse move
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
