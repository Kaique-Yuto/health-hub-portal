-- Limpeza do schema antigo
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TABLE IF EXISTS public.prescriptions;
DROP TABLE IF EXISTS public.profiles;

-- Extensões
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tabela de Médicos
CREATE TABLE public.medicos (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    nome text NOT NULL,
    email text not null,
    crm text NOT NULL,
    uf char(2) NOT NULL,
    rqe text,
    endereco text,
    nome_clinica text,
    especialidade text,
    telefone text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Tabela de Pacientes
CREATE TABLE public.pacientes (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    medico_id uuid NOT NULL REFERENCES public.medicos(id) ON DELETE CASCADE,
    nome text NOT NULL,
    cpf bytea NOT NULL,
    email text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Tabela de Prescrições
CREATE TABLE public.prescricoes (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    medico_id uuid NOT NULL REFERENCES public.medicos(id) ON DELETE CASCADE,
    paciente_id uuid NOT NULL REFERENCES public.pacientes(id) ON DELETE CASCADE,
    conteudo_json jsonb NOT NULL DEFAULT '{}'::jsonb,
    hash_assinatura text,
    status_dispensacao text DEFAULT 'Pendente',
    pdf_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Automação de Perfil Médico
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.medicos (user_id, nome, crm, uf)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data ->> 'name', 'Médico'),
    COALESCE(new.raw_user_meta_data ->> 'crm', ''),
    COALESCE(new.raw_user_meta_data ->> 'uf', 'SP')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Segurança (RLS)
ALTER TABLE public.medicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescricoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Médicos veem seu próprio perfil" ON public.medicos
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Médicos gerenciam seus pacientes" ON public.pacientes
    FOR ALL USING (
        medico_id IN (SELECT id FROM public.medicos WHERE user_id = auth.uid())
    );

CREATE POLICY "Médicos gerenciam suas prescrições" ON public.prescricoes
    FOR ALL USING (
        medico_id IN (SELECT id FROM public.medicos WHERE user_id = auth.uid())
    );