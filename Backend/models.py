from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class FlashcardSet(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    cards = db.relationship('Card', backref='flashcard_set', cascade="all, delete-orphan", lazy=True)

class Card(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    front = db.Column(db.String(200), nullable=False)
    back = db.Column(db.String(200), nullable=False)
    flashcard_set_id = db.Column(db.Integer, db.ForeignKey('flashcard_set.id'), nullable=False)
