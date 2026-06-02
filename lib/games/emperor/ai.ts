// エンペラーゲームのAIロジック

import type { EmperorState, RankType } from './types';
import { CARD_RANK_VALUES } from './constants';

export interface AiDecision {
  action: 'ready' | 'wait';
  confidence: number; // 0-1の確信度
  reasoning: string; // 判断理由（デバッグ用）
}

/**
 * CPUの判断を計算
 * エンペラーゲームはカードが配られるだけなので、
 * AIとしての判断は「次のアクションに進むタイミング」のみ
 */
export function calculateCpuDecision(state: EmperorState, cpuPlayerId: string): AiDecision {
  const cpuPlayer = state.players.find((p) => p.id === cpuPlayerId);

  if (!cpuPlayer) {
    throw new Error('CPUプレイヤーが見つかりません');
  }

  // エンペラーゲームは自動進行なので、常に準備完了
  return {
    action: 'ready',
    confidence: 1.0,
    reasoning: 'エンペラーゲームは自動進行',
  };
}

/**
 * 期待値計算: 各階級になる確率と期待コイン変動
 */
export function calculateExpectedValue(
  state: EmperorState,
  playerId: string
): {
  expectedCoins: number;
  emperorProbability: number;
  slaveProbability: number;
  citizenProbability: number;
} {
  const activePlayers = state.players.filter((p) => p.isActive);
  const totalPlayers = activePlayers.length;

  // 各階級になる確率（均等）
  const emperorProb = 1 / totalPlayers;
  const slaveProb = 1 / totalPlayers;
  const citizenProb = (totalPlayers - 2) / totalPlayers;

  // 期待コイン変動
  // 皇帝: +3コイン
  // 奴隷: -3コイン
  // 市民: 0コイン
  const expectedChange = emperorProb * state.transferAmount - slaveProb * state.transferAmount;

  const player = state.players.find((p) => p.id === playerId);
  const currentCoins = player?.coins || 0;

  return {
    expectedCoins: currentCoins + expectedChange,
    emperorProbability: emperorProb,
    slaveProbability: slaveProb,
    citizenProbability: citizenProb,
  };
}

/**
 * リスク評価: 破産リスクを計算
 */
export function calculateBankruptcyRisk(state: EmperorState, playerId: string): number {
  const player = state.players.find((p) => p.id === playerId);
  if (!player || !player.isActive) {
    return 1.0; // すでに破産している
  }

  const currentCoins = player.coins;
  const transferAmount = state.transferAmount;
  const activePlayers = state.players.filter((p) => p.isActive);
  const totalPlayers = activePlayers.length;

  // 奴隷になる確率
  const slaveProb = 1 / totalPlayers;

  // 奴隷になってもコインが残る確率
  if (currentCoins > transferAmount) {
    return 0; // 破産リスクなし
  }

  // 破産リスク = 奴隷になる確率 × コイン不足度
  const shortfall = transferAmount - currentCoins;
  const riskFactor = Math.min(1.0, shortfall / transferAmount);

  return slaveProb * riskFactor;
}

/**
 * CPUの難易度別の思考時間を計算（演出用）
 */
export function calculateThinkingTime(difficulty: 'easy' | 'medium' | 'hard'): number {
  switch (difficulty) {
    case 'easy':
      return 500; // 0.5秒
    case 'medium':
      return 1000; // 1秒
    case 'hard':
      return 1500; // 1.5秒
    default:
      return 1000;
  }
}

/**
 * ゲーム状況の分析（デバッグ用）
 */
export function analyzeGameState(state: EmperorState): {
  activePlayersCount: number;
  averageCoins: number;
  maxCoins: number;
  minCoins: number;
  bankruptcyRisk: Record<string, number>;
} {
  const activePlayers = state.players.filter((p) => p.isActive);
  const totalCoins = activePlayers.reduce((sum, p) => sum + p.coins, 0);
  const avgCoins = totalCoins / activePlayers.length;

  const coins = activePlayers.map((p) => p.coins);
  const maxCoins = Math.max(...coins);
  const minCoins = Math.min(...coins);

  const bankruptcyRisk: Record<string, number> = {};
  for (const player of activePlayers) {
    bankruptcyRisk[player.id] = calculateBankruptcyRisk(state, player.id);
  }

  return {
    activePlayersCount: activePlayers.length,
    averageCoins: avgCoins,
    maxCoins,
    minCoins,
    bankruptcyRisk,
  };
}
