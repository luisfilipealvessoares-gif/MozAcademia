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
                    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@500;800&display=swap');
                    .moz-text { font-family: 'Inter', sans-serif; font-size: 50px; font-weight: 800; fill: #f7941d; }
                    .up-text { font-family: 'Inter', sans-serif; font-size: 50px; font-weight: 800; fill: #d95829; }
                    .academy-text { font-family: 'Inter', sans-serif; font-size: 50px; font-weight: 500; fill: #1F2937; }
                `}
                </style>
            </defs>
            
            <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle">
                <tspan className="moz-text">MOZ</tspan>
                <tspan className="up-text">UP</tspan>
                <tspan className="academy-text"> Academy</tspan>
            </text>
        </svg>
    </div>
  );
};

export default Logo;