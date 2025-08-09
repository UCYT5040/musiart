<script lang="ts">
  import { doSegmentsIntersect } from "$lib/utils";
  import { onMount } from "svelte";

  const { onCanvasUpdate }: { onCanvasUpdate: (imageBase64: string) => void } =
    $props();

  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;

  interface Point {
    x: number;
    y: number;
  }

  interface Path {
    points: Point[];
    color: string;
    width: number;
  }
  let paths: Path[] = [];

  let mouseDown = false;
  let mouseButton = 0;
  let lastPoint: Point | null = null;

  let hue = $state(0);

  let erasing = false;

  const hueOverrides: Record<number, string> = {
    0: "black",
    360: "white",
  };

  function getHueColor() {
    return hueOverrides[hue] || `hsl(${hue}, 100%, 50%)`;
  }

  let brushSize = 2;

  function draw() {
    if (!canvas || !ctx) return;
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    paths.forEach((path) => {
      ctx.beginPath();
      ctx.moveTo(path.points[0].x, path.points[0].y);
      path.points.forEach((point) => {
        ctx.lineTo(point.x, point.y);
      });
      ctx.strokeStyle = path.color;
      ctx.lineWidth = path.width;
      ctx.stroke();
    });
    onCanvasUpdate(canvas.toDataURL("image/png"));
  }

  function mousemove(event: MouseEvent) {
    if (!mouseDown) return;
    event.preventDefault();

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (lastPoint) {
      if (erasing) {
        // Determine if the line formed by (x, y) and lastPoint is intersecting with any paths
        const line = { start: lastPoint, end: { x, y } };
        for (const path of paths) {
          // Check each segment of the path for intersection
          for (let i = 1; i < path.points.length; i++) {
            const segment = { start: path.points[i - 1], end: path.points[i] };
            if (
              doSegmentsIntersect(
                line.start,
                line.end,
                segment.start,
                segment.end
              )
            ) {
              // If it is, remove the path
              paths = paths.filter((p) => p !== path);
              break;
            }
          }
        }
      } else {
        const path = paths[paths.length - 1];
        if (
          path.points[path.points.length - 1].x === x &&
          path.points[path.points.length - 1].y === y
        ) {
          return; // Prevent adding duplicate points
        }
        path.points.push({ x, y });
      }
    }

    lastPoint = { x, y };
    draw();
  }

  function mousedown(event: MouseEvent) {
    event.preventDefault();
    mouseDown = true;
    mouseButton = event.button;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    lastPoint = { x, y };

    if (erasing) return;

    paths.push({
      points: [lastPoint],
      color: getHueColor(),
      width: brushSize * 4,
    });
    draw();
  }

  function mouseup(event: MouseEvent | FocusEvent) {
    mouseDown = false;
    lastPoint = null;
  }

  function touchmove(event: TouchEvent) {
    if (!mouseDown) return;
    event.preventDefault();

    const rect = canvas.getBoundingClientRect();
    const touch = event.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    if (lastPoint) {
      if (erasing) {
        // Determine if the line formed by (x, y) and lastPoint is intersecting with any paths
        const line = { start: lastPoint, end: { x, y } };
        for (const path of paths) {
          // Check each segment of the path for intersection
          for (let i = 1; i < path.points.length; i++) {
            const segment = { start: path.points[i - 1], end: path.points[i] };
            if (
              doSegmentsIntersect(
                line.start,
                line.end,
                segment.start,
                segment.end
              )
            ) {
              // If it is, remove the path
              paths = paths.filter((p) => p !== path);
              break;
            }
          }
        }
      } else {
        const path = paths[paths.length - 1];
        if (
          path.points[path.points.length - 1].x === x &&
          path.points[path.points.length - 1].y === y
        ) {
          return; // Prevent adding duplicate points
        }
        path.points.push({ x, y });
      }
    }

    lastPoint = { x, y };
    draw();
  }

  function touchstart(event: TouchEvent) {
    event.preventDefault();
    mouseDown = true;

    const rect = canvas.getBoundingClientRect();
    const touch = event.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    lastPoint = { x, y };

    if (erasing) return;

    paths.push({
      points: [lastPoint],
      color: getHueColor(),
      width: brushSize * 4,
    });
    draw();
  }

  function touchend(event: TouchEvent) {
    event.preventDefault();
    mouseDown = false;
    lastPoint = null;
  }

  onMount(() => {
    if (!canvas) return;
    const _ctx = canvas.getContext("2d");
    if (!_ctx) return;
    ctx = _ctx;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  });
