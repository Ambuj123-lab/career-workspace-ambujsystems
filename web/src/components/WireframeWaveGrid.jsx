"use client";

import { useEffect, useRef } from "react";

export default function WireframeWaveGrid() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    let mouseX = width / 2;
    let mouseY = height / 2;
    let targetMouseX = width / 2;
    let targetMouseY = height / 2;

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      targetMouseX = e.clientX - rect.left;
      targetMouseY = e.clientY - rect.top;
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("resize", handleResize);

    const cols = 40;
    const rows = 26;
    let time = 0;

    const render = () => {
      time += 0.009; // calm, dignified pace

      mouseX += (targetMouseX - mouseX) * 0.03;
      mouseY += (targetMouseY - mouseY) * 0.03;

      // Deep Void Black Clear
      ctx.fillStyle = "#020408";
      ctx.fillRect(0, 0, width, height);

      // Subtle Dark Amber / Ember Radial Glow at Top Center (Deep & Moody)
      const emberGrad = ctx.createRadialGradient(
        width * 0.5,
        height * 0.02,
        20,
        width * 0.5,
        height * 0.12,
        width * 0.45
      );
      emberGrad.addColorStop(0, "rgba(217, 119, 6, 0.075)");
      emberGrad.addColorStop(0.4, "rgba(180, 83, 9, 0.02)");
      emberGrad.addColorStop(1, "rgba(2, 4, 8, 0)");
      ctx.fillStyle = emberGrad;
      ctx.fillRect(0, 0, width, height);

      // 3D Perspective Wave Mesh
      const points = [];
      const fov = 440;
      const cameraY = -height * 0.16;
      const cameraZ = -120;

      for (let r = 0; r < rows; r++) {
        points[r] = [];
        const normY = r / (rows - 1);
        const yWorld = (normY - 0.5) * height * 1.3;

        for (let c = 0; c < cols; c++) {
          const normX = c / (cols - 1);
          const xWorld = (normX - 0.5) * width * 1.4;

          const distToCenter = Math.hypot(normX - 0.5, normY - 0.5);
          const wave1 = Math.sin(normX * 8.0 + time * 1.1) * Math.cos(normY * 6.5 + time * 0.8);
          const wave2 = Math.sin(normX * 14.0 - time * 0.7 + normY * 10.0) * 0.35;

          const dxMouse = xWorld - (mouseX - width / 2);
          const dyMouse = yWorld - (mouseY - height / 2);
          const mouseDist = Math.hypot(dxMouse, dyMouse);
          const mouseRipple = Math.exp(-mouseDist / 240) * Math.sin(mouseDist * 0.04 - time * 2.5) * 16;

          const zHeight = (wave1 + wave2) * 28 * (1 - distToCenter * 0.4) + mouseRipple;

          const zWorld = (1 - normY) * 250 + cameraZ;
          const scale = fov / (fov + zWorld);
          const x2d = width / 2 + xWorld * scale;
          const y2d = height * 0.52 + (yWorld - zHeight + cameraY) * scale;

          points[r][c] = { x: x2d, y: y2d, normY };
        }
      }

      ctx.lineWidth = 1;

      // Horizontal Rows (Very subtle hairline mesh)
      for (let r = 0; r < rows; r++) {
        ctx.beginPath();
        for (let c = 0; c < cols; c++) {
          const pt = points[r][c];
          if (c === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        }
        const depthAlpha = Math.max(0.01, Math.min(0.045, points[r][0].normY * 0.05));
        ctx.strokeStyle = `rgba(255, 255, 255, ${depthAlpha})`;
        ctx.stroke();
      }

      // Vertical Columns
      for (let c = 0; c < cols; c += 2) {
        ctx.beginPath();
        for (let r = 0; r < rows; r++) {
          const pt = points[r][c];
          if (r === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        }
        const colGrad = ctx.createLinearGradient(0, 0, 0, height);
        colGrad.addColorStop(0, "rgba(217, 119, 6, 0.05)");
        colGrad.addColorStop(0.5, "rgba(255, 255, 255, 0.02)");
        colGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.strokeStyle = colGrad;
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none -z-10 w-full h-full"
      aria-hidden="true"
    />
  );
}
