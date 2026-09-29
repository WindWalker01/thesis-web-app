"use client";

import { useEffect, useRef, memo } from "react";

interface Cube {
  id: number;
  x: number;
  y: number;
  z: number;
  size: number;
  rx: number;
  ry: number;
  rz: number;
  vx: number;
  vy: number;
  speedX: number;
  speedY: number;
  speedZ: number;
  isAccent: boolean;
  scale: number;
  screenX: number;
  screenY: number;
  screenRadius: number;
}

interface WireframeBlocksProps {
  cubeCount?: number;
  primaryColor?: string;
  accentColor?: string;
  /** Soft shadow on edges and connecting lines. Off for small screens. */
  glow?: boolean;
  /** Caps the canvas backing-store scale. Phones stay at 1. */
  maxDpr?: number;
  /** Stops the frame loop without tearing down the cubes. */
  paused?: boolean;
}

// 8 vertices of a perfect 1:1:1 unit cube
const BASE_VERTICES: readonly [number, number, number][] = [
  [-1, -1, -1],
  [1, -1, -1],
  [1, 1, -1],
  [-1, 1, -1],
  [-1, -1, 1],
  [1, -1, 1],
  [1, 1, 1],
  [-1, 1, 1],
];

// 12 edges connecting the 8 vertices
const EDGES: readonly [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 0], // Back face
  [4, 5],
  [5, 6],
  [6, 7],
  [7, 4], // Front face
  [0, 4],
  [1, 5],
  [2, 6],
  [3, 7], // Connecting edges
];

