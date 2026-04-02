import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';

export default function Results() {
  const { room, currentPlayer, resetGame } = useGame();
  const navigate = useNavigate();

  useEffect(() => {
    if (!room) navigate('/');
  }, [room, navigate]);

  if (!room || !currentPlayer) return null;

  const sorted = [...room.players].sort((a, b) => b.score - a.score);
  const winner = sorted[0];
  const myRank = sorted.findIndex((p) => p.id === currentPlayer.id) + 1;

  const myAnswers = currentPlayer.answers;
  const correct = myAnswers.filter((a) => a.isCorrect).length;
  const accuracy = myAnswers.length > 0 ? Math.round((correct / myAnswers.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100">
      <div className="mx-auto max-w-4xl space-y-5">
        <header className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-center">
          <p className="text-sm text-slate-400">Match Complete</p>
          <h1 className="mt-2 text-3xl font-bold">
            {winner.avatar} {winner.name} wins
          </h1>
          <p className="mt-2 text-slate-300">You finished rank #{myRank}</p>
        </header>

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="mb-3 text-lg font-semibold">Final Leaderboard</h2>
          <div className="space-y-2">
            {sorted.map((p, i) => (
              <div
                key={p.id}
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
                  p.id === currentPlayer.id
                    ? 'border-indigo-400/60 bg-indigo-500/10'
                    : 'border-slate-700 bg-slate-950'
                }`}
              >
                <span className="w-7 text-xs font-bold text-slate-400">#{i + 1}</span>
                <span className="text-2xl">{p.avatar}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{p.name}</p>
                  <p className="text-xs text-slate-400">
                    {p.answers.filter((a) => a.isCorrect).length}/{p.answers.length} correct
                  </p>
                </div>
                <span className="text-lg font-bold text-emerald-400">{p.score}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 text-center">
            <p className="text-xs text-slate-400">Accuracy</p>
            <p className="mt-1 text-2xl font-bold text-emerald-400">{accuracy}%</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 text-center">
            <p className="text-xs text-slate-400">Correct Answers</p>
            <p className="mt-1 text-2xl font-bold text-indigo-300">{correct}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 text-center">
            <p className="text-xs text-slate-400">Final Rank</p>
            <p className="mt-1 text-2xl font-bold text-amber-300">#{myRank}</p>
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-2">
          <button
            onClick={() => {
              resetGame();
              navigate(`/lobby/${room.id}`);
            }}
            className="rounded-xl bg-indigo-500 px-4 py-3 font-semibold text-white transition hover:bg-indigo-400"
          >
            Rematch
          </button>
          <button
            onClick={() => {
              sessionStorage.clear();
              navigate('/');
            }}
            className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 font-semibold text-slate-200 transition hover:border-slate-500"
          >
            Back to Home
          </button>
        </section>
      </div>
    </div>
  );
}
