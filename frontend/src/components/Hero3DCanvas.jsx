import React, { useEffect, useRef } from 'react';

export default function Hero3DCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); let frame; let w=0,h=0;
    const resize=()=>{w=canvas.width=canvas.clientWidth;h=canvas.height=canvas.clientHeight;}; resize(); window.addEventListener('resize',resize);
    const draw=()=>{ctx.clearRect(0,0,w,h); for(let i=0;i<45;i++){const a=i*2.399; const r=30+(i%9)*12; const x=w/2+Math.cos(a+Date.now()/3000)*r; const y=h/2+Math.sin(a+Date.now()/3000)*r; ctx.fillStyle='#D4AF37';ctx.globalAlpha=.35+(i%5)/10;ctx.beginPath();ctx.arc(x,y,1.5+(i%3),0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;frame=requestAnimationFrame(draw);}; draw();
    return ()=>{cancelAnimationFrame(frame);window.removeEventListener('resize',resize);};
  },[]);
  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true"/>;
}
