import { MoveDetails, Pokemon, PokemonSpecies } from "./pokemon";

export type Turn = 'player1' | 'player2';

export interface BattleState {
  logs: string[];
  battleOver: boolean;
  playerHp: number;
  oppHp: number;
  playerMoves: MoveDetails[];
  opponentMoves: MoveDetails[];
  playerSpecies: PokemonSpecies | null;
  opponentSpecies: PokemonSpecies | null;
  loading: boolean;
  currentTurn: Turn;
  isProcessing: boolean;
  damageEffect: 'p1' | 'p2' | null;
}
