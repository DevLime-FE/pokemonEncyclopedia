"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getPokedexByRegion, getPokemon, Pokemon, PokedexEntry } from '@/src/services/pokeapi';
import PokemonCard from '@/src/components/PokemonCard';
import { useBattle } from '@/src/context/BattleContext';
import { useTranslation } from 'react-i18next';

export default function RegionPage() {
  const { t } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const regionName = params.regionName as string;
  
  const [entries, setEntries] = useState<PokedexEntry[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { setPlayerPokemon, setOpponentPokemon } = useBattle();
  const [selectedPlayer, setSelectedPlayer] = useState<Pokemon | null>(null);
  const [selectedOpponent, setSelectedOpponent] = useState<Pokemon | null>(null);
  const [pokemonCache, setPokemonCache] = useState<Record<string, Pokemon>>({});

  useEffect(() => {
    async function loadRegion() {
      try {
        const data = await getPokedexByRegion(regionName);
        setEntries(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadRegion();
  }, [regionName]);
  
  const fetchPokemonDetails = async (name: string) => {
    if (pokemonCache[name]) return pokemonCache[name];
    const data = await getPokemon(name);
    setPokemonCache(prev => ({ ...prev, [name]: data }));
    return data;
  };

  const handleSelect = async (entry: PokedexEntry) => {
    const pkmn = await fetchPokemonDetails(entry.pokemon_species.name);
    
    if (selectedPlayer?.name === pkmn.name) {
      setSelectedPlayer(null);
      setPlayerPokemon(null);
      return;
    }
    
    if (selectedOpponent?.name === pkmn.name) {
      setSelectedOpponent(null);
      setOpponentPokemon(null);
      return;
    }

    if (!selectedPlayer) {
      setSelectedPlayer(pkmn);
      setPlayerPokemon(pkmn);
    } else if (!selectedOpponent) {
      setSelectedOpponent(pkmn);
      setOpponentPokemon(pkmn);
    }
  };
  
  const startGame = () => {
    router.push('/battle');
  };

  const getRegionTheme = (region: string) => {
    switch (region.toLowerCase()) {
      case 'kanto': return 'bg-green-300';
      case 'johto': return 'bg-yellow-200';
      case 'hoenn': return 'bg-blue-300';
      case 'sinnoh': return 'bg-slate-300';
      case 'unova': return 'bg-gray-400';
      case 'kalos': return 'bg-pink-200';
      case 'alola': return 'bg-teal-200';
      case 'galar': return 'bg-red-300';
      case 'paldea': return 'bg-orange-300';
      default: return 'bg-blue-100';
    }
  };

  return (
    <div 
      className={`min-h-screen ${getRegionTheme(regionName)}`}
      style={{ backgroundImage: 'radial-gradient(#00000022 2px, transparent 2px)', backgroundSize: '24px 24px' }}
    >
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl sm:text-4xl font-mono uppercase tracking-widest mb-8 text-center text-black" style={{ textShadow: '2px 2px 0px white' }}>{t('Region Pokedex', { region: regionName })}</h1>
        
        <div className="bg-[#dc0a2d] p-4 sm:p-6 mb-8 sticky top-4 z-50 border-[6px] border-black rounded-2xl shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex-1 w-full">
              
              {/* Top Pokedex Lights */}
              <div className="flex items-center gap-3 mb-6 border-b-4 border-black pb-4">
                <div className="w-12 h-12 bg-[#28aafd] border-4 border-black rounded-full shadow-[inset_-4px_-4px_0_0_rgba(0,0,0,0.3)] relative flex items-start justify-start p-1">
                   <div className="w-3 h-3 bg-white rounded-full opacity-60"></div>
                </div>
                <div className="w-4 h-4 bg-red-500 border-2 border-black rounded-full shadow-inner"></div>
                <div className="w-4 h-4 bg-yellow-400 border-2 border-black rounded-full shadow-inner"></div>
                <div className="w-4 h-4 bg-green-500 border-2 border-black rounded-full shadow-inner"></div>
                <h2 className="font-mono text-white text-xl sm:text-2xl ml-auto uppercase tracking-widest" style={{ textShadow: '2px 2px 0px black' }}>{t('Battle Setup')}</h2>
              </div>

              {/* Pokedex Inner Screen Container */}
              <div className="bg-[#dedede] p-4 border-[6px] border-black rounded-lg shadow-[inset_4px_4px_0_0_rgba(0,0,0,0.2)]">
                <div className="bg-[#232323] p-2 rounded-t-lg flex justify-center gap-4">
                  <div className="w-3 h-3 bg-red-500 border-2 border-black rounded-full shadow-inner"></div>
                  <div className="w-3 h-3 bg-red-500 border-2 border-black rounded-full shadow-inner"></div>
                </div>
                
                {/* LCD Screen */}
                <div className="bg-[#98cb98] grid grid-cols-2 p-6 border-x-4 border-black font-mono text-xs sm:text-sm overflow-hidden relative min-h-[220px] shadow-[inset_4px_4px_0_0_rgba(0,0,0,0.2)]">
                  
                  {/* Pokedex Screen Watermark */}
                  <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(0,0,0,0.1)_1px,_transparent_1px)]" style={{ backgroundSize: '100% 4px' }}></div>

                  {/* Player 1 Screen */}
                  <div className="flex flex-col items-center z-10 border-r-4 border-black/20 pr-4">
                    <span className="text-black font-bold mb-6 uppercase bg-white/50 border-2 border-black px-4 py-1 rounded-full">{t('Player 1')}</span>
                    <div key={selectedPlayer?.name || 'empty-p1'} className={`relative w-16 h-16 flex items-center justify-center mb-6 ${selectedPlayer ? 'animate-throw-left' : ''}`}>
                      {/* Real Poke Ball Sprite - Top Half */}
                      <div className="absolute inset-0 origin-bottom" style={{ zIndex: selectedPlayer ? 10 : 20, clipPath: 'polygon(0 0, 100% 0, 100% 50%, 0 50%)', animation: selectedPlayer ? 'openTop 0.3s ease-out 1.0s both' : 'none' }}>
                        <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png" className="w-full h-full drop-shadow-md" style={{ imageRendering: 'pixelated' }} alt="pokeball top" />
                      </div>
                      {/* Real Poke Ball Sprite - Bottom Half */}
                      <div className="absolute inset-0 origin-top" style={{ zIndex: 20, clipPath: 'polygon(0 50%, 100% 50%, 100% 100%, 0 100%)', animation: selectedPlayer ? 'openBottom 0.3s ease-out 1.0s both' : 'none' }}>
                        <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png" className="w-full h-full drop-shadow-md" style={{ imageRendering: 'pixelated' }} alt="pokeball bottom" />
                      </div>
                      
                      {/* Pokemon Sprite - Huge Size! */}
                      {selectedPlayer && (
                        <div className="absolute z-30" style={{ animation: 'popOut 0.4s ease-out 1.3s both', top: '-70px' }}>
                          <img src={selectedPlayer.sprites.front_default} className="w-40 h-40 max-w-none object-contain drop-shadow-[4px_4px_0_rgba(0,0,0,0.3)] animate-bounce" style={{ imageRendering: 'pixelated' }} alt={selectedPlayer.name} />
                        </div>
                      )}
                    </div>
                    {selectedPlayer ? <span className="font-bold uppercase text-black bg-white/80 px-4 py-2 border-2 border-black rounded-lg shadow-[4px_4px_0_0_rgba(0,0,0,0.2)] mt-auto animate-pulse">{selectedPlayer.name}</span> : <span className="text-black/50 text-xs mt-auto border-2 border-dashed border-black/30 px-3 py-1 rounded-lg">{t('Select below')}</span>}
                  </div>

                  {/* Player 2 Screen */}
                  <div className="flex flex-col items-center z-10 pl-4">
                    <span className="text-black font-bold mb-6 uppercase bg-white/50 border-2 border-black px-4 py-1 rounded-full">{t('Player 2')}</span>
                    <div key={selectedOpponent?.name || 'empty-p2'} className={`relative w-16 h-16 flex items-center justify-center mb-6 ${selectedOpponent ? 'animate-throw-right' : ''}`}>
                      {/* Real Poke Ball Sprite - Top Half */}
                      <div className="absolute inset-0 origin-bottom" style={{ zIndex: selectedOpponent ? 10 : 20, clipPath: 'polygon(0 0, 100% 0, 100% 50%, 0 50%)', animation: selectedOpponent ? 'openTop 0.3s ease-out 1.0s both' : 'none' }}>
                        <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png" className="w-full h-full drop-shadow-md" style={{ imageRendering: 'pixelated' }} alt="pokeball top" />
                      </div>
                      {/* Real Poke Ball Sprite - Bottom Half */}
                      <div className="absolute inset-0 origin-top" style={{ zIndex: 20, clipPath: 'polygon(0 50%, 100% 50%, 100% 100%, 0 100%)', animation: selectedOpponent ? 'openBottom 0.3s ease-out 1.0s both' : 'none' }}>
                        <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png" className="w-full h-full drop-shadow-md" style={{ imageRendering: 'pixelated' }} alt="pokeball bottom" />
                      </div>
                      
                      {/* Pokemon Sprite - Huge Size! */}
                      {selectedOpponent && (
                        <div className="absolute z-30" style={{ animation: 'popOut 0.4s ease-out 1.3s both', top: '-70px' }}>
                          <img src={selectedOpponent.sprites.front_default} className="w-40 h-40 max-w-none object-contain drop-shadow-[4px_4px_0_rgba(0,0,0,0.3)] animate-bounce" style={{ imageRendering: 'pixelated' }} alt={selectedOpponent.name} />
                        </div>
                      )}
                    </div>
                    {selectedOpponent ? <span className="font-bold uppercase text-black bg-white/80 px-4 py-2 border-2 border-black rounded-lg shadow-[4px_4px_0_0_rgba(0,0,0,0.2)] mt-auto animate-pulse">{selectedOpponent.name}</span> : <span className="text-black/50 text-xs mt-auto border-2 border-dashed border-black/30 px-3 py-1 rounded-lg">{t('Select below')}</span>}
                  </div>

                </div>
                
                <div className="bg-[#232323] p-3 rounded-b-lg flex justify-between items-center px-6">
                  <div className="w-5 h-5 bg-red-500 rounded-full border-2 border-black shadow-[inset_-2px_-2px_0_0_rgba(0,0,0,0.4)]"></div>
                  <div className="flex gap-3">
                    <div className="w-8 h-2 bg-black rounded-full shadow-inner"></div>
                    <div className="w-8 h-2 bg-black rounded-full shadow-inner"></div>
                  </div>
                </div>
              </div>

            </div>
            
            <div className="w-full md:w-auto flex flex-col items-center gap-4 mt-4 md:mt-0">
              <button 
                disabled={!selectedPlayer || !selectedOpponent}
                onClick={startGame}
                className="w-full px-8 py-6 bg-[#28aafd] text-white font-mono uppercase text-xl sm:text-2xl rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-400 transition-transform transform hover:-translate-y-1 hover:-translate-x-1 border-[6px] border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] active:shadow-none active:translate-x-[8px] active:translate-y-[8px]"
              >
                {t('Start Battle!')}
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <p className="text-center font-mono text-xl text-black bg-white inline-block px-8 py-3 rounded-full border-4 border-black shadow-[4px_4px_0_0_#000] animate-pulse">{t('Loading Pokedex...')}</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {entries.map((entry) => {
              const urlParts = entry.pokemon_species.url.split('/');
              const id = urlParts[urlParts.length - 2];
              const spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
              
              const isPlayer = selectedPlayer?.name === entry.pokemon_species.name;
              const isOpponent = selectedOpponent?.name === entry.pokemon_species.name;
              
              return (
                <div 
                  key={entry.pokemon_species.name}
                  onClick={() => handleSelect(entry)}
                  className={`relative p-3 border-4 border-black rounded-2xl transition-all duration-300 cursor-pointer overflow-hidden group ${
                    isPlayer 
                      ? 'bg-blue-100 shadow-[6px_6px_0_0_#2563eb] -translate-y-2 -translate-x-2 z-10 scale-105' 
                      : isOpponent 
                        ? 'bg-red-100 shadow-[6px_6px_0_0_#dc2626] -translate-y-2 -translate-x-2 z-10 scale-105' 
                        : 'bg-white shadow-[4px_4px_0_0_#000] hover:shadow-[6px_6px_0_0_#000] hover:-translate-y-1 hover:-translate-x-1 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex justify-center mb-3 bg-gradient-to-b from-gray-100 to-gray-200 border-2 border-black rounded-xl overflow-hidden group-hover:from-blue-50 group-hover:to-blue-100 transition-colors relative">
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_#000_1px,_transparent_1px)]" style={{ backgroundSize: '8px 8px' }}></div>
                    <img src={spriteUrl} alt={entry.pokemon_species.name} className="w-24 h-24 drop-shadow-md z-10 group-hover:scale-110 transition-transform" style={{ imageRendering: 'pixelated' }} />
                  </div>
                  <h3 className="text-center font-mono font-bold uppercase text-xs text-black tracking-widest bg-gray-100 border-2 border-black rounded-full py-1">{entry.pokemon_species.name}</h3>
                  {isPlayer && <span className="absolute top-2 left-2 text-[10px] font-mono font-bold uppercase bg-blue-500 text-white px-2 py-0.5 rounded-full border-2 border-black shadow-sm">P1</span>}
                  {isOpponent && <span className="absolute top-2 right-2 text-[10px] font-mono font-bold uppercase bg-red-500 text-white px-2 py-0.5 rounded-full border-2 border-black shadow-sm">P2</span>}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
