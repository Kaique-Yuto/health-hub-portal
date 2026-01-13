from flask import Flask, send_from_directory, abort, render_template
import os

basedir = os.path.abspath(os.path.dirname(__file__))
static_dir = os.path.join(basedir, 'dist')
app = Flask(__name__, static_folder=static_dir, static_url_path='')

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_static(path):
    # Tenta encontrar o arquivo na pasta dist
    file_path = os.path.join(app.static_folder, path)
    if os.path.exists(file_path) and os.path.isfile(file_path):
        return send_from_directory(app.static_folder, path)
    
    # Se for uma tentativa de acessar um arquivo (com extensão) que não existe, dá 404
    # Isso evita que o navegador tente executar o index.html como se fosse um .js
    if "." in path:
        abort(404)
        
    # Para qualquer outra rota (SPA), serve o index.html
    return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 8000))
    app.run(host='0.0.0.0', port=port)