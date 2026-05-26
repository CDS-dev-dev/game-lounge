const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const svgContent = `<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
    </linearGradient>
  </defs>

  <rect width="512" height="512" rx="120" fill="url(#bg)"/>

  <g transform="translate(256, 256)">
    <path d="M -60,-100 L -40,-60 L -20,-100 L 0,-60 L 20,-100 L 40,-60 L 60,-100 L 60,-40 L -60,-40 Z"
          fill="white" opacity="0.95"/>
    <ellipse cx="0" cy="-10" rx="50" ry="35" fill="white" opacity="0.95"/>
    <rect x="-25" y="15" width="50" height="30" fill="white" opacity="0.95"/>
    <path d="M -35,45 L -45,100 L 45,100 L 35,45 Z" fill="white" opacity="0.95"/>
    <rect x="-60" y="100" width="120" height="20" rx="5" fill="white" opacity="0.95"/>
  </g>

  <text x="256" y="450" font-family="sans-serif" font-size="48" font-weight="bold"
        text-anchor="middle" fill="white" opacity="0.9">GL</text>
</svg>`;

const publicDir = path.join(__dirname, '../public');

// publicディレクトリが存在しない場合は作成
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// SVG文字列をBufferに変換
const svgBuffer = Buffer.from(svgContent);

async function generateIcons() {
  try {
    // icon-192.png
    await sharp(svgBuffer)
      .resize(192, 192)
      .png()
      .toFile(path.join(publicDir, 'icon-192.png'));
    console.log('✅ icon-192.png generated');

    // icon-512.png
    await sharp(svgBuffer)
      .resize(512, 512)
      .png()
      .toFile(path.join(publicDir, 'icon-512.png'));
    console.log('✅ icon-512.png generated');

    // apple-touch-icon.png
    await sharp(svgBuffer)
      .resize(180, 180)
      .png()
      .toFile(path.join(publicDir, 'apple-touch-icon.png'));
    console.log('✅ apple-touch-icon.png generated');

    // favicon.ico用の小さい画像
    await sharp(svgBuffer)
      .resize(32, 32)
      .png()
      .toFile(path.join(publicDir, 'favicon-32x32.png'));
    console.log('✅ favicon-32x32.png generated');

    console.log('\n🎉 All icons generated successfully!');
  } catch (error) {
    console.error('❌ Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons();
