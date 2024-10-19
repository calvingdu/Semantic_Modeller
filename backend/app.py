from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
import tempfile
import shutil
from model import SemanticModel
import base64

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes
semantic_model = SemanticModel()

ALLOWED_EXTENSIONS = {'pdf'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/analyze', methods=['POST'])
def analyze_documents():
    if 'files' not in request.json:
        return jsonify({'error': 'No files'}), 400

    files_data = request.json['files']
    topics = request.json.get('topics', [])
    min_score = float(request.json.get('min_score', 0))

    if not files_data or not topics:
        return jsonify({'error': 'Files and topics are required'}), 400

    # Create temp directory to save files
    with tempfile.TemporaryDirectory() as tmpdirname:
        saved_files = []
        try:
            for file_data in files_data:
                filename = secure_filename(file_data['name'])
                file_content = base64.b64decode(file_data['content'].split(',')[1])
                filepath = os.path.join(tmpdirname, filename)
                with open(filepath, 'wb') as f:
                    f.write(file_content)
                saved_files.append(filepath)

            # Processing
            results = []
            for filepath in saved_files:
                file_results = semantic_model.analyze(filepath, os.path.basename(filepath), topics, min_score)
                results.extend(file_results)

            results.sort(key=lambda x: x['score'], reverse=True)
            return jsonify(results), 200

        except Exception as e:
            return jsonify({'error': str(e)}), 500

        finally:
            shutil.rmtree(tmpdirname, ignore_errors=True)

if __name__ == '__main__':
    app.run(debug=True)