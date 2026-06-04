// 立体四目並べの3Dボードコンポーネント

'use client';

import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Html } from '@react-three/drei';
import * as THREE from 'three';
import type { Connect4ClientState, Position3D } from '@/lib/games/connect4/types';
import { BOARD_SIZE } from '@/lib/games/connect4/constants';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { Connect4Board } from './Connect4Board';

interface Connect4Board3DProps {
  gameState: Connect4ClientState;
  onCellClick?: (position: Position3D) => void;
  availablePositions?: Position3D[];
}

// 個別のセル（立方体）
function Cell({
  position,
  piece,
  isAvailable,
  isWinning,
  isLastMove,
  onClick,
}: {
  position: Position3D;
  piece: { owner: 'player1' | 'player2' } | null;
  isAvailable: boolean;
  isWinning: boolean;
  isLastMove: boolean;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  // セルの3D座標（中心を原点に）
  const x = position.x - (BOARD_SIZE - 1) / 2;
  const y = position.y - (BOARD_SIZE - 1) / 2;
  const z = position.z - (BOARD_SIZE - 1) / 2;

  return (
    <group position={[x, z, y]}>
      {/* 枠（透明なワイヤーフレーム） */}
      <mesh>
        <boxGeometry args={[0.9, 0.9, 0.9]} />
        <meshBasicMaterial
          color={isAvailable ? '#3b82f6' : '#374151'}
          wireframe
          transparent
          opacity={isAvailable ? 0.6 : 0.2}
        />
      </mesh>

      {/* 駒 */}
      {piece && (
        <mesh>
          <sphereGeometry args={[0.35, 32, 32]} />
          <meshStandardMaterial
            color={piece.owner === 'player1' ? '#3b82f6' : '#ef4444'}
            emissive={isWinning ? '#fbbf24' : isLastMove ? (piece.owner === 'player1' ? '#60a5fa' : '#f87171') : '#000000'}
            emissiveIntensity={isWinning ? 0.5 : isLastMove ? 0.4 : 0}
          />
        </mesh>
      )}

      {/* 最後の手のリング */}
      {piece && isLastMove && !isWinning && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.45, 0.05, 16, 32]} />
          <meshStandardMaterial
            color={piece.owner === 'player1' ? '#60a5fa' : '#f87171'}
            emissive={piece.owner === 'player1' ? '#60a5fa' : '#f87171'}
            emissiveIntensity={0.8}
          />
        </mesh>
      )}

      {/* 配置可能なセルのインジケーター */}
      {!piece && isAvailable && (
        <mesh
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            setHovered(false);
            document.body.style.cursor = 'auto';
          }}
        >
          <sphereGeometry args={[0.25, 16, 16]} />
          <meshStandardMaterial
            color="#60a5fa"
            transparent
            opacity={hovered ? 0.8 : 0.4}
          />
        </mesh>
      )}
    </group>
  );
}

// 盤面全体
function Board3D({
  gameState,
  onCellClick,
  availablePositions,
}: Connect4Board3DProps) {
  const isAvailable = (pos: Position3D) => {
    return availablePositions?.some((p) => p.x === pos.x && p.y === pos.y && p.z === pos.z) || false;
  };

  const isWinningPiece = (pos: Position3D) => {
    if (!gameState.winningLine) return false;
    return gameState.winningLine.some((p) => p.x === pos.x && p.y === pos.y && p.z === pos.z);
  };

  // 最後に配置された駒かチェック
  const isLastMove = (pos: Position3D) => {
    if (!gameState.lastMove) return false;
    return (
      gameState.lastMove.x === pos.x &&
      gameState.lastMove.y === pos.y &&
      gameState.lastMove.z === pos.z
    );
  };

  const cells: React.ReactElement[] = [];
  const rods: React.ReactElement[] = [];

  // 縦の串（16本）を生成
  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      const rodX = x - (BOARD_SIZE - 1) / 2;
      const rodY = y - (BOARD_SIZE - 1) / 2;
      const rodHeight = BOARD_SIZE; // z方向の高さ

      rods.push(
        <mesh
          key={`rod-${x}-${y}`}
          position={[rodX, 0, rodY]}
        >
          <cylinderGeometry args={[0.04, 0.04, rodHeight, 16]} />
          <meshStandardMaterial
            color="#d4d4d4"
            metalness={0.9}
            roughness={0.1}
            emissive="#888888"
            emissiveIntensity={0.3}
          />
        </mesh>
      );
    }
  }

  // 全セルを生成
  for (let z = 0; z < BOARD_SIZE; z++) {
    for (let y = 0; y < BOARD_SIZE; y++) {
      for (let x = 0; x < BOARD_SIZE; x++) {
        const pos: Position3D = { x, y, z };
        const piece = gameState.board[z][y][x];
        const available = isAvailable(pos);
        const isWinning = isWinningPiece(pos);
        const isLast = isLastMove(pos);

        cells.push(
          <Cell
            key={`${x}-${y}-${z}`}
            position={pos}
            piece={piece}
            isAvailable={available}
            isWinning={isWinning}
            isLastMove={isLast}
            onClick={() => onCellClick?.(pos)}
          />
        );
      }
    }
  }

  // 勝利ラインの串を描画
  const renderWinningLine = () => {
    if (!gameState.winningLine || gameState.winningLine.length !== 4) return null;

    const points = gameState.winningLine.map((pos) => {
      const x = pos.x - (BOARD_SIZE - 1) / 2;
      const y = pos.y - (BOARD_SIZE - 1) / 2;
      const z = pos.z - (BOARD_SIZE - 1) / 2;
      return new THREE.Vector3(x, z, y);
    });

    // 両端を少し延長
    const dir = new THREE.Vector3().subVectors(points[3], points[0]).normalize();
    const start = points[0].clone().sub(dir.multiplyScalar(0.5));
    const end = points[3].clone().add(dir.multiplyScalar(0.5));

    const curve = new THREE.CatmullRomCurve3([start, ...points, end]);
    const tubeGeometry = new THREE.TubeGeometry(curve, 64, 0.08, 8, false);

    return (
      <mesh geometry={tubeGeometry}>
        <meshStandardMaterial
          color="#fbbf24"
          emissive="#fbbf24"
          emissiveIntensity={0.8}
          metalness={0.6}
          roughness={0.2}
        />
      </mesh>
    );
  };

  return (
    <>
      {/* 環境光 */}
      <ambientLight intensity={0.5} />
      {/* 指向性ライト */}
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <directionalLight position={[-10, -10, -5]} intensity={0.3} />

      {/* グリッド参考線 */}
      <gridHelper args={[8, 8, '#444444', '#222222']} position={[0, -2, 0]} />

      {/* 縦の串 */}
      {rods}

      {/* セル群 */}
      {cells}

      {/* 勝利ラインの串 */}
      {renderWinningLine()}
    </>
  );
}

