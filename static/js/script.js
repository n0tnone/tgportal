const CACHE_KEY = 'telegram_channel_data';
const CACHE_TIMESTAMP_KEY = 'telegram_channel_timestamp';
const CACHE_DURATION = 5 * 60 * 1000;

async function loadChannelData(forceRefresh = false) {
    try {
        const cachedData = getCachedData();
        
        if (cachedData && !forceRefresh) {
            displayChannelData(cachedData);
            console.log('📦 Данные загружены из кэша');
            return;
        }
        
        if (forceRefresh) {
            showUpdateIndicator();
        }
        
        const response = await fetch('/get_channel_data');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        setCachedData(data);
        
        displayChannelData(data);
        
        if (forceRefresh) {
            hideUpdateIndicator();
        }
        
        console.log('🔄 Данные обновлены с сервера');
        
    } catch (error) {
        console.error('Ошибка загрузки данных канала:', error);
        
        const cachedData = getCachedData();
        if (cachedData) {
            displayChannelData(cachedData);
            showErrorNotification('Используются кэшированные данные');
        } else {
            displayFallbackData();
            showErrorNotification('Не удалось загрузить данные канала');
        }
        
        if (forceRefresh) {
            hideUpdateIndicator();
        }
    }
}

function getCachedData() {
    try {
        const timestamp = parseInt(sessionStorage.getItem(CACHE_TIMESTAMP_KEY) || '0');
        const now = Date.now();
        
        if (now - timestamp > CACHE_DURATION) {
            return null;
        }
        
        const cachedDataStr = sessionStorage.getItem(CACHE_KEY);
        return cachedDataStr ? JSON.parse(cachedDataStr) : null;
    } catch (error) {
        console.error('Ошибка чтения кэша:', error);
        return null;
    }
}

function setCachedData(data) {
    try {
        sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
        sessionStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
    } catch (error) {
        console.error('Ошибка записи в кэш:', error);
    }
}

function displayChannelData(data) {
    document.getElementById('channelName').textContent = data.title || 'Неизвестный канал';
    document.getElementById('channelDescription').innerHTML = data.description || 'Описание не найдено';
    document.getElementById('subscriberCount').textContent = formatNumber(data.subscribers);
    
    if (data.avatar_url && data.avatar_url !== '/static/placeholder.png') {
        const avatarElement = document.getElementById('channelAvatar');
        avatarElement.style.backgroundImage = `url(${data.avatar_url})`;
        avatarElement.style.backgroundSize = 'cover';
        avatarElement.style.backgroundPosition = 'center';
        avatarElement.innerHTML = '';
    } else {
        document.getElementById('channelAvatar').innerHTML = '📱';
    }
}

function displayFallbackData() {
    document.getElementById('channelName').textContent = 'f11';
    document.getElementById('channelDescription').textContent = 'Крутой канал с интересным контентом. Подписывайтесь!';
    document.getElementById('subscriberCount').textContent = '1.2K';
    document.getElementById('postCount').textContent = '150';
}

function showUpdateIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'updateIndicator';
    indicator.style.cssText = `
        position: fixed;
        top: 10px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 136, 204, 0.9);
        color: white;
        padding: 8px 16px;
        border-radius: 20px;
        font-size: 12px;
        z-index: 1000;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        animation: slideDown 0.3s ease-out;
        display: flex;
        align-items: center;
        gap: 8px;
    `;
    indicator.innerHTML = `
        <div style="width: 12px; height: 12px; border: 2px solid rgba(255,255,255,0.3); border-top: 2px solid white; border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
        Обновление данных...
    `;
    
    document.body.appendChild(indicator);
}

function hideUpdateIndicator() {
    const indicator = document.getElementById('updateIndicator');
    if (indicator) {
        indicator.style.animation = 'slideUp 0.3s ease-in';
        setTimeout(() => indicator.remove(), 300);
    }
}

function showLoadingState() {
    document.getElementById('channelName').textContent = 'Загрузка...';
    document.getElementById('channelDescription').textContent = 'Получаем данные канала...';
    document.getElementById('subscriberCount').textContent = '...';
}

function hideLoadingState() {
    const card = document.querySelector('.card');
    card.style.opacity = '0.8';
    setTimeout(() => {
        card.style.opacity = '1';
    }, 100);
}

function showErrorNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(255, 59, 48, 0.9);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        font-size: 14px;
        z-index: 1000;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

document.addEventListener('mousemove', function(e) {
    if (Math.random() > 0.95) {
        createParticle(e.clientX, e.clientY);
    }
});

function createParticle(x, y) {
    const particle = document.createElement('div');
    particle.style.position = 'fixed';
    particle.style.left = x + 'px';
    particle.style.top = y + 'px';
    particle.style.width = '9px';
    particle.style.height = '9px';
    particle.style.background = 'rgba(100, 200, 255, 0.8)';
    particle.style.borderRadius = '50%';
    particle.style.pointerEvents = 'none';
    particle.style.zIndex = '5';
    particle.style.animation = 'particleFade 1s ease-out forwards';
    
    document.body.appendChild(particle);
    
    setTimeout(() => {
        particle.remove();
    }, 1000);
}

let updateInterval;

function startAutoUpdate() {
    if (updateInterval) {
        clearInterval(updateInterval);
    }
    
    updateInterval = setInterval(() => {
        console.log('🔄 Автоматическое обновление данных...');
        loadChannelData(true);
    }, CACHE_DURATION);
}

function addFreshnessIndicator() {
    const card = document.querySelector('.card');
    const indicator = document.createElement('div');
    indicator.className = 'freshness-indicator';
    indicator.title = 'Данные актуальны';
    card.appendChild(indicator);
}

document.addEventListener('DOMContentLoaded', () => {
    loadChannelData();
    startAutoUpdate();
    addFreshnessIndicator();
});