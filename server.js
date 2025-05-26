
const WebSocket = require('ws');
const http = require('http');
const https = require('https');
const fs = require('fs');

const server = http.createServer();
const wss = new WebSocket.Server({ 
  server,
  // Разрешаем подключения с любых источников для разработки
  verifyClient: () => true
});

// Хранилище данных в памяти сервера
let queueData = [];
let settingsData = [];

// Функция для рассылки данных всем подключенным клиентам
function broadcast(data) {
  console.log(`📡 Рассылаем данные ${data.type} ${wss.clients.size} клиентам`);
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(JSON.stringify(data));
      } catch (error) {
        console.error('Ошибка при отправке данных клиенту:', error);
      }
    }
  });
}

wss.on('connection', (ws, req) => {
  console.log(`✅ Новое устройство подключилось. Всего подключений: ${wss.clients.size}`);
  console.log(`📍 IP клиента: ${req.socket.remoteAddress}`);

  // Отправляем текущие данные новому клиенту
  ws.send(JSON.stringify({
    type: 'init',
    queue: queueData,
    settings: settingsData
  }));

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      console.log(`📨 Получено сообщение типа: ${data.type}`);
      
      if (data.type === 'queue-update') {
        queueData = data.data;
        broadcast({ type: 'queue-sync', data: queueData });
        console.log(`🔄 Очередь обновлена и разослана всем устройствам (${wss.clients.size} клиентов)`);
      }
      
      if (data.type === 'settings-update') {
        settingsData = data.data;
        broadcast({ type: 'settings-sync', data: settingsData });
        console.log(`⚙️ Настройки обновлены и разосланы всем устройствам (${wss.clients.size} клиентов)`);
      }
    } catch (error) {
      console.error('❌ Ошибка при обработке сообщения:', error);
    }
  });

  ws.on('close', () => {
    console.log(`❌ Устройство отключилось. Осталось подключений: ${wss.clients.size - 1}`);
  });

  ws.on('error', (error) => {
    console.error('❌ Ошибка WebSocket соединения:', error);
  });
});

const PORT = 3001;

server.listen(PORT, '0.0.0.0', () => {
  console.log('🌐='.repeat(50));
  console.log(`🚀 Сервер синхронизации запущен на порту ${PORT}`);
  console.log(`📱 Подключайтесь с других устройств по адресу:`);
  console.log(`   http://[IP-адрес]:${PORT}`);
  console.log(`💡 Для получения IP-адреса выполните: ipconfig (Windows) или ifconfig (Mac/Linux)`);
  console.log('🌐='.repeat(50));
});

// Обработка ошибок сервера
server.on('error', (error) => {
  console.error('❌ Ошибка сервера:', error);
});

process.on('SIGINT', () => {
  console.log('\n🛑 Остановка сервера...');
  server.close(() => {
    console.log('✅ Сервер остановлен');
    process.exit(0);
  });
});
