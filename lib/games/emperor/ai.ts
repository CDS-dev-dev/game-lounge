// エンペラーゲーム（カイジのEカード）AI

import type { EmperorState, ECard } from './types';

/**
 * CPUがカードを選択する
 */
export function calculateCpuCard(
  state: EmperorState,
  difficulty: 'easy' | 'medium' | 'hard' = 'medium'
): ECard {
  const cpu = state.players.find((p) => p.isCpu);
  if (!cpu || cpu.hand.length === 0) {
    throw new Error('CPUの手札がありません');
  }

  const hand = cpu.hand;
  const player = state.players.find((p) => !p.isCpu)!;

  // 難易度による思考パターン
  if (difficulty === 'easy') {
    // かんたん: 完全ランダム
    return hand[Math.floor(Math.random() * hand.length)];
  }

  if (difficulty === 'medium') {
    // ふつう: 基本的な戦略
    return mediumStrategy(hand, cpu.side, state.currentBattle, player.hand.length);
  }

  // むずかしい: 高度な読み合い
  return hardStrategy(hand, cpu.side, state.currentBattle, player.hand.length, state.battleHistory);
}

/**
 * ふつう難易度の戦略
 */
function mediumStrategy(
  hand: ECard[],
  cpuSide: 'emperor' | 'slave',
  currentBattle: number,
  opponentHandCount: number
): ECard {
  const emperorCards = hand.filter((c) => c.type === 'emperor');
  const citizenCards = hand.filter((c) => c.type === 'citizen');
  const slaveCards = hand.filter((c) => c.type === 'slave');

  // 最初の勝負: 市民を出しやすい
  if (currentBattle === 0) {
    if (citizenCards.length > 0 && Math.random() < 0.7) {
      return citizenCards[Math.floor(Math.random() * citizenCards.length)];
    }
  }

  // 皇帝側の場合
  if (cpuSide === 'emperor') {
    // 序盤は市民を出して温存
    if (currentBattle < 2 && citizenCards.length > 0 && Math.random() < 0.6) {
      return citizenCards[Math.floor(Math.random() * citizenCards.length)];
    }
    // 中盤以降は皇帝を出す確率を上げる
    if (emperorCards.length > 0 && Math.random() < 0.5) {
      return emperorCards[0];
    }
  }

  // 奴隷側の場合
  if (cpuSide === 'slave') {
    // 相手の手札が少ない = 皇帝を温存している可能性
    if (opponentHandCount <= 2 && slaveCards.length > 0 && Math.random() < 0.7) {
      return slaveCards[0];
    }
    // それ以外は市民優先
    if (citizenCards.length > 0 && Math.random() < 0.6) {
      return citizenCards[Math.floor(Math.random() * citizenCards.length)];
    }
  }

  // デフォルト: ランダム
  return hand[Math.floor(Math.random() * hand.length)];
}

/**
 * むずかしい難易度の戦略
 */
function hardStrategy(
  hand: ECard[],
  cpuSide: 'emperor' | 'slave',
  currentBattle: number,
  opponentHandCount: number,
  battleHistory: any[]
): ECard {
  const emperorCards = hand.filter((c) => c.type === 'emperor');
  const citizenCards = hand.filter((c) => c.type === 'citizen');
  const slaveCards = hand.filter((c) => c.type === 'slave');

  // 過去の履歴から相手の傾向を分析
  const opponentPlayedEmperor = battleHistory.some((b) => b.playerCard?.type === 'emperor');
  const opponentPlayedSlave = battleHistory.some((b) => b.playerCard?.type === 'slave');

  // 皇帝側の場合
  if (cpuSide === 'emperor') {
    // 相手が奴隷をまだ出していない && 手札が少ない = 奴隷を温存
    if (!opponentPlayedSlave && opponentHandCount <= 2 && citizenCards.length > 0) {
      // 市民を出して奴隷を誘う
      return citizenCards[Math.floor(Math.random() * citizenCards.length)];
    }
    // 相手が奴隷を既に使った = 皇帝を出しても安全
    if (opponentPlayedSlave && emperorCards.length > 0 && Math.random() < 0.8) {
      return emperorCards[0];
    }
    // それ以外は市民優先
    if (citizenCards.length > 0 && Math.random() < 0.5) {
      return citizenCards[Math.floor(Math.random() * citizenCards.length)];
    }
  }

  // 奴隷側の場合
  if (cpuSide === 'slave') {
    // 相手が皇帝をまだ出していない && 手札が少ない
    if (!opponentPlayedEmperor && opponentHandCount <= 2 && slaveCards.length > 0) {
      // 奴隷を出して皇帝を狙う
      return slaveCards[0];
    }
    // 相手が皇帝を既に使った = 市民を出して安全に
    if (opponentPlayedEmperor && citizenCards.length > 0) {
      return citizenCards[Math.floor(Math.random() * citizenCards.length)];
    }
  }

  // デフォルト: medium戦略にフォールバック
  return mediumStrategy(hand, cpuSide, currentBattle, opponentHandCount);
}
