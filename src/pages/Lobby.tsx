import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';

export default function Lobby() {
  const { room, currentPlayer, updateSettings, setPlayerReady, startGame } = useGame();
  const navigate = useNavigate();
  const prevCount = useRef(0);
  const [copied, setCopied] = useState(false);
  const [joinedNotice, setJoinedNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!room) {
      navigate('/');
      return;
    }

    if (room.phase === 'countdown' || room.phase === 'question') {
      navigate(`/game/${room.id}`);
    }
  }, [room, navigate]);

  useEffect(() => {
    if (!room || !currentPlayer) return;

    const count = room.players.length;
    if (prevCount.current > 0 && count > prevCount.current) {
      const newest = room.players[count - 1];
      if (newest && newest.id !== currentPlayer.id) {
        setJoinedNotice(`${newest.avatar} ${newest.name} joined the lobby`);
        setTimeout(() => setJoinedNotice(null), 2200);
      }
    }

    prevCount.current = count;
  }, [room, currentPlayer]);

  if (!room || !currentPlayer) return null;

  const isOwner = currentPlayer.isOwner;
  const nonOwners = room.players.filter((p) => !p.isOwner);
  const readyCount = nonOwners.filter((p) => p.isReady).length;
  const allReady = nonOwners.length === 0 || readyCount === nonOwners.length;

  const copyCode = async () => {
    await navigator.clipboard.writeText(room.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const leave = () => {
    sessionStorage.clear();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {joinedNotice && (
          <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
            {joinedNotice}
          </div>
        )}

        <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-slate-400">Room Lobby</p>
            <h1 className="text-2xl font-bold">Welcome, {currentPlayer.name}</h1>
          </div>

          <button
            onClick={copyCode}
            className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-left transition hover:border-indigo-400"
          >
            <p className="text-xs text-slate-400">Room Code</p>
            <p className="font-mono text-xl font-bold tracking-[0.25em]">{room.code}</p>
            <p className="mt-1 text-xs text-slate-400">{copied ? 'Copied' : 'Click to copy'}</p>
          </button>
        </header>

        <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Players</h2>
              <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
                {room.players.length}/{room.settings.maxPlayers}
              </span>
            </div>

            <div className="space-y-2">
              {room.players.map((p) => (
                <div
                  key={p.id}
                  className={`flex items-center gap-3 rounded-xl border px-3 py-2 ${
                    p.id === currentPlayer.id
                      ? 'border-indigo-400/60 bg-indigo-500/10'
                      : 'border-slate-700 bg-slate-950'
                  }`}
                >
                  <span className="text-2xl">{p.avatar}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{p.name}</p>
                    <p className="text-xs text-slate-400">
                      {p.isOwner ? 'Host' : p.isReady ? 'Ready' : 'Not ready'}
                    </p>
                  </div>
                  {p.isOwner && <span className="text-xs text-amber-300">Host</span>}
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-5">
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-5">
              <h2 className="mb-4 text-lg font-semibold">Game Settings</h2>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-1 text-sm">
                  <span className="text-slate-300">Difficulty</span>
                  <select
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-indigo-400"
                    disabled={!isOwner}
                    value={room.settings.difficulty}
                    onChange={(e) => updateSettings({ difficulty: e.target.value as any })}
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </label>

                <label className="space-y-1 text-sm">
                  <span className="text-slate-300">Questions</span>
                  <select
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-indigo-400"
                    disabled={!isOwner}
                    value={room.settings.rounds}
                    onChange={(e) => updateSettings({ rounds: parseInt(e.target.value, 10) })}
                  >
                    {[3, 5, 7, 10].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1 text-sm">
                  <span className="text-slate-300">Time / Question</span>
                  <select
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-indigo-400"
                    disabled={!isOwner}
                    value={room.settings.timePerQuestion}
                    onChange={(e) => updateSettings({ timePerQuestion: parseInt(e.target.value, 10) })}
                  >
                    {[30, 45, 60, 75].map((n) => (
                      <option key={n} value={n}>
                        {n}s
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1 text-sm">
                  <span className="text-slate-300">Max Players</span>
                  <select
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-indigo-400"
                    disabled={!isOwner}
                    value={room.settings.maxPlayers}
                    onChange={(e) => updateSettings({ maxPlayers: parseInt(e.target.value, 10) })}
                  >
                    {[2, 3, 4, 6, 8, 10, 15, 20, 30].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-5">
              <h3 className="mb-3 text-sm font-semibold text-slate-300">Status</h3>
              <p className="mb-4 text-sm text-slate-400">
                Ready players: {readyCount}/{nonOwners.length}
              </p>

              {isOwner ? (
                <button
                  disabled={!allReady}
                  onClick={() => {
                    startGame();
                    navigate(`/game/${room.id}`);
                  }}
                  className="w-full rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Start Game
                </button>
              ) : (
                <button
                  onClick={() => setPlayerReady(currentPlayer.id, !currentPlayer.isReady)}
                  className={`w-full rounded-xl px-4 py-3 font-semibold transition ${
                    currentPlayer.isReady
                      ? 'border border-emerald-400 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/15'
                      : 'bg-indigo-500 text-white hover:bg-indigo-400'
                  }`}
                >
                  {currentPlayer.isReady ? 'Cancel Ready' : "I'm Ready"}
                </button>
              )}

              <button
                onClick={leave}
                className="mt-3 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 font-medium text-slate-200 transition hover:border-slate-500"
              >
                Leave Room
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
