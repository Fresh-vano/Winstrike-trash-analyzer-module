from flask_sqlalchemy import SQLAlchemy
from datetime import datetime,timedelta

db = SQLAlchemy()
 
class InfoModel(db.Model):
    __tablename__ = 'Trash'
 
    id = db.Column(db.Integer, primary_key=True)
    address = db.Column(db.String(255))
    type = db.Column(db.String(50))
    status = db.Column(db.Boolean)
    dateTime = db.Column(db.DateTime, default=datetime.utcnow() + timedelta(hours=3))
    result_photo_path = db.Column(db.String(255))
    video_time = db.Column(db.String(255))
 
    def __init__(self, address, type, status, result_photo_path, video_time):
        self.address = address
        self.type = type
        self.status = status
        self.result_photo_path = result_photo_path
        self.video_time = video_time