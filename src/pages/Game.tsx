import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame, type Player } from '../context/GameContext';

function Timer({ value, total }: { value: number; total: number }) {
  const percent = total > 0 ? Math.max(0, Math.round((value / total) * 100)) : 0;
  const danger = value <= 10;

  return (
    <div className="min-w-28 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-center">
      <p className="text-xs text-slate-400">Time Left</p>
      <p className={`text-2xl font-bold ${danger ? 'text-rose-400' : 'text-emerald-400'}`}>{value}s</p>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
        <div
          className={`h-full ${danger ? 'bg-rose-400' : 'bg-emerald-400'} transition-all`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function RankingRow({ player, rank, isMe, answered }: { player: Player; rank: number; isMe: boolean; answered: boolean }) {
  return (
    <div
      className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${
        isMe ? 'border-indigo-400/60 bg-indigo-500/10' : 'border-slate-700 bg-slate-900'
      }`}
    >
      <span className="w-7 text-xs font-bold text-slate-400">#{rank}</span>
      <span className="text-xl">{player.avatar}</span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{player.name}</p>
        <p className="text-xs text-slate-400">{answered ? 'Answered' : 'Thinking...'}</p>
      </div>
      <span className="text-sm font-bold text-emerald-400">{player.score}</span>
    </div>
  );
}

export default function Game() {
  const { room, currentPlayer, activeQuestion, submitAnswer, nextQuestion } = useGame();
  const navigate = useNavigate();

  const [typedAnswer, setTypedAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(3);
  const [showQuestion, setShowQuestion] = useState(false);
  const [hintsShown, setHintsShown] = useState(0);
  const [wrongFeedback, setWrongFeedback] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAtRef = useRef(0);
  const lastQuestionRef = useRef<string | null>(null);

  useEffect(() => {
    if (!room) {
      navigate('/');
      return;
    }

    if (room.phase === 'final-results') {
      navigate(`/results/${room.id}`);
    }
  }, [room, navigate]);

  useEffect(() => {
    if (!room || room.phase !== 'question') return;
    if (!activeQuestion) return;

    if (lastQuestionRef.current !== activeQuestion.id) {
      lastQuestionRef.current = activeQuestion.id;
      setCountdown(3);
      setShowQuestion(false);
    }
  }, [room, activeQuestion]);

  useEffect(() => {
    if (countdown === null) return;

    if (countdown <= 0) {
      setCountdown(null);
      setShowQuestion(true);
      return;
    }

    const t = setTimeout(() => setCountdown((c) => (c === null ? null : c - 1)), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const sortedPlayers = useMemo(() => {
    if (!room) return [];
    return [...room.players].sort((a, b) => b.score - a.score);
  }, [room]);

  const isCorrect = useMemo(() => {
    if (!room || !currentPlayer || !activeQuestion) return false;
    const me = room.players.find((p) => p.id === currentPlayer.id);
    return !!me?.answers.some((a) => a.questionId === activeQuestion.id && a.isCorrect);
  }, [room, currentPlayer, activeQuestion]);

  const everyoneFinished = useMemo(() => {
    if (!room || !activeQuestion) return false;
    return room.players.every((p) => p.answers.some((a) => a.questionId === activeQuestion.id && a.isCorrect));
  }, [room, activeQuestion]);

  const ownerAdvance = useCallback(() => {
    if (!room || !currentPlayer?.isOwner) return;
    nextQuestion();
  }, [room, currentPlayer, nextQuestion]);

  useEffect(() => {
    if (!room || !activeQuestion || !showQuestion) return;

    const total = room.settings.timePerQuestion;
    setTypedAnswer('');
    setWrongFeedback(false);
    setHintsShown(0);
    setTimeLeft(total);
    startedAtRef.current = Date.now();

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        const next = Math.max(0, prev - 1);
        const elapsed = total - next;

        if (elapsed >= 50) setHintsShown(3);
        else if (elapsed >= 40) setHintsShown(2);
        else if (elapsed >= 20) setHintsShown(1);

        if (next === 0 && currentPlayer?.isOwner) {
          setTimeout(() => ownerAdvance(), 1500);
        }

        return next;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [room, activeQuestion, showQuestion, currentPlayer, ownerAdvance]);

  useEffect(() => {
    if (!showQuestion || !currentPlayer?.isOwner) return;
    if (!everyoneFinished) return;

    const t = setTimeout(() => ownerAdvance(), 1500);
    return () => clearTimeout(t);
  }, [showQuestion, everyoneFinished, currentPlayer, ownerAdvance]);

  if (!room || !currentPlayer || !activeQuestion) return null;

  if (countdown !== null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        <div className="text-center">
          <p className="mb-3 text-sm text-slate-400">Get Ready</p>
          <h1 className="text-7xl font-bold text-indigo-400">{countdown === 0 ? 'GO' : countdown}</h1>
        </div>
      </div>
    );
  }

  if (!showQuestion) return null;

  const handleSubmit = () => {
    if (!typedAnswer.trim() || isCorrect || timeLeft === 0) return;

    const responseTime = (Date.now() - startedAtRef.current) / 1000;
    const result = submitAnswer(typedAnswer.trim(), responseTime);

    if (!result.isCorrect) {
      setWrongFeedback(true);
      setTimeout(() => setWrongFeedback(false), 1400);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-4 text-slate-100">
      <div className="mx-auto max-w-7xl space-y-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-3 sm:p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs text-slate-400">Question {room.currentQuestionIndex + 1} / {room.questionSet.length}</p>
              <p className="text-sm text-slate-300">Type your answer and submit before time ends.</p>
            </div>
            <Timer value={timeLeft} total={room.settings.timePerQuestion} />
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
          <aside className="rounded-2xl border border-slate-800 bg-slate-900 p-3 sm:p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold">Ranking</h2>
              <span className="text-xs text-slate-400">Live</span>
            </div>
            <div className="space-y-2">
              {sortedPlayers.map((p, i) => (
                <RankingRow
                  key={p.id}
                  player={p}
                  rank={i + 1}
                  isMe={p.id === currentPlayer.id}
                  answered={!!p.answers.find((a) => a.questionId === activeQuestion.id && a.isCorrect)}
                />
              ))}
            </div>
          </aside>

          <main className="rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-6">
            <div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full bg-slate-800 px-2 py-1 text-slate-300">{activeQuestion.subtopic}</span>
              <span className="rounded-full bg-slate-800 px-2 py-1 text-slate-300">{activeQuestion.difficulty}</span>
              <span className="rounded-full bg-slate-800 px-2 py-1 text-slate-300">Typed answer mode</span>
            </div>

            <h1 className="mb-5 text-xl font-bold leading-relaxed sm:text-2xl">{activeQuestion.prompt}</h1>

            <textarea
              value={
                isCorrect
                  ? room.players
                      .find((p) => p.id === currentPlayer.id)
                      ?.answers.find((a) => a.questionId === activeQuestion.id)?.answer ?? typedAnswer
                  : typedAnswer
              }
              onChange={(e) => {
                if (!isCorrect) setTypedAnswer(e.target.value);
              }}
              disabled={isCorrect || timeLeft === 0}
              rows={6}
              className={`w-full rounded-xl border bg-slate-950 px-4 py-3 font-mono text-sm outline-none transition ${
                wrongFeedback
                  ? 'border-rose-400'
                  : isCorrect
                  ? 'border-emerald-400/60'
                  : 'border-slate-700 focus:border-indigo-400'
              }`}
              placeholder="Write your SQL answer here..."
            />

            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="text-xs text-slate-400">Use typed answers only (no selection).</p>
              <button
                onClick={handleSubmit}
                disabled={!typedAnswer.trim() || isCorrect || timeLeft === 0}
                className="rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Submit Answer
              </button>
            </div>

            {(isCorrect || timeLeft === 0) && (
              <div
                className={`mt-4 rounded-xl border px-4 py-3 text-sm ${
                  isCorrect
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
                    : 'border-rose-500/40 bg-rose-500/10 text-rose-200'
                }`}
              >
                {isCorrect
                  ? 'Answer received. Waiting for next question...'
                  : `Time is over. Expected answer: ${activeQuestion.answer}`}
              </div>
            )}

            {hintsShown > 0 && (
              <div className="mt-5 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4">
                <h3 className="mb-2 text-sm font-semibold text-amber-300">Hints</h3>
                <ul className="space-y-2 text-sm text-amber-100">
                  {activeQuestion.hints.slice(0, hintsShown).map((hint, i) => (
                    <li key={i} className="rounded-lg bg-slate-900/70 px-3 py-2">
                      {hint}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
