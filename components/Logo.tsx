import React from 'react';

const Logo: React.FC<{ className?: string }> = ({ className = "h-12 w-auto" }) => {
  return (
    <div className={className}>
        <svg 
            viewBox="0 0 480 120" 
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
            aria-label="Mozup Academy Logo"
        >
            <defs>
                <style>
                {`
                    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;800&display=swap');
                    .mozup-text { font-family: 'Inter', sans-serif; font-size: 80px; font-weight: 800; letter-spacing: -2px; }
                    /* Style for "ACADEMY" inspired by the image's tagline */
                    .academy-text { font-family: 'Inter', sans-serif; font-size: 20px; font-weight: 400; letter-spacing: 4px; text-transform: uppercase; fill: #4D4D4D; }
                `}
                </style>
            </defs>
            
            <g>
                {/* MOZ text */}
                <text x="0" y="75" className="mozup-text" fill="#F15A24">MOZ</text>
                
                {/* U with integrated arrow - using a darker, reddish orange */}
                <g transform="translate(200, 0)">
                    <path d="M15 0 V 40 C 15 72.6 37.4 95 65 95 S 115 72.6 115 40 V 0 H 90 V 40 C 90 59.4 78.4 75 65 75 S 40 59.4 40 40 V 0 Z" fill="#D73327"/>
                    {/* White arrow inside the U */}
                    <path d="M65 15 L50 40 H 80 Z" fill="white"/>
                </g>
                
                {/* P text */}
                <text x="320" y="75" className="mozup-text" fill="#F15A24">P</text>
            </g>
            
            {/* ACADEMY tagline, centered under MOZUP */}
            <text x="240" y="115" textAnchor="middle" className="academy-text">
                ACADEMY
            </text>
        </svg>
    </div>
  );
};

export default Logo;
