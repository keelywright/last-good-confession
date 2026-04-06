/* =========================================================
   THE LAST GOOD CONFESSION — script.js
   Canvas: brushed silver metal, cathedral etchings,
           cursor reflection, custom cursor
   ========================================================= */

(function () {
  'use strict';

  const canvas  = document.getElementById('bg-canvas');
  const ctx     = canvas.getContext('2d');
  const glowEl  = document.getElementById('cursor-glow');
  const dotEl   = document.getElementById('cursor-dot');

  let W, H;
  let rawX = 0,  rawY = 0;
  let glowX = 0, glowY = 0;
  let cursorActive = false;
  let grainTile = null;

  /* --------------------------------------------------
     RESIZE
  -------------------------------------------------- */
  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    buildGrain();
  }

  /* --------------------------------------------------
     GRAIN TILE — brushed steel texture (built once)
  -------------------------------------------------- */
  function buildGrain() {
    const TW = 900, TH = 700;
    const gc  = document.createElement('canvas');
    gc.width  = TW;
    gc.height = TH;
    const gx  = gc.getContext('2d');

    /* base tonal wash — dark silvered steel */
    const base = gx.createLinearGradient(0, 0, 0, TH);
    base.addColorStop(0,   '#28262e');
    base.addColorStop(0.3, '#242230');
    base.addColorStop(0.6, '#22202c');
    base.addColorStop(1,   '#26242e');
    gx.fillStyle = base;
    gx.fillRect(0, 0, TW, TH);

    /* horizontal brushed grain — 1100 micro-lines */
    for (let i = 0; i < 1100; i++) {
      const y = Math.random() * TH;
      const a = Math.random() * 0.04 + 0.004;
      gx.beginPath();
      gx.moveTo(0, y);
      gx.bezierCurveTo(
        TW * 0.33, y + (Math.random() - 0.5) * 1.4,
        TW * 0.66, y + (Math.random() - 0.5) * 1.4,
        TW,        y + (Math.random() - 0.5) * 0.8
      );
      gx.strokeStyle = Math.random() > 0.48
        ? `rgba(210,202,195,${a})`
        : `rgba(12,10,14,${a * 0.7})`;
      gx.lineWidth = Math.random() * 0.5 + 0.12;
      gx.stroke();
    }

    grainTile = gc;
  }

  /* --------------------------------------------------
     LERP
  -------------------------------------------------- */
  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  /* --------------------------------------------------
     DRAW MOTIF — all sacred / mythological etchings
  -------------------------------------------------- */
  function drawMotif(x, y, type, sz, alpha) {
    ctx.save();
    ctx.translate(x, y);
    ctx.globalAlpha = alpha;

    const silver = 'rgba(195,185,172,1)';
    const dim    = 'rgba(160,148,135,1)';
    ctx.strokeStyle = dim;
    ctx.lineWidth   = 0.55;

    switch (type) {

      case 'sacred_heart': {
        /* heart body */
        ctx.beginPath();
        ctx.moveTo(0, -sz * 0.45);
        ctx.bezierCurveTo( sz * 0.55, -sz * 0.9,  sz * 1.05, -sz * 0.2,  0,  sz * 0.55);
        ctx.bezierCurveTo(-sz * 1.05, -sz * 0.2, -sz * 0.55, -sz * 0.9,  0, -sz * 0.45);
        ctx.stroke();
        /* crown cross */
        ctx.beginPath();
        ctx.moveTo(0, -sz * 0.6);
        ctx.lineTo(0, -sz * 1.05);
        ctx.moveTo(-sz * 0.18, -sz * 0.78);
        ctx.lineTo( sz * 0.18, -sz * 0.78);
        ctx.stroke();
        /* flame rays */
        for (let i = 0; i < 5; i++) {
          const ang = -Math.PI / 2 + (i - 2) * 0.28;
          ctx.beginPath();
          ctx.moveTo(Math.cos(ang) * sz * 0.7,  Math.sin(ang) * sz * 0.7);
          ctx.lineTo(Math.cos(ang) * sz * 0.88, Math.sin(ang) * sz * 0.88);
          ctx.strokeStyle = 'rgba(155,80,80,0.55)';
          ctx.stroke();
          ctx.strokeStyle = dim;
        }
        /* cross on heart */
        ctx.beginPath();
        ctx.moveTo(-sz * 0.22, sz * 0.05);
        ctx.lineTo( sz * 0.22, sz * 0.05);
        ctx.moveTo(0, -sz * 0.18);
        ctx.lineTo(0,  sz * 0.28);
        ctx.stroke();
        break;
      }

      case 'cross_ornate': {
        ctx.lineWidth = 0.6;
        const arm  = sz * 0.85;
        const stub = sz * 0.22;
        ctx.beginPath();
        ctx.moveTo(0, -arm); ctx.lineTo(0, arm);
        ctx.moveTo(-arm * 0.7, 0); ctx.lineTo(arm * 0.7, 0);
        ctx.stroke();
        /* trefoil terminals */
        [[-arm * 0.7, 0], [arm * 0.7, 0], [0, -arm], [0, arm]].forEach(([ex, ey]) => {
          ctx.beginPath();
          ctx.moveTo(ex - stub * 0.4, ey - stub * 0.05);
          ctx.lineTo(ex, ey - stub * 0.28);
          ctx.lineTo(ex + stub * 0.4, ey - stub * 0.05);
          ctx.moveTo(ex - stub * 0.05, ey - stub * 0.4);
          ctx.lineTo(ex + stub * 0.28, ey);
          ctx.lineTo(ex - stub * 0.05, ey + stub * 0.4);
          ctx.stroke();
        });
        ctx.beginPath();
        ctx.arc(0, 0, sz * 0.2, 0, Math.PI * 2);
        ctx.stroke();
        break;
      }

      case 'wound': {
        /* Christ's sacred side wound */
        ctx.strokeStyle = 'rgba(140,60,60,0.6)';
        ctx.lineWidth   = 0.7;
        ctx.beginPath();
        ctx.ellipse(0, 0, sz * 0.55, sz * 0.28, Math.PI * 0.1, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(0, 0, sz * 0.32, sz * 0.14, Math.PI * 0.1, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(110,35,35,0.5)';
        ctx.stroke();
        /* radiating drops */
        for (let i = 0; i < 4; i++) {
          const ang = Math.random() * Math.PI * 2;
          const r   = sz * 0.3 + Math.random() * sz * 0.15;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(ang) * r, Math.sin(ang) * r);
          ctx.strokeStyle = 'rgba(130,45,45,0.22)';
          ctx.lineWidth = 0.4;
          ctx.stroke();
        }
        break;
      }

      case 'mary_halo': {
        /* double nimbus with rays */
        ctx.beginPath(); ctx.arc(0, 0, sz, 0, Math.PI * 2);       ctx.stroke();
        ctx.beginPath(); ctx.arc(0, 0, sz * 0.82, 0, Math.PI * 2); ctx.stroke();
        for (let i = 0; i < 12; i++) {
          const ang = (i / 12) * Math.PI * 2 - Math.PI / 2;
          ctx.beginPath();
          ctx.moveTo(Math.cos(ang) * sz * 0.82, Math.sin(ang) * sz * 0.82);
          ctx.lineTo(Math.cos(ang) * sz,         Math.sin(ang) * sz);
          ctx.stroke();
        }
        /* veil silhouette */
        ctx.beginPath();
        ctx.moveTo(0, -sz * 0.55);
        ctx.bezierCurveTo( sz * 0.2, -sz * 0.7,  sz * 0.12, -sz * 0.38, 0, -sz * 0.28);
        ctx.bezierCurveTo(-sz * 0.12, -sz * 0.38, -sz * 0.2, -sz * 0.7, 0, -sz * 0.55);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-sz * 0.18, -sz * 0.08);
        ctx.bezierCurveTo(-sz * 0.12, sz * 0.12, sz * 0.12, sz * 0.12, sz * 0.18, -sz * 0.08);
        ctx.stroke();
        break;
      }

      case 'cherub': {
        /* head */
        ctx.beginPath(); ctx.arc(0, -sz * 0.1, sz * 0.3, 0, Math.PI * 2); ctx.stroke();
        /* body */
        ctx.beginPath();
        ctx.moveTo(-sz * 0.22, sz * 0.22);
        ctx.bezierCurveTo(-sz * 0.3, sz * 0.6, sz * 0.3, sz * 0.6, sz * 0.22, sz * 0.22);
        ctx.stroke();
        /* left wing */
        ctx.beginPath();
        ctx.moveTo(-sz * 0.22, sz * 0.22);
        ctx.bezierCurveTo(-sz * 0.8, -sz * 0.05, -sz * 0.95, sz * 0.38, -sz * 0.5, sz * 0.45);
        ctx.stroke();
        /* right wing */
        ctx.beginPath();
        ctx.moveTo(sz * 0.22, sz * 0.22);
        ctx.bezierCurveTo(sz * 0.8, -sz * 0.05, sz * 0.95, sz * 0.38, sz * 0.5, sz * 0.45);
        ctx.stroke();
        /* legs */
        ctx.beginPath();
        ctx.moveTo(-sz * 0.15, sz * 0.42); ctx.lineTo(-sz * 0.22, sz * 0.72);
        ctx.moveTo( sz * 0.15, sz * 0.42); ctx.lineTo( sz * 0.22, sz * 0.72);
        ctx.stroke();
        /* eyes */
        ctx.beginPath();
        ctx.arc(-sz * 0.09, -sz * 0.15, sz * 0.06, 0, Math.PI * 2);
        ctx.arc( sz * 0.09, -sz * 0.15, sz * 0.06, 0, Math.PI * 2);
        ctx.stroke();
        break;
      }

      case 'laurel': {
        /* bilateral leaf sprays */
        ctx.lineWidth = 0.5;
        for (let side = 0; side < 2; side++) {
          const flip = side === 0 ? 1 : -1;
          ctx.save();
          ctx.scale(flip, 1);
          for (let i = 0; i < 6; i++) {
            const t   = i / 5;
            const bx  = sz * 0.15 + t * sz * 0.38;
            const by  = -sz * 0.55 + t * sz * 1.1;
            const ang = -0.7 + t * 0.3;
            ctx.save();
            ctx.translate(bx, by);
            ctx.rotate(ang);
            ctx.beginPath();
            ctx.ellipse(0, 0, sz * 0.14, sz * 0.08, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
          }
          /* stem */
          ctx.beginPath();
          ctx.moveTo(sz * 0.18, -sz * 0.55);
          ctx.bezierCurveTo(sz * 0.45, -sz * 0.3, sz * 0.55, sz * 0.1, sz * 0.48, sz * 0.55);
          ctx.stroke();
          ctx.restore();
        }
        break;
      }

      case 'star_8': {
        /* Marian eight-pointed star */
        ctx.lineWidth = 0.6;
        for (let i = 0; i < 8; i++) {
          const ang  = (i / 8) * Math.PI * 2;
          const ang2 = ang + Math.PI / 8;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(ang) * sz, Math.sin(ang) * sz);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(Math.cos(ang2) * sz * 0.45, Math.sin(ang2) * sz * 0.45);
          ctx.lineTo(Math.cos(ang2) * sz * 0.72, Math.sin(ang2) * sz * 0.72);
          ctx.stroke();
        }
        ctx.beginPath(); ctx.arc(0, 0, sz * 0.20, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(0, 0, sz * 0.45, 0, Math.PI * 2); ctx.stroke();
        break;
      }

      case 'fleur': {
        /* fleur-de-lis */
        ctx.lineWidth = 0.6;
        for (let i = 0; i < 4; i++) {
          ctx.save();
          ctx.rotate((i / 4) * Math.PI * 2);
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.bezierCurveTo( sz * 0.3, -sz * 0.1,  sz * 0.35, -sz * 0.4,  0, -sz * 0.65);
          ctx.bezierCurveTo(-sz * 0.35, -sz * 0.4, -sz * 0.3, -sz * 0.1,  0,  0);
          ctx.stroke();
          ctx.restore();
        }
        ctx.beginPath(); ctx.arc(0, 0, sz * 0.12, 0, Math.PI * 2); ctx.stroke();
        break;
      }

      case 'border_corner': {
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(0, sz * 2); ctx.lineTo(0, sz * 0.3);
        ctx.bezierCurveTo(0, 0, 0, 0, sz * 0.3, 0);
        ctx.lineTo(sz * 2, 0);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, sz * 1.4); ctx.lineTo(0, sz * 0.55);
        ctx.bezierCurveTo(0, sz * 0.28, sz * 0.28, sz * 0.28, sz * 0.55, sz * 0.28);
        ctx.lineTo(sz * 1.4, sz * 0.28);
        ctx.stroke();
        ctx.beginPath(); ctx.arc(sz * 0.3, sz * 0.3, sz * 0.18, 0, Math.PI * 2); ctx.stroke();
        break;
      }
    }

    ctx.restore();
  }

  /* --------------------------------------------------
     BORDER STRIP — fleur-de-lis frieze
  -------------------------------------------------- */
  function drawBorderStrip(y, width) {
    ctx.save();
    ctx.globalAlpha = 0.055;
    ctx.strokeStyle = 'rgba(195,185,172,1)';
    ctx.lineWidth   = 0.5;
    ctx.beginPath(); ctx.moveTo(0, y);   ctx.lineTo(width, y);   ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, y+6); ctx.lineTo(width, y+6); ctx.stroke();
    const step = 52;
    for (let x = step / 2; x < width; x += step) {
      const t = x / width;
      drawMotif(x, y + 3, 'fleur', 7, 0.045 + Math.sin(t * Math.PI) * 0.025);
    }
    ctx.restore();
  }

  /* --------------------------------------------------
     SIDE COLUMNS — recurring motif procession
  -------------------------------------------------- */
  function drawSideColumn(x, flip) {
    const motifs  = ['cherub', 'mary_halo', 'sacred_heart', 'cross_ornate',
                     'wound', 'star_8', 'laurel'];
    const spacing = 220;
    for (let i = 0; i < 12; i++) {
      const y    = 80 + i * spacing + Math.sin(i * 1.3) * 30;
      const type = motifs[i % motifs.length];
      const sz   = 18 + Math.sin(i * 0.7) * 6;
      drawMotif(x, y, type, sz, 0.055 + Math.sin(i * 0.9) * 0.018);
      if (i % 2 === 0) {
        drawMotif(x + (flip * 32), y + 90, 'fleur', 9, 0.035);
      }
    }
  }

  /* --------------------------------------------------
     CENTRAL SPINE — medallions down the page axis
  -------------------------------------------------- */
  function drawSpine() {
    const cx = W * 0.5;
    const items = [
      [cx, 180,  'mary_halo',    22, 0.040],
      [cx, 520,  'sacred_heart', 20, 0.038],
      [cx, 900,  'cross_ornate', 18, 0.035],
      [cx, 1280, 'wound',        16, 0.032],
      [cx, 1650, 'cherub',       22, 0.040],
      [cx, 2020, 'star_8',       17, 0.033],
      [cx, 2380, 'laurel',       20, 0.036],
    ];
    items.forEach(([x, y, t, sz, a]) => {
      if (y < H + 100) drawMotif(x, y, t, sz, a);
    });
  }

  /* --------------------------------------------------
     MAIN DRAW LOOP
  -------------------------------------------------- */
  function draw() {
    ctx.clearRect(0, 0, W, H);

    /* tiled grain texture */
    if (grainTile) {
      const pat = ctx.createPattern(grainTile, 'repeat');
      ctx.fillStyle = pat;
      ctx.fillRect(0, 0, W, H);
    }

    /* vertical depth gradient */
    const depthG = ctx.createLinearGradient(0, 0, 0, H);
    depthG.addColorStop(0,    'rgba(8,6,10,0.42)');
    depthG.addColorStop(0.18, 'rgba(8,6,10,0.20)');
    depthG.addColorStop(0.5,  'rgba(8,6,10,0.10)');
    depthG.addColorStop(0.78, 'rgba(8,6,10,0.18)');
    depthG.addColorStop(1,    'rgba(8,6,10,0.46)');
    ctx.fillStyle = depthG;
    ctx.fillRect(0, 0, W, H);

    /* lateral edge fall-off */
    const sideG = ctx.createLinearGradient(0, 0, W, 0);
    sideG.addColorStop(0,    'rgba(6,4,8,0.35)');
    sideG.addColorStop(0.10, 'rgba(6,4,8,0.08)');
    sideG.addColorStop(0.5,  'transparent');
    sideG.addColorStop(0.90, 'rgba(6,4,8,0.08)');
    sideG.addColorStop(1,    'rgba(6,4,8,0.35)');
    ctx.fillStyle = sideG;
    ctx.fillRect(0, 0, W, H);

    /* calculate side column x positions */
    const margin = Math.max(60, Math.min(120, (W - 680) / 2));
    const lx     = Math.max(40,      W / 2 - 400);
    const rx     = Math.min(W - 40,  W / 2 + 400);

    drawSideColumn(lx - margin * 0.3 + 28,  1);
    drawSideColumn(rx + margin * 0.3 - 28, -1);
    drawSpine();

    /* border friezes */
    drawBorderStrip(0, W);
    drawBorderStrip(H - 8, W);

    /* ornate corner pieces */
    const corners = [
      [0,   0,   0            ],
      [W,   0,   Math.PI / 2  ],
      [0,   H,  -Math.PI / 2  ],
      [W,   H,   Math.PI      ],
    ];
    corners.forEach(([cx, cy, rot]) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rot);
      drawMotif(0, 0, 'border_corner', 32, 0.06);
      ctx.restore();
    });

    /* cursor specular reflection */
    if (cursorActive) {
      glowX = lerp(glowX, rawX, 0.058);
      glowY = lerp(glowY, rawY, 0.058);

      /* broad diffuse lift */
      const lift = ctx.createRadialGradient(glowX, glowY, 0, glowX, glowY, 220);
      lift.addColorStop(0,    'rgba(200,190,178,0.09)');
      lift.addColorStop(0.20, 'rgba(180,170,158,0.042)');
      lift.addColorStop(0.50, 'rgba(155,145,132,0.016)');
      lift.addColorStop(1,    'transparent');
      ctx.fillStyle = lift;
      ctx.fillRect(0, 0, W, H);

      /* anisotropic grain smear */
      ctx.save();
      ctx.translate(glowX, glowY);
      ctx.scale(5.2, 1);
      const smear = ctx.createRadialGradient(0, 0, 0, 0, 0, 48);
      smear.addColorStop(0,   'rgba(205,196,184,0.09)');
      smear.addColorStop(0.4, 'rgba(182,174,162,0.035)');
      smear.addColorStop(1,   'transparent');
      ctx.fillStyle = smear;
      ctx.beginPath(); ctx.arc(0, 0, 48, 0, Math.PI * 2); ctx.fill();
      ctx.restore();

      glowEl.style.left = glowX + 'px';
      glowEl.style.top  = glowY + 'px';
    }

    requestAnimationFrame(draw);
  }

  /* --------------------------------------------------
     CURSOR TRACKING
  -------------------------------------------------- */
  document.addEventListener('mousemove', function (e) {
    rawX = e.clientX;
    rawY = e.clientY;

    dotEl.style.left = rawX + 'px';
    dotEl.style.top  = rawY + 'px';

    if (!cursorActive) {
      cursorActive = true;
      glowEl.style.opacity = '1';
      dotEl.style.opacity  = '1';
      glowX = rawX;
      glowY = rawY;
    }
  });

  document.addEventListener('mouseleave', function () {
    cursorActive = false;
    glowEl.style.opacity = '0';
    dotEl.style.opacity  = '0';
  });

  /* smooth glow position (runs independently of draw) */
  (function tickGlow() {
    glowX = lerp(glowX, rawX, 0.058);
    glowY = lerp(glowY, rawY, 0.058);
    glowEl.style.left = glowX + 'px';
    glowEl.style.top  = glowY + 'px';
    requestAnimationFrame(tickGlow);
  }());

  /* --------------------------------------------------
     INIT
  -------------------------------------------------- */
  resize();
  window.addEventListener('resize', resize);
  draw();

}());
