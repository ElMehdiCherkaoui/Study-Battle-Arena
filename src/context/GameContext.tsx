import { createContext, useContext, useState, useCallback, useEffect, useMemo, useRef } from 'react';
import type { ReactNode } from 'react';
import type { Question, Difficulty } from '../data/questions';
import { shuffled, getQuestionsByDifficulty } from '../data/questions';

// =================== TYPES ===================

export type Topic = 'sql';
export type GamePhase =
  | 'home'
  | 'lobby'
  | 'countdown'
  | 'question'
  | 'round-summary'
  | 'final-results';

export interface Player {
  id: string;
  name: string;
  avatar: string;
  score: number;
  isOwner: boolean;
  isReady: boolean;
  answers: PlayerAnswer[];
  streak: number;
}

export interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  avatar: string;
  text: string;
  timestamp: number;
  type: 'user' | 'system';
}

export interface PlayerAnswer {
  questionId: string;
  answer: string;
  isCorrect: boolean;
  responseTime: number; // seconds taken
  pointsEarned: number;
}

export interface LobbySettings {
  topic: Topic;
  difficulty: Difficulty;
  maxPlayers: number;
  rounds: number;
  timePerQuestion: number; // seconds
}

export interface Room {
  id: string;
  code: string;
  ownerId: string;
  settings: LobbySettings;
  players: Player[];
  phase: GamePhase;
  currentRound: number;
  currentQuestionIndex: number;
  questionSet: Question[];
  messages: ChatMessage[];
}

// =================== AVATARS ===================

export const AVATARS = [
  { id: 'rocket',   emoji: '🚀', label: 'Rocket' },
  { id: 'dragon',   emoji: '🐉', label: 'Dragon' },
  { id: 'alien',    emoji: '👽', label: 'Alien' },
  { id: 'robot',    emoji: '🤖', label: 'Robot' },
  { id: 'ninja',    emoji: '🥷', label: 'Ninja' },
  { id: 'wizard',   emoji: '🧙', label: 'Wizard' },
  { id: 'fox',      emoji: '🦊', label: 'Fox' },
  { id: 'panda',    emoji: '🐼', label: 'Panda' },
];

// =================== SCORING ===================

export const calculateScore = (
  isCorrect: boolean,
  responseTime: number,
  totalTime: number,
  isFirstCorrect: boolean,
  streak: number
): number => {
  if (!isCorrect) return -10;
  const base = 100;
  const speedRatio = Math.max(0, 1 - responseTime / totalTime);
  const speedBonus = Math.round(speedRatio * 50);
  const firstBonus = isFirstCorrect ? 20 : 0;
  const streakBonus = streak >= 3 ? Math.min(streak * 10, 30) : 0;
  return base + speedBonus + firstBonus + streakBonus;
};

// =================== ROOM CODE ===================

const generateRoomCode = (): string =>
  Math.random().toString(36).substring(2, 8).toUpperCase();

const generateId = (): string =>
  Math.random().toString(36).substring(2, 10);

const STORAGE_KEY = 'sba.rooms.v1';
const SESSION_PLAYER_KEY = 'sba.session.playerId';
const SESSION_ROOM_KEY = 'sba.session.roomCode';

const readRooms = (): Record<string, Room> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, Room>) : {};
  } catch {
    return {};
  }
};

const writeRooms = (rooms: Record<string, Room>) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rooms));
};

const readRoomByCode = (code: string): Room | null => {
  const rooms = readRooms();
  return rooms[code.toUpperCase()] ?? null;
};

const writeRoom = (room: Room) => {
  const rooms = readRooms();
  rooms[room.code] = room;
  writeRooms(rooms);
};

const findAvailableRoomCode = (): string => {
  let code = generateRoomCode();
  while (readRoomByCode(code)) {
    code = generateRoomCode();
  }
  return code;
};

// =================== CONTEXT ===================

interface GameContextValue {
  room: Room | null;
  currentPlayer: Player | null;
  activeQuestion: Question | null;

  createRoom: (playerName: string, avatar: string) => Room;
  joinRoom: (code: string, playerName: string, avatar: string) => string | null; // returns room.id or null
  updateSettings: (settings: Partial<LobbySettings>) => void;
  setPlayerReady: (playerId: string, ready: boolean) => void;
  startGame: () => void;
  submitAnswer: (answer: string, responseTime: number) => PlayerAnswer;
  nextQuestion: () => void;
  nextRound: () => void;
  resetGame: () => void;
  setPhase: (phase: GamePhase) => void;
  sendMessage: (text: string, type?: 'user' | 'system') => void;
}

const GameContext = createContext<GameContextValue | null>(null);

export const useGame = () => {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
};

// =================== PROVIDER ===================

