import React from 'react'

export function Flower({ size = 31, color = '#d3aeb5', center = '#f5d995', className = '' }) {
  return <svg className={className} width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
    <ellipse cx="32" cy="17" rx="10" ry="15" fill={color}/>
    <ellipse cx="32" cy="47" rx="10" ry="15" fill={color}/>
    <ellipse cx="17" cy="32" rx="15" ry="10" fill={color}/>
    <ellipse cx="47" cy="32" rx="15" ry="10" fill={color}/>
    <ellipse cx="21" cy="21" rx="10" ry="14" transform="rotate(-45 21 21)" fill={color}/>
    <ellipse cx="43" cy="21" rx="10" ry="14" transform="rotate(45 43 21)" fill={color}/>
    <ellipse cx="21" cy="43" rx="10" ry="14" transform="rotate(45 21 43)" fill={color}/>
    <ellipse cx="43" cy="43" rx="10" ry="14" transform="rotate(-45 43 43)" fill={color}/>
    <circle cx="32" cy="32" r="11" fill={center}/>
    <circle cx="29" cy="29" r="2" fill="#fff" opacity=".75"/>
  </svg>
}

export function Sprig({ className = '' }) {
  return <svg className={className} width="190" height="145" viewBox="0 0 190 145" fill="none" aria-hidden="true">
    <path d="M20 145C55 111 87 78 129 17" stroke="#94aa92" strokeWidth="3" strokeLinecap="round"/>
    <path d="M57 109C37 90 20 88 12 98C25 117 43 121 57 109Z" fill="#b8cbb3"/>
    <path d="M77 85C65 55 44 47 35 57C43 81 61 93 77 85Z" fill="#a9bda7"/>
    <path d="M99 57C114 33 135 30 143 38C132 60 114 67 99 57Z" fill="#c9d7bf"/>
    <path d="M111 40C100 18 103 3 115 3C127 16 123 32 111 40Z" fill="#aabfa4"/>
    <path d="M36 127C45 104 58 97 70 103C63 124 49 132 36 127Z" fill="#c8d4bd"/>
    <circle cx="136" cy="29" r="9" fill="#e7b9af"/><circle cx="136" cy="29" r="3" fill="#f8edcf"/>
  </svg>
}
