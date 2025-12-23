import React from 'react';

const Logo: React.FC<{ className?: string }> = ({ className = "h-12 w-auto" }) => {
  return (
    <div className={className} style={{ lineHeight: 1 }}>
        <svg 
            viewBox="0 0 450 100" 
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
            aria-label="MozupAcademy"
        >
            <defs>
                <style>
                {`
                    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
                    .mozup-font { font-family: 'Inter', sans-serif; font-weight: 800; font-size: 60px; letter-spacing: -2px; }
                    .tagline-font { font-family: 'Inter', sans-serif; font-weight: 500; font-size: 14px; letter-spacing: 2px; }
                `}
                </style>
            </defs>
            
            {/* MOZUP wordmark */}
            <g>
                <text x="0" y="60" className="mozup-font" fill="#F27A24">MOZ</text>
                
                {/* The 'U' with arrow */}
                <g transform="translate(155, 6)">
                    {/* U shape */}
                    <path d="M12 0 V 30 C 12 50 30 62 45 62 S 78 50 78 30 V 0 H 60 V 30 C 60 42 52 50 45 50 S 30 42 30 30 V 0 Z" fill="#C85B2B"/>
                    {/* Arrow shape (white cutout) */}
                    <path d="M45 5 L35 20 H 40 V 38 H 50 V 20 H 55 Z" fill="white"/>
                </g>
                
                <text x="250" y="60" className="mozup-font" fill="#C85B2B">P</text>
            </g>
            
            {/* Tagline */}
            <text x="155" y="85" text-anchor="middle" className="tagline-font" fill="#4B5563">
                ACADEMY
            </text>
        </svg>
    </div>
  );
};

export default Logo;