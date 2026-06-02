// ゲームエンジンのテスト

import { describe, it, expect } from '@jest/globals';
import {
  createInitialState,
  startGame,
  playerAction,
  createDeck,
  shuffleDeck,
} from '../engine';

describe('テキサスホールデム エンジン', () => {
  describe('デッキ生成', () => {
    it('52枚のデッキが生成される', () => {
      const deck = createDeck();
      expect(deck.length).toBe(52);
    });

    it('シャッフル後も52枚', () => {
      const deck = createDeck();
      const shuffled = shuffleDeck(deck);
      expect(shuffled.length).toBe(52);
    });
  });

  describe('初期状態', () => {
    it('3人プレイヤーで初期状態が作成される', () => {
      const state = createInitialState('test-game', 3, ['Player1', 'Player2', 'Player3']);
      expect(state.players.length).toBe(3);
      expect(state.status).toBe('waiting');
      expect(state.pot).toBe(0);
    });

    it('プレイヤー人数が2人未満の場合エラー', () => {
      expect(() => {
        createInitialState('test-game', 1, ['Player1']);
      }).toThrow();
    });

    it('プレイヤー人数が9人を超える場合エラー', () => {
      expect(() => {
        createInitialState('test-game', 10, Array(10).fill('Player'));
      }).toThrow();
    });
  });

  describe('ゲーム開始', () => {
    it('ゲーム開始でブラインドが配置される', () => {
      const state = createInitialState('test-game', 3, ['Player1', 'Player2', 'Player3']);
      const started = startGame(state);

      expect(started.status).toBe('preflop');
      expect(started.pot).toBeGreaterThan(0); // ブラインドがポットに入っている
      expect(started.players[0].holeCards).not.toBeNull();
      expect(started.players[1].holeCards).not.toBeNull();
      expect(started.players[2].holeCards).not.toBeNull();
    });

    it('各プレイヤーに2枚のカードが配られる', () => {
      const state = createInitialState('test-game', 2, ['Player1', 'Player2']);
      const started = startGame(state);

      expect(started.players[0].holeCards?.length).toBe(2);
      expect(started.players[1].holeCards?.length).toBe(2);
    });
  });

  describe('プレイヤーアクション', () => {
    it('フォールドできる', () => {
      const state = createInitialState('test-game', 2, ['Player1', 'Player2']);
      const started = startGame(state);

      // 現在のターンのプレイヤーがフォールド
      const currentPlayer = started.players[started.currentTurn];
      const folded = playerAction(started, currentPlayer.id, 'fold');

      const foldedPlayer = folded.players.find(p => p.id === currentPlayer.id);
      expect(foldedPlayer?.isActive).toBe(false);
    });

    it('チェックできる（ベット額が同じ場合）', () => {
      const state = createInitialState('test-game', 2, ['Player1', 'Player2']);
      const started = startGame(state);

      // 現在のターンのプレイヤーがコール
      const currentPlayer1 = started.players[started.currentTurn];
      const called = playerAction(started, currentPlayer1.id, 'call');

      // 次のプレイヤー（ビッグブラインド）はチェック可能
      const currentPlayer2 = called.players[called.currentTurn];
      const checked = playerAction(called, currentPlayer2.id, 'check');

      expect(checked).toBeDefined();
    });

    it('レイズできる', () => {
      const state = createInitialState('test-game', 2, ['Player1', 'Player2']);
      const started = startGame(state);

      const currentPlayer = started.players[started.currentTurn];
      const raiseAmount = 50;
      const raised = playerAction(started, currentPlayer.id, 'raise', raiseAmount);

      expect(raised.currentBet).toBeGreaterThan(started.currentBet);
    });
  });
});
