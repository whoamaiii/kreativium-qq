interface ConfettiParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rotation: number;
  rotationSpeed: number;
  gravity: number;
}

const COLORS = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd', '#98d8c8'];

export function launchConfetti(element: HTMLElement, duration: number = 3000): void {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Position canvas over the element
  const rect = element.getBoundingClientRect();
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '9999';
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  document.body.appendChild(canvas);

  const particles: ConfettiParticle[] = [];
  const particleCount = 50;

  // Create particles
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
      vx: (Math.random() - 0.5) * 10,
      vy: Math.random() * -8 - 2,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: Math.random() * 6 + 2,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      gravity: 0.3,
    });
  }

  const startTime = Date.now();

  function animate() {
    const elapsed = Date.now() - startTime;
    
    if (elapsed >= duration) {
      document.body.removeChild(canvas);
      return;
    }

    ctx!.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((particle) => {
      // Update physics
      particle.vy += particle.gravity;
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.rotation += particle.rotationSpeed;

      // Draw particle
      ctx!.save();
      ctx!.translate(particle.x, particle.y);
      ctx!.rotate((particle.rotation * Math.PI) / 180);
      ctx!.fillStyle = particle.color;
      ctx!.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
      ctx!.restore();
    });

    requestAnimationFrame(animate);
  }

  animate();
} 