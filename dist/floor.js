import * as THREE from './assets/three.module.js';

// A tile is 10 plank-widths across: 1.78 m. The UVs should be in metres.
// Rotating the repeated tile gives the familiar 45° herringbone lay.
export function makeOakFloor() {
  const size = 2048;
  const units = 10;
  const px = size / units;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#a78d6b';
  ctx.fillRect(0, 0, size, size);

  const random = (seed) => {
    let s = seed >>> 0;
    return () => {
      s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
      return s / 4294967296;
    };
  };
  const mod = (n, d) => ((n % d) + d) % d;

  function plank(x, y, vertical, seed) {
    if (x >= units || y >= units || x + (vertical ? 1 : 5) <= 0 || y + (vertical ? 5 : 1) <= 0) return;
    const r = random(seed);
    const length = 5 * px;
    const width = px;
    ctx.save();
    ctx.translate(x * px, y * px);
    if (vertical) {
      ctx.translate(px, 0);
      ctx.rotate(Math.PI / 2);
    }
    ctx.beginPath();
    ctx.rect(0, 0, length, width);
    ctx.clip();
    const variation = (r() - 0.5) * 16;
    const base = [165 + variation, 140 + variation, 109 + variation];
    ctx.fillStyle = `rgb(${base.map(Math.round).join(',')})`;
    ctx.fillRect(0, 0, length, width);

    // Broad, soft variation gives each plank its own sawn-oak character.
    for (let i = 0; i < 12; i++) {
      const cy = r() * width;
      const band = ctx.createLinearGradient(0, cy - 16, 0, cy + 16);
      const dark = r() < 0.55;
      band.addColorStop(0, 'rgba(90,61,37,0)');
      band.addColorStop(0.5, dark ? 'rgba(83,58,35,0.065)' : 'rgba(235,216,180,0.12)');
      band.addColorStop(1, 'rgba(90,61,37,0)');
      ctx.fillStyle = band;
      ctx.fillRect(0, cy - 16, length, 32);
    }

    const phase = r() * Math.PI * 2;
    const knotX = length * (0.2 + r() * 0.6);
    const knotY = width * (0.25 + r() * 0.5);
    const hasKnot = r() < 0.32;
    for (let i = 0; i < 235; i++) {
      const y0 = (i / 235) * width;
      const alpha = 0.025 + r() * 0.09;
      ctx.strokeStyle = i % 5 === 0 ? `rgba(237,218,182,${alpha * 1.5})` : `rgba(77,52,30,${alpha})`;
      ctx.lineWidth = 0.35 + r() * 0.9;
      ctx.beginPath();
      for (let x0 = -10; x0 <= length + 10; x0 += 18) {
        let yy = y0 + Math.sin(x0 / 190 + phase + y0 / 31) * 2.7
          + Math.sin(x0 / 74 + phase + y0 / 19) * 0.7;
        if (hasKnot) {
          yy += Math.sign(y0 - knotY) * 8 * Math.exp(-(((x0 - knotX) / 115) ** 2)) * Math.exp(-Math.abs(y0 - knotY) / 33);
        }
        if (x0 === -10) ctx.moveTo(x0, yy);
        else ctx.lineTo(x0, yy);
      }
      ctx.stroke();
    }
    if (hasKnot) {
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.ellipse(knotX, knotY, 4 + i * 5.5, 0.9 + i * 1.3, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(73,50,31,${0.12 - i * 0.017})`;
        ctx.lineWidth = 0.7;
        ctx.stroke();
      }
    }
    for (let i = 0; i < 270; i++) {
      const x0 = r() * length;
      const y0 = r() * width;
      ctx.fillStyle = `rgba(65,43,26,${0.025 + r() * 0.055})`;
      ctx.fillRect(x0, y0, 2 + r() * 8, 0.4 + r() * 0.7);
    }
    // Fine micro-bevel, deliberately subtle for an extra-matte PVC finish.
    ctx.strokeStyle = 'rgba(69,50,34,0.28)';
    ctx.lineWidth = 1.7;
    ctx.strokeRect(0.8, 0.8, length - 1.6, width - 1.6);
    ctx.strokeStyle = 'rgba(242,222,191,0.25)';
    ctx.lineWidth = 0.8;
    ctx.strokeRect(2, 2, length - 4, width - 4);
    ctx.restore();
  }

  // The two perpendicular planks share a lattice with vectors (5,5), (-1,1).
  // A 10×10 unit canvas contains 10 horizontal and 10 vertical planks.
  for (let k = 0; k < units; k++) {
    const y = mod(-k, units);
    for (let wrapX = -1; wrapX <= 1; wrapX++) {
      for (let wrapY = -1; wrapY <= 1; wrapY++) {
        plank(k + wrapX * units, y + wrapY * units, false, 400 + k * 17);
        plank(mod(k + 5, units) + wrapX * units, y + wrapY * units, true, 900 + k * 31);
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1 / 1.78, 1 / 1.78);
  texture.rotation = Math.PI / 4;
  texture.anisotropy = 8;
  const material = new THREE.MeshStandardMaterial({
    map: texture,
    bumpMap: texture,
    bumpScale: 0.003,
    roughness: 0.92,
    metalness: 0,
    color: 0xffffff,
  });
  material.name = 'Ambiant · Spigato XL Soleno · Warm Oak (benadering)';
  return material;
}
