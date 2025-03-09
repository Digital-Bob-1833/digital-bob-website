'use client';

import Image from 'next/image';

interface AvatarProps {
  imageUrl: string;
  size?: number;
  className?: string;
}

export default function Avatar({ imageUrl, size = 200, className = '' }: AvatarProps) {
  return (
    <div 
      className={`relative ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src={imageUrl}
        alt="Avatar"
        width={size}
        height={size}
        priority
        className="rounded-full object-cover"
      />
    </div>
  );
} 