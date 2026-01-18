from flask import Flask, send_from_directory, abort, render_template, request, send_file, jsonify, make_response
from flask_cors import CORS
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from io import BytesIO
from datetime import datetime, timedelta, timezone
import os

basedir = os.path.abspath(os.path.dirname(__file__))
static_dir = os.path.join(basedir, 'dist')
app = Flask(__name__, static_folder=static_dir, static_url_path='')
CORS(app)

@app.route('/api/generate-prescription-pdf', methods=['POST'])
def generate_prescription_pdf():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Payload inválido"}), 400

    documentType = data.get('documentType', 'Receita')
    serviceLocation = data.get('serviceLocation', '')
    patientName = data.get('patientName', '')
    patientCPF = data.get('patientCPF', '')
    medications = data.get('medications', []) or []
    doctor = data.get('doctor')

    # Generate PDF in-memory using reportlab
    buffer = BytesIO()
    p = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4
    y = height - 50

    p.setFont("Helvetica-Bold", 16)
    p.drawString(50, y, documentType)
    y -= 30

    p.setFont("Helvetica", 12)
    p.drawString(50, y, f"Local de Atendimento: {serviceLocation}")
    y -= 20

    p.drawString(50, y, f"Paciente: {patientName}   CPF: {patientCPF}")
    y -= 30

    p.setFont("Helvetica-Bold", 12)
    p.drawString(50, y, "Medicamentos:")
    y -= 20
    p.setFont("Helvetica", 12)

    for med in medications:
        if y < 80:
            p.showPage()
            y = height - 50
            p.setFont("Helvetica", 12)

        name = med.get('name', '')
        dosage = med.get('dosage', '')
        quantity = med.get('quantity', '')
        administration = med.get('administration', '')

        p.drawString(60, y, f"- {name} | {dosage} | Qtde: {quantity} | Via: {administration}")
        y -= 18

    if doctor:
        y -= 20
        p.setFont("Helvetica-Bold", 12)
        p.drawString(50, y, "Médico:")
        y -= 20
        p.setFont("Helvetica", 12)
        p.drawString(50, y, f"{doctor.get('name', '')} - CRM: {doctor.get('crm', '')}")
        y -= 18
        clinic = doctor.get('clinicName') or doctor.get('clinic_name') or ''
        p.drawString(50, y, f"{doctor.get('specialty', '')} | {clinic}")
        y -= 18

    

    fuso_brasil = timezone(timedelta(hours=-3))
    timestamp = datetime.now(fuso_brasil).strftime('%d/%m/%Y %H:%M:%S')
    p.setFont("Helvetica", 10)
    p.drawString(50, 30, f"Gerado em {timestamp}")

    # No seu app.py, dentro de generate_prescription_pdf:
    p.showPage()
    p.save() # Garante que o PDF foi escrito no buffer
    buffer.seek(0)

    response = make_response(buffer.getvalue())
    response.headers['Content-Type'] = 'application/pdf'
    response.headers['Content-Disposition'] = f'attachment; filename=receita.pdf'
    return response


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