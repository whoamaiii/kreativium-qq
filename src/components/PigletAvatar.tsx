"use client";

import { useEffect, useRef } from 'react';

interface PigletAvatarProps {
  isConnected?: boolean;
  isRecording?: boolean;
}

const PigletAvatar: React.FC<PigletAvatarProps> = ({ isConnected = false, isRecording = false }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 400;
    canvas.height = 400;

    let time = 0;

    const drawSphere = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = 120;

      // Create radial gradient for 3D sphere effect
      const gradient = ctx.createRadialGradient(
        centerX - 30, centerY - 30, 0,
        centerX, centerY, radius
      );

      if (isRecording) {
        // Red glow when recording
        gradient.addColorStop(0, '#FF6B6B');
        gradient.addColorStop(0.3, '#FF5252');
        gradient.addColorStop(0.7, '#D32F2F');
        gradient.addColorStop(1, '#1A1A2E');
      } else if (isConnected) {
        // Blue glow when connected
        gradient.addColorStop(0, '#64B5F6');
        gradient.addColorStop(0.3, '#42A5F5');
        gradient.addColorStop(0.7, '#1E88E5');
        gradient.addColorStop(1, '#0D1B2A');
      } else {
        // Gray when disconnected
        gradient.addColorStop(0, '#90A4AE');
        gradient.addColorStop(0.3, '#78909C');
        gradient.addColorStop(0.7, '#546E7A');
        gradient.addColorStop(1, '#263238');
      }

      // Main sphere
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();

      // Outer glow effect
      if (isConnected) {
        const glowGradient = ctx.createRadialGradient(
          centerX, centerY, radius,
          centerX, centerY, radius + 30
        );
        
        if (isRecording) {
          glowGradient.addColorStop(0, 'rgba(255, 107, 107, 0.3)');
          glowGradient.addColorStop(1, 'rgba(255, 107, 107, 0)');
        } else {
          glowGradient.addColorStop(0, 'rgba(100, 181, 246, 0.3)');
          glowGradient.addColorStop(1, 'rgba(100, 181, 246, 0)');
        }
        
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius + 30, 0, Math.PI * 2);
        ctx.fill();
      }

      // Highlight/reflection
      const highlightGradient = ctx.createRadialGradient(
        centerX - 40, centerY - 40, 0,
        centerX - 40, centerY - 40, 60
      );
      highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
      highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      
      ctx.fillStyle = highlightGradient;
      ctx.beginPath();
      ctx.arc(centerX - 40, centerY - 40, 60, 0, Math.PI * 2);
      ctx.fill();

      // Subtle animation
      if (isConnected) {
        const pulseIntensity = Math.sin(time * 0.05) * 0.1 + 0.1;
        const pulseGradient = ctx.createRadialGradient(
          centerX, centerY, 0,
          centerX, centerY, radius
        );
        
        if (isRecording) {
          pulseGradient.addColorStop(0, `rgba(255, 255, 255, ${pulseIntensity})`);
        } else {
          pulseGradient.addColorStop(0, `rgba(100, 181, 246, ${pulseIntensity})`);
        }
        pulseGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = pulseGradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      time++;
    };

    const animate = () => {
      drawSphere();
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isConnected, isRecording]);

  return (
    <div className="flex flex-col items-center justify-center">
      <canvas
        ref={canvasRef}
        className="drop-shadow-2xl"
        style={{ background: 'transparent' }}
      />
    </div>
  );
};

export default PigletAvatar; 