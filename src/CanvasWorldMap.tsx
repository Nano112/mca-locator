import React, { useState, useEffect, useRef } from 'react';
import { getBiomeColor, getBiomeName } from "./biomeUtils";

const CanvasWorldMap = ({ regions }) => {
  const [selectedChunk, setSelectedChunk] = useState(null);
  const [debug, setDebug] = useState({ chunkCount: 0, minX: 0, maxX: 0, minZ: 0, maxZ: 0 });
  const canvasRef = useRef(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (!canvasRef.current || regions.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    let chunkCount = 0;
    let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;

    const chunkSize = 16;
    const scaleFactor = 1;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(scale, scale);
    ctx.translate(-canvas.width / 2 + offset.x, -canvas.height / 2 + offset.y);

    regions.forEach(region => {
      region.chunks.forEach(chunk => {
        chunkCount++;
        minX = Math.min(minX, chunk.x);
        maxX = Math.max(maxX, chunk.x);
        minZ = Math.min(minZ, chunk.z);
        maxZ = Math.max(maxZ, chunk.z);

        ctx.fillStyle = getBiomeColor(chunk.dominant_biome);
        ctx.fillRect(
          chunk.x * chunkSize * scaleFactor,
          chunk.z * chunkSize * scaleFactor,
          chunkSize * scaleFactor,
          chunkSize * scaleFactor
        );
      });
    });

    ctx.restore();

    setDebug({ chunkCount, minX, maxX, minZ, maxZ });

    ctx.fillStyle = 'white';
    ctx.font = '12px Arial';
    ctx.fillText(`Chunks: ${chunkCount}, X: ${minX} to ${maxX}, Z: ${minZ} to ${maxZ}`, 10, 20);

  }, [regions, offset, scale]);

  const handleWheel = (event) => {
    event.preventDefault();
    const newScale = scale * (event.deltaY < 0 ? 1.1 : 0.9);
    setScale(newScale);
  };

  const handleMouseDown = (event) => {
    const startX = event.clientX;
    const startY = event.clientY;
    const startOffset = { ...offset };

    const handleMouseMove = (moveEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      setOffset({
        x: startOffset.x + dx / scale,
        y: startOffset.y + dy / scale,
      });
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleClick = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left - canvas.width / 2) / scale + canvas.width / 2 - offset.x;
    const y = (event.clientY - rect.top - canvas.height / 2) / scale + canvas.height / 2 - offset.y;

    const chunkSize = 16;
    const chunkX = Math.floor(x / chunkSize);
    const chunkZ = Math.floor(y / chunkSize);

    const clickedChunk = regions.flatMap(r => r.chunks).find(c => c.x === chunkX && c.z === chunkZ);
    if (clickedChunk) {
      setSelectedChunk(clickedChunk);
    }
  };

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onClick={handleClick}
        className="w-full h-full cursor-move"
      />
      {selectedChunk && (
        <div className="absolute p-4 rounded-lg shadow-lg bottom-4 left-4 bg-base-200">
          <h3 className="mb-2 text-lg font-semibold">Chunk Info</h3>
          <p>X: {selectedChunk.x}</p>
          <p>Z: {selectedChunk.z}</p>
          <p>Size: {selectedChunk.size} bytes</p>
          <p>Biome: {getBiomeName(selectedChunk.dominant_biome)} (ID: {selectedChunk.dominant_biome})</p>
        </div>
      )}
      <div className="absolute p-2 text-sm bg-opacity-75 rounded-lg top-4 left-4 bg-base-200">
        Chunks: {debug.chunkCount}, X: {debug.minX} to {debug.maxX}, Z: {debug.minZ} to {debug.maxZ}
      </div>
    </div>
  );
};

export default CanvasWorldMap;