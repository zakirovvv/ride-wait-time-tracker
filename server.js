
const WebSocket = require('ws');
const http = require('http');

const server = http.createServer();
const wss = new WebSocket.Server({ 
  server,
  verifyClient: () => true
});

// Хранилище данных в памяти сервера (основной источник правды)
let serverQueueData = [];
let serverSettingsData = [];

// Функция для рассылки данных всем подключенным клиентам
function broadcast(data) {
  console.log(`📡 Рассылаем данные ${data.type} для ${wss.clients.size} клиентов`);
  const message = JSON.stringify(data);
  
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(message);
        console.log(`✅ Данные отправлены клиенту`);
      } catch (error) {
        console.error('❌ Ошибка при отправке данных клиенту:', error);
      }
    }
  });
}

// Функция для отправки текущих данных конкретному клиенту
function sendCurrentData(ws) {
  try {
    ws.send(JSON.stringify({
      type: 'init',
      queueData: serverQueueData,
      settingsData: serverSettingsData
    }));
    console.log('📤 Отправлены текущие данные новому клиенту');
  } catch (error) {
    console.error('❌ Ошибка при отправке данных новому клиенту:', error);
  }
}

wss.on('connection', (ws, req) => {
  console.log(`✅ Новое устройство подключилось. Всего подключений: ${wss.clients.size}`);
  console.log(`📍 IP клиента: ${req.socket.remoteAddress}`);

  // Немедленно отправляем текущие данные новому клиенту
  sendCurrentData(ws);

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      console.log(`📨 Получено сообщение типа: ${data.type}`);
      
      if (data.type === 'queue-update') {
        serverQueueData = data.data || [];
        console.log(`🔄 Очередь обновлена на сервере. Элементов: ${serverQueueData.length}`);
        
        // Рассылаем обновления всем клиентам
        broadcast({ 
          type: 'queue-sync', 
          data: serverQueueData 
        });
      }
      
      if (data.type === 'settings-update') {
        serverSettingsData = data.data || [];
        console.log(`⚙️ Настройки обновлены на сервере. Элементов: ${serverSettingsData.length}`);
        
        // Рассылаем обновления всем клиентам
        broadcast({ 
          type: 'settings-sync', 
          data: serverSettingsData 
        });
      }

      if (data.type === 'request-sync') {
        // Клиент запрашивает принудительную синхронизацию
        sendCurrentData(ws);
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
  console.log('🌐' + '='.repeat(60));
  console.log(`🚀 СЕРВЕР СИНХРОНИЗАЦИИ ЗАПУЩЕН НА ПОРТУ ${PORT}`);
  console.log(`📱 Для подключения других устройств:`);
  console.log(`   1. Узнайте IP-адрес этого компьютера`);
  console.log(`   2. На других устройствах откройте: http://[IP-адрес]:5173`);
  console.log(`💡 Получить IP: ipconfig (Windows) или ifconfig (Mac/Linux)`);
  console.log('🌐' + '='.repeat(60));
});

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
