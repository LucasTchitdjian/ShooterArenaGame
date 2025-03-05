from flask import render_template, request, jsonify
from app import app, db
from models import Score

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/scores', methods=['GET'])
def get_scores():
    scores = Score.query.order_by(Score.points.desc()).limit(10).all()
    return jsonify([score.to_dict() for score in scores])

@app.route('/scores', methods=['POST'])
def save_score():
    data = request.get_json()
    score = Score(points=data['score'])
    db.session.add(score)
    db.session.commit()
    return jsonify(score.to_dict()), 201

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)