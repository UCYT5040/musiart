<script lang="ts">
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

  function draw() {
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
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
    onCanvasUpdate(
      canvas.toDataURL('image/png')
    );
  }

  function mousemove(event: MouseEvent) {
    if (!mouseDown) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (lastPoint) {
      const path = paths[paths.length - 1];
      if (
        path.points[path.points.length - 1].x === x &&
        path.points[path.points.length - 1].y === y
      ) {
        return; // Prevent adding duplicate points
      }
      path.points.push({ x, y });
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
    paths.push({ points: [lastPoint], color: `hsl(${hue}, 100%, 50%)`, width: 2 });
    draw();
  }

  function mouseup(event: MouseEvent | FocusEvent) {
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
  ondragstart={()=>{}}
  draggable="false"
></canvas>

<input
  type="range"
  bind:value={hue}
  style={`--thumb-color: hsl(${hue}, 100%, 50%)`}
  min="0"
  max="360"
/>

<style>
  canvas {
    -webkit-user-drag: none;
    border: solid 1px blue;
  }

  input[type="range"] {
    accent-color: var(--thumb-color);
  }

  /* Webkit browsers (Chrome, Safari, Edge) */
  input[type="range"]::-webkit-slider-thumb {
    background-color: var(--thumb-color);
    border: none; /* Remove default border */
    border-radius: 50%; /* Make it circular */
    width: 18px;
    height: 18px;
    cursor: pointer;
    -webkit-appearance: none; /* Remove default styling */
  }

  /* Firefox */
  input[type="range"]::-moz-range-thumb {
    background-color: var(--thumb-color);
    border: none; /* Remove default border */
    border-radius: 50%; /* Make it circular */
    width: 18px;
    height: 18px;
    cursor: pointer;
  }

  /* Internet Explorer */
  input[type="range"]::-ms-thumb {
    background-color: var(--thumb-color);
    border: none;
    border-radius: 50%;
    width: 18px;
    height: 18px;
    cursor: pointer;
  }
</style>
