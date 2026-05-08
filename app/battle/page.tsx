"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useBattle } from '@/src/context/BattleContext';
import { useTranslation } from 'react-i18next';
import { getRandomMoves, MoveDetails } from '@/src/services/pokeapi';

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

const typeColors: Record<string, string> = {
  normal: 'bg-gray-400', fire: 'bg-red-500', water: 'bg-blue-500', grass: 'bg-green-500',
  electric: 'bg-yellow-400 text-gray-900', ice: 'bg-cyan-300 text-gray-900', fighting: 'bg-orange-700',
  poison: 'bg-purple-500', ground: 'bg-yellow-600', flying: 'bg-indigo-300 text-gray-900',
  psychic: 'bg-pink-500', bug: 'bg-lime-500 text-gray-900', rock: 'bg-yellow-800',
  ghost: 'bg-indigo-800', dragon: 'bg-indigo-600', dark: 'bg-gray-800',
  steel: 'bg-gray-500', fairy: 'bg-pink-300 text-gray-900'
};

export default function BattlePage() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { playerPokemon, opponentPokemon, resetBattle } = useBattle();
  
  const [logs, setLogs] = useState<string[]>([]);
  const [battleOver, setBattleOver] = useState(false);
  const [playerHp, setPlayerHp] = useState<number>(0);
  const [oppHp, setOppHp] = useState<number>(0);
  
  const [playerMoves, setPlayerMoves] = useState<MoveDetails[]>([]);
  const [opponentMoves, setOpponentMoves] = useState<MoveDetails[]>([]);
  const [loadingMoves, setLoadingMoves] = useState(true);
  
  const [currentTurn, setCurrentTurn] = useState<'player1' | 'player2'>('player1');
  const [isProcessing, setIsProcessing] = useState(false);

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
      
      // Scale up HP to make battles last slightly longer
      currentPHp *= 3;
      currentOHp *= 3;
      
      setPlayerHp(currentPHp);
      setOppHp(currentOHp);
      
      try {
        const pMoves = await getRandomMoves(playerPokemon.moves, 4);
        const oMoves = await getRandomMoves(opponentPokemon.moves, 4);
        setPlayerMoves(pMoves);
        setOpponentMoves(oMoves);
      } catch (err) {
        console.error("Failed to load moves", err);
      }
      
      setLoadingMoves(false);

      setLogs([
        t('Battle Start!'),
        t('Go, {{name}}!', { name: playerPokemon.name }),
        t('Go, {{name}}!', { name: opponentPokemon.name })
      ]);
    };
    
    initBattle();
  }, [playerPokemon, opponentPokemon, router, t]);

  const getLocalizedMoveName = (move: MoveDetails) => {
    const lang = i18n.language.startsWith('ko') ? 'ko' : i18n.language.startsWith('ja') ? 'ja' : 'en';
    const nameObj = move.names.find(n => n.language.name === lang) || move.names.find(n => n.language.name === 'en');
    return nameObj ? nameObj.name : move.name;
  };

  const executeTurn = async (move: MoveDetails) => {
    if (isProcessing || battleOver) return;
    setIsProcessing(true);
    
    const wait = (ms: number) => new Promise(res => setTimeout(res, ms));
    
    const isPlayer1 = currentTurn === 'player1';
    const attacker = isPlayer1 ? playerPokemon! : opponentPokemon!;
    const defender = isPlayer1 ? opponentPokemon! : playerPokemon!;
    
    const attackerAtk = attacker.stats.find(s => s.stat.name === 'attack')?.base_stat || 10;
    const defenderDef = defender.stats.find(s => s.stat.name === 'defense')?.base_stat || 10;
    
    const moveName = getLocalizedMoveName(move);
    const moveLog = t('{{name}} used {{move}}!', { name: attacker.name, move: moveName });
    
    setLogs(prev => [...prev, moveLog]);
    await wait(800);
    
    const multiplier = getMultiplier(move.type.name, defender.types);
    const power = move.power || 50;
    
    // STAB (Same Type Attack Bonus)
    const hasStab = attacker.types.some(t => t.type.name === move.type.name);
    const stabMultiplier = hasStab ? 1.5 : 1;
    
    // Simple damage formula
    const damage = Math.max(1, Math.floor(((power * attackerAtk / defenderDef) / 2) * multiplier * stabMultiplier));
    
    if (isPlayer1) {
      const newHp = Math.max(0, oppHp - damage);
      setOppHp(newHp);
      
      let effectLog = '';
      if (multiplier > 1) effectLog = t("It's super effective!");
      else if (multiplier < 1 && multiplier > 0) effectLog = t("It's not very effective...");
      else if (multiplier === 0) effectLog = t("It had no effect!");
      
      if (effectLog) {
        setLogs(prev => [...prev, effectLog]);
        await wait(800);
      }
      
      setLogs(prev => [...prev, t('Dealt {{damage}} damage!', { damage })]);
      
      if (newHp <= 0) {
        await wait(1000);
        setLogs(prev => [...prev, t('Opponent {{name}} fainted! Player 1 wins!', { name: opponentPokemon!.name })]);
        setBattleOver(true);
        setIsProcessing(false);
        return;
      }
    } else {
      const newHp = Math.max(0, playerHp - damage);
      setPlayerHp(newHp);
      
      let effectLog = '';
      if (multiplier > 1) effectLog = t("It's super effective!");
      else if (multiplier < 1 && multiplier > 0) effectLog = t("It's not very effective...");
      else if (multiplier === 0) effectLog = t("It had no effect!");
      
      if (effectLog) {
        setLogs(prev => [...prev, effectLog]);
        await wait(800);
      }
      
      setLogs(prev => [...prev, t('Dealt {{damage}} damage!', { damage })]);
      
      if (newHp <= 0) {
        await wait(1000);
        setLogs(prev => [...prev, t('{{name}} fainted! Player 2 wins!', { name: playerPokemon!.name })]);
        setBattleOver(true);
        setIsProcessing(false);
        return;
      }
    }
    
    await wait(1000);
    setCurrentTurn(isPlayer1 ? 'player2' : 'player1');
    setIsProcessing(false);
  };

  if (!playerPokemon || !opponentPokemon) return null;

  const getStat = (pokemon: any, statName: string) => pokemon.stats.find((s: any) => s.stat.name === statName)?.base_stat || 0;
  
  // Scale max HP since we multiplied by 3
  const maxPlayerHp = (getStat(playerPokemon, 'hp') || 50) * 3;
  const maxOppHp = (getStat(opponentPokemon, 'hp') || 50) * 3;

  const getHpPercentage = (current: number, max: number) => Math.max(0, Math.min(100, (current / max) * 100));
  const getHpColor = (percentage: number) => {
    if (percentage > 50) return 'bg-green-500';
    if (percentage > 20) return 'bg-yellow-400';
    return 'bg-red-500';
  };

  const activeMoves = currentTurn === 'player1' ? playerMoves : opponentMoves;
  const activePlayerName = currentTurn === 'player1' ? t('Player 1') : t('Player 2');

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-4xl md:text-5xl font-mono uppercase tracking-widest text-center mb-10 text-yellow-400" style={{ textShadow: '4px 4px 0px #3B4CCA, -2px -2px 0px #3B4CCA, 2px -2px 0px #3B4CCA, -2px 2px 0px #3B4CCA, 2px 2px 0px #3B4CCA' }}>
        {t('Battle Arena')}
      </h1>
      
      {/* Player 1 & 2 Turn indicator */}
      {!battleOver && !loadingMoves && (
        <div className="flex justify-center mb-6">
          <div className={`px-6 py-2 font-mono uppercase text-white text-xl shadow-[6px_6px_0_0_rgba(0,0,0,1)] border-4 ${currentTurn === 'player1' ? 'bg-blue-500 border-black' : 'bg-red-500 border-black'} animate-bounce`}>
            {activePlayerName} Turn!
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-8">
        
        {/* Player 1 Pokemon */}
        <div className={`relative w-full md:w-5/12 p-6 bg-white border-4 ${currentTurn === 'player1' && !battleOver ? 'border-black shadow-[8px_8px_0_0_#2563eb] -translate-y-2 -translate-x-2' : 'border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)]'} transition-all flex flex-col items-center`}>
          <h2 className="text-xl font-mono uppercase text-black mb-2 tracking-widest">{playerPokemon.name}</h2>
          <div className="flex flex-wrap justify-center gap-1 mb-4">
            {playerPokemon.types.map((t: any) => (
              <span key={t.type.name} className="px-2 py-1 bg-black text-white text-[8px] font-mono uppercase tracking-wider border-2 border-black">
                {t.type.name}
              </span>
            ))}
          </div>
          <div className="w-full mb-6 px-4 bg-gray-100 p-3 border-4 border-black">
            <div className="flex justify-between text-xs font-mono uppercase text-black mb-1">
              <span>HP</span>
              <span>{Math.max(0, playerHp)} / {maxPlayerHp}</span>
            </div>
            <div className="w-full bg-white border-4 border-black h-6 overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${getHpColor(getHpPercentage(playerHp, maxPlayerHp))}`} 
                style={{ width: `${getHpPercentage(playerHp, maxPlayerHp)}%` }}>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-8 bg-black opacity-20 rounded-[50%] blur-sm"></div>
            <img 
              src={playerPokemon.sprites.front_default} 
              alt={playerPokemon.name} 
              className={`relative w-48 h-48 scale-x-[-1] drop-shadow-xl ${currentTurn === 'player1' ? 'animate-pulse' : ''}`}
              style={{ imageRendering: 'pixelated' }}
            />
          </div>
        </div>

        <div className="text-4xl sm:text-6xl font-mono italic text-yellow-400" style={{ textShadow: '4px 4px 0px #EE1515, -2px -2px 0px #EE1515, 2px -2px 0px #EE1515, -2px 2px 0px #EE1515, 2px 2px 0px #EE1515' }}>VS</div>

        {/* Player 2 Pokemon */}
        <div className={`relative w-full md:w-5/12 p-6 bg-white border-4 ${currentTurn === 'player2' && !battleOver ? 'border-black shadow-[8px_8px_0_0_#dc2626] -translate-y-2 -translate-x-2' : 'border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)]'} transition-all flex flex-col items-center`}>
          <h2 className="text-xl font-mono uppercase text-black mb-2 tracking-widest">{opponentPokemon.name}</h2>
          <div className="flex flex-wrap justify-center gap-1 mb-4">
            {opponentPokemon.types.map((t: any) => (
              <span key={t.type.name} className="px-2 py-1 bg-black text-white text-[8px] font-mono uppercase tracking-wider border-2 border-black">
                {t.type.name}
              </span>
            ))}
          </div>
          <div className="w-full mb-6 px-4 bg-gray-100 p-3 border-4 border-black">
            <div className="flex justify-between text-xs font-mono uppercase text-black mb-1">
              <span>HP</span>
              <span>{Math.max(0, oppHp)} / {maxOppHp}</span>
            </div>
            <div className="w-full bg-white border-4 border-black h-6 overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${getHpColor(getHpPercentage(oppHp, maxOppHp))}`} 
                style={{ width: `${getHpPercentage(oppHp, maxOppHp)}%` }}>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-8 bg-black opacity-20 rounded-[50%] blur-sm"></div>
            <img 
              src={opponentPokemon.sprites.front_default} 
              alt={opponentPokemon.name} 
              className={`relative w-48 h-48 drop-shadow-xl ${currentTurn === 'player2' ? 'animate-pulse' : ''}`}
              style={{ imageRendering: 'pixelated' }}
            />
          </div>
        </div>
        
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Retro Gameboy Log Box */}
        <div ref={logBoxRef} className="bg-[#e0f8d0] text-black p-6 shadow-inner font-mono overflow-y-auto h-64 border-8 border-black relative z-10 scroll-smooth" style={{ boxShadow: 'inset 4px 4px 0px rgba(0,0,0,0.2)' }}>
          {logs.map((log, i) => (
            <p key={i} className="mb-4 text-xs sm:text-sm leading-loose uppercase">▶ {log}</p>
          ))}
          {isProcessing && !battleOver && <p className="mb-4 text-xs sm:text-sm text-gray-700 animate-pulse uppercase">▶ ...</p>}
        </div>

        {/* Move Control Panel */}
        <div className="bg-white p-6 border-8 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] flex flex-col justify-center">
          {loadingMoves ? (
            <div className="flex justify-center items-center h-full">
              <span className="text-black font-mono animate-pulse uppercase">{t('Loading moves...')}</span>
            </div>
          ) : battleOver ? (
            <div className="flex justify-center items-center h-full">
               <button 
                onClick={() => { resetBattle(); router.push('/'); }}
                className="w-full py-6 bg-yellow-400 text-black font-mono uppercase text-xl sm:text-2xl hover:bg-yellow-300 transition transform hover:-translate-y-1 hover:-translate-x-1 border-4 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] active:shadow-none active:translate-x-[6px] active:translate-y-[6px]"
              >
                {t('Play Again')}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 h-full">
              {activeMoves.map((move, idx) => (
                <button
                  key={`${move.name}-${idx}`}
                  disabled={isProcessing}
                  onClick={() => executeTurn(move)}
                  className={`relative p-4 border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] text-left transition-transform transform hover:-translate-y-1 hover:-translate-x-1 active:shadow-none active:translate-x-[4px] active:translate-y-[4px] disabled:opacity-50 disabled:cursor-not-allowed ${typeColors[move.type.name] || 'bg-gray-300 text-black'}`}
                >
                  <div className="font-mono uppercase text-xs sm:text-sm mb-2 line-clamp-1">{getLocalizedMoveName(move)}</div>
                  <div className="flex justify-between text-[10px] font-mono opacity-90 uppercase tracking-widest">
                    <span>{move.type.name}</span>
                    <span>PWR {move.power || '--'}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
