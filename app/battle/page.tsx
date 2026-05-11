"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useBattle } from '@/src/context/BattleContext';
import { useTranslation } from 'react-i18next';
import { getRandomMoves, MoveDetails, PokemonSpecies, getPokemonSpecies } from '@/src/services/pokeapi';

/**
 * 타입별 테마 컬러 및 보조색
 */
const typeThemes: Record<string, { main: string, light: string, dark: string }> = {
  normal: { main: 'bg-gray-400', light: 'bg-gray-200', dark: 'bg-gray-600' },
  fire: { main: 'bg-red-500', light: 'bg-red-300', dark: 'bg-red-700' },
  water: { main: 'bg-blue-500', light: 'bg-blue-300', dark: 'bg-blue-700' },
  grass: { main: 'bg-green-500', light: 'bg-green-300', dark: 'bg-green-700' },
  electric: { main: 'bg-yellow-400', light: 'bg-yellow-200', dark: 'bg-yellow-600' },
  ice: { main: 'bg-cyan-300', light: 'bg-cyan-100', dark: 'bg-cyan-500' },
  fighting: { main: 'bg-orange-700', light: 'bg-orange-500', dark: 'bg-orange-900' },
  poison: { main: 'bg-purple-500', light: 'bg-purple-300', dark: 'bg-purple-700' },
  ground: { main: 'bg-yellow-600', light: 'bg-yellow-400', dark: 'bg-yellow-800' },
  flying: { main: 'bg-indigo-300', light: 'bg-indigo-100', dark: 'bg-indigo-500' },
  psychic: { main: 'bg-pink-500', light: 'bg-pink-300', dark: 'bg-pink-700' },
  bug: { main: 'bg-lime-500', light: 'bg-lime-300', dark: 'bg-lime-700' },
  rock: { main: 'bg-yellow-800', light: 'bg-yellow-600', dark: 'bg-yellow-900' },
  ghost: { main: 'bg-indigo-800', light: 'bg-indigo-600', dark: 'bg-indigo-950' },
  dragon: { main: 'bg-indigo-600', light: 'bg-indigo-400', dark: 'bg-indigo-800' },
  dark: { main: 'bg-gray-800', light: 'bg-gray-600', dark: 'bg-black' },
  steel: { main: 'bg-gray-500', light: 'bg-gray-300', dark: 'bg-gray-700' },
  fairy: { main: 'bg-pink-300', light: 'bg-pink-100', dark: 'bg-pink-500' }
};

