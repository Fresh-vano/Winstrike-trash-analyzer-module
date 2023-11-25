from flask import Flask, request, jsonify, send_from_directory
from flask_migrate import Migrate
from models import db, InfoModel
from datetime import datetime, timedelta
from werkzeug.utils import secure_filename
from flask_cors import CORS
from sqlalchemy import func
import os
import detect
from concurrent.futures import ThreadPoolExecutor
from config import SQLALCHEMY_DATABASE_URI, UPLOAD_FOLDER, ALLOWED_EXTENSIONS

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = SQLALCHEMY_DATABASE_URI
db.init_app(app)
migrate = Migrate(app, db)
CORS(app)

# Конфигурация для загрузки файлов
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

executor = ThreadPoolExecutor(max_workers=5)  # Укажите количество желаемых потоков для обработки видео

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

days_translation = {
    'Mon': 'Пн',
    'Tue': 'Вт',
    'Wed': 'Ср',
    'Thu': 'Чт',
    'Fri': 'Пт',
    'Sat': 'Сб',
    'Sun': 'Вс'
}

# Роут для получения списка всех элементов в порядке убывания по дате
@app.route('/history', methods=['GET'])
def get_history():
    records = InfoModel.query.order_by(InfoModel.dateTime.desc()).all()
    history = []
    for record in records:
        history.append({
            'id': record.id,
            'address': record.address,
            'type': record.type,
            'status': record.status,
            'dateTime': record.dateTime.strftime('%Y-%m-%d %H:%M:%S'),
            'result_photo_path': record.result_photo_path,
            'video_time': record.video_time,
        })
    return jsonify(history)

# Метод добавления новой записи в бд
def add_record(address, type, status, result_photo_path, video_time):
    new_record = InfoModel(
        address= address,
        type= type,
        status= status,
        result_photo_path= result_photo_path,
        video_time=video_time
    )
    with app.app_context():
        db.session.add(new_record)
        db.session.commit()

# Роут для получения нового уведомления с сервера
@app.route('/notification', methods=['GET'])
def get_notification():
    notifications = InfoModel.query.filter_by(status=False).order_by(InfoModel.dateTime.desc()).limit(5).all()
    notifications_list = []
    for notification in notifications:
        notifications_list.append({
            'id': notification.id,
            'address': notification.address,
            'type': notification.type,
            'status': notification.type,
            'dateTime': notification.dateTime.strftime('%Y-%m-%d %H:%M:%S'),
            'result_photo_path': notification.result_photo_path
        })

    return jsonify(notifications_list)

# Роут для загрузки и анализа видеозаписи
@app.route('/video', methods=['POST'])
def upload_video():
    if 'files' not in request.files:
        return jsonify({'error': 'No file part'})

    file = request.files['files']

    if file.filename == '':
        return jsonify({'error': 'No selected file'})

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = f"{app.config['UPLOAD_FOLDER']}/{filename}"
        file.save(file_path)

        # Запускаем асинхронный процесс анализа
        executor.submit(analyze_video, file_path)

        return jsonify({'success': True})

    return jsonify({'error': 'Invalid file format'})

# Метод анализа загруженного видео
def analyze_video(file_path):
    names = {
        'bricks':'Кирпич', 
        'concrete':'Бетон', 
        'ground':'Грунт', 
        'wood':'Дерево', 
        'no detect':'Не обнаружен грузовик', 
        'cargo error':'Плохая видимость камеры или груз не обраружен'
    }

    result = detect.predict_and_send(file_path, "winstrike_nn.pt")

    status = True
    if result[0] == -1 or result[0] == -2:
        status = False

    os.remove(file_path)
    print(f'Video {file_path} was analyzed and removed')
    add_record("Адрес объекта...", names[result[1]], status, file_path.replace('.mp4', '.png').replace('static', ''), result[2])

# Роут для отображения количества обработанных записей за последний день
@app.route('/all', methods=['GET'])
def get_all_records_count():
    count = InfoModel.query.filter(InfoModel.dateTime >= datetime.now() - timedelta(days=1)).count()
    return jsonify({'count': count})

# Роут для отображения количества доступных камер
@app.route('/cameras', methods=['GET'])
def get_cameras_count():
    count = InfoModel.query.group_by(InfoModel.id).count()
    return jsonify({'count': count})

# Роут для отображения количества распознанных автомобилей за последний день
@app.route('/detected', methods=['GET'])
def get_detected_count():
    count = InfoModel.query.filter(InfoModel.status == True, InfoModel.dateTime >= datetime.now() - timedelta(days=1)).count()
    return jsonify({'count': count})

# Роут для отображения количества предупреждений за последний день
@app.route('/detected_fail', methods=['GET'])
def get_detected_fail_count():
    count = InfoModel.query.filter(InfoModel.status == False, InfoModel.dateTime >= datetime.now() - timedelta(days=1)).count()
    return jsonify({'count': count})

# Роут для получения фото по его пути
@app.route('/get-photo/<path:filename>')
def get_photo(filename):
    return send_from_directory('static', filename)

# Роут для вывода количества уникальных камер за неделю
@app.route('/chart/cameras', methods=['GET'])
def get_cameras_chart_data():
    
    cameras_data = (
        db.session.query(func.count(InfoModel.id).label('count'), func.date_trunc('day', InfoModel.dateTime).label('day'))
        .filter(InfoModel.dateTime >= datetime.now() - timedelta(days=7))
        .group_by('day')
        .all()
    )

    cameras_dict = {days_translation[day[1].strftime("%a")]: day[0] for day in cameras_data}

    labels = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
    data = [cameras_dict.get(day, 0) for day in labels]

    return jsonify({
        'labels': labels,
        'datasets': {'label': 'Количество уникальных камер', 'data': data}
    })

# Роут для вывода количества верно распознанных автомобилей за неделю
@app.route('/chart/detected', methods=['GET'])
def get_detected_chart_data():

    detected_data = (
        db.session.query(func.count(InfoModel.id).label('count'), func.date_trunc('day', InfoModel.dateTime).label('day'))
        .filter(InfoModel.dateTime >= datetime.now() - timedelta(days=7), InfoModel.status == True)
        .group_by('day')
        .all()
    )

    detected_dict = {days_translation[day[1].strftime("%a")]: day[0] for day in detected_data}

    labels = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
    data = [detected_dict.get(day, 0) for day in labels]

    return jsonify({
        'labels': labels,
        'datasets': {'label': 'Количество верно распознанных автомобилей', 'data': data}
    })

# Роут для вывода количества неверно распознанных автомобилей за неделю
@app.route('/chart/detected_fail', methods=['GET'])
def get_detected_fail_chart_data():

    detected_fail_data = (
        db.session.query(func.count(InfoModel.id).label('count'), func.date_trunc('day', InfoModel.dateTime).label('day'))
        .filter(InfoModel.dateTime >= datetime.now() - timedelta(days=7), InfoModel.status == False)
        .group_by('day')
        .all()
    )

    detected_fail_dict = {days_translation[day[1].strftime("%a")]: day[0] for day in detected_fail_data}

    labels = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
    data = [detected_fail_dict.get(day, 0) for day in labels]

    return jsonify({
        'labels': labels,
        'datasets': {'label': 'Количество неверно распознанных автомобилей', 'data': data}
    })

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(host='127.0.0.1', port=5000)