</script>

<canvas
  bind:this={canvas}
  onmousemove={mousemove}
  onmousedown={mousedown}
  onmouseup={mouseup}
  onmouseout={mouseup}
  onblur={mouseup}
  ontouchstart={touchstart}
  ontouchmove={touchmove}
  ontouchend={touchend}
  draggable="false"
  width="800"
  height="600"
></canvas>

<input
  id="color"
  type="range"
  bind:value={hue}
  style={`--thumb-color: ${getHueColor()}`}
  min="0"
  max="360"
  class="border rounded-xl"
/>

<div class="flex">
  <button
    onclick={() => {
      brushSize = 1;
      erasing = false;
    }}
    aria-label="Small brush"
  >
    <svg viewBox="0 0 6 6" class="w-8">
      <circle cx="3" cy="3" r="1" fill="black" />
    </svg>
  </button>
  <button
    onclick={() => {
      brushSize = 2;
      erasing = false;
    }}
    aria-label="Medium brush"
  >
    <svg viewBox="0 0 6 6" class="w-8">
      <circle cx="3" cy="3" r="2" fill="black" />
    </svg>
  </button>
  <button
    onclick={() => {
      brushSize = 3;
      erasing = false;
    }}
    aria-label="Large brush"
  >
    <svg viewBox="0 0 6 6" class="w-8">
      <circle cx="3" cy="3" r="3" fill="black" />
    </svg>
  </button>
</div>
<button
  onclick={() => {
    erasing = true;
  }}
  aria-label="Erase"
>
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-eraser-fill" viewBox="0 0 16 16">
  <path d="M8.086 2.207a2 2 0 0 1 2.828 0l3.879 3.879a2 2 0 0 1 0 2.828l-5.5 5.5A2 2 0 0 1 7.879 15H5.12a2 2 0 0 1-1.414-.586l-2.5-2.5a2 2 0 0 1 0-2.828zm.66 11.34L3.453 8.254 1.914 9.793a1 1 0 0 0 0 1.414l2.5 2.5a1 1 0 0 0 .707.293H7.88a1 1 0 0 0 .707-.293z"/>
</svg>
</button>

<style>
  canvas {
    -webkit-user-drag: none;
    border: solid 1px blue;
  }

  input#color {
    accent-color: var(--thumb-color);
    background-image: linear-gradient(
      to right,
      rgb(0, 0, 0),
      hsl(0, 75%, 50%),
      hsl(60, 75%, 50%),
      hsl(120, 75%, 50%),
      hsl(180, 75%, 50%),
      hsl(240, 75%, 50%),
      hsl(300, 75%, 50%),
      hsl(360, 75%, 50%),
      rgb(255, 255, 255)
    );
  }

  /* Webkit browsers (Chrome, Safari, Edge) */
  input#color::-webkit-slider-thumb {
    background-color: var(--thumb-color);
    border: none; /* Remove default border */
    border-radius: 50%; /* Make it circular */
    width: 18px;
    height: 18px;
    cursor: pointer;
    -webkit-appearance: none; /* Remove default styling */
  }

  /* Firefox */
  input#color::-moz-range-thumb {
    background-color: var(--thumb-color);
    border: none; /* Remove default border */
    border-radius: 50%; /* Make it circular */
    width: 18px;
    height: 18px;
    cursor: pointer;
  }

  /* Internet Explorer */
  input#color::-ms-thumb {
    background-color: var(--thumb-color);
    border: none;
    border-radius: 50%;
    width: 18px;
    height: 18px;
    cursor: pointer;
  }
</style>
