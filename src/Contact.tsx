import Avatar from "./Avatar.js";

export default function Contact({id,username,onClick,selected,online}: any) {
  return (
    <div key={id} onClick={() => onClick(id)}
         className={"border-b border-gray flex items-center gap-2 cursor-pointer "+(selected ? 'bg-sky-300' : '')}>

      <div className="flex gap-2 py-2 pl-4 items-center">
        <Avatar online={online} username={username} userId={id}/>
        <span className="text-black text-lg font-medium">{username}</span>
      </div>
    </div>
  );
}