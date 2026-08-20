import React from 'react';

const avatarGradients = [
  'bg-gradient-to-br from-blue-500 to-indigo-600 text-white',
  'bg-gradient-to-br from-emerald-500 to-teal-600 text-white',
  'bg-gradient-to-br from-amber-500 to-orange-600 text-white',
  'bg-gradient-to-br from-primary to-blue-600 text-white',
  'bg-gradient-to-br from-violet-500 to-purple-600 text-white',
  'bg-gradient-to-br from-rose-500 to-pink-600 text-white',
  'bg-gradient-to-br from-teal-500 to-cyan-600 text-white',
];

export default function Avatar({ userId, username, online, size = 'md' }: any) {
  const userIdBase10 = userId ? parseInt(userId.substring(Math.max(0, userId.length - 6)), 16) || 0 : 0;
  const gradientClass = avatarGradients[userIdBase10 % avatarGradients.length];

  const sizeClasses = size === 'sm' 
    ? 'w-8 h-8 text-xs' 
    : size === 'lg' 
    ? 'w-12 h-12 text-base' 
    : 'w-10 h-10 text-sm';

  const dotSize = size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3';

  const initials = username
    ? username.trim().split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  return (
    <div className={`relative ${sizeClasses} rounded-2xl flex items-center justify-center font-bold uppercase shadow-xs shrink-0 select-none ${gradientClass}`}>
      <span>{initials}</span>

      {/* Online / Offline Status Dot */}
      <span
        className={`absolute bottom-0 right-0 ${dotSize} rounded-full ring-2 ring-white ${
          online ? 'bg-emerald-500 shadow-xs' : 'bg-slate-300'
        }`}
        title={online ? 'Online' : 'Offline'}
      />
    </div>
  );
}

