"use client";

import { useEffect, useRef } from 'react';

const PigletAvatar: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Simple 3D-ish placeholder cube
    const drawCube = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Set up gradient for 3D effect
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#8B5CF6');
      gradient.addColorStop(1, '#6366F1');
      
      ctx.fillStyle = gradient;
      ctx.strokeStyle = '#A78BFA';
      ctx.lineWidth = 2;

      // Draw main face
      ctx.fillRect(80, 60, 120, 120);
      ctx.strokeRect(80, 60, 120, 120);

      // Draw "3D" edges
      ctx.fillStyle = '#6366F1';
      ctx.beginPath();
      ctx.moveTo(200, 60);
      ctx.lineTo(220, 40);
      ctx.lineTo(220, 160);
      ctx.lineTo(200, 180);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Top face
      ctx.fillStyle = '#8B5CF6';
      ctx.beginPath();
      ctx.moveTo(80, 60);
      ctx.lineTo(100, 40);
      ctx.lineTo(220, 40);
      ctx.lineTo(200, 60);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Add "Piglet" text placeholder
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('🐷', 140, 130);
    };

    drawCube();
  }, []);

  return (
    <div className="flex flex-col items-center space-y-4">
      <canvas
        ref={canvasRef}
        width={300}
        height={200}
        className="border border-gray-600 rounded-lg bg-gray-800"
      />
      <h2 className="text-xl font-semibold text-gray-300">PigletChat AI</h2>
    </div>
  );
};

export default PigletAvatar; 