export const WireframeBlocks = memo(function WireframeBlocks({
  cubeCount = 14,
  primaryColor,
  accentColor,
  glow = true,
  maxDpr = 2,
  paused = false,
}: WireframeBlocksProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pausedRef = useRef(paused);
  const resumeRef = useRef<(() => void) | null>(null);
  pausedRef.current = paused;

  useEffect(() => {
    if (!paused) resumeRef.current?.();
  }, [paused]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId = 0;
    let frameCount = 0;
    const narrow =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(max-width: 1023px)").matches;
    const drawGlow = glow && !narrow;
    const dpr = Math.min(window.devicePixelRatio || 1, narrow ? 1 : maxDpr);
    const count = narrow ? Math.min(cubeCount, 6) : cubeCount;
    canvas.dataset.resolvedCount = String(count);
    canvas.dataset.resolvedDpr = String(dpr);
    canvas.dataset.resolvedGlow = drawGlow ? "true" : "false";

    let width = 0;
    let height = 0;

    const resize = () => {
      const parent = canvas.parentElement;
      width = parent?.offsetWidth || window.innerWidth;
      height = parent?.offsetHeight || window.innerHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    const fov = 440;

    // Mouse / Pointer Interaction state
    const mouse = {
      x: -9999,
      y: -9999,
      isDown: false,
      hoveredCube: null as Cube | null,
      draggedCube: null as Cube | null,
      cameraTiltX: 0,
      cameraTiltY: 0,
    };

    // Helper to spawn cubes around the perimeter of the hero section (avoiding center text)
    function spawnAroundPerimeter(index: number) {
      const zone = index % 4;
      const z = 160 + Math.random() * 450;
      const scale = fov / (fov + z);

      let screenTargetX = 0;
      let screenTargetY = 0;

      if (zone === 0) {
        // Left flank
        screenTargetX = -width * 0.32 - Math.random() * (width * 0.22);
        screenTargetY = (Math.random() - 0.5) * height * 0.85;
      } else if (zone === 1) {
        // Right flank
        screenTargetX = width * 0.32 + Math.random() * (width * 0.22);
        screenTargetY = (Math.random() - 0.5) * height * 0.85;
      } else if (zone === 2) {
        // Top perimeter
        screenTargetX = (Math.random() - 0.5) * width * 0.9;
        screenTargetY = -height * 0.28 - Math.random() * (height * 0.2);
      } else {
        // Bottom perimeter
        screenTargetX = (Math.random() - 0.5) * width * 0.9;
        screenTargetY = height * 0.28 + Math.random() * (height * 0.2);
      }

      return {
        x: screenTargetX / scale,
        y: screenTargetY / scale,
        z,
        scale,
      };
    }

    // Initialize cubes with verified zero initial overlaps
    const cubes: Cube[] = [];
    for (let i = 0; i < count; i++) {
      const isAccent = i % 3 === 0;
      const size = 32 + Math.random() * 36;
      let pos = spawnAroundPerimeter(i);

      for (let attempt = 0; attempt < 10; attempt++) {
        let hasOverlap = false;
        for (const existing of cubes) {
          const dx = pos.x - existing.x;
          const dy = pos.y - existing.y;
          const minDist = (size + existing.size) * 2.2;
          if (dx * dx + dy * dy < minDist * minDist) {
            hasOverlap = true;
            break;
          }
        }
        if (!hasOverlap) break;
        pos = spawnAroundPerimeter(i + attempt * 2);
      }

      cubes.push({
        id: i,
        x: pos.x,
        y: pos.y,
        z: pos.z,
        size,
        rx: Math.random() * Math.PI * 2,
        ry: Math.random() * Math.PI * 2,
        rz: Math.random() * Math.PI * 2,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.28,
        speedX: (Math.random() - 0.5) * 0.0007,
        speedY: (Math.random() - 0.5) * 0.0007,
        speedZ: (Math.random() - 0.5) * 0.0004,
        isAccent,
        scale: pos.scale,
        screenX: 0,
        screenY: 0,
        screenRadius: 40,
      });
    }

    // Pointer Event Listeners for Interaction & Dragging
    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const currentX = e.clientX - rect.left;
      const currentY = e.clientY - rect.top;

      mouse.cameraTiltX += ((currentX - width / 2) * 0.00012 - mouse.cameraTiltX) * 0.05;
      mouse.cameraTiltY += ((currentY - height / 2) * 0.00012 - mouse.cameraTiltY) * 0.05;

      if (mouse.draggedCube) {
        const cube = mouse.draggedCube;
        const scale = fov / (fov + cube.z);
        const cx = width / 2;
        const cy = height / 2;

        const targetX = (currentX - cx) / scale;
        const targetY = (currentY - cy) / scale;

        cube.vx = (targetX - cube.x) * 0.25;
        cube.vy = (targetY - cube.y) * 0.25;
        cube.x = targetX;
        cube.y = targetY;

        canvas.style.cursor = "grabbing";
      } else {
        let foundHover: Cube | null = null;
        for (let i = cubes.length - 1; i >= 0; i--) {
          const cube = cubes[i];
          const dx = currentX - cube.screenX;
          const dy = currentY - cube.screenY;
          if (dx * dx + dy * dy < cube.screenRadius * cube.screenRadius) {
            foundHover = cube;
            break;
          }
        }
        mouse.hoveredCube = foundHover;
        canvas.style.cursor = foundHover ? "grab" : "default";
      }

      mouse.x = currentX;
      mouse.y = currentY;
    };

    const onPointerDown = () => {
      if (mouse.hoveredCube) {
        mouse.draggedCube = mouse.hoveredCube;
        mouse.isDown = true;
        canvas.style.cursor = "grabbing";
        mouse.draggedCube.speedX += (Math.random() - 0.5) * 0.003;
        mouse.draggedCube.speedY += (Math.random() - 0.5) * 0.003;
      }
    };

    const onPointerUp = () => {
      mouse.isDown = false;
      if (mouse.draggedCube) {
        mouse.draggedCube = null;
        canvas.style.cursor = mouse.hoveredCube ? "grab" : "default";
      }
    };

    const onPointerLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
      mouse.hoveredCube = null;
      mouse.draggedCube = null;
      canvas.style.cursor = "default";
    };

    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointerleave", onPointerLeave);

    const render = () => {
      if (pausedRef.current) {
        animId = 0;
        return;
      }

      frameCount++;
      ctx.clearRect(0, 0, width, height);

      // Check dark mode dynamically
      const isDark = document.documentElement.classList.contains("dark");

      // Adaptive Color Palette:
      // - Dark mode: Glowing neon cyan/blue and orange with soft transparency
      // - Light mode: Strong, punchy, high-contrast royal blue and deep orange (no washed-out faint lines)
      const colors = {
        primary:
          primaryColor ||
          (isDark ? "rgba(59, 130, 246, 0.55)" : "rgba(29, 78, 216, 0.92)"),
        accent:
          accentColor ||
          (isDark ? "rgba(249, 115, 22, 0.5)" : "rgba(194, 65, 12, 0.92)"),
        primaryGlow: isDark
          ? "rgba(59, 130, 246, 0.7)"
          : "rgba(37, 99, 235, 0.35)",
        accentGlow: isDark
          ? "rgba(249, 115, 22, 0.7)"
          : "rgba(234, 88, 12, 0.35)",
        edgeWidth: isDark ? 1.3 : 1.8, // Bolder stroke in light mode for crisp definition
        shadowBlur: drawGlow ? (isDark ? 7 : 3) : 0,
      };

      const cx = width / 2;
      const cy = height / 2;

      // Hero Content Avoidance Zone Dimensions
      const textZoneW = Math.min(340, width * 0.32);
      const textZoneH = Math.min(220, height * 0.28);

      // 1. Update Screen Projections & Avoid Hero Center
      cubes.forEach((cube) => {
        cube.scale = fov / (fov + cube.z);
        cube.screenX = cx + cube.x * cube.scale;
        cube.screenY = cy + cube.y * cube.scale;
        cube.screenRadius = cube.size * cube.scale * 1.5;

        // Content Avoidance: Steer smoothly away from center text zone
        if (cube !== mouse.draggedCube) {
          const fromCenterX = cube.screenX - cx;
          const fromCenterY = cube.screenY - cy;

          const absX = Math.abs(fromCenterX);
          const absY = Math.abs(fromCenterY);

          if (absX < textZoneW && absY < textZoneH) {
            const overlapX = (textZoneW - absX) / textZoneW;
            const overlapY = (textZoneH - absY) / textZoneH;
            const steerForce = overlapX * overlapY * 0.6;

            const dirX = fromCenterX >= 0 ? 1 : -1;
            const dirY = fromCenterY >= 0 ? 1 : -1;

            cube.vx += dirX * steerForce * 0.35;
            cube.vy += dirY * steerForce * 0.2;
            cube.x += (dirX * steerForce * 2.2) / cube.scale;
            cube.y += (dirY * steerForce * 1.5) / cube.scale;
          }
        }
      });

      // 2. Strict No-Overlap Collision Solver (2D Screen Space + 3D Space)
      const numCubes = cubes.length;
      for (let pass = 0; pass < 2; pass++) {
        for (let i = 0; i < numCubes; i++) {
          for (let j = i + 1; j < numCubes; j++) {
            const c1 = cubes[i];
            const c2 = cubes[j];

            const sDx = c2.screenX - c1.screenX;
            const sDy = c2.screenY - c1.screenY;
            const sDistSq = sDx * sDx + sDy * sDy;
            const minScreenDist = c1.screenRadius + c2.screenRadius + 24;
            const minScreenDistSq = minScreenDist * minScreenDist;

            if (sDistSq < minScreenDistSq && sDistSq > 0.001) {
              const sDist = Math.sqrt(sDistSq);
              const sOverlap = minScreenDist - sDist;
              const sNx = sDx / sDist;
              const sNy = sDy / sDist;

              const avgScale = (c1.scale + c2.scale) * 0.5;
              const worldPush = (sOverlap * 0.5) / avgScale;

              if (c1 !== mouse.draggedCube) {
                c1.x -= sNx * worldPush;
                c1.y -= sNy * worldPush;
                c1.vx -= sNx * 0.12;
                c1.vy -= sNy * 0.12;
              }
              if (c2 !== mouse.draggedCube) {
                c2.x += sNx * worldPush;
                c2.y += sNy * worldPush;
                c2.vx += sNx * 0.12;
                c2.vy += sNy * 0.12;
              }
            }

            // 3D Depth Separation
            const dx = c2.x - c1.x;
            const dy = c2.y - c1.y;
            const dz = c2.z - c1.z;
            const dist3dSq = dx * dx + dy * dy + dz * dz;
            const min3dDist = (c1.size + c2.size) * 1.85;
            if (dist3dSq < min3dDist * min3dDist && dist3dSq > 0.001) {
              const dist3d = Math.sqrt(dist3dSq);
              const overlap3d = (min3dDist - dist3d) / min3dDist;
              const nz = dz / dist3d;
              if (c1 !== mouse.draggedCube) c1.z -= nz * overlap3d * 8;
              if (c2 !== mouse.draggedCube) c2.z += nz * overlap3d * 8;
            }
          }
        }
      }

      // 3. Movement Physics & Soft Canvas Boundary Deflection
      cubes.forEach((cube) => {
        cube.rx += cube.speedX;
        cube.ry += cube.speedY;
        cube.rz += cube.speedZ;

        if (cube !== mouse.draggedCube) {
          cube.x += cube.vx;
          cube.y += cube.vy;

          const boundX = width * 0.58;
          const boundY = height * 0.52;
          if (cube.x > boundX) {
            cube.x = boundX;
            cube.vx = -Math.abs(cube.vx) * 0.9;
          } else if (cube.x < -boundX) {
            cube.x = -boundX;
            cube.vx = Math.abs(cube.vx) * 0.9;
          }

          if (cube.y > boundY) {
            cube.y = boundY;
            cube.vy = -Math.abs(cube.vy) * 0.9;
          } else if (cube.y < -boundY) {
            cube.y = -boundY;
            cube.vy = Math.abs(cube.vy) * 0.9;
          }

          cube.vx *= 0.994;
          cube.vy *= 0.994;
          if (Math.abs(cube.vx) < 0.08) cube.vx += (Math.random() - 0.5) * 0.04;
          if (Math.abs(cube.vy) < 0.08) cube.vy += (Math.random() - 0.5) * 0.04;
        }

        cube.screenX = cx + cube.x * cube.scale;
        cube.screenY = cy + cube.y * cube.scale;
      });

      // 4. Glowing Connecting Lines between nearby blocks + Moving Pulse
      // Connecting lines only draw between blocks around the perimeter, never crossing the center text
      const maxConnectDist = 320;
      for (let i = 0; i < numCubes; i++) {
        const c1 = cubes[i];
        for (let j = i + 1; j < numCubes; j++) {
          const c2 = cubes[j];
          const dx = c2.x - c1.x;
          const dy = c2.y - c1.y;
          const dz = c2.z - c1.z;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist < maxConnectDist) {
            // Check that the line segment doesn't pass through the center text zone
            const midX = (c1.screenX + c2.screenX) * 0.5;
            const midY = (c1.screenY + c2.screenY) * 0.5;
            const midDistToCenter = Math.hypot(midX - cx, midY - cy);

            // Skip drawing lines that intersect right through the central reading area
            if (midDistToCenter < 190) continue;

            const lineOpacity = Math.max(0, (1 - dist / maxConnectDist) * (isDark ? 0.32 : 0.6));

            ctx.save();
            ctx.strokeStyle = c1.isAccent || c2.isAccent
              ? (isDark ? `rgba(249, 115, 22, ${lineOpacity})` : `rgba(194, 65, 12, ${lineOpacity})`)
              : (isDark ? `rgba(59, 130, 246, ${lineOpacity})` : `rgba(29, 78, 216, ${lineOpacity})`);
            ctx.lineWidth = isDark ? 1.1 : 1.3;
            ctx.shadowColor = drawGlow
              ? c1.isAccent
                ? "#f97316"
                : "#3b82f6"
              : "transparent";
            ctx.shadowBlur = drawGlow ? 4 : 0;

            ctx.beginPath();
            ctx.moveTo(c1.screenX, c1.screenY);
            ctx.lineTo(c2.screenX, c2.screenY);
            ctx.stroke();

            // Animated light photon pulse
            const pulseSpeed = 0.007;
            const pulseT = ((frameCount * pulseSpeed + (i * 3 + j) * 0.25) % 1 + 1) % 1;
            const photonX = c1.screenX + (c2.screenX - c1.screenX) * pulseT;
            const photonY = c1.screenY + (c2.screenY - c1.screenY) * pulseT;

            ctx.fillStyle = c1.isAccent
              ? (isDark ? "#f97316" : "#c2410c")
              : (isDark ? "#ffffff" : "#1d4ed8");
            ctx.shadowColor = drawGlow
              ? c1.isAccent
                ? "#f97316"
                : "#60a5fa"
              : "transparent";
            ctx.shadowBlur = drawGlow ? (isDark ? 8 : 4) : 0;
            ctx.beginPath();
            ctx.arc(photonX, photonY, 2.2, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
          }
        }
      }

      // 5. Render 3D Wireframe Cubes - Exact 1:1:1 Orthonormal Matrix (Never a Slab or Rectangle!)
      cubes.forEach((cube) => {
        const isHovered = mouse.hoveredCube === cube;
        const isDragged = mouse.draggedCube === cube;

        const radX = cube.rx + mouse.cameraTiltY;
        const radY = cube.ry + mouse.cameraTiltX;
        const radZ = cube.rz;

        // Exact 3D Orthonormal Euler rotation matrix (Rz * Ry * Rx)
        // Guarantees all 12 edges remain identical length in 3D and all 6 faces are perfect squares!
        const cosX = Math.cos(radX), sinX = Math.sin(radX);
        const cosY = Math.cos(radY), sinY = Math.sin(radY);
        const cosZ = Math.cos(radZ), sinZ = Math.sin(radZ);

        const r00 = cosY * cosZ;
        const r01 = sinX * sinY * cosZ - cosX * sinZ;
        const r02 = cosX * sinY * cosZ + sinX * sinZ;

        const r10 = cosY * sinZ;
        const r11 = sinX * sinY * sinZ + cosX * cosZ;
        const r12 = cosX * sinY * sinZ - sinX * cosZ;

        // Project with uniform scale per cube to prevent non-affine perspective shearing
        const projected = BASE_VERTICES.map(([vx, vy, vz]) => {
          const x0 = vx * cube.size;
          const y0 = vy * cube.size;
          const z0 = vz * cube.size;

          const rotX = r00 * x0 + r01 * y0 + r02 * z0;
          const rotY = r10 * x0 + r11 * y0 + r12 * z0;

          return {
            x: cx + (cube.x + rotX) * cube.scale,
            y: cy + (cube.y + rotY) * cube.scale,
            scale: cube.scale,
          };
        });

        const strokeColor = cube.isAccent ? colors.accent : colors.primary;
        const glowColor = cube.isAccent ? colors.accentGlow : colors.primaryGlow;

        let baseAlpha = Math.max(0.35, Math.min(1.0, 1 - cube.z / 950));
        if (isHovered || isDragged) baseAlpha = 1.0;

        ctx.save();
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = isHovered || isDragged ? colors.edgeWidth + 0.8 : colors.edgeWidth;
        ctx.shadowColor = drawGlow ? glowColor : "transparent";
        ctx.shadowBlur = drawGlow
          ? isHovered || isDragged
            ? colors.shadowBlur + 8
            : colors.shadowBlur
          : 0;
        ctx.globalAlpha = baseAlpha;

        // Draw 12 edges of the perfect square/cube
        ctx.beginPath();
        EDGES.forEach(([p1, p2]) => {
          ctx.moveTo(projected[p1].x, projected[p1].y);
          ctx.lineTo(projected[p2].x, projected[p2].y);
        });
        ctx.stroke();

        // High-contrast vertex corner points
        if (isDark) {
          ctx.fillStyle = isHovered ? "#ffffff" : cube.isAccent ? "#fed7aa" : "#e0f2fe";
        } else {
          // Strong punchy dark vertex in light mode
          ctx.fillStyle = isHovered ? "#000000" : cube.isAccent ? "#9a3412" : "#1e40af";
        }

        projected.forEach((p) => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, Math.max(1.5, (isHovered ? 2.6 : 1.9) * p.scale), 0, Math.PI * 2);
          ctx.fill();
        });

        ctx.restore();
      });

      animId = requestAnimationFrame(render);
    };

    const resume = () => {
      if (pausedRef.current || animId) return;
      animId = requestAnimationFrame(render);
    };
    resumeRef.current = resume;
    if (!pausedRef.current) render();

    return () => {
      resumeRef.current = null;
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [cubeCount, primaryColor, accentColor, glow, maxDpr]);

  return (
    <canvas
      ref={canvasRef}
      data-cube-count={cubeCount}
      data-glow={glow ? "true" : "false"}
      data-max-dpr={maxDpr}
      data-paused={paused ? "true" : "false"}
      className="absolute inset-0 h-full w-full touch-pan-y"
      aria-hidden="true"
    />
  );
});
