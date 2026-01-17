// Script para gerar ícones em múltiplos tamanhos
const fs = require('fs');
const path = require('path');

console.log('Copiando logo para ícones PWA...');

// Usar a logo.png ao invés do icon.png em branco
const iconPath = path.join(__dirname, 'image', 'logo.png');
const webDir = path.join(__dirname, 'web');

// Garantir que a pasta web existe
if (!fs.existsSync(webDir)) {
  fs.mkdirSync(webDir, { recursive: true });
}

// Copiar logo para diferentes nomes de ícone
const sizes = [
  { file: 'icon.png', size: 1024 },
  { file: 'icon-192.png', size: 192 },
  { file: 'icon-512.png', size: 512 },
  { file: 'apple-touch-icon.png', size: 180 }
];

sizes.forEach(({ file }) => {
  const destPath = path.join(webDir, file);
  fs.copyFileSync(iconPath, destPath);
  console.log(`✓ Criado: ${file} (usando logo.png)`);
});

console.log('✓ Ícones criados com sucesso usando a logo!');
console.log('\nDica: Se o ícone não aparecer no celular:');
console.log('1. Limpe o cache do navegador');
console.log('2. Remova o app e instale novamente');
