import * as PIXI from "pixi.js";
import React, { useEffect, useCallback } from "react";

const ChunkGrid = ({ regions }) => {
	const initializePixi = useCallback(
		(container) => {
			if (container && !container.initialized) {
				container.initialized = true;

				try {
					// Create a Pixi Application
					const app = new PIXI.Application({
						width: container.clientWidth,
						height: container.clientHeight,
						antialias: true,
						resolution: 1,
						backgroundColor: 0x1099bb,
					});

					// Append PixiJS canvas to the container
					container.appendChild(app.view);

					const gridContainer = new PIXI.Container();
					app.stage.addChild(gridContainer);

					// Initial scale for zooming
					gridContainer.scale.set(1);

					// Zoom interaction
					app.view.addEventListener("wheel", (event) => {
						event.preventDefault();
						const zoom = event.deltaY > 0 ? 0.9 : 1.1;
						gridContainer.scale.set(gridContainer.scale.x * zoom);
					});

					// Panning interaction
					let dragging = false;
					let lastPosition = { x: 0, y: 0 };

					app.view.addEventListener("mousedown", (event) => {
						dragging = true;
						lastPosition = { x: event.clientX, y: event.clientY };
					});

					app.view.addEventListener("mousemove", (event) => {
						if (dragging) {
							const deltaX = event.clientX - lastPosition.x;
							const deltaY = event.clientY - lastPosition.y;
							gridContainer.x += deltaX;
							gridContainer.y += deltaY;
							lastPosition = { x: event.clientX, y: event.clientY };
						}
					});

					app.view.addEventListener("mouseup", () => {
						dragging = false;
					});

					// Render chunks
					regions.forEach((region) => {
						region.chunks.forEach((chunk) => {
							const graphics = new PIXI.Graphics();
							graphics.beginFill(chunk.color);
							graphics.drawRect(chunk.x * 10, chunk.z * 10, 10, 10);
							graphics.endFill();
							gridContainer.addChild(graphics);
						});
					});
				} catch (error) {
					console.error("Error initializing PixiJS:", error);
				}
			}
		},
		[regions]
	);

	return <div ref={initializePixi} style={{ width: "100%", height: "100%" }} />;
};

export default ChunkGrid;
