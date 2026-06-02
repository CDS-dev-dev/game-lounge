// エンペラーゲーム（カイジ）の型定義

export type PlayerRole = 'player1' | 'player2' | 'player3' | 'player4' | 'player5' | 'player6';
export type GameStatus = 'waiting' | 'dealing' | 'reveal' | 'transfer' | 'finished';
export type RankType = 'emperor' | 'citizen' | 'slave' | null;

// カードのランク（実際にはトランプの絵札を使用）
export type CardRank = 'J' | 'Q' | 'K';

export interface EmperorCard {
  id: string;
  rank: CardRank;
  // Kが皇帝、Qが市民、Jが奴隷
}

export interface EmperorPlayer {
  id: string;
  name: string;
  coins: number; // 所持コイン数
  role: RankType; // 現在のラウンドでの階級
  card: EmperorCard | null; // 配られたカード
  isActive: boolean; // 破産していないか
  isCpu: boolean; // CPU対戦かどうか
}

export interface EmperorState {
  gameId: string;
  status: GameStatus;
  players: EmperorPlayer[];
  currentRound: number; // 現在のラウンド数
  maxRounds: number; // 最大ラウンド数（破産者が出たら終了）
  deck: EmperorCard[]; // 山札（シャッフル済み）
  transferAmount: number; // 奴隷が皇帝に渡すコイン数
  lastTransfer: { from: string; to: string; amount: number } | null; // 最後の移動
  winner: string | null; // 勝者のプレイヤーID
  playerCount: number; // プレイヤー数（3-6人）
  createdAt: number;
  updatedAt: number;
}

// クライアント用の状態（カードが見えないプレイヤーの情報を隠す）
export interface EmperorClientState {
  gameId: string;
  status: GameStatus;
  players: {
    id: string;
    name: string;
    coins: number;
    role: RankType;
    hasCard: boolean; // カードを持っているか（中身は見えない）
    card: EmperorCard | null; // 自分のカードのみ見える、他は公開後に見える
    isActive: boolean;
    isCpu: boolean;
  }[];
  myPlayerId: string;
  myPlayer: EmperorPlayer | null;
  currentRound: number;
  maxRounds: number;
  transferAmount: number;
  lastTransfer: { from: string; to: string; amount: number } | null;
  winner: string | null;
  playerCount: number;
}
