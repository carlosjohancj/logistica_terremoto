-- Crear tabla de mensajes para el chat entre usuarios
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Permitir SELECT a participantes del match
CREATE POLICY "messages_select_participant" ON public.messages
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM public.matches WHERE id = match_id
      UNION
      SELECT tr.user_id FROM public.travel_requests tr
      JOIN public.matches m ON m.travel_request_id = tr.id
      WHERE m.id = match_id
    )
  );

-- Permitir INSERT al sender
CREATE POLICY "messages_insert_own" ON public.messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Habilitar Realtime para mensajes en vivo
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