const typeChart: Record<string, Record<string, number>> = {
  normal: { rock: 0.5, ghost: 0, steel: 0.5 },
  fire: { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
  water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  grass: { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
  electric: { water: 2, grass: 0.5, electric: 0.5, ground: 0, flying: 2, dragon: 0.5 },
  ice: { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
  fighting: { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5 },
  poison: { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
  ground: { fire: 2, water: 1, grass: 0.5, electric: 2, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
  flying: { grass: 2, electric: 0.5, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
  psychic: { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
  bug: { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 },
  rock: { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
  ghost: { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
  dragon: { dragon: 2, steel: 0.5, fairy: 0 },
  dark: { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
  steel: { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
  fairy: { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 }
};

const getMultiplier = (attackType: string, defenderTypes: any[]) => {
  let multiplier = 1;
  defenderTypes.forEach(d => {
    const dType = d.type.name;
    if (typeChart[attackType] && typeChart[attackType][dType] !== undefined) {
      multiplier *= typeChart[attackType][dType];
    }
  });
  return multiplier;
};

export default function BattlePage() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { playerPokemon, opponentPokemon, playerMoves: contextPlayerMoves, opponentMoves: contextOpponentMoves, resetBattle } = useBattle();
  
  const [logs, setLogs] = useState<string[]>([]);
  const [battleOver, setBattleOver] = useState(false);
  const [playerHp, setPlayerHp] = useState<number>(0);
  const [oppHp, setOppHp] = useState<number>(0);
  
  const [playerMoves, setPlayerMoves] = useState<MoveDetails[]>([]);
  const [opponentMoves, setOpponentMoves] = useState<MoveDetails[]>([]);
  const [playerSpecies, setPlayerSpecies] = useState<PokemonSpecies | null>(null);
  const [opponentSpecies, setOpponentSpecies] = useState<PokemonSpecies | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [currentTurn, setCurrentTurn] = useState<'player1' | 'player2'>('player1');
  const [isProcessing, setIsProcessing] = useState(false);
  const [damageEffect, setDamageEffect] = useState<'p1' | 'p2' | null>(null);

  const logBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logBoxRef.current) {
      logBoxRef.current.scrollTop = logBoxRef.current.scrollHeight;
    }
  }, [logs]);

  useEffect(() => {
    if (!playerPokemon || !opponentPokemon) {
      router.push('/');
      return;
    }

    const initBattle = async () => {
      let currentPHp = playerPokemon.stats.find(s => s.stat.name === 'hp')?.base_stat || 50;
      let currentOHp = opponentPokemon.stats.find(s => s.stat.name === 'hp')?.base_stat || 50;
      currentPHp *= 3;
      currentOHp *= 3;
      setPlayerHp(currentPHp);
      setOppHp(currentOHp);
      
      try {
        const [pSpecies, oSpecies] = await Promise.all([
          getPokemonSpecies(playerPokemon.name),
          getPokemonSpecies(opponentPokemon.name)
        ]);
        setPlayerSpecies(pSpecies);
        setOpponentSpecies(oSpecies);

        const pMoves = contextPlayerMoves?.length ? contextPlayerMoves : await getRandomMoves(playerPokemon.moves, 4);
        const oMoves = contextOpponentMoves?.length ? contextOpponentMoves : await getRandomMoves(opponentPokemon.moves, 4);
        setPlayerMoves(pMoves);
        setOpponentMoves(oMoves);

        setLogs([
          t('Battle Start!'),
          t('Go, {{name}}!', { name: getLocalizedName(pSpecies, playerPokemon.name) }),
          t('Go, {{name}}!', { name: getLocalizedName(oSpecies, opponentPokemon.name) })
        ]);
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    initBattle();
  }, [playerPokemon, opponentPokemon, router, t]);

  const getLocalizedName = (species: PokemonSpecies | null, defaultName: string) => {
    if (!species) return defaultName;
    const lang = i18n.language.startsWith('ko') ? 'ko' : i18n.language.startsWith('ja') ? 'ja' : 'en';
    const nameObj = species.names.find(n => n.language.name === lang) || 
                   species.names.find(n => n.language.name === 'ko') || 
                   species.names.find(n => n.language.name === 'en');
    return nameObj ? nameObj.name : defaultName;
  };

  const getLocalizedMoveName = (move: MoveDetails) => {
    const lang = i18n.language.startsWith('ko') ? 'ko' : i18n.language.startsWith('ja') ? 'ja' : 'en';
    const nameObj = move.names.find(n => n.language.name === lang) || 
                   move.names.find(n => n.language.name === 'ko') || 
                   move.names.find(n => n.language.name === 'en');
    return nameObj ? nameObj.name : move.name;
  };

  const executeTurn = async (move: MoveDetails) => {
    if (isProcessing || battleOver) return;
    setIsProcessing(true);
    const wait = (ms: number) => new Promise(res => setTimeout(res, ms));
    const isPlayer1 = currentTurn === 'player1';
    const attacker = isPlayer1 ? playerPokemon! : opponentPokemon!;
    const defender = isPlayer1 ? opponentPokemon! : playerPokemon!;
    const attackerSpecies = isPlayer1 ? playerSpecies : opponentSpecies;
    const defenderSpecies = isPlayer1 ? opponentSpecies : playerSpecies;
    const attackerAtk = attacker.stats.find(s => s.stat.name === 'attack')?.base_stat || 10;
    const defenderDef = defender.stats.find(s => s.stat.name === 'defense')?.base_stat || 10;
    const moveName = getLocalizedMoveName(move);
    const attackerName = getLocalizedName(attackerSpecies, attacker.name);
    
    setLogs(prev => [...prev, t('{{name}} used {{move}}!', { name: attackerName, move: moveName })]);
    await wait(800);
    
    const multiplier = getMultiplier(move.type.name, defender.types);
    const power = move.power || 50;
    const damage = Math.max(1, Math.floor(((power * attackerAtk / defenderDef) / 2) * multiplier * (attacker.types.some(t => t.type.name === move.type.name) ? 1.5 : 1)));
    
    setDamageEffect(isPlayer1 ? 'p2' : 'p1');
    if (isPlayer1) {
      const newHp = Math.max(0, oppHp - damage);
      setOppHp(newHp);
      if (multiplier > 1) setLogs(prev => [...prev, t("It's super effective!")]);
      else if (multiplier < 1 && multiplier > 0) setLogs(prev => [...prev, t("It's not very effective...")]);
      else if (multiplier === 0) setLogs(prev => [...prev, t("It had no effect!")]);
      if (multiplier !== 1) await wait(600);
      setLogs(prev => [...prev, t('Dealt {{damage}} damage!', { damage })]);
      if (newHp <= 0) {
        await wait(1000);
        setLogs(prev => [...prev, t('Opponent {{name}} fainted! Player 1 wins!', { name: getLocalizedName(defenderSpecies, defender.name) })]);
        setBattleOver(true); setIsProcessing(false); setDamageEffect(null); return;
      }
    } else {
      const newHp = Math.max(0, playerHp - damage);
      setPlayerHp(newHp);
      if (multiplier > 1) setLogs(prev => [...prev, t("It's super effective!")]);
      else if (multiplier < 1 && multiplier > 0) setLogs(prev => [...prev, t("It's not very effective...")]);
      else if (multiplier === 0) setLogs(prev => [...prev, t("It had no effect!")]);
      if (multiplier !== 1) await wait(600);
      setLogs(prev => [...prev, t('Dealt {{damage}} damage!', { damage })]);
      if (newHp <= 0) {
        await wait(1000);
        setLogs(prev => [...prev, t('{{name}} fainted! Player 2 wins!', { name: getLocalizedName(defenderSpecies, defender.name) })]);
        setBattleOver(true); setIsProcessing(false); setDamageEffect(null); return;
      }
    }
    await wait(600);
    setDamageEffect(null);
    await wait(400);
    setCurrentTurn(isPlayer1 ? 'player2' : 'player1');
    setIsProcessing(false);
  };

  if (!playerPokemon || !opponentPokemon) return null;

  const getStat = (pkmn: any, s: string) => pkmn.stats.find((st: any) => st.stat.name === s)?.base_stat || 0;
  const maxPlayerHp = (getStat(playerPokemon, 'hp') || 50) * 3;
  const maxOppHp = (getStat(opponentPokemon, 'hp') || 50) * 3;
  const getHpPercentage = (c: number, m: number) => Math.max(0, Math.min(100, (c / m) * 100));
  const getHpColor = (p: number) => p > 50 ? 'bg-[#42f554]' : p > 20 ? 'bg-[#f5e042]' : 'bg-[#f54242]';

  const activeMoves = currentTurn === 'player1' ? playerMoves : opponentMoves;
  const activePlayerName = currentTurn === 'player1' ? t('Player 1') : t('Player 2');

  return (
    <div className="min-h-screen bg-[#1a1a1a] p-2 sm:p-4 flex flex-col items-center justify-center overflow-hidden font-sans">
      <div className="w-full max-w-4xl perspective-1000">
        
        {/* 컴팩트 포켓몬 아레나 프레임 */}
        <div className="relative bg-[#DC0A2D] border-[8px] border-black rounded-[2.5rem] shadow-[12px_12px_40px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col transform transition-transform duration-700 hover:scale-[1.005]">
          
          {/* 상단바 (슬림화) */}
          <div className="h-14 sm:h-16 bg-gradient-to-b from-[#ff5f7a] via-[#dc0a2d] to-[#b90020] border-b-[6px] border-black/30 flex items-center px-6 sm:px-8 gap-4 relative">
            <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.15)_0%,rgba(255,255,255,0)_50%)] pointer-events-none"></div>
            <div className="w-10 h-10 rounded-full bg-[#28aafd] border-[4px] border-white shadow-[0_0_15px_#28aafd,inset_4px_4px_8px_rgba(0,0,0,0.5)] relative animate-pulse">
              <div className="absolute top-1 left-1 w-3 h-3 rounded-full bg-white/50 blur-[1px]"></div>
            </div>
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-600 border-[2px] border-black/40"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400 border-[2px] border-black/40"></div>
              <div className="w-3 h-3 rounded-full bg-green-500 border-[2px] border-black/40"></div>
            </div>
            <h1 className="ml-auto text-base sm:text-xl font-mono uppercase font-black text-white italic tracking-tighter drop-shadow-lg">{t('Battle Arena')}</h1>
          </div>

          <div className="p-3 sm:p-5 bg-[#DC0A2D] relative">
            {/* 컴팩트 시뮬레이션 화면 */}
            <div className="relative aspect-video sm:aspect-[21/10] bg-[#222] border-[6px] border-black rounded-2xl overflow-hidden shadow-[inset_0_0_60px_rgba(0,0,0,0.7)]">
              
              {/* 필드 배경 */}
              <div className="absolute inset-0 bg-[#87CEEB] overflow-hidden">
                <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-[#4a6b12] to-[#6b8e23]"></div>
                <div className="absolute top-1/2 w-full h-[1px] bg-white/10"></div>
                <div className="absolute bottom-0 w-full h-full opacity-15" style={{ backgroundImage: 'radial-gradient(circle at 50% 120%, #ffffff 0%, transparent 60%)' }}></div>
              </div>

              {/* 상대방 포켓몬 (컴팩트 레이아웃) */}
              <div className="absolute top-[10%] right-[8%] flex flex-col items-end gap-2 z-10 scale-90 sm:scale-100 origin-right">
                <div className="glassmorphism border-2 border-black/40 p-2 sm:p-3 rounded-bl-[1.5rem] rounded-tr-lg shadow-xl min-w-[180px] sm:min-w-[220px]">
                  <div className="flex justify-between items-end mb-1 border-b border-black/10 pb-0.5">
                    <span className="font-mono font-black text-xs sm:text-sm uppercase text-black/80">{getLocalizedName(opponentSpecies, opponentPokemon.name)}</span>
                    <span className="font-mono text-[9px] font-black text-black/40 italic">Lv50</span>
                  </div>
                  <div className="w-full bg-black/30 border-2 border-black h-3 rounded-full overflow-hidden flex items-center px-0.5">
                    <div className={`h-1.5 rounded-full transition-all duration-1000 ease-out ${getHpColor(getHpPercentage(oppHp, maxOppHp))}`} style={{ width: `${getHpPercentage(oppHp, maxOppHp)}%` }}></div>
                  </div>
                  <div className="flex justify-between mt-1 font-mono text-[9px] font-black text-black/60">
                    <div className="flex gap-0.5">{opponentPokemon.types.map(t => <span key={t.type.name} className="px-1 py-0.5 bg-black/10 rounded uppercase text-[7px]">{t.type.name}</span>)}</div>
                    <span>{Math.max(0, oppHp)} / {maxOppHp}</span>
                  </div>
                </div>
                <div className={`relative transition-all duration-300 ${damageEffect === 'p2' ? 'animate-shake' : ''}`}>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-32 h-6 bg-black/20 rounded-[50%] blur-lg"></div>
                  <img src={opponentPokemon.sprites.front_default} className={`w-32 h-32 sm:w-44 sm:h-44 relative z-10 transition-transform duration-500 ${currentTurn === 'player2' ? 'scale-110 drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]' : 'scale-100 opacity-90'}`} style={{ imageRendering: 'pixelated' }} />
                </div>
              </div>

              {/* 플레이어 포켓몬 (컴팩트 레이아웃) */}
              <div className="absolute bottom-[10%] left-[8%] flex flex-col items-start gap-2 z-10 scale-90 sm:scale-100 origin-left">
                <div className={`relative transition-all duration-300 ${damageEffect === 'p1' ? 'animate-shake' : ''}`}>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-40 h-8 bg-black/20 rounded-[50%] blur-lg"></div>
                  <img src={playerPokemon.sprites.front_default} className={`w-36 h-36 sm:w-52 sm:h-52 relative z-10 transition-transform duration-500 scale-x-[-1] ${currentTurn === 'player1' ? 'scale-x-[-1.1] scale-y-[1.1] drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]' : 'scale-x-[-1] opacity-90'}`} style={{ imageRendering: 'pixelated' }} />
                </div>
                <div className="glassmorphism border-2 border-black/40 p-2 sm:p-4 rounded-br-[1.5rem] rounded-tl-lg shadow-xl min-w-[200px] sm:min-w-[240px]">
                  <div className="flex justify-between items-end mb-1 border-b border-black/10 pb-0.5">
                    <span className="font-mono font-black text-sm sm:text-lg uppercase text-black/80">{getLocalizedName(playerSpecies, playerPokemon.name)}</span>
                    <span className="font-mono text-[10px] font-black text-black/40 italic">Lv50</span>
                  </div>
                  <div className="w-full bg-black/30 border-2 border-black h-3.5 rounded-full overflow-hidden flex items-center px-0.5">
                    <div className={`h-2 rounded-full transition-all duration-1000 ease-out ${getHpColor(getHpPercentage(playerHp, maxPlayerHp))}`} style={{ width: `${getHpPercentage(playerHp, maxPlayerHp)}%` }}></div>
                  </div>
                  <div className="flex justify-between mt-1 font-mono text-[10px] font-black text-black/60">
                    <div className="flex gap-1">{playerPokemon.types.map(t => <span key={t.type.name} className="px-1.5 py-0.5 bg-black/10 rounded uppercase text-[8px]">{t.type.name}</span>)}</div>
                    <span>{Math.max(0, playerHp)} / {maxPlayerHp}</span>
                  </div>
                </div>
              </div>

              {/* 컴팩트 턴 알림 */}
              {!battleOver && !loading && (
                <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
                  <div className={`px-6 py-2 bg-black/70 border-y-2 border-white/20 backdrop-blur-sm transform transition-all duration-500 ${isProcessing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
                    <p className="font-mono text-white text-base sm:text-lg font-black tracking-widest uppercase italic animate-pulse">{activePlayerName} Turn</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 하단 제어 센터 (컴팩트 최적화) */}
          <div className="px-3 sm:px-5 pb-5 bg-[#DC0A2D] flex flex-col md:flex-row gap-3">
            
            {/* 로그 디스플레이 */}
            <div ref={logBoxRef} className="md:w-[35%] bg-[#0a0a0a] border-[4px] border-black rounded-[1.5rem] p-3 h-32 sm:h-40 overflow-y-auto shadow-inner custom-scrollbar">
              {logs.map((log, i) => (
                <div key={i} className="flex gap-2 mb-2 items-start animate-in fade-in slide-in-from-bottom-1 duration-200">
                  <span className="text-[#42f554] font-mono text-sm shadow-glow">»</span>
                  <p className="font-mono text-[#42f554] text-[11px] sm:text-[13px] uppercase tracking-tighter leading-tight font-bold">{log}</p>
                </div>
              ))}
            </div>

            {/* 커맨드 센터 */}
            <div className="md:w-[65%] bg-[#2a2a2a] border-[4px] border-black rounded-[1.5rem] p-3 flex flex-col relative shadow-inner">
              {loading ? (
                <div className="flex-1 flex items-center justify-center"><div className="w-8 h-8 border-[3px] border-[#28aafd] border-t-transparent rounded-full animate-spin"></div></div>
              ) : battleOver ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-2 py-2">
                  <div className="text-xl font-mono font-black text-black uppercase bg-yellow-400 px-6 py-1 border-4 border-black shadow-[4px_4px_0_0_#000]">{t('Battle Ended')}</div>
                  <button onClick={() => { resetBattle(); router.back(); }} className="px-6 py-2 bg-[#28aafd] border-4 border-black rounded-lg font-mono font-black text-white uppercase text-sm shadow-[4px_4px_0_0_#000] hover:translate-y-1 hover:shadow-none active:scale-95 transition-all">
                    {t('Play Again')}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 h-full">
                  {activeMoves.map((move, idx) => (
                    <button
                      key={`${move.name}-${idx}`}
                      disabled={isProcessing}
                      onClick={() => executeTurn(move)}
                      className={`group relative h-full min-h-[50px] p-2 border-[4px] border-black rounded-xl shadow-[4px_4px_0_0_#000] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all flex flex-col justify-center overflow-hidden disabled:opacity-50 ${typeThemes[move.type.name]?.main || 'bg-gray-500'}`}
                    >
                      <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(135deg,rgba(255,255,255,0.1)_0%,transparent_50%)] pointer-events-none"></div>
                      <div className="absolute top-1 right-1 px-1.5 py-0.5 bg-black/30 rounded text-[7px] font-mono font-black text-white uppercase tracking-widest">{move.type.name}</div>
                      <div className="relative z-10 text-left">
                        <p className="font-mono font-black text-[11px] sm:text-[13px] text-white uppercase tracking-tighter drop-shadow-md group-hover:translate-x-0.5 transition-transform truncate pr-10">{getLocalizedMoveName(move)}</p>
                        <div className="flex gap-2 mt-0.5 opacity-80 pt-0.5 border-t border-white/10">
                          <span className="text-[8px] font-black text-white/60 uppercase">P {move.power || '--'}</span>
                          <span className="text-[8px] font-black text-white/60 uppercase">A {move.accuracy || '--'}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 하단 마감 (슬림화) */}
          <div className="h-8 bg-black/10 flex items-center justify-between px-10 border-t-4 border-black/10">
            <div className="flex gap-3">
              <div className="w-10 h-1.5 bg-black/20 rounded-full"></div>
              <div className="w-10 h-1.5 bg-black/20 rounded-full"></div>
            </div>
            <div className="w-6 h-6 rounded-full bg-black/20 border-2 border-black/10"></div>
          </div>
        </div>

      </div>

      <style jsx>{`
        .perspective-1000 { perspective: 1200px; }
        .glassmorphism {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-6px) rotate(-1deg); }
          75% { transform: translateX(6px) rotate(1deg); }
        }
        .animate-shake { animation: shake 0.3s ease-in-out; }
        .shadow-glow { text-shadow: 0 0 6px currentColor; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.1); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #42f554; border-radius: 10px; }
      `}</style>
    </div>
  );
}
