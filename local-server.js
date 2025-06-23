
const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer();
const wss = new WebSocket.Server({ 
  server,
  verifyClient: () => true
});

// Путь к файлам данных
const DATA_DIR = path.join(__dirname, 'local-data');
const QUEUE_FILE = path.join(DATA_DIR, 'queue.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

// Создаем папку для данных если её нет
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Загружаем данные из файлов или создаем пустые
let serverQueueData = [];
let serverSettingsData = [];

try {
  if (fs.existsSync(QUEUE_FILE)) {
    serverQueueData = JSON.parse(fs.readFileSync(QUEUE_FILE, 'utf8'));
  }
  if (fs.existsSync(SETTINGS_FILE)) {
    serverSettingsData = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
  }
} catch (error) {
  console.error('❌ Ошибка загрузки данных:', error);
}

// Функция сохранения данных в файлы
function saveDataToFiles() {
  try {
    fs.writeFileSync(QUEUE_FILE, JSON.stringify(serverQueueData, null, 2));
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(serverSettingsData, null, 2));
    console.log('💾 Данные сохранены в файлы');
  } catch (error) {
    console.error('❌ Ошибка сохранения данных:', error);
  }
}

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
function sen
