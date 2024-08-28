import * as PIXI from "pixi.js";
import React, { useEffect, useRef } from "react";

const ChunkGrid = ({ regions }) => {
	const pixiContainer = useRef(null);
	const appRef = useRef(null);

	useEffect(() => {
		if (!pixiContainer.current || appRef.current) return;

		try {
			// Create a Pixi Application
			const app = new PIXI.Application({
				width: pixiContainer.current.clientWidth,
				height: pixiContainer.current.clientHeight,
				antialias: true,
				resolution: 1,
				backgroundColor: 0x1099bb,
			});

			if (!app.view) {
				console.error(
					"PixiJS app.view is undefined. Something went wrong during initialization."
				);
				return;
			}

			pixiContainer.current.appendChild(app.view);
			appRef.current = app;

			// Basic test to ensure PIXI is rendering correctly
			const testGraphic = new PIXI.Graphics();
			testGraphic.beginFill(0xff0000);
			testGraphic.drawRect(0, 0, 100, 100);
			testGraphic.endFill();

			app.stage.addChild(testGraphic);
		} catch (error) {
			console.error("Error initializing PixiJS:", error);
		}

		return () => {
			if (appRef.current) {
				appRef.current.destroy(true, true);
				appRef.current = null;
			}
		};
	}, []); // Notice the empty dependency array, ensuring this effect runs only once

	return <div ref={pixiContainer} style={{ width: "100%", height: "100%" }} />;
};

export default ChunkGrid;
