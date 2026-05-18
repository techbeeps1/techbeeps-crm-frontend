export default function Avatar({ userId, username, online }: any) {
  const colors = [
    'bg-stroke', 'bg-transparent', 'bg-success', 'bg-secondary',
    'bg-primary', 'bg-warning', 'bg-meta-9', 'bg-meta-1', 'bg-strokedark', 'bg-meta-2'
  ];
  
  const userIdBase10 = parseInt(userId.substring(10), 16);
  const colorIndex = userIdBase10 % colors.length;
  const color = colors[colorIndex];

  return (
    <div className={`hidden md:block relative w-12 h-12 flex items-center justify-center rounded-full border-2 border-gray-300 ${color} hover:ring-4 hover:ring-blue transition-all duration-300`}>
      <div className="text-center text-lg font-semibold text-black uppercase w-full">{username && username[0]}</div>

      {/* Online Status */}
      <div className={`absolute w-3 h-3 rounded-full border-2 border-white ${online ? 'bg-danger' : 'bg-gray'} bottom-0 right-0`} />
    </div>
  );
}
