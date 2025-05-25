
const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer();
const wss = new WebSocket.Server({ server });

// Хранилище данных в памяти сервера
let queueData = [];
let settingsData = [];

// Функция для рассылки данных всем подключенным клиентам
function broadcast(data) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

wss.on('connection', (ws) => {
  console.log('Новое устройство подключилось');

  // Отправляем текущие данные новому клиенту
  ws.send(JSON.stringify({
    type: 'init',
    queue: queueData,
    settings: settingsData
  }));

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      
      if (data.type === 'queue-update') {
        queueData = data.data;
        broadcast({ type: 'queue-sync', data: queueData });
        console.log('Очередь обновлена и разослана всем устройствам');
      }
      
      if (data.type === 'settings-update') {
        settingsData = data.data;
        broadcast({ type: 'settings-sync', data: settingsData });
        console.log('Настройки обновлены и разосланы всем устройствам');
      }
    } catch (error) {
      console.error('Ошибка при обработке сообщения:', error);
    }
  });

  ws.on('close', () => {
    console.log('Устройство отключилось');
  });
});

const PORT = 3001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🌐 Сервер синхронизации запущен на порту ${PORT}`);
  console.log(`📱 Подключайтесь с других устройств по адресу: http://[IP-адрес]:${PORT}`);
});
