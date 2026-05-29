// 立体四目並べの3Dボードコンポーネント

'use client';

import React, { useRef, useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import type { Connect4ClientState, Position3D } from '@/lib/games/connect4/types';
import { BOARD_SIZE, PLAYER_COLORS } from '@/lib/games/connect4/constants';

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
  onClick,
}: {
  position: Position3D;
  piece: { owner: 'player1' | 'player2' } | null;
  isAvailable: boolean;
  isWinning: boolean;
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
            emissive={isWinning ? '#fbbf24' : '#000000'}
            emissiveIntensity={isWinning ? 0.5 : 0}
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

  const cells: React.ReactElement[] = [];

  // 全セルを生成
  for (let z = 0; z < BOARD_SIZE; z++) {
    for (let y = 0; y < BOARD_SIZE; y++) {
      for (let x = 0; x < BOARD_SIZE; x++) {
        const pos: Position3D = { x, y, z };
        const piece = gameState.board[z][y][x];
        const available = isAvailable(pos);
        const isWinning = isWinningPiece(pos);

        cells.push(
          <Cell
            key={`${x}-${y}-${z}`}
            position={pos}
            piece={piece}
            isAvailable={available}
            isWinning={isWinning}
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

      {/* セル群 */}
      {cells}

      {/* 勝利ラインの串 */}
      {renderWinningLine()}
    </>
  );
}

export const Connect4Board3D: React.FC<Connect4Board3DProps> = (props) => {
  return (
    <div className="relative w-full h-[500px] sm:h-[600px] bg-slate-900 rounded-lg shadow-2xl overflow-hidden">
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

        <Suspense fallback={null}>
          <Board3D {...props} />
        </Suspense>
      </Canvas>

      {/* 操作説明オーバーレイ */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-lg text-xs sm:text-sm backdrop-blur-sm pointer-events-none">
        🖱️ ドラッグで回転 | 🔍 ホイールでズーム | 💡 青い玉をクリックして配置
      </div>
    </div>
  );
};
