import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Medication {
  name: string;
  dosage: string;
  quantity: string;
  administration: string;
}

interface Doctor {
  name: string;
  crm: string;
  specialty?: string;
  clinicName?: string;
  clinicAddress?: string;
  phone?: string;
  email?: string;
}

interface PrescriptionData {
  documentType: string;
  serviceLocation: string;
  patientName: string;
  patientCPF: string;
  medications: Medication[];
  doctor: Doctor | null;
}

function formatCPF(cpf: string): string {
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11) return cpf;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function generatePDFContent(data: PrescriptionData): string {
  const today = new Date();
  const formattedDate = formatDate(today);
  const formattedCPF = formatCPF(data.patientCPF);

  const medicationsHtml = data.medications
    .filter(med => med.name.trim())
    .map((med, index) => `
      <div style="margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #0d9488;">
        <div style="font-weight: 600; font-size: 16px; color: #1f2937; margin-bottom: 8px;">
          ${index + 1}. ${med.name} ${med.dosage ? `- ${med.dosage}` : ''}
        </div>
        ${med.quantity ? `<div style="color: #4b5563; margin-bottom: 6px;"><strong>Quantidade:</strong> ${med.quantity}</div>` : ''}
        ${med.administration ? `<div style="color: #4b5563; white-space: pre-wrap;"><strong>Administração:</strong> ${med.administration}</div>` : ''}
      </div>
    `)
    .join('');

  const doctorInfo = data.doctor
    ? `
      <div style="margin-bottom: 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px; color: #0d9488; font-weight: 700;">
          ${data.doctor.clinicName || 'Consultório Médico'}
        </h1>
        ${data.doctor.clinicAddress ? `<p style="margin: 5px 0; color: #6b7280; font-size: 14px;">${data.doctor.clinicAddress}</p>` : ''}
        ${data.doctor.phone ? `<p style="margin: 5px 0; color: #6b7280; font-size: 14px;">Tel: ${data.doctor.phone}</p>` : ''}
      </div>
      <hr style="border: none; border-top: 2px solid #e5e7eb; margin: 20px 0;">
      <div style="text-align: right; margin-bottom: 20px;">
        <p style="margin: 0; color: #374151;"><strong>Dr(a). ${data.doctor.name}</strong></p>
        <p style="margin: 5px 0; color: #6b7280; font-size: 14px;">CRM: ${data.doctor.crm}</p>
        ${data.doctor.specialty ? `<p style="margin: 5px 0; color: #6b7280; font-size: 14px;">${data.doctor.specialty}</p>` : ''}
      </div>
    `
    : '';

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <style>
        @page { size: A4; margin: 20mm; }
        body { font-family: sans-serif; color: #1f2937; line-height: 1.6; padding: 20px; }
        @media print { .no-print { display: none; } }
      </style>
    </head>
    <body>
      ${doctorInfo}
      <div style="text-align: center; margin-bottom: 30px;">
        <h2 style="margin: 0; font-size: 20px; color: #374151; text-transform: uppercase;">Receita Médica</h2>
        <p style="margin: 10px 0; color: #6b7280; font-size: 14px;">${formattedDate}</p>
      </div>
      <div style="margin-bottom: 30px; padding: 20px; background: #f0fdfa; border-radius: 8px; border: 1px solid #99f6e4;">
        <p><strong>Paciente:</strong> ${data.patientName}</p>
        <p><strong>CPF:</strong> ${formattedCPF}</p>
        <p><strong>Local:</strong> ${data.serviceLocation}</p>
      </div>
      <h3 style="border-bottom: 2px solid #0d9488; padding-bottom: 10px;">Prescrição</h3>
      ${medicationsHtml}
    </body>
    </html>
  `;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const data: PrescriptionData = await req.json();

    if (!data.patientName || !data.patientCPF) {
      return new Response(JSON.stringify({ error: 'Dados insuficientes' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const htmlContent = generatePDFContent(data);

    // Retorna o HTML diretamente como binário para o blob do frontend
    return new Response(htmlContent, {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'text/html; charset=utf-8' 
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});