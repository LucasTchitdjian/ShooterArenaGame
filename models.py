from datetime import datetime
from app import db

class Score(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    points = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'points': self.points,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S')
        }
