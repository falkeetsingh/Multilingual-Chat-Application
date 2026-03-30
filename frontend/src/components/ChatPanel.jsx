import { useMemo, useState } from 'react';

export default function ChatPanel({
  profile,
  activeChat,
  messages,
  typingText,
  onSend,
  onTyping,
  onMarkRead,
}) {
  const [draft, setDraft] = useState('');

  const otherParticipant = useMemo(() => {
    if (!activeChat || !profile) {
      return null;
    }

    return activeChat.participants.find((participant) => participant._id !== profile.id) || null;
  }, [activeChat, profile]);

  const send = (event) => {
    event.preventDefault();
    if (!draft.trim()) {
      return;
    }

    onSend(draft.trim());
    setDraft('');
  };

  if (!activeChat) {
    return (
      <section className="glass flex h-full items-center justify-center">
        <p className="text-[#6f6458]">Select a chat to start messaging.</p>
      </section>
    );
  }

  return (
    <section className="glass flex h-full flex-col">
      <header className="border-b border-white/50 px-5 py-4">
        <p className="text-xs uppercase tracking-[0.18em] text-[#6f6458]">Conversation</p>
        <h2 className="mt-1 text-xl font-semibold text-[#1d1a16]">{otherParticipant?.name || 'User'}</h2>
        {typingText ? <p className="mt-2 text-xs text-[#0d8b8b]">{typingText}</p> : null}
      </header>

      <div className="min-h-0 flex-1 space-y-3 overflow-auto p-5 pb-20">
        {messages.map((message) => {
          const fromMe = message.senderId === profile.id || message.senderId?._id === profile.id;

          return (
            <div key={message._id || message.messageId} className={`flex ${fromMe ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[78%] rounded-2xl px-4 py-3 shadow ${
                  fromMe ? 'bg-[#0d8b8b] text-white' : 'bg-white text-[#1d1a16]'
                }`}
              >
                <p className="text-sm leading-relaxed">{message.text || message.originalText}</p>
                <div className={`mt-2 flex items-center gap-2 text-[11px] ${fromMe ? 'text-white/80' : 'text-[#8c7e70]'}`}>
                  <span>{new Date(message.createdAt).toLocaleTimeString()}</span>
                  <span>{message.status}</span>
                  {!fromMe && message.status !== 'read' ? (
                    <button
                      className="rounded bg-[#1d1a16] px-2 py-1 text-[10px] uppercase tracking-wide text-white"
                      onClick={() => onMarkRead(message._id || message.messageId)}
                    >
                      mark read
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <form className="sticky bottom-0 z-10 border-t border-white/50 bg-white/80 p-4 backdrop-blur" onSubmit={send}>
        <div className="flex gap-2">
          <input
            value={draft}
            onChange={(event) => {
              setDraft(event.target.value);
              onTyping(Boolean(event.target.value));
            }}
            placeholder="Type a message"
            className="flex-1 rounded-xl border border-[#d7cdc1] bg-white px-4 py-3 outline-none focus:border-[#0d8b8b]"
          />
          <button className="rounded-xl bg-[#ef7e56] px-5 py-3 text-sm font-semibold uppercase tracking-wider text-white hover:bg-[#de6f47]">
            Send
          </button>
        </div>
      </form>
    </section>
  );
}
