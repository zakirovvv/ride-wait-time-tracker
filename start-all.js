
const { spawn } = require('child_process');
const os = require('os');

// Функция для получения IP адреса
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const interfaceName in interfaces) {
    const interfaceInfo = interfaces[interfaceName];
    if (interfaceInfo) {
      for (const info of interfaceInfo) {
        if (info.family === 'IPv4' && !info.internal) {
          return info.address;
        }
      }
    }
  }
  return 'localhost';
}

console.log('🚀 Запуск системы управления парком аттракционов...\n');

// Запускаем сервер синхронизации
console.log('🔧 Запуск сервера синхронизации...');
const server = spawn('node', ['server.js'], { stdio: 'inherit' });

// Ждем немного и запускаем веб-приложение
setTimeout(() => {
  console.log('🌐 Запуск веб-приложения...');
  const client = spawn('npm', ['run', 'dev'], { stdio: 'inherit', shell: true });
  
  const localIP = getLocalIP();

  setTimeout(() => {
    console.log('\n' + '='.repeat(70));
    console.log('🎯 СИСТЕМА ГОТОВА К РАБОТЕ!');
    console.log('='.repeat(70));
    console.log(`🖥️  Главное устройство: http://localhost:5173`);
    console.log(`📱 Другие устройства: http://${localIP}:5173`);
    console.log(`🔗 Сервер синхронизации: ws://localhost:3001`);
    console.log('='.repeat(70));
    console.log('💡 Для остановки нажмите Ctrl+C');
    console.log('📝 Убедитесь, что все устройства в одной сети Wi-Fi');
    console.log('');
  }, 3000);
}, 2000);

// Обработка завершения
process.on('SIGINT', () => {
  console.log('\n🛑 Остановка системы...');
  server.kill();
  process.exit();
});
