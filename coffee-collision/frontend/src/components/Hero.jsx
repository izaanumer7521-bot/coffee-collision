import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../i18n/LangContext.jsx';

// Put your frames in frontend/public/frames named frame_001.png ... frame_NNN.png
// (.png, .jpg or .webp — change FRAME_EXT) and set FRAME_COUNT to how many you have.
const FRAME_COUNT = 95;
const FRAME_EXT = 'webp';
const frameSrc = (i) => `/frames/frame_${String(i + 1).padStart(3, '0')}.${FRAME_EXT}`;

export default function Hero() {
  const { t } = useLang();
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const framesRef = useRef([]);
  const [loaded, setLoaded] = useState(0);

  // preload frames
  useEffect(() => {
    let count = 0;
    framesRef.current = Array.from({ length: FRAME_COUNT }, (_, i) => {
      const img = new Image();
      img.onload = () => { count += 1; setLoaded(count); if (i === 0) draw(0); };
      img.src = frameSrc(i);
      return img;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const draw = (index) => {
    const canvas = canvasRef.current;
    const img = framesRef.current[index];
    if (!canvas || !img || !img.complete || !img.naturalWidth) return;
    const ctx = canvas.getContext('2d');
    const { width: cw, height: ch } = canvas;
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, cw, ch);

    // cup size: ~70% of the hero height on desktop, never wider than the screen on phones
    const scale = Math.min((0.7 * ch) / img.naturalHeight, (1.6 * cw) / img.naturalWidth);
    const w = img.naturalWidth * scale;
    const h = img.naturalHeight * scale;
    // glass sits at ~48% of the frame width; put that point at 60% of the screen (cup right of centre)
    const dpr = window.devicePixelRatio || 1;
    const mobile = cw < 700 * dpr;
    const targetX = mobile ? 0.5 * cw : 0.6 * cw;
    const x = targetX - 0.48 * w;
    const y = (mobile ? 0.52 : 0.67) * ch - h / 2;
    ctx.drawImage(img, x, y, w, h);

  };

  // scroll -> frame
  useEffect(() => {
    const canvas = canvasRef.current;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      onScroll();
    };
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const wrap = wrapRef.current;
        if (!wrap) return;
        const rect = wrap.getBoundingClientRect();
        const total = wrap.offsetHeight - window.innerHeight;
        const p = Math.min(1, Math.max(0, -rect.top / total));
        const idx = Math.min(FRAME_COUNT - 1, Math.floor(p * FRAME_COUNT));
        draw(idx);
        wrap.style.setProperty('--p', p.toFixed(3));
      });
    };
    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', onScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded]);

  return (
    <section className="hero-wrap" ref={wrapRef} style={{ '--p': 0 }}>
      <div className="hero-stick">
        <h1 className="hero-title" aria-label="Evara">
          <span>Evara</span>
        </h1>
        <canvas ref={canvasRef} className="hero-canvas" aria-hidden="true" />
        <div className="hero-copy">
          <p className="hero-kicker">{t('heroKicker')}</p>
          <p className="hero-quote">{t('heroQuote')}</p>
          <p className="hero-sub">{t('heroSub')}</p>
          <Link to="/create" className="btn">{t('createCupCta')}</Link>
        </div>
        {loaded < FRAME_COUNT && <div className="hero-loading">{t('loading')} {Math.round((loaded / FRAME_COUNT) * 100)}%</div>}
      </div>
    </section>
  );
}
