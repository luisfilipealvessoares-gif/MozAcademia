import React from 'react';

const Logo: React.FC<{ className?: string }> = ({ className = "h-12 w-auto" }) => {
  return (
    <div className={className}>
        <svg 
            viewBox="0 0 400 120" 
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
            aria-label="Mozup Academy Logo"
        >
            <defs>
                <style>
                {`
                    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;800&display=swap');
                    .mozup-text { font-family: 'Inter', sans-serif; font-size: 80px; font-weight: 800; letter-spacing: -2px; fill: #F15A24; }
                    /* Elegant style for Academy: lighter weight, increased spacing */
                    .academy-text { font-family: 'Inter', sans-serif; font-size: 22px; font-weight: 400; letter-spacing: 3px; text-transform: uppercase; fill: #1F2937; }
                `}
                </style>
            </defs>
            
            <g>
                {/* Moz text */}
                <text x="0" y="75" className="mozup-text">Moz</text>
                
                {/* U with integrated arrow, correctly scaled */}
                <g transform="translate(170, 0)">
                    <path d="M10 0 V 45 C 10 70 30 90 55 90 S 100 70 100 45 V 0 H 78 V 45 C 78 58.8 67.8 70 55 70 S 32 58.8 32 45 V 0 Z" fill="#F15A24"/>
                    {/* White arrow inside the U */}
                    <path d="M55 20 L40 45 H 70 Z" fill="white"/>
                </g>
                
                {/* p text */}
                <text x="275" y="75" className="mozup-text">p</text>
            </g>
            
            {/* ACADEMY tagline, centered under Mozup */}
            <text x="200" y="112" textAnchor="middle" className="academy-text">
                Academy
            </text>
        </svg>
    </div>
  );
};

export default Logo;
