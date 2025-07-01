from flask import Flask, jsonify, render_template
import requests
import os
import re

BOT_TOKEN = os.environ.get('BOT_TOKEN')
CHANNEL_ID = int(os.environ.get('CHANNEL_ID', -1002221957917))

app = Flask(__name__)

@app.route('/get_channel_data')
def api_channel_data():
    try:
        chat_identifier = CHANNEL_ID
        get_chat_url = f'https://api.telegram.org/bot{BOT_TOKEN}/getChat'
        response_chat = requests.post(get_chat_url, json={'chat_id': chat_identifier}).json()

        if not response_chat.get('ok'):
            raise Exception(f"Ошибка getChat: {response_chat.get('description')}")

        chat_data = response_chat['result']

        get_count_url = f'https://api.telegram.org/bot{BOT_TOKEN}/getChatMemberCount'
        response_count = requests.post(get_count_url, json={'chat_id': chat_identifier}).json()

        if not response_count.get('ok'):
            raise Exception(f"Ошибка getChatMemberCount: {response_count.get('description')}")

        subscribers = response_count['result']

        avatar_url = '/static/img/placeholder.png'
        if 'photo' in chat_data:
            file_id = chat_data['photo']['big_file_id']
            get_file_url = f'https://api.telegram.org/bot{BOT_TOKEN}/getFile'
            response_file = requests.post(get_file_url, json={'file_id': file_id}).json()

            if response_file.get('ok'):
                file_path = response_file['result']['file_path']
                avatar_url = f'https://api.telegram.org/file/bot{BOT_TOKEN}/{file_path}'

        raw_description = chat_data.get('description', '')
        processed_description = re.sub(
            r'@([a-zA-Z0-9_]+)',
            r'<a href="tg://resolve?domain=\1">@\1</a>',
            raw_description
        )

        data = {
            'title': chat_data.get('title', 'Название не найдено'),
            'description': processed_description,
            'subscribers': subscribers,
            'avatar_url': avatar_url
        }
        return jsonify(data)

    except Exception as e:
        print(f"Произошла ошибка: {e}")
        return jsonify({
            'title': 'Канал не найден',
            'description': 'Не удалось получить данные о канале. Проверьте ID канала и токен бота. Убедитесь, что бот является администратором канала.',
            'subscribers': 0,
            'avatar_url': '/static/img/placeholder.png'
        }), 404

@app.route('/')
def index():
    return render_template('index.html')


if __name__ == '__main__':
    print("Сервер запущен на http://127.0.0.1:5000")
    app.run(debug=True, port=5000)