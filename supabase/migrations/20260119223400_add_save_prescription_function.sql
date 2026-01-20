CREATE OR REPLACE FUNCTION public.salvar_prescricao_completa(
  p_medico_id uuid,
  p_paciente_nome text,
  p_paciente_cpf text,
  p_paciente_email text,
  p_conteudo jsonb,
  p_local text
) RETURNS uuid AS $$
DECLARE
  v_paciente_id uuid;
  v_prescricao_id uuid;
  v_key text;
BEGIN
  -- Recupera a chave das configurações do banco
  SELECT decrypted_secret INTO v_key 
  FROM vault.decrypted_secrets 
  WHERE name = 'encryption_key';
  
  IF v_key IS NULL OR v_key = '' THEN
    RAISE EXCEPTION 'Chave de criptografia não configurada no banco de dados.';
  END IF;

  SELECT id INTO v_paciente_id
  FROM public.pacientes
  WHERE medico_id = p_medico_id
  AND pgp_sym_decrypt(cpf, v_key) = p_paciente_cpf
  LIMIT 1;

  IF v_paciente_id IS NULL THEN
    INSERT INTO public.pacientes (medico_id, nome, cpf, email)
    VALUES (p_medico_id, p_paciente_nome, pgp_sym_encrypt(p_paciente_cpf, v_key), p_paciente_email)
    RETURNING id INTO v_paciente_id;
  END IF;

  INSERT INTO public.prescricoes (medico_id, paciente_id, conteudo_json)
  VALUES (p_medico_id, v_paciente_id, p_conteudo)
  RETURNING id INTO v_prescricao_id;

  RETURN v_prescricao_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;