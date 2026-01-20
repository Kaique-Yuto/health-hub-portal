CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.medicos (user_id, nome, email, crm, uf, telefone)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data ->> 'name', ''),
    new.email, -- Pega o e-mail diretamente da conta de autenticação
    COALESCE(new.raw_user_meta_data ->> 'crm', ''),
    COALESCE(new.raw_user_meta_data ->> 'uf', 'SP'), -- Default caso não venha no cadastro
    COALESCE(new.raw_user_meta_data ->> 'phone', '')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;