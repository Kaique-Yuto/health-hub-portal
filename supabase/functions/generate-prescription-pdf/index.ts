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

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        @page {
          size: A4;
          margin: 20mm;
        }
        body {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          color: #1f2937;
          line-height: 1.6;
          margin: 0;
          padding: 40px;
        }
      </style>
    </head>
    <body>
      ${doctorInfo}
      
      <div style="text-align: center; margin-bottom: 30px;">
        <h2 style="margin: 0; font-size: 20px; color: #374151; text-transform: uppercase; letter-spacing: 2px;">
          Receita Médica
        </h2>
        <p style="margin: 10px 0; color: #6b7280; font-size: 14px;">${formattedDate}</p>
      </div>

      <div style="margin-bottom: 30px; padding: 20px; background: #f0fdfa; border-radius: 8px; border: 1px solid #99f6e4;">
        <div style="margin-bottom: 15px;">
          <span style="color: #6b7280; font-size: 14px;">Paciente:</span>
          <p style="margin: 5px 0; font-size: 18px; font-weight: 600; color: #1f2937;">${data.patientName}</p>
        </div>
        <div style="margin-bottom: 15px;">
          <span style="color: #6b7280; font-size: 14px;">CPF:</span>
          <p style="margin: 5px 0; font-size: 16px; color: #1f2937;">${formattedCPF}</p>
        </div>
        <div>
          <span style="color: #6b7280; font-size: 14px;">Local de Atendimento:</span>
          <p style="margin: 5px 0; font-size: 16px; color: #1f2937;">${data.serviceLocation}</p>
        </div>
      </div>

      <h3 style="margin: 0 0 20px 0; font-size: 16px; color: #374151; border-bottom: 2px solid #0d9488; padding-bottom: 10px;">
        Prescrição
      </h3>

      ${medicationsHtml}

      <div style="margin-top: 60px; text-align: center;">
        <div style="display: inline-block; border-top: 1px solid #1f2937; padding-top: 10px; min-width: 300px;">
          <p style="margin: 0; font-weight: 600; color: #1f2937;">
            ${data.doctor ? `Dr(a). ${data.doctor.name}` : 'Assinatura do Médico'}
          </p>
          ${data.doctor ? `<p style="margin: 5px 0; color: #6b7280; font-size: 14px;">CRM: ${data.doctor.crm}</p>` : ''}
        </div>
      </div>
    </body>
    </html>
  `;

  return html;
}

// Simple HTML to PDF using a data URL approach (base64 encoded HTML for iframe rendering)
// For production, you'd want to use a proper PDF generation service
function htmlToPdfBase64(html: string): string {
  // Create a simple PDF-like format using HTML
  // This is a workaround - in production you'd use a service like Puppeteer, PDFKit, or a cloud service
  const encoder = new TextEncoder();
  const bytes = encoder.encode(html);
  
  // Convert to base64
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: PrescriptionData = await req.json();
    
    console.log('Generating prescription PDF for patient:', data.patientName);

    // Validate required fields
    if (!data.patientName || !data.patientCPF || !data.serviceLocation) {
      throw new Error('Campos obrigatórios não preenchidos');
    }

    if (!data.medications || data.medications.length === 0) {
      throw new Error('Pelo menos um medicamento é necessário');
    }

    // Generate HTML content
    const htmlContent = generatePDFContent(data);
    
    // For now, we'll return the HTML as base64 that can be rendered in an iframe
    // The client can print this to PDF using the browser's print functionality
    const base64Html = htmlToPdfBase64(htmlContent);

    console.log('PDF generated successfully');

    return new Response(
      JSON.stringify({ 
        pdf: base64Html,
        contentType: 'text/html',
        message: 'Para salvar como PDF, use Ctrl+P (ou Cmd+P no Mac) na visualização e selecione "Salvar como PDF"'
      }),
      {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
      }
    );
  } catch (error) {
    console.error('Error generating PDF:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Erro ao gerar PDF' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
