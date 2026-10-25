import React, { useEffect, useRef } from 'react';

/**
 * Interactive Aurora Gradient Canvas with Bokeh Specks and Subtle Noise
 *
 * Implements:
 * - 4 drifting soft light pools following mouse cursor with lerp easing
 * - 50 faint, blurred floating bokeh specks
 * - Offscreen noise pattern overlay to prevent color banding
 * - Capped DPR (1.5) for high performance
 * - Visibility change pause and prefers-reduced-motion support
 */
export default function GradientBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Detect prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Read colors from CSS custom properties with fallbacks
    const computedStyles = getComputedStyle(document.documentElement);
    const bgBase = computedStyles.getPropertyValue('--bg-base').trim() || '#120F2B';
    const blob1Color = computedStyles.getPropertyValue('--blob-1').trim() || '#6A2A63';
    const blob2Color = computedStyles.getPropertyValue('--blob-2').trim() || '#3B2A80';
    const blob3Color = computedStyles.getPropertyValue('--blob-3').trim() || '#1F4A94';
    const blob4Color = computedStyles.getPropertyValue('--blob-4').trim() || '#2A2370';

    // Helper: convert hex to rgba
    const hexToRgba = (hex, alpha) => {
      let c = hex.replace('#', '');
      if (c.length === 3) c = c.split('').map(x => x + x).join('');
      const num = parseInt(c, 16);
      return `rgba(${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}, ${alpha})`;
    };

    let width = 0;
    let height = 0;
    let dpr = 1;
    let animationFrameId;
    let isTabVisible = !document.hidden;

    // Mouse / Pointer coordinates
    const pointer = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      targetX: window.innerWidth / 2,
      targetY: window.innerHeight / 2,
      isInteracting: false,
      lastMoved: Date.now()
    };

    // 4 Dynamic Light Pools (Blobs)
    const blobs = [
      {
        color: blob1Color,
        baseXRatio: 0.2,
        baseYRatio: 0.25,
        x: 0,
        y: 0,
        targetX: 0,
        targetY: 0,
        radiusRatio: 0.42,
        speed: 0.0007,
        lerp: 0.03,
        phase: 0,
        amp: 90
      },
      {
        color: blob2Color,
        baseXRatio: 0.35,
        baseYRatio: 0.65,
        x: 0,
        y: 0,
        targetX: 0,
        targetY: 0,
        radiusRatio: 0.48,
        speed: 0.0009,
        lerp: 0.05,
        phase: 2.1,
        amp: 110
      },
      {
        color: blob3Color,
        baseXRatio: 0.8,
        baseYRatio: 0.3,
        x: 0,
        y: 0,
        targetX: 0,
        targetY: 0,
        radiusRatio: 0.45,
        speed: 0.0008,
        lerp: 0.025,
        phase: 4.2,
        amp: 100
      },
      {
        color: blob4Color,
        baseXRatio: 0.65,
        baseYRatio: 0.8,
        x: 0,
        y: 0,
        targetX: 0,
        targetY: 0,
        radiusRatio: 0.52,
        speed: 0.0006,
        lerp: 0.04,
        phase: 1.2,
        amp: 80
      }
    ];

    // Generate 50 faint floating bokeh specks
    const BOKEH_COUNT = 50;
    const bokehSpecks = Array.from({ length: BOKEH_COUNT }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      radius: 1.2 + Math.random() * 2.4,
      alpha: 0.06 + Math.random() * 0.16,
      vx: (Math.random() - 0.5) * 0.18,
      vy: -0.15 - Math.random() * 0.25,
      pulseSpeed: 0.001 + Math.random() * 0.002,
      pulsePhase: Math.random() * Math.PI * 2
    }));

    // Pre-render offscreen noise pattern
    let noisePattern = null;
    const createNoisePattern = () => {
      const noiseCanvas = document.createElement('canvas');
      const size = 128;
      noiseCanvas.width = size;
      noiseCanvas.height = size;
      const noiseCtx = noiseCanvas.getContext('2d');
      if (!noiseCtx) return;

      const imgData = noiseCtx.createImageData(size, size);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        const val = Math.random() * 255;
        data[i] = val;
        data[i + 1] = val;
        data[i + 2] = val;
        data[i + 3] = 16; // Very subtle noise
      }
      noiseCtx.putImageData(imgData, 0, 0);
      noisePattern = ctx.createPattern(noiseCanvas, 'repeat');
    };

    createNoisePattern();

    // Handle Window Resize
    const resizeCanvas = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);

      // Re-initialize blobs coordinate anchors
      blobs.forEach((b) => {
        b.x = width * b.baseXRatio;
        b.y = height * b.baseYRatio;
        b.targetX = b.x;
        b.targetY = b.y;
      });
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Track Pointer (Mouse & Touch)
    const handlePointerMove = (clientX, clientY) => {
      pointer.targetX = clientX;
      pointer.targetY = clientY;
      pointer.isInteracting = true;
      pointer.lastMoved = Date.now();
    };

    const onMouseMove = (e) => handlePointerMove(e.clientX, e.clientY);
    const onTouchMove = (e) => {
      if (e.touches && e.touches.length > 0) {
        handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });

    // Handle tab visibility changes to pause rendering
    const onVisibilityChange = () => {
      isTabVisible = !document.hidden;
      if (isTabVisible && !prefersReducedMotion) {
        lastTime = performance.now();
        animationFrameId = requestAnimationFrame(render);
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    let lastTime = performance.now();

    // Main Canvas Render Loop
    const render = (currentTime) => {
      if (!isTabVisible) return;

      const delta = currentTime - lastTime;
      lastTime = currentTime;

      // 1. Draw solid dark base background
      ctx.fillStyle = bgBase;
      ctx.fillRect(0, 0, width, height);

      // Smoothly ease pointer back toward center if idle for 4 seconds
      const isIdle = Date.now() - pointer.lastMoved > 4000;
      if (isIdle) {
        pointer.targetX += (width / 2 - pointer.targetX) * 0.01;
        pointer.targetY += (height / 2 - pointer.targetY) * 0.01;
      }

      // 2. Draw 4 Aurora Blobs
      blobs.forEach((blob, idx) => {
        // Autonomous organic drift using sinusoidal waves
        const timeOffset = currentTime * blob.speed + blob.phase;
        const driftX = Math.sin(timeOffset) * blob.amp;
        const driftY = Math.cos(timeOffset * 0.8) * blob.amp;

        // Pointer influence with offsets so blobs don't stack directly on top of each other
        const angle = (idx * Math.PI) / 2;
        const pointerOffsetX = Math.cos(angle) * (width * 0.15);
        const pointerOffsetY = Math.sin(angle) * (height * 0.15);

        const targetX = width * blob.baseXRatio + driftX + (pointer.targetX - width / 2) * (blob.lerp * 4) + pointerOffsetX * 0.4;
        const targetY = height * blob.baseYRatio + driftY + (pointer.targetY - height / 2) * (blob.lerp * 4) + pointerOffsetY * 0.4;

        // Lerp position
        blob.x += (targetX - blob.x) * blob.lerp;
        blob.y += (targetY - blob.y) * blob.lerp;

        const radius = Math.min(width, height) * blob.radiusRatio;

        // Radial gradient for each blob (moderate opacity 0.65 to 0.75)
        const radGrad = ctx.createRadialGradient(blob.x, blob.y, 0, blob.x, blob.y, radius);
        radGrad.addColorStop(0, hexToRgba(blob.color, 0.72));
        radGrad.addColorStop(0.5, hexToRgba(blob.color, 0.38));
        radGrad.addColorStop(1, hexToRgba(blob.color, 0));

        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(blob.x, blob.y, radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // 3. Draw Bokeh Specks
      bokehSpecks.forEach((speck) => {
        speck.x += speck.vx;
        speck.y += speck.vy;

        // Wrap around boundaries
        if (speck.y < -10) speck.y = height + 10;
        if (speck.y > height + 10) speck.y = -10;
        if (speck.x < -10) speck.x = width + 10;
        if (speck.x > width + 10) speck.x = -10;

        const pulse = Math.sin(currentTime * speck.pulseSpeed + speck.pulsePhase) * 0.04;
        const alpha = Math.max(0.02, Math.min(0.24, speck.alpha + pulse));

        ctx.fillStyle = `rgba(244, 241, 250, ${alpha})`;
        ctx.beginPath();
        ctx.arc(speck.x, speck.y, speck.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // 4. Subtle Film-Grain Noise Overlay (prevents color banding)
      if (noisePattern) {
        ctx.fillStyle = noisePattern;
        ctx.fillRect(0, 0, width, height);
      }

      // If user prefers reduced motion, render single static frame and stop
      if (!prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    // Initial render call
    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        pointerEvents: 'none'
      }}
      aria-hidden="true"
    />
  );
}
