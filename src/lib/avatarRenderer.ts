export interface AvatarOptions {
  bg: string;
  skin: string;
  shirt: string;
  h: 'long' | 'short' | 'wavy' | 'buzz' | 'curly' | 'bun';
  hc: string;
  eye: string;
  lip: string;
  gl?: boolean;
}

function dk(hex: string, amount: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return '#' + [r, g, b].map(v => Math.max(0, Math.round(v * (1 - amount))).toString(16).padStart(2, '0')).join('');
}

export function drawAvatar(canvas: HTMLCanvasElement, o: AvatarOptions) {
  const w = canvas.width, h = canvas.height;
  const c = canvas.getContext('2d');
  if (!c) return;
  const cx = w / 2, cy = h / 2;

  c.clearRect(0, 0, w, h);
  // Background
  c.beginPath(); c.arc(cx, cy, w / 2, 0, Math.PI * 2); c.fillStyle = o.bg; c.fill();
  // Neck
  c.fillStyle = o.skin; c.fillRect(cx - w * 0.07, cy + w * 0.17, w * 0.14, w * 0.14);
  // Shirt
  c.beginPath(); c.ellipse(cx, cy + w * 0.44, w * 0.4, w * 0.24, 0, Math.PI, 0, true); c.fillStyle = o.shirt; c.fill();
  // Head
  c.beginPath(); c.ellipse(cx, cy - w * 0.04, w * 0.2, w * 0.24, 0, 0, Math.PI * 2); c.fillStyle = o.skin; c.fill();

  // Hair
  const hc = o.hc;
  if (o.h === 'long') {
    c.beginPath(); c.ellipse(cx, cy - w * 0.18, w * 0.22, w * 0.18, 0, 0, Math.PI * 2); c.fillStyle = hc; c.fill();
    c.fillRect(cx - w * 0.22, cy - w * 0.15, w * 0.08, w * 0.32);
    c.fillRect(cx + w * 0.14, cy - w * 0.15, w * 0.08, w * 0.32);
    c.beginPath(); c.ellipse(cx, cy - w * 0.23, w * 0.19, w * 0.07, 0, 0, Math.PI * 2); c.fill();
  } else if (o.h === 'short') {
    c.beginPath(); c.ellipse(cx, cy - w * 0.18, w * 0.21, w * 0.16, 0, 0, Math.PI * 2); c.fillStyle = hc; c.fill();
  } else if (o.h === 'wavy') {
    c.beginPath(); c.ellipse(cx, cy - w * 0.16, w * 0.23, w * 0.2, 0, 0, Math.PI * 2); c.fillStyle = hc; c.fill();
    c.fillRect(cx - w * 0.23, cy - w * 0.1, w * 0.1, w * 0.24);
    c.fillRect(cx + w * 0.13, cy - w * 0.1, w * 0.1, w * 0.24);
  } else if (o.h === 'buzz') {
    c.beginPath(); c.ellipse(cx, cy - w * 0.17, w * 0.21, w * 0.14, 0, 0, Math.PI * 2); c.fillStyle = hc; c.fill();
  } else if (o.h === 'curly') {
    for (let a = 0; a < 12; a++) {
      const an = a * Math.PI / 6;
      c.beginPath(); c.arc(cx + Math.cos(an) * w * 0.21, cy - w * 0.16 + Math.sin(an) * w * 0.1, w * 0.06, 0, Math.PI * 2);
      c.fillStyle = hc; c.fill();
    }
  } else if (o.h === 'bun') {
    c.beginPath(); c.ellipse(cx, cy - w * 0.18, w * 0.22, w * 0.16, 0, 0, Math.PI * 2); c.fillStyle = hc; c.fill();
    c.beginPath(); c.arc(cx, cy - w * 0.35, w * 0.09, 0, Math.PI * 2); c.fill();
  }

  // Ears
  c.fillStyle = o.skin;
  c.beginPath(); c.ellipse(cx - w * 0.2, cy - w * 0.02, w * 0.03, w * 0.05, 0, 0, Math.PI * 2); c.fill();
  c.beginPath(); c.ellipse(cx + w * 0.2, cy - w * 0.02, w * 0.03, w * 0.05, 0, 0, Math.PI * 2); c.fill();

  // Eyes
  const ey = cy - w * 0.02, eo = w * 0.08;
  c.fillStyle = '#fff';
  c.beginPath(); c.ellipse(cx - eo, ey, w * 0.045, w * 0.032, 0, 0, Math.PI * 2); c.fill();
  c.beginPath(); c.ellipse(cx + eo, ey, w * 0.045, w * 0.032, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = o.eye || '#3a2a1a';
  c.beginPath(); c.arc(cx - eo, ey, w * 0.025, 0, Math.PI * 2); c.fill();
  c.beginPath(); c.arc(cx + eo, ey, w * 0.025, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#111';
  c.beginPath(); c.arc(cx - eo, ey, w * 0.013, 0, Math.PI * 2); c.fill();
  c.beginPath(); c.arc(cx + eo, ey, w * 0.013, 0, Math.PI * 2); c.fill();
  // Eye highlights
  c.fillStyle = 'rgba(255,255,255,.6)';
  c.beginPath(); c.arc(cx - eo - w * 0.007, ey - w * 0.007, w * 0.006, 0, Math.PI * 2); c.fill();
  c.beginPath(); c.arc(cx + eo - w * 0.007, ey - w * 0.007, w * 0.006, 0, Math.PI * 2); c.fill();

  // Eyebrows
  c.strokeStyle = hc; c.lineWidth = w * 0.016; c.lineCap = 'round';
  c.beginPath(); c.moveTo(cx - eo - w * 0.04, ey - w * 0.055);
  c.quadraticCurveTo(cx - eo, ey - w * 0.072, cx - eo + w * 0.04, ey - w * 0.05); c.stroke();
  c.beginPath(); c.moveTo(cx + eo - w * 0.04, ey - w * 0.05);
  c.quadraticCurveTo(cx + eo, ey - w * 0.072, cx + eo + w * 0.04, ey - w * 0.055); c.stroke();

  // Nose
  const sk2 = dk(o.skin, 0.12);
  c.strokeStyle = sk2; c.lineWidth = w * 0.008;
  c.beginPath(); c.moveTo(cx, cy + w * 0.01); c.lineTo(cx - w * 0.018, cy + w * 0.055);
  c.quadraticCurveTo(cx, cy + w * 0.065, cx + w * 0.018, cy + w * 0.055); c.stroke();

  // Mouth
  c.fillStyle = o.lip || '#d4928a';
  c.beginPath(); c.moveTo(cx - w * 0.05, cy + w * 0.11);
  c.quadraticCurveTo(cx, cy + w * 0.085, cx + w * 0.05, cy + w * 0.11);
  c.quadraticCurveTo(cx, cy + w * 0.125, cx - w * 0.05, cy + w * 0.11); c.fill();
  c.strokeStyle = o.lip || '#c4826a'; c.lineWidth = w * 0.008;
  c.beginPath(); c.moveTo(cx - w * 0.055, cy + w * 0.108);
  c.quadraticCurveTo(cx, cy + w * 0.155, cx + w * 0.055, cy + w * 0.108); c.stroke();

  // Glasses
  if (o.gl) {
    c.strokeStyle = 'rgba(100,110,130,.5)'; c.lineWidth = w * 0.012;
    c.beginPath(); c.ellipse(cx - eo, ey, w * 0.06, w * 0.045, 0, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.ellipse(cx + eo, ey, w * 0.06, w * 0.045, 0, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.moveTo(cx - eo + w * 0.06, ey); c.lineTo(cx + eo - w * 0.06, ey); c.stroke();
  }
}
