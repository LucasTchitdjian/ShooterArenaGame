from flask import Flask, render_template, request, jsonify

# create the app
app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/scores', methods=['GET'])
def get_scores():
    return jsonify([score.to_dict() for score in scores])

@app.route('/scores', methods=['POST'])
def save_score():
    data = request.get_json()
    return jsonify(score.to_dict()), 201

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)