import React from 'react';

export default function Navbar({ onNavigate = () => {} }) {
  const links = [['home','Home'],['about','About'],['services','Services'],['portfolio','Portfolio'],['blog','Blog'],['careers','Careers'],['contact','Contact']];
  return <nav aria-label="Main navigation" className="flex flex-wrap items-center gap-3">{links.map(([id,label]) => <button key={id} onClick={() => onNavigate(id)} className="text-sm text-gray-300 hover:text-amber-400">{label}</button>)}</nav>;
}