export const Connect4Board3D: React.FC<Connect4Board3DProps> = (props) => {
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('3d');

  return (
    <ErrorBoundary
      fallback={(error) => (
        <div className="w-full">
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <div className="text-2xl">⚠️</div>
              <div className="flex-1">
                <p className="text-white font-medium mb-2">
                  3D表示に対応していないため、2D表示に切り替えます
                </p>
                <p className="text-slate-300 text-sm">
                  お使いのブラウザまたはデバイスがWebGLに対応していない可能性があります。
                </p>
                {process.env.NODE_ENV === 'development' && (
                  <div className="mt-2 bg-red-900/20 border border-red-500/30 rounded px-3 py-2">
                    <p className="text-red-300 text-xs font-mono break-all">
                      エラー: {error.message}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* 2Dボードにフォールバック */}
          <Connect4Board {...props} />
        </div>
      )}
    >
      <div className="space-y-3">
        <div className="rounded-lg border border-white/10 bg-neutral-950/80 p-2 text-white shadow-lg">
          <div className="grid grid-cols-2 gap-2" role="tablist" aria-label="盤面表示の切り替え">
            <button
              type="button"
              onClick={() => setViewMode('2d')}
              role="tab"
              aria-selected={viewMode === '2d'}
              className={`min-h-[44px] rounded-md px-4 text-sm font-semibold transition-colors ${
                viewMode === '2d' ? 'bg-teal-500 text-white' : 'bg-white/10 text-gray-100 hover:bg-white/15'
              }`}
            >
              2D盤面
            </button>
            <button
              type="button"
              onClick={() => setViewMode('3d')}
              role="tab"
              aria-selected={viewMode === '3d'}
              className={`min-h-[44px] rounded-md px-4 text-sm font-semibold transition-colors ${
                viewMode === '3d' ? 'bg-teal-500 text-white' : 'bg-white/10 text-gray-100 hover:bg-white/15'
              }`}
            >
              3D表示
            </button>
          </div>
        </div>

        {viewMode === '2d' ? (
          <div className="rounded-lg border border-white/10 bg-neutral-950/60 p-2 sm:p-4">
            <Connect4Board {...props} />
          </div>
        ) : (
          <div className="relative h-[min(72vh,520px)] min-h-[420px] w-full overflow-hidden rounded-lg border border-white/10 bg-slate-950 shadow-2xl sm:h-[600px]">
            <Canvas>
              <PerspectiveCamera makeDefault position={[6, 6, 6]} fov={50} />

              {/* カメラコントロール（縦軸中心の回転制限付き） */}
              <OrbitControls
                enablePan={false}
                enableZoom={true}
                minDistance={5}
                maxDistance={15}
                minPolarAngle={0.1} // 真上に近い角度（約6度）
                maxPolarAngle={Math.PI / 2 - 0.1} // 水平に近い角度（約84度）
                maxAzimuthAngle={Infinity} // 左右回転は無制限
                minAzimuthAngle={-Infinity}
                enableDamping
                dampingFactor={0.05}
                target={[0, 0, 0]} // 中心を固定
              />

              <Suspense fallback={
                <Html center>
                  <div className="rounded-lg bg-white/90 px-6 py-4 shadow-lg backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-teal-600"></div>
                      <p className="font-medium text-slate-700">3Dボードを読み込み中...</p>
                    </div>
                  </div>
                </Html>
              }>
                <Board3D {...props} />
              </Suspense>
            </Canvas>

            {/* 操作説明オーバーレイ */}
            <div className="pointer-events-none absolute bottom-3 left-1/2 w-[calc(100%-24px)] max-w-lg -translate-x-1/2 rounded-lg bg-black/65 px-3 py-2 text-center text-xs text-white backdrop-blur-sm sm:text-sm">
              ドラッグで回転 / ホイールでズーム / 青い玉をクリック
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};
