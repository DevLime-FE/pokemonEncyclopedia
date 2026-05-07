import React from 'react';
import Link from 'next/link';

interface RegionCardProps {
  name: string;
}

export default function RegionCard({ name }: RegionCardProps) {
  return (
    <Link href={`/region/${name}`}>
      <div className="relative overflow-hidden h-48 cursor-pointer transform transition-all duration-300 border-4 border-black bg-white group shadow-[6px_6px_0_0_#000] hover:shadow-[8px_8px_0_0_#000] hover:-translate-y-1 hover:-translate-x-1">
        {/* Top Red Half */}
        <div className="absolute top-0 left-0 right-0 h-1/2 bg-red-600 border-b-4 border-black transition-colors group-hover:bg-red-500"></div>
        {/* Bottom White Half */}
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-white"></div>
        
        {/* Center Button */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white border-4 border-black rounded-full flex items-center justify-center z-10 transition-transform group-hover:scale-110">
          <div className="w-6 h-6 bg-white border-2 border-black rounded-full"></div>
        </div>

        {/* Text */}
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <h2 className="text-xl sm:text-2xl font-mono uppercase tracking-widest text-black mt-20" style={{ textShadow: '2px 2px 0px white' }}>
            {name}
          </h2>
        </div>
      </div>
    </Link>
  );
}
