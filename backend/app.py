from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from model import SemanticModel
import logging
from werkzeug.serving import run_simple

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": ["http://localhost:3000", "http://localhost:3001", "http://frontend:3001"]}})

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

semantic_model = SemanticModel()

ALLOWED_EXTENSIONS = {'pdf'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/analyze', methods=['POST'])
def analyze_documents():
    try:
        if 'files' not in request.files:
            logger.error("No file part in the request")
            return jsonify({'error': 'No file part'}), 400

        files = request.files.getlist('files')
        topics = request.form.get('topics', None).split(',')
        min_score = float(request.form.get('min_score', 0))
        generate_topics = request.form.get('generate_topics', False)

        logger.info(f"Received request with {len(files)} files, topics: {topics}, min_score: {min_score}")

        if not files or not topics:
            logger.error("Files or topics are missing")
            return jsonify({'error': 'Files and topics are required'}), 400

        results = semantic_model.semantic_modeling(files, topics, min_score, generate_topics, logger=logger)
        return jsonify(results), 200

    except Exception as e:
        logger.exception(f"An error occurred during analysis: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    if os.environ.get('FLASK_ENV') == 'production':
        from werkzeug.middleware.proxy_fix import ProxyFix
        app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1, x_prefix=1)
        run_simple('0.0.0.0', port, app, use_reloader=False, threaded=True)
    else:
        app.run(host='0.0.0.0', port=port, debug=True)