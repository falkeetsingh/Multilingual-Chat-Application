export default function Sidebar({
  profile,
  users,
  chats,
  activeChat,
  onCreateChat,
  onSelectChat,
  onLogout,
  onLanguageChange,
}) {
  return (
    <aside className="glass flex h-full flex-col border-r border-white/60">
      <div className="border-b border-white/50 p-4">
        <p className="text-xs uppercase tracking-[0.18em] text-[#6f6458]">Signed in as</p>
        <div className="mt-2 flex items-center justify-between gap-2">
          <p className="font-semibold text-[#1d1a16]">{profile?.name}</p>
          <button
            onClick={onLogout}
            className="rounded-lg bg-[#1d1a16] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white"
          >
            Logout
          </button>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <span className="text-xs text-[#6f6458]">Language</span>
          <select
            value={profile?.preferredLanguage || 'en'}
            onChange={(event) => onLanguageChange(event.target.value)}
            className="rounded-lg border border-[#d7cdc1] bg-white px-2 py-1 text-xs"
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="hi">Hindi</option>
            <option value="ar">Arabic</option>
          </select>
        </div>
      </div>

      <div className="border-b border-white/50 p-4">
        <p className="text-xs uppercase tracking-[0.18em] text-[#6f6458]">Start new chat</p>
        <div className="mt-3 space-y-2">
          {users.map((user) => (
            <button
              key={user._id}
              onClick={() => onCreateChat(user._id)}
              className="flex w-full items-center justify-between rounded-xl border border-[#dccfbf] bg-white px-3 py-2 text-left text-sm transition hover:border-[#0d8b8b]"
            >
              <span>{user.name}</span>
              <span className="text-xs text-[#817567]">{user.preferredLanguage}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto p-4">
        <p className="text-xs uppercase tracking-[0.18em] text-[#6f6458]">Your chats</p>
        <div className="mt-3 space-y-2">
          {chats.map((chat) => {
            const other = chat.participants.find((participant) => participant._id !== profile?.id);

            return (
              <button
                key={chat._id}
                onClick={() => onSelectChat(chat)}
                className={`w-full rounded-xl border px-3 py-3 text-left transition ${
                  activeChat?._id === chat._id
                    ? 'border-[#0d8b8b] bg-[#0d8b8b]/12'
                    : 'border-[#dccfbf] bg-white hover:border-[#0d8b8b]'
                }`}
              >
                <p className="font-semibold text-[#1d1a16]">{other?.name || 'Unknown user'}</p>
                <p className="mt-1 line-clamp-1 text-xs text-[#6f6458]">
                  {chat.lastMessage?.originalText || 'No messages yet'}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