function buildQuestionSet(settings: LobbySettings, roundCount: number): Question[] {
  const pool = shuffled(getQuestionsByDifficulty(settings.difficulty));
  return pool.slice(0, Math.min(roundCount, pool.length));
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [room, setRoom] = useState<Room | null>(null);
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentRoomCode = room?.code ?? null;

  const broadcastRoomUpdated = useCallback((code: string) => {
    channelRef.current?.postMessage({ type: 'room-updated', code, ts: Date.now() });
  }, []);

  const syncRoomFromStorage = useCallback((code: string) => {
    const latest = readRoomByCode(code);
    if (!latest) return;
    setRoom(prev => {
      if (!prev) return latest;
      if (JSON.stringify(prev) === JSON.stringify(latest)) return prev;
      return latest;
    });
  }, []);

  const attachRoomSync = useCallback((code: string) => {
    if (channelRef.current) {
      channelRef.current.close();
      channelRef.current = null;
    }
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }

    try {
      channelRef.current = new BroadcastChannel(`sba-room-${code}`);
      channelRef.current.onmessage = (event) => {
        if (event?.data?.type === 'room-updated' && event?.data?.code === code) {
          syncRoomFromStorage(code);
        }
      };
    } catch {
      channelRef.current = null;
    }

    pollRef.current = setInterval(() => syncRoomFromStorage(code), 2500);
  }, [syncRoomFromStorage]);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY || !currentRoomCode) return;
      syncRoomFromStorage(currentRoomCode);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [currentRoomCode, syncRoomFromStorage]);

  useEffect(() => {
    const savedPlayer = sessionStorage.getItem(SESSION_PLAYER_KEY);
    const savedRoomCode = sessionStorage.getItem(SESSION_ROOM_KEY);
    if (!savedPlayer || !savedRoomCode) return;

    const savedRoom = readRoomByCode(savedRoomCode);
    if (!savedRoom) return;

    setCurrentPlayerId(savedPlayer);
    setRoom(savedRoom);
    attachRoomSync(savedRoom.code);
  }, [attachRoomSync]);

  useEffect(() => {
    return () => {
      if (channelRef.current) channelRef.current.close();
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const setSession = useCallback((playerId: string, roomCode: string) => {
    sessionStorage.setItem(SESSION_PLAYER_KEY, playerId);
    sessionStorage.setItem(SESSION_ROOM_KEY, roomCode);
    setCurrentPlayerId(playerId);
  }, []);

  const patchRoom = useCallback((code: string, updater: (current: Room) => Room): Room | null => {
    const current = readRoomByCode(code);
    if (!current) return null;
    const updated = updater(current);
    writeRoom(updated);
    setRoom(updated);
    broadcastRoomUpdated(code);
    return updated;
  }, [broadcastRoomUpdated]);

  const currentPlayer = useMemo(
    () => room?.players.find(p => p.id === currentPlayerId) ?? null,
    [room, currentPlayerId]
  );

  const activeQuestion = useMemo(
    () => (room ? room.questionSet[room.currentQuestionIndex] ?? null : null),
    [room]
  );

  const createRoom = useCallback((playerName: string, avatar: string): Room => {
    const playerId = generateId();
    const settings: LobbySettings = {
      topic: 'sql',
      difficulty: 'easy',
      maxPlayers: 6,
      rounds: 5,
      timePerQuestion: 60,
    };
    const player: Player = {
      id: playerId,
      name: playerName,
      avatar,
      score: 0,
      isOwner: true,
      isReady: false,
      answers: [],
      streak: 0,
    };
    const roomCode = findAvailableRoomCode();
    const newRoom: Room = {
      id: generateId(),
      code: roomCode,
      ownerId: playerId,
      settings,
      players: [player],
      phase: 'lobby',
      currentRound: 1,
      currentQuestionIndex: 0,
      questionSet: [],
      messages: [],
    };
    writeRoom(newRoom);
    setRoom(newRoom);
    setSession(playerId, newRoom.code);
    attachRoomSync(newRoom.code);
    return newRoom;
  }, [attachRoomSync, setSession]);

  const joinRoom = useCallback((code: string, playerName: string, avatar: string): string | null => {
    const normalizedCode = code.toUpperCase();
    const targetRoom = readRoomByCode(normalizedCode);
    if (!targetRoom) return null;
    if (targetRoom.players.length >= targetRoom.settings.maxPlayers) return null;
    if (targetRoom.players.some(p => p.name.toLowerCase() === playerName.toLowerCase())) return null;

    const playerId = generateId();
    const newPlayer: Player = {
      id: playerId, name: playerName, avatar,
      score: 0, isOwner: false, isReady: false, answers: [], streak: 0,
    };

    const updated = patchRoom(normalizedCode, r => ({ ...r, players: [...r.players, newPlayer] }));
    if (!updated) return null;

    setSession(playerId, normalizedCode);
    attachRoomSync(normalizedCode);
    return updated.id; // return room UUID so caller can navigate
  }, [attachRoomSync, patchRoom, setSession]);

  const updateSettings = useCallback((settings: Partial<LobbySettings>) => {
    if (!room || !currentPlayer || !currentPlayer.isOwner) return;
    patchRoom(room.code, r => ({
      ...r,
      settings: { ...r.settings, ...settings },
      questionSet: [],
    }));
  }, [room, currentPlayer, patchRoom]);

  const setPlayerReady = useCallback((playerId: string, ready: boolean) => {
    if (!room) return;
    patchRoom(room.code, r => ({
      ...r,
      players: r.players.map(p => p.id === playerId ? { ...p, isReady: ready } : p),
    }));
  }, [room, patchRoom]);

  const startGame = useCallback(() => {
    if (!room || !currentPlayer?.isOwner) return;
    patchRoom(room.code, r => {
      const qs = buildQuestionSet(r.settings, r.settings.rounds);
      return {
        ...r,
        questionSet: qs,
        currentRound: 1,
        currentQuestionIndex: 0,
        phase: 'countdown',
        players: r.players.map(p => ({ ...p, score: 0, answers: [], streak: 0 })),
      };
    });
  }, [room, currentPlayer, patchRoom]);

  const sendMessage = useCallback((text: string, type: 'user' | 'system' = 'user') => {
    if (!room || !currentPlayer) return;
    
    patchRoom(room.code, r => {
      const msg: ChatMessage = {
        id: generateId(),
        playerId: currentPlayer.id,
        playerName: currentPlayer.name,
        avatar: currentPlayer.avatar,
        text,
        timestamp: Date.now(),
        type,
      };
      
      const newMessages = [...(r.messages || []), msg].slice(-100);
      return { ...r, messages: newMessages };
    });
  }, [room, currentPlayer, patchRoom]);

  const submitAnswer = useCallback((answer: string, responseTime: number): PlayerAnswer => {
    const empty: PlayerAnswer = { questionId: '', answer, isCorrect: false, responseTime, pointsEarned: 0 };
    if (!room || !currentPlayerId) return empty;

    // Read the current state from storage (source of truth)
    const current = readRoomByCode(room.code);
    if (!current) return empty;

    const q = current.questionSet[current.currentQuestionIndex];
    if (!q) return empty;

    // Only block if they already answered *correctly*
    const alreadyAnsweredCorrectly = current.players
      .find(p => p.id === currentPlayerId)
      ?.answers.some(a => a.questionId === q.id && a.isCorrect);
    
    if (alreadyAnsweredCorrectly) return empty;

    const normalize = (value: string) => value.trim().replace(/\s+/g, ' ').toLowerCase();
    const isCorrect = normalize(answer) === normalize(q.answer);
    
    if (!isCorrect) {
      // Do not permanently record wrong answers, just let the UI know it was wrong
      return { questionId: q.id, answer, isCorrect: false, responseTime, pointsEarned: 0 };
    }

    const firstCorrect = !current.players.some(p => p.answers.some(a => a.questionId === q.id && a.isCorrect));
    const currentPlayerState = current.players.find(p => p.id === currentPlayerId);
    const streak = currentPlayerState?.streak ?? 0;

    const points = calculateScore(isCorrect, responseTime, current.settings.timePerQuestion, firstCorrect, streak);
    const newStreak = isCorrect ? streak + 1 : 0;

    const result: PlayerAnswer = {
      questionId: q.id,
      answer,
      isCorrect,
      responseTime,
      pointsEarned: Math.max(0, points),
    };

    // Now patch storage
    patchRoom(room.code, r => ({
      ...r,
      players: r.players.map(p => {
        if (p.id !== currentPlayerId) return p;
        return {
          ...p,
          score: Math.max(0, p.score + points),
          answers: [...p.answers, result],
          streak: newStreak,
        };
      }),
    }));

    // Send a system message that this player got it right!
    if (currentPlayerState) {
      sendMessage(`${currentPlayerState.avatar} ${currentPlayerState.name} found the correct answer! 🎉`, 'system');
    }

    return result;
  }, [room, currentPlayerId, patchRoom, sendMessage]);

  const nextQuestion = useCallback(() => {
    if (!room || !currentPlayer?.isOwner) return;
    patchRoom(room.code, r => {
      const nextIdx = r.currentQuestionIndex + 1;
      if (nextIdx >= r.questionSet.length) {
        return { ...r, phase: 'final-results' };
      }
      return { ...r, currentQuestionIndex: nextIdx, currentRound: nextIdx + 1, phase: 'question' };
    });
  }, [room, currentPlayer, patchRoom]);

  const nextRound = useCallback(() => {
    if (!room || !currentPlayer?.isOwner) return;
    patchRoom(room.code, r => ({ ...r, currentRound: r.currentRound + 1, phase: 'question' }));
  }, [room, currentPlayer, patchRoom]);

  const resetGame = useCallback(() => {
    if (!room) return;
    patchRoom(room.code, r => ({
      ...r,
      phase: 'lobby',
      currentRound: 1,
      currentQuestionIndex: 0,
      questionSet: [],
      players: r.players.map(p => ({ ...p, score: 0, answers: [], streak: 0, isReady: false })),
    }));
  }, [room, patchRoom]);

  const setPhase = useCallback((phase: GamePhase) => {
    if (!room) return;
    patchRoom(room.code, r => ({ ...r, phase }));
  }, [room, patchRoom]);

  return (
    <GameContext.Provider value={{
      room, currentPlayer, activeQuestion,
      createRoom, joinRoom, updateSettings, setPlayerReady,
      startGame, submitAnswer, nextQuestion, nextRound, resetGame, setPhase, sendMessage,
    }}>
      {children}
    </GameContext.Provider>
  );
}
