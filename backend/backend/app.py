import os
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
from utils import extract_text_from_pdf, extract_text_from_pptx, simple_generate_quiz


UPLOAD_DIR = 'uploads'
ALLOWED_EXT = {'pdf', 'pptx'}


app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_DIR
os.makedirs(UPLOAD_DIR, exist_ok=True)




def allowed_file(filename):
return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXT




@app.route('/health')
def health():
return jsonify({'status': 'ok'})




@app.route('/generate-quiz', methods=['POST'])
def generate_quiz():
if 'file' not in request.files:
return jsonify({'error': 'no file part'}), 400
f = request.files['file']
if f.filename == '':
return jsonify({'error': 'no selected file'}), 400
if not allowed_file(f.filename):
return jsonify({'error': 'unsupported file type'}), 400


filename = secure_filename(f.filename)
path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
f.save(path)


ext = filename.rsplit('.', 1)[1].lower()
try:
if ext == 'pdf':
text = extract_text_from_pdf(path)
elif ext == 'pptx':
text = extract_text_from_pptx(path)
else:
return jsonify({'error': 'unsupported file extension'}), 400
except Exception as e:
return jsonify({'error': 'failed to extract text', 'detail': str(e)}), 500


questions = simple_generate_quiz(text, max_questions=10)
return jsonify({'title': filename, 'questions': questions, 'source_text_length': len(text)})




if __name__ == '__main__':
app.run(debug=True)
