"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { Pokemon, MoveDetails } from "../services/pokeapi";

interface BattleContextType {
  playerPokemon: Pokemon | null;
  opponentPokemon: Pokemon | null;
  setPlayerPokemon: (p: Pokemon | null) => void;
  setOpponentPokemon: (p: Pokemon | null) => void;
  playerMoves: MoveDetails[];
  opponentMoves: MoveDetails[];
  setPlayerMoves: (m: MoveDetails[]) => void;
  setOpponentMoves: (m: MoveDetails[]) => void;
  resetBattle: () => void;
}

const BattleContext = createContext<BattleContextType | undefined>(undefined);

export function BattleProvider({ children }: { children: ReactNode }) {
  const [playerPokemon, setPlayerPokemon] = useState<Pokemon | null>(null);
  const [opponentPokemon, setOpponentPokemon] = useState<Pokemon | null>(null);
  const [playerMoves, setPlayerMoves] = useState<MoveDetails[]>([]);
  const [opponentMoves, setOpponentMoves] = useState<MoveDetails[]>([]);

  const resetBattle = () => {
    setPlayerPokemon(null);
    setOpponentPokemon(null);
    setPlayerMoves([]);
    setOpponentMoves([]);
  };

  return (
    <BattleContext.Provider
      value={{
        playerPokemon,
        opponentPokemon,
        setPlayerPokemon,
        setOpponentPokemon,
        playerMoves,
        opponentMoves,
        setPlayerMoves,
        setOpponentMoves,
        resetBattle,
      }}
    >
      {children}
    </BattleContext.Provider>
  );
}

export function useBattle() {
  const context = useContext(BattleContext);
  if (context === undefined) {
    throw new Error("useBattle must be used within a BattleProvider");
  }
  return context;
}
