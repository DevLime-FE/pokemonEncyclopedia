"use client";

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getPokedexByRegion, getPokemon, Pokemon, PokedexEntry, getRandomMoves, MoveDetails, getMovesDetails, PokemonMove, PokemonSpecies, getPokemonSpecies } from '@/src/services/pokeapi';
import { useBattle } from '@/src/context/BattleContext';
import { useTranslation } from 'react-i18next';

/**
 * 타입별 네온 테마 컬러
 */
const typeThemes: Record<string, { color: string, shadow: string }> = {
  normal: { color: '#A8A878', shadow: 'rgba(168, 168, 120, 0.5)' },
  fire: { color: '#F08030', shadow: 'rgba(240, 128, 48, 0.5)' },
  water: { color: '#6890F0', shadow: 'rgba(104, 144, 240, 0.5)' },
  grass: { color: '#78C850', shadow: 'rgba(120, 200, 80, 0.5)' },
  electric: { color: '#F8D030', shadow: 'rgba(248, 208, 48, 0.5)' },
  ice: { color: '#98D8D8', shadow: 'rgba(152, 216, 216, 0.5)' },
  fighting: { color: '#C03028', shadow: 'rgba(192, 48, 40, 0.5)' },
  poison: { color: '#A040A0', shadow: 'rgba(160, 64, 160, 0.5)' },
  ground: { color: '#E0C068', shadow: 'rgba(224, 192, 104, 0.5)' },
  flying: { color: '#A890F0', shadow: 'rgba(168, 144, 240, 0.5)' },
  psychic: { color: '#F85888', shadow: 'rgba(248, 88, 136, 0.5)' },
  bug: { color: '#A8B820', shadow: 'rgba(168, 184, 32, 0.5)' },
  rock: { color: '#B8A038', shadow: 'rgba(184, 160, 56, 0.5)' },
  ghost: { color: '#705898', shadow: 'rgba(112, 88, 152, 0.5)' },
  dragon: { color: '#7038F8', shadow: 'rgba(112, 56, 248, 0.5)' },
  dark: { color: '#705848', shadow: 'rgba(112, 88, 72, 0.5)' },
  steel: { color: '#B8B8D0', shadow: 'rgba(184, 184, 208, 0.5)' },
  fairy: { color: '#EE99AC', shadow: 'rgba(238, 153, 172, 0.5)' }
};

/**
 * 프리미엄 포켓몬 도감 디바이스 (반응형 버전)
 * 컴포넌트 외부로 이동하여 리렌더링 시 언마운트 방지 (스크롤 버그 해결)
 */
