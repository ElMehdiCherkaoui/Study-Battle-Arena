import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame, AVATARS } from '../context/GameContext';

export default function Home() {
  const { createRoom, joinRoom } = useGame();
  const navigate = useNavigate();

  const [tab, setTab] = useState<'create' | 'join'>('create');
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(AVATARS[0].emoji);
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      setError('Enter your nickname to continue.');
      return;
    }

    setError('');
    setLoading(true);
    await new Promise((r) => setTimeout(r, 180));
    const room = createRoom(name.trim(), avatar);
    navigate(`/lobby/${room.id}`);
  };

  const handleJoin = async () => {
    if (!name.trim()) {
      setError('Enter your nickname to continue.');
      return;
    }

    if (roomCode.trim().length !== 6) {
      setError('Room code must be exactly 6 characters.');
      return;
    }

    setError('');
    setLoading(true);
    await new Promise((r) => setTimeout(r, 180));
    const roomId = joinRoom(roomCode.trim(), name.trim(), avatar);

    if (!roomId) {
      setError('Room not found, full, or nickname already used.');
      setLoading(false);
      return;
    }

    navigate(`/lobby/${roomId}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
        <header className="mb-8 sm:mb-10 text-center">
          <p className="text-sm font-medium text-slate-400">Multiplayer SQL Study Game</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">Study Battle Arena</h1>
          <p className="mx-auto mt-3 max-w-2xl text-slate-300">
            Create a room, invite friends, and answer timed questions with typed responses.
          </p>
        </header>

        <main className="mx-auto max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-6">
          <div className="mb-6 grid grid-cols-2 gap-2 rounded-xl bg-slate-950 p-1">
            <button
              onClick={() => {
                setTab('create');
                setError('');
              }}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                tab === 'create' ? 'bg-indigo-500 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              Create Room
            </button>
            <button
              onClick={() => {
                setTab('join');
                setError('');
              }}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                tab === 'join' ? 'bg-indigo-500 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              Join Room
            </button>
          </div>

          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Nickname</label>
              <input
                value={name}
                maxLength={20}
                onChange={(e) => {
                  setName(e.target.value);
                  setError('');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (tab === 'create') handleCreate();
                    else handleJoin();
                  }
                }}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none transition focus:border-indigo-400"
                placeholder="Enter your nickname"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Avatar</label>
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
                {AVATARS.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setAvatar(item.emoji)}
                    title={item.label}
                    className={`rounded-xl border px-2 py-3 text-2xl transition ${
                      avatar === item.emoji
                        ? 'border-indigo-400 bg-indigo-500/20'
                        : 'border-slate-700 bg-slate-950 hover:border-slate-500'
                    }`}
                  >
                    {item.emoji}
                  </button>
                ))}
              </div>
            </div>

            {tab === 'join' && (
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Room Code</label>
                <input
                  value={roomCode}
                  maxLength={6}
                  onChange={(e) => {
                    setRoomCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''));
                    setError('');
                  }}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-center font-mono text-lg tracking-[0.3em] outline-none transition focus:border-indigo-400"
                  placeholder="ABC123"
                />
              </div>
            )}

            {error && <p className="rounded-xl bg-rose-500/10 px-3 py-2 text-sm text-rose-300">{error}</p>}

            <button
              onClick={tab === 'create' ? handleCreate : handleJoin}
              disabled={loading}
              className="w-full rounded-xl bg-indigo-500 px-4 py-3 font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Please wait...' : tab === 'create' ? 'Create Room' : 'Join Room'}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
