import React, { useEffect, useRef } from "react";
import * as PIXI from "pixi.js";

const ChunkGrid = ({ regions }) => {
	const pixiContainerRef = useRef(null);
	const appRef = useRef(null);

	useEffect(() => {
		if (!pixiContainerRef.current) return;

		// Create PixiJS application
		const app = new PIXI.Application({
			width: pixiContainerRef.current.clientWidth,
			height: pixiContainerRef.current.clientHeight,
			backgroundColor: 0x1099bb,
			resolution: window.devicePixelRatio || 1,
		});

		pixiContainerRef.current.appendChild(app.view);
		appRef.current = app;

		// Create a container for the grid
		const gridContainer = new PIXI.Container();
		app.stage.addChild(gridContainer);

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

		// Zoom functionality
		const zoom = (event) => {
			event.preventDefault();
			const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
			gridContainer.scale.x *= zoomFactor;
			gridContainer.scale.y *= zoomFactor;
		};

		// Pan functionality
		let isDragging = false;
		let prevX, prevY;

		const onMouseDown = (event) => {
			isDragging = true;
			prevX = event.clientX;
			prevY = event.clientY;
		};

		const onMouseMove = (event) => {
			if (!isDragging) return;
			const dx = event.clientX - prevX;
			const dy = event.clientY - prevY;
			gridContainer.position.x += dx;
			gridContainer.position.y += dy;
			prevX = event.clientX;
			prevY = event.clientY;
		};

		const onMouseUp = () => {
			isDragging = false;
		};

		// Add event listeners
		app.view.addEventListener("wheel", zoom);
		app.view.addEventListener("mousedown", onMouseDown);
		app.view.addEventListener("mousemove", onMouseMove);
		app.view.addEventListener("mouseup", onMouseUp);

		// Cleanup function
		return () => {
			app.view.removeEventListener("wheel", zoom);
			app.view.removeEventListener("mousedown", onMouseDown);
			app.view.removeEventListener("mousemove", onMouseMove);
			app.view.removeEventListener("mouseup", onMouseUp);
			app.destroy(true, { children: true, texture: true, baseTexture: true });
		};
	}, [regions]);

	return (
		<div ref={pixiContainerRef} style={{ width: "100%", height: "100%" }} />
	);
};

export default ChunkGrid;