const PokedexSidePanel = ({
  pokemon,
  species,
  moves,
  tab,
  onTabChange,
  onEdit,
  onClose,
  isOpponent,
  t,
  getLocalizedName,
  getLocalizedPokemonDescription,
  getLocalizedMoveName
}: any) => (
  <div className={`w-full lg:w-[340px] xl:w-[380px] h-[1200px] lg:h-[calc(100%-2rem)] flex flex-col bg-[#1a1a1a]/95 backdrop-blur-3xl border-[6px] border-black shadow-[0_0_80px_rgba(0,0,0,0.8)] overflow-hidden transition-all duration-700 ease-out animate-in fade-in zoom-in-95 lg:slide-in-from-right z-40 rounded-[2.5rem] lg:m-4 relative min-h-0`}>
    {/* 도감 케이스 느낌을 위한 입체적 광택 */}
    <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/40 pointer-events-none"></div>

    {/* 장치 헤더 */}
    <div className={`p-4 flex items-center justify-between border-b-[6px] border-black shrink-0 relative overflow-hidden bg-[#DC0A2D]`}>
      <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none"></div>
      <div className="flex items-center gap-3 relative z-10">
        <div className="w-10 h-10 rounded-full border-4 border-white shadow-[0_0_15px_rgba(255,255,255,0.4)] flex items-center justify-center bg-[#28aafd]">
          <div className="w-6 h-6 rounded-full bg-[#88d6ff] animate-pulse opacity-80"></div>
        </div>
        <div className="flex flex-col">
          <span className="text-[8px] font-black text-white/70 uppercase tracking-widest leading-none">SYSTEM.UNIT</span>
          <span className="text-white font-mono font-black text-sm uppercase tracking-tighter">{isOpponent ? '2PLAYER' : '1PLAYER'}</span>
        </div>
      </div>
      <div className="flex gap-1.5 relative z-10">
        <div className="w-2.5 h-2.5 rounded-full bg-[#ff0000] border border-black/40"></div>
        <div className="w-2.5 h-2.5 rounded-full bg-[#ffcc00] border border-black/40"></div>
        <div className="w-2.5 h-2.5 rounded-full bg-[#33cc33] border border-black/40"></div>
      </div>
      <button onClick={onClose} className="ml-4 w-7 h-7 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center text-xs font-bold transition-all relative z-10">✕</button>
    </div>

    {/* 탭 영역 (높이 고정 및 디자인 통일) */}
    <div className="px-4 pt-4 shrink-0 relative z-10">
      <div className="flex bg-black/40 p-1 rounded-xl gap-1 border-2 border-black shadow-inner">
        <button onClick={() => onTabChange('info')} className={`flex-1 py-2 font-mono text-[11px] uppercase font-black rounded-lg transition-all ${tab === 'info' ? 'bg-[#28aafd] text-white' : 'text-white/40 hover:text-white'}`}>{t('정보')}</button>
        <button onClick={() => onTabChange('moves')} className={`flex-1 py-2 font-mono text-[11px] uppercase font-black rounded-lg transition-all ${tab === 'moves' ? 'bg-[#28aafd] text-white' : 'text-white/40 hover:text-white'}`}>{t('스킬셋')}</button>
      </div>
    </div>

    <div className="flex-1 flex flex-col min-h-0 relative z-10">
      <div className="flex-1 p-4 sm:p-5 overflow-y-auto custom-scrollbar bg-[#1a1a1a] min-h-0">
        {/* 공통 상단 영역: 포켓몬 기본 정보 (탭 전환 시에도 고정된 느낌을 줌) */}
        <div className="mb-4 animate-in fade-in zoom-in-95 duration-300">
          <div className="relative bg-black/60 border-[4px] border-black rounded-[1.5rem] p-5 flex flex-col items-center justify-center overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>
            <div className="absolute top-2 left-3 text-[8px] font-mono text-blue-400/50 font-black">#{String(pokemon.id).padStart(4, '0')}</div>
            <img src={pokemon.sprites.front_default} className="w-28 h-28 relative drop-shadow-[0_0_20px_rgba(40,170,253,0.3)] animate-float" style={{ imageRendering: 'pixelated' }} />
            <h2 className="text-xl font-mono text-white uppercase font-black tracking-tighter text-center mt-2">{getLocalizedName(species, pokemon.name)}</h2>
            <div className="flex gap-2 mt-2">
              {pokemon.types.map((t: any) => (
                <span key={t.type.name} className="px-3 py-1 rounded-lg text-[9px] font-black text-white uppercase border-2 border-black" style={{ backgroundColor: typeThemes[t.type.name]?.color }}>{t.type.name}</span>
              ))}
            </div>
          </div>
        </div>

        {tab === 'info' ? (
          <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
            <div className="bg-white/5 border-2 border-black p-4 rounded-[1.2rem] shadow-inner">
              <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest block mb-2">Description</span>
              <p className="font-mono text-[11px] sm:text-[13px] text-white/80 leading-snug">{getLocalizedPokemonDescription(species)}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 pb-4">
              <div className="bg-white/5 border-2 border-black p-3 rounded-[1.2rem]">
                <span className="text-[8px] font-black text-white/30 uppercase tracking-widest block mb-2">Dimensions</span>
                <div className="space-y-1 text-[10px] font-mono">
                  <div className="flex justify-between"><span className="text-white/50">HT:</span><span className="font-black text-blue-400">{pokemon.height / 10}m</span></div>
                  <div className="flex justify-between"><span className="text-white/50">WT:</span><span className="font-black text-blue-400">{pokemon.weight / 10}kg</span></div>
                </div>
              </div>
              <div className="bg-white/5 border-2 border-black p-3 rounded-[1.2rem]">
                <span className="text-[8px] font-black text-white/30 uppercase tracking-widest block mb-2">Base Stats</span>
                <div className="grid grid-cols-3 gap-x-2 gap-y-1">
                  {pokemon.stats.slice(0, 6).map((s: any) => (
                    <div key={s.stat.name} className="flex flex-col items-center">
                      <span className="text-[6px] text-white/30 font-black uppercase">{t(s.stat.name).substring(0, 3)}</span>
                      <span className="text-[9px] text-white font-black">{s.base_stat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex justify-between items-center px-1">
              <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Moveset</span>
              <button onClick={onEdit} className="px-3 py-1 bg-yellow-400 text-black rounded-lg font-mono text-[9px] font-black uppercase hover:bg-yellow-300">Edit</button>
            </div>
            <div className="space-y-2 pb-6">
              {moves.map((m: any) => (
                <div key={m.id} className="relative bg-black/40 border-2 border-black p-3 rounded-[1.2rem] flex flex-col gap-1 hover:bg-black/60 transition-colors shadow-inner">
                  <div className="flex justify-between items-center">
                    <span className="text-[12px] font-black text-white uppercase">{getLocalizedMoveName(m)}</span>
                    <span className="text-[7px] px-1.5 py-0.5 rounded-md text-white font-black" style={{ backgroundColor: typeThemes[m.type.name]?.color }}>{m.type.name}</span>
                  </div>
                  <div className="flex gap-3 text-[9px] font-mono text-white/40">
                    <span>PWR <span className="text-white font-black">{m.power || '--'}</span></span>
                    <span>ACC <span className="text-white font-black">{m.accuracy || '--'}</span></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
);

export default function RegionPage() {
  const { t, i18n } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const regionName = (params.regionName as string).toLowerCase();

  const [entries, setEntries] = useState<PokedexEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [localizedNames, setLocalizedNames] = useState<Record<string, string>>({});

  const { setPlayerPokemon, setOpponentPokemon, playerMoves, opponentMoves, setPlayerMoves, setOpponentMoves } = useBattle();
  const [selectedPlayer, setSelectedPlayer] = useState<Pokemon | null>(null);
  const [selectedOpponent, setSelectedOpponent] = useState<Pokemon | null>(null);
  const [playerSpecies, setPlayerSpecies] = useState<PokemonSpecies | null>(null);
  const [opponentSpecies, setOpponentSpecies] = useState<PokemonSpecies | null>(null);
  const [showP1Info, setShowP1Info] = useState(false);
  const [showP2Info, setShowP2Info] = useState(false);

  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<'player1' | 'player2' | null>(null);
  const [tempSelectedMoves, setTempSelectedMoves] = useState<MoveDetails[]>([]);
  const [availableMovesDetails, setAvailableMovesDetails] = useState<MoveDetails[]>([]);
  const [isLoadingAvailableMoves, setIsLoadingAvailableMoves] = useState(false);
  const [hoveredMove, setHoveredMove] = useState<MoveDetails | null>(null);

  const [playerPokedexTab, setPlayerPokedexTab] = useState<'info' | 'moves'>('info');
  const [opponentPokedexTab, setOpponentPokedexTab] = useState<'info' | 'moves'>('info');

  const [pokemonSearchTerm, setPokemonSearchTerm] = useState('');
  const [moveSearchTerm, setMoveSearchTerm] = useState('');

  const mainScrollRef = useRef<HTMLDivElement>(null);

  // 배경 이미지 경로 결정
  const bgPath = `/backgrounds/bg_${regionName}.png`;

  // --- 현지화 유틸리티 ---
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

  const getLocalizedMoveDescription = (move: MoveDetails) => {
    const lang = i18n.language.startsWith('ko') ? 'ko' : i18n.language.startsWith('ja') ? 'ja' : 'en';
    const descObj = move.flavor_text_entries.find(f => f.language.name === lang) ||
      move.flavor_text_entries.find(f => f.language.name === 'ko') ||
      move.flavor_text_entries.find(f => f.language.name === 'en');
    return descObj ? descObj.flavor_text.replace(/[\n\f\r]/g, ' ') : '';
  };

  const getLocalizedPokemonDescription = (species: PokemonSpecies | null) => {
    if (!species) return '';
    const lang = i18n.language.startsWith('ko') ? 'ko' : i18n.language.startsWith('ja') ? 'ja' : 'en';
    const descObj = species.flavor_text_entries.find(f => f.language.name === lang) ||
      species.flavor_text_entries.find(f => f.language.name === 'ko') ||
      species.flavor_text_entries.find(f => f.language.name === 'en');
    return descObj ? descObj.flavor_text.replace(/[\n\f\r]/g, ' ') : '';
  };



  // --- 데이터 로직 ---
  useEffect(() => {
    async function loadRegion() {
      try {
        const data = await getPokedexByRegion(regionName);
        setEntries(data);
        const names: Record<string, string> = {};
        await Promise.all(data.map(async (entry) => {
          try {
            const species = await getPokemonSpecies(entry.pokemon_species.name);
            names[entry.pokemon_species.name] = getLocalizedName(species, entry.pokemon_species.name);
          } catch (e) { names[entry.pokemon_species.name] = entry.pokemon_species.name; }
        }));
        setLocalizedNames(names);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    loadRegion();
  }, [regionName]);

  const handleSelect = async (entry: PokedexEntry) => {
    const pkmn = await getPokemon(entry.pokemon_species.name);
    const species = await getPokemonSpecies(entry.pokemon_species.name);

    const isP1 = selectedPlayer?.name === pkmn.name;
    const isP2 = selectedOpponent?.name === pkmn.name;

    // 1. 둘 다 선택된 상태라면 P2부터 해제
    if (isP1 && isP2) {
      setSelectedOpponent(null); setOpponentPokemon(null); setOpponentMoves([]); return;
    }

    // 2. P1만 선택된 상태라면
    if (isP1) {
      if (!selectedOpponent) {
        // P2가 비어있다면 P2도 같은 포켓몬 선택 가능 (중복 허용)
        setSelectedOpponent(pkmn); setOpponentPokemon(pkmn); setOpponentSpecies(species);
        getRandomMoves(pkmn.moves, 4).then(setOpponentMoves);
      } else {
        // P2가 다른걸 들고 있다면 P1 해제
        setSelectedPlayer(null); setPlayerPokemon(null); setPlayerMoves([]);
      }
      return;
    }

    // 3. P2만 선택된 상태라면
    if (isP2) {
      if (!selectedPlayer) {
        // P1이 비어있다면 P1도 같은 포켓몬 선택 가능
        setSelectedPlayer(pkmn); setPlayerPokemon(pkmn); setPlayerSpecies(species);
        getRandomMoves(pkmn.moves, 4).then(setPlayerMoves);
      } else {
        // P1이 다른걸 들고 있다면 P2 해제
        setSelectedOpponent(null); setOpponentPokemon(null); setOpponentMoves([]);
      }
      return;
    }

    // 4. 아무도 선택하지 않은 상태라면 비어있는 쪽 우선 채움
    if (!selectedPlayer) {
      setSelectedPlayer(pkmn); setPlayerPokemon(pkmn); setPlayerSpecies(species);
      getRandomMoves(pkmn.moves, 4).then(setPlayerMoves);
      if (typeof window !== 'undefined' && window.innerWidth >= 1024) setShowP1Info(true);
    } else if (!selectedOpponent) {
      setSelectedOpponent(pkmn); setOpponentPokemon(pkmn); setOpponentSpecies(species);
      getRandomMoves(pkmn.moves, 4).then(setOpponentMoves);
      if (typeof window !== 'undefined' && window.innerWidth >= 1024) setShowP2Info(true);
    }
  };


  const openMoveEditModal = async (playerType: 'player1' | 'player2') => {
    setEditingPlayer(playerType);
    const pkmn = playerType === 'player1' ? selectedPlayer : selectedOpponent;
    const currentMoves = playerType === 'player1' ? playerMoves : opponentMoves;
    if (pkmn) {
      setTempSelectedMoves([...currentMoves]);
      setIsMoveModalOpen(true);
      setIsLoadingAvailableMoves(true);
      try {
        const urls = pkmn.moves.map(m => m.move.url);
        const allDetails = await getMovesDetails(urls);
        setAvailableMovesDetails(allDetails);
      } catch (e) { console.error(e); }
      finally { setIsLoadingAvailableMoves(false); }
    }
  };

  const toggleTempMove = (move: MoveDetails) => {
    setTempSelectedMoves(prev => {
      const exists = prev.find(m => m.name === move.name);
      if (exists) return prev.filter(m => m.name !== move.name);
      if (prev.length >= 4) return prev;
      return [...prev, move];
    });
  };

  const confirmMoveSelection = () => {
    if (tempSelectedMoves.length < 1 || tempSelectedMoves.length > 4) return;
    if (editingPlayer === 'player1') {
      setPlayerMoves(tempSelectedMoves);
    } else {
      setOpponentMoves(tempSelectedMoves);
    }
    setIsMoveModalOpen(false);
    setEditingPlayer(null);
  };

  return (
    <div className="h-screen bg-[#0a0a0a] flex flex-col font-sans selection:bg-blue-500 selection:text-white overflow-hidden relative">

      {/* 지역별 다이나믹 배경 */}
      <div className="fixed inset-0 z-0 transition-opacity duration-1000">
        <div className="absolute inset-0 bg-black/40 z-10"></div>
        <img src={bgPath} className="w-full h-full object-cover animate-ken-burns" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-[#0a0a0a] z-20"></div>

        {/* 노이즈 및 그리드 오버레이 */}
        <div className="absolute inset-0 opacity-[0.15] z-30 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '60px 60px' }}></div>
      </div>

      <header className="z-50 bg-white/5 backdrop-blur-md border-b border-white/10 px-6 py-3 flex justify-between items-center shadow-lg shrink-0">
        <div className="flex items-center gap-6">
          <div onClick={() => router.push('/')} className="cursor-pointer group flex items-center gap-4">
            <div className="w-9 h-9 bg-red-600/80 border border-white/20 rounded-xl shadow-xl group-hover:scale-110 transition-all flex items-center justify-center text-white relative overflow-hidden">
              <svg className="w-4 h-4 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </div>
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-blue-400 uppercase tracking-[0.4em] leading-none mb-0.5 opacity-70">Encyclopedia</span>
              <h1 className="text-lg sm:text-xl font-mono text-white uppercase font-black tracking-tighter leading-none">{regionName} Sector</h1>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 flex-1 justify-end">
          <div className="relative group/search hidden md:block max-w-[200px] lg:max-w-[280px] w-full mr-2">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-white/20 group-focus-within/search:text-blue-400 transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </div>
            <input
              type="text"
              value={pokemonSearchTerm}
              onChange={(e) => setPokemonSearchTerm(e.target.value)}
              placeholder={t('Search...')}
              className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-1.5 font-sans text-xs text-white placeholder:text-white/20 focus:border-blue-500/50 outline-none transition-all backdrop-blur-md"
            />
          </div>
          <button onClick={() => { setSelectedPlayer(null); setSelectedOpponent(null); setPlayerPokemon(null); setOpponentPokemon(null); setPokemonSearchTerm(''); }} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/40 hover:text-white font-mono font-black text-[9px] uppercase transition-all rounded-lg backdrop-blur-md">Reset</button>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative z-10">

        {/* P1 상세 */}
        {selectedPlayer && showP1Info && (
          <div className={`lg:shrink-0 h-full ${(typeof window !== 'undefined' && window.innerWidth < 1024) ? 'fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-end lg:items-center justify-center' : 'relative z-40 flex flex-col justify-center'}`}>
            <div className="absolute inset-0 lg:hidden" onClick={() => setShowP1Info(false)}></div>
            <div className="w-full lg:w-auto h-full transform transition-transform duration-500 ease-out animate-in slide-in-from-bottom lg:slide-in-from-left">
              <PokedexSidePanel
                pokemon={selectedPlayer}
                species={playerSpecies}
                moves={playerMoves}
                tab={playerPokedexTab}
                onTabChange={setPlayerPokedexTab}
                onEdit={() => openMoveEditModal('player1')}
                onClose={() => {
                  setShowP1Info(false);
                  setSelectedPlayer(null);
                  setPlayerPokemon(null);
                }}
                t={t}
                getLocalizedName={getLocalizedName}
                getLocalizedPokemonDescription={getLocalizedPokemonDescription}
                getLocalizedMoveName={getLocalizedMoveName}
              />
            </div>
          </div>
        )}

        {/* 중앙 그리드 */}
        <div ref={mainScrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar relative">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center gap-6">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-mono text-white/40 uppercase font-black tracking-[0.5em] animate-pulse">Syncing...</p>
            </div>
          ) : (
            <div className={`grid gap-3 sm:gap-4 transition-all duration-700 ${(selectedPlayer && selectedOpponent)
              ? 'grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-4 xl:grid-cols-5'
              : (selectedPlayer || selectedOpponent)
                ? 'grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-6 xl:grid-cols-7'
                : 'grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10'
              }`}>
              {entries.filter(entry => {
                const name = localizedNames[entry.pokemon_species.name] || entry.pokemon_species.name;
                return name.toLowerCase().includes(pokemonSearchTerm.toLowerCase());
              }).map((entry, idx) => {
                const id = entry.pokemon_species.url.split('/').filter(Boolean).pop();
                const isP1 = selectedPlayer?.name === entry.pokemon_species.name;
                const isP2 = selectedOpponent?.name === entry.pokemon_species.name;
                const displayName = localizedNames[entry.pokemon_species.name] || entry.pokemon_species.name;

                return (
                  <div
                    key={entry.pokemon_species.name}
                    onClick={() => handleSelect(entry)}
                    style={{ animationDelay: `${(idx % 20) * 40}ms` }}
                    className={`group relative p-0.5 rounded-[1.2rem] cursor-pointer transition-all duration-500 animate-in fade-in zoom-in-90 fill-mode-both 
                      ${isP1 && isP2
                        ? 'bg-gradient-to-br from-blue-500 to-red-600 scale-95 shadow-[0_0_20px_rgba(255,255,255,0.2)]'
                        : isP1
                          ? 'bg-blue-500 scale-95 shadow-[0_0_15px_rgba(59,130,246,0.4)]'
                          : isP2
                            ? 'bg-red-600 scale-95 shadow-[0_0_15px_rgba(220,38,38,0.4)]'
                            : 'bg-white/5 hover:bg-white/10 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.4)] active:scale-95'
                      }`}
                  >
                    <div className="bg-[#1a1a1a]/40 backdrop-blur-md border border-white/5 rounded-[1rem] p-2 sm:p-3 flex flex-col items-center relative overflow-hidden h-full min-h-[100px] sm:min-h-[140px] justify-center">
                      <div className="absolute top-1.5 right-2 text-[8px] font-mono text-white/10 font-black">#{String(id).padStart(3, '0')}</div>

                      {(isP1 || isP2) && (
                        <div className="absolute top-1.5 left-2 flex gap-1">
                          {isP1 && <div className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_8px_#3b82f6]"></div>}
                          {isP2 && <div className="w-2 h-2 rounded-full bg-red-400 shadow-[0_0_8px_#dc2626]"></div>}
                        </div>
                      )}

                      <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`} className={`w-16 h-16 sm:w-20 sm:h-20 transition-transform duration-500 relative z-10 ${isP1 || isP2 ? 'scale-110' : 'group-hover:scale-125'}`} style={{ imageRendering: 'pixelated' }} />
                      <h3 className={`mt-1 sm:mt-2 font-sans font-black text-[10px] sm:text-xs uppercase truncate w-full text-center tracking-tight transition-colors ${isP1 || isP2 ? 'text-white' : 'text-white/60 group-hover:text-white'}`}>{displayName}</h3>
                    </div>
                  </div>

                );
              })}
            </div>
          )}
        </div>

        {/* P2 상세 */}
        {selectedOpponent && showP2Info && (
          <div className={`lg:shrink-0 h-full ${(typeof window !== 'undefined' && window.innerWidth < 1024) ? 'fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-end lg:items-center justify-center' : 'relative z-40 flex flex-col justify-center'}`}>
            <div className="absolute inset-0 lg:hidden" onClick={() => setShowP2Info(false)}></div>
            <div className="w-full lg:w-auto h-full transform transition-transform duration-500 ease-out animate-in slide-in-from-bottom lg:slide-in-from-right">
              <PokedexSidePanel
                pokemon={selectedOpponent}
                species={opponentSpecies}
                moves={opponentMoves}
                tab={opponentPokedexTab}
                onTabChange={setOpponentPokedexTab}
                onEdit={() => openMoveEditModal('player2')}
                onClose={() => {
                  setShowP2Info(false);
                  setSelectedOpponent(null);
                  setOpponentPokemon(null);
                }}
                isOpponent
                t={t}
                getLocalizedName={getLocalizedName}
                getLocalizedPokemonDescription={getLocalizedPokemonDescription}
                getLocalizedMoveName={getLocalizedMoveName}
              />
            </div>
          </div>
        )}
      </main>

      {/* 하단 컨트롤 패널: 완전히 슬림화하고 플로팅 스타일 강화 */}
      <footer className="shrink-0 p-4 flex justify-center items-center z-[50] relative">
        <div className="w-full max-w-4xl flex items-center gap-6 relative z-10">
          <div className="flex-1 flex justify-around items-center bg-black/40 backdrop-blur-xl border-2 border-black p-2 rounded-[1.5rem] shadow-2xl relative">
            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-[#DC0A2D] border-2 border-black px-3 py-0.5 rounded-full z-10 shadow-lg"><span className="text-[7px] font-mono text-white font-black tracking-[0.3em] uppercase whitespace-nowrap">READY</span></div>

            <div className="flex items-center gap-3">
              <div
                onClick={() => selectedPlayer && setShowP1Info(true)}
                className={`w-12 h-12 rounded-xl border-2 transition-all flex items-center justify-center relative cursor-pointer ${selectedPlayer ? 'bg-blue-500/20 border-blue-500/50' : 'bg-white/5 border-white/5 border-dashed opacity-40'}`}
              >
                {selectedPlayer && (
                  <img src={selectedPlayer.sprites.front_default} className="w-14 h-14 max-w-none absolute drop-shadow-lg animate-float" style={{ imageRendering: 'pixelated' }} />
                )}
              </div>
              <span className="hidden sm:block text-[9px] font-mono text-white/50 font-black uppercase tracking-widest truncate max-w-[80px]">{selectedPlayer ? getLocalizedName(playerSpecies, selectedPlayer.name) : 'P1'}</span>
            </div>

            <div className="text-xl font-mono text-white/10 font-black italic tracking-tighter">VS</div>

            <div className="flex items-center gap-3">
              <span className="hidden sm:block text-[9px] font-mono text-white/50 font-black uppercase tracking-widest truncate max-w-[80px] text-right">{selectedOpponent ? getLocalizedName(opponentSpecies, selectedOpponent.name) : 'P2'}</span>
              <div
                onClick={() => selectedOpponent && setShowP2Info(true)}
                className={`w-12 h-12 rounded-xl border-2 transition-all flex items-center justify-center relative cursor-pointer ${selectedOpponent ? 'bg-red-500/20 border-red-500/50' : 'bg-white/5 border-white/5 border-dashed opacity-40'}`}
              >
                {selectedOpponent && (
                  <img src={selectedOpponent.sprites.front_default} className="w-14 h-14 max-w-none absolute drop-shadow-lg animate-float" style={{ imageRendering: 'pixelated' }} />
                )}
              </div>
            </div>

          </div>

          <button
            onClick={() => router.push('/battle')}
            disabled={!selectedPlayer || !selectedOpponent}
            className="group relative px-8 py-3 bg-yellow-400 border-[4px] border-black rounded-[1.5rem] shadow-xl hover:-translate-y-1 active:translate-y-0.5 disabled:opacity-20 transition-all overflow-hidden flex-shrink-0"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform"></div>
            <span className="relative z-10 text-lg font-mono font-black text-black uppercase italic tracking-tighter">{t('Initiate')}</span>
          </button>
        </div>
      </footer>


      {/* 기술 편집 모달 */}
      {isMoveModalOpen && editingPlayer && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4">
          <div className="bg-[#111]/90 border-2 border-white/10 rounded-[3rem] w-full max-w-6xl flex flex-col max-h-[92vh] shadow-[0_0_120px_rgba(0,0,0,0.9)] relative overflow-hidden animate-in zoom-in-95 duration-400">

            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-red-500 opacity-50"></div>

            <div className="p-8 sm:p-10 flex flex-col gap-6">
              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.5em] mb-1 opacity-70">Technique.Protocol</span>
                  <h2 className="text-3xl sm:text-5xl font-mono uppercase font-black text-white tracking-tighter leading-none italic">{t('Define Protocol')}</h2>
                </div>
                <div className="flex flex-col flex-1 items-end sm:items-center">
                  <div className="relative group/search max-w-[240px] sm:max-w-[300px] w-full mb-4">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-white/20 group-focus-within/search:text-blue-400 transition-colors">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    </div>
                    <input
                      type="text"
                      value={moveSearchTerm}
                      onChange={(e) => setMoveSearchTerm(e.target.value)}
                      placeholder={t('Search by technique...')}
                      className="w-full bg-black/60 border border-white/10 rounded-2xl pl-11 pr-4 py-3 font-sans text-sm text-white placeholder:text-white/20 focus:border-blue-500/50 outline-none transition-all backdrop-blur-md"
                    />
                  </div>
                  <div className="flex gap-3">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className={`w-4 h-4 sm:w-6 sm:h-6 rounded-lg border-2 transition-all ${i < tempSelectedMoves.length ? 'bg-blue-500 border-white/20 shadow-[0_0_15px_#3b82f6]' : 'bg-white/5 border-white/5'}`}></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden px-8 sm:px-10 pb-8 sm:pb-10 gap-8">

              <div className="flex-[1.5] flex flex-col gap-6 overflow-hidden">
                <div className="bg-black/60 border border-white/10 rounded-3xl p-4 flex gap-3 items-center shrink-0 overflow-x-auto custom-scrollbar shadow-2xl backdrop-blur-md">
                  <span className="text-[11px] font-mono font-black text-blue-500 uppercase tracking-tighter px-4 border-r border-white/10 shrink-0">Current Loadout</span>
                  {[...Array(4)].map((_, i) => {
                    const move = tempSelectedMoves[i];
                    return (
                      <div key={i} className={`flex-1 min-w-[140px] h-12 rounded-2xl border transition-all flex items-center px-4 gap-3 ${move ? 'bg-blue-600/20 border-blue-500/50 shadow-lg' : 'bg-white/5 border-dashed border-white/10 opacity-30'}`}>
                        {move ? (
                          <>
                            <div className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse"></div>
                            <span className="text-[11px] font-mono font-black text-white uppercase truncate">{getLocalizedMoveName(move)}</span>
                            <button onClick={() => toggleTempMove(move)} className="ml-auto text-white/40 hover:text-white transition-colors">×</button>
                          </>
                        ) : (
                          <span className="text-[9px] font-mono font-black text-white/20 uppercase tracking-widest">Awaiting Data</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex-1 overflow-y-auto grid grid-cols-2 md:grid-cols-3 gap-3 p-6 bg-black/40 border border-white/10 rounded-[2rem] custom-scrollbar shadow-inner backdrop-blur-md">
                  {isLoadingAvailableMoves ? (
                    <div className="col-span-full h-full flex flex-col items-center justify-center gap-5 py-24">
                      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="font-mono text-white/30 text-sm uppercase tracking-widest">Analyzing Gene Pool...</span>
                    </div>
                  ) : (
                    availableMovesDetails.filter(m => {
                      const name = getLocalizedMoveName(m);
                      return name.toLowerCase().includes(moveSearchTerm.toLowerCase());
                    }).map((m: any) => {
                      const isSelected = tempSelectedMoves.find(sm => sm.name === m.name);
                      const typeTheme = typeThemes[m.type.name] || { color: '#555', shadow: 'rgba(0,0,0,0.5)' };
                      return (
                        <button
                          key={m.name}
                          onClick={() => toggleTempMove(m)}
                          onMouseEnter={() => setHoveredMove(m)}
                          className={`group relative p-5 border transition-all rounded-[1.5rem] flex flex-col justify-center overflow-hidden ${isSelected ? 'scale-95 ring-2 ring-blue-400 border-transparent shadow-[0_0_30px_rgba(59,130,246,0.4)]' : 'hover:scale-[1.03] hover:border-white/20 border-white/5 bg-white/5 grayscale-[0.8] opacity-60 hover:grayscale-0 hover:opacity-100'}`}
                          style={{
                            backgroundColor: isSelected ? `${typeTheme.color}33` : 'rgba(255,255,255,0.03)',
                            height: '110px'
                          }}
                        >
                          {isSelected && <div className="absolute inset-0 bg-white/5 animate-pulse"></div>}
                          <div className="absolute top-3 right-4 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: typeTheme.color, boxShadow: `0 0 15px ${typeTheme.shadow}` }}></div>
                          </div>
                          <div className="relative z-10 w-full">
                            <p className={`font-mono font-black text-sm sm:text-xl uppercase truncate leading-tight drop-shadow-lg ${isSelected ? 'text-white' : 'text-white/70 group-hover:text-white'}`}>{getLocalizedMoveName(m)}</p>
                            <div className={`mt-2 text-[10px] font-black uppercase tracking-[0.3em] ${isSelected ? 'text-white/90' : 'text-white/30'}`}>{m.type.name}</div>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* 상세 정보 패널 */}
              <div className="w-full lg:w-[420px] h-[450px] lg:h-auto flex-shrink-0 bg-[#1a1a1a]/60 border border-white/10 rounded-[2.5rem] p-8 flex flex-col gap-6 overflow-hidden relative group/panel backdrop-blur-3xl shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-red-500/5 pointer-events-none"></div>
                {hoveredMove || tempSelectedMoves[tempSelectedMoves.length - 1] ? (
                  <>
                    {(() => {
                      const move = hoveredMove || tempSelectedMoves[tempSelectedMoves.length - 1];
                      const typeTheme = typeThemes[move.type.name] || { color: '#555', shadow: 'rgba(0,0,0,0.5)' };
                      return (
                        <div className="animate-in fade-in slide-in-from-right-8 duration-500 flex flex-col h-full">
                          <div className="flex justify-between items-start mb-6">
                            <span className="px-4 py-1.5 rounded-xl text-[10px] font-black text-white uppercase border border-white/10 shadow-xl" style={{ backgroundColor: `${typeTheme.color}aa` }}>{move.type.name}</span>
                            <span className="font-mono text-[10px] text-white/20 font-black tracking-tighter">DATA.CORE_{move.id}</span>
                          </div>

                          <h3 className="text-3xl sm:text-5xl font-mono font-black text-white uppercase mb-5 tracking-tighter leading-none italic py-1 drop-shadow-2xl shrink-0">{getLocalizedMoveName(move)}</h3>

                          <div className="flex-1 overflow-y-auto custom-scrollbar pr-3 mb-6">
                            <p className="text-sm sm:text-lg text-white/80 leading-relaxed font-medium border-l-4 border-white/10 pl-6 italic">{getLocalizedMoveDescription(move)}</p>
                          </div>

                          <div className="grid grid-cols-2 gap-4 shrink-0">
                            <div className="bg-black/60 p-5 rounded-2xl border border-white/5 shadow-inner">
                              <span className="block text-[10px] font-black text-white/20 uppercase mb-2 tracking-widest">Force</span>
                              <span className="text-2xl sm:text-3xl font-mono font-black text-blue-400 drop-shadow-lg">{move.power || '--'}</span>
                            </div>
                            <div className="bg-black/60 p-5 rounded-2xl border border-white/5 shadow-inner">
                              <span className="block text-[10px] font-black text-white/20 uppercase mb-2 tracking-widest">Precision</span>
                              <span className="text-2xl sm:text-3xl font-mono font-black text-blue-400 drop-shadow-lg">{move.accuracy || '--'}%</span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8 opacity-20">
                    <svg className="w-16 h-16 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <p className="font-mono text-sm uppercase font-black tracking-[0.3em]">{t('Select technique to analyze')}</p>
                  </div>
                )}

                {/* 하단 확정 영역 */}
                <div className="mt-auto pt-6 border-t border-white/10 flex flex-col gap-4 shrink-0">
                  <div className="flex justify-between items-center px-2">
                    <span className="text-[11px] font-mono text-white/30 font-black uppercase tracking-widest">{tempSelectedMoves.length} / 4 {t('Active')}</span>
                    <div className="flex gap-1.5">
                      {[...Array(tempSelectedMoves.length)].map((_, i) => <div key={i} className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse shadow-[0_0_8px_#3b82f6]"></div>)}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setIsMoveModalOpen(false)} className="flex-1 py-4 bg-white/5 border border-white/10 text-white/40 font-mono font-black uppercase rounded-2xl hover:bg-white/10 transition-all text-xs tracking-widest">{t('Abort')}</button>
                    <button
                      onClick={confirmMoveSelection}
                      disabled={tempSelectedMoves.length < 1 || tempSelectedMoves.length > 4}
                      className="flex-[2] py-4 bg-blue-500 text-white font-mono font-black uppercase rounded-2xl shadow-[0_10px_25px_rgba(59,130,246,0.4)] hover:shadow-[0_15px_30px_rgba(59,130,246,0.5)] hover:-translate-y-1 active:translate-y-1 active:shadow-none disabled:opacity-10 transition-all text-xs tracking-widest"
                    >
                      {t('Execute Protocol')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-float { animation: float 3s ease-in-out infinite; }
        
        @keyframes ken-burns {
          0% { transform: scale(1); }
          100% { transform: scale(1.1) translate(1%, 1%); }
        }
        .animate-ken-burns { animation: ken-burns 20s linear infinite alternate; }

        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
      `}</style>
    </div>
  );
}
