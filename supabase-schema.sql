-- ============================================================
-- ClicStudio - Script SQL para Supabase
-- Sistema de Gestão de Agenda - Estúdio de Fotografia
-- ============================================================

-- Habilitar extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABELA: clientes
-- ============================================================
CREATE TABLE clientes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  telefone VARCHAR(50),
  empresa VARCHAR(255),
  notas TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABELA: funcionarios
-- ============================================================
CREATE TABLE funcionarios (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  telefone VARCHAR(50),
  cargo VARCHAR(255),
  cor VARCHAR(7) DEFAULT '#5d109c',
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABELA: tipos_tarefa
-- ============================================================
CREATE TABLE tipos_tarefa (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  cor VARCHAR(7) DEFAULT '#5d109c',
  icone VARCHAR(50) DEFAULT 'camera',
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABELA: tarefas
-- ============================================================
CREATE TABLE tarefas (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
  tipo_tarefa_id UUID REFERENCES tipos_tarefa(id) ON DELETE SET NULL,
  funcionario_id UUID REFERENCES funcionarios(id) ON DELETE SET NULL,
  descricao TEXT NOT NULL,
  data_prazo DATE NOT NULL,
  hora_inicio TIME,
  hora_fim TIME,
  local VARCHAR(255),
  link_galeria TEXT,
  realizado BOOLEAN DEFAULT false,
  deadline_entrega TIMESTAMPTZ,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ÍNDICES para performance
-- ============================================================
CREATE INDEX idx_tarefas_data_prazo ON tarefas(data_prazo);
CREATE INDEX idx_tarefas_funcionario ON tarefas(funcionario_id);
CREATE INDEX idx_tarefas_tipo ON tarefas(tipo_tarefa_id);
CREATE INDEX idx_tarefas_cliente ON tarefas(cliente_id);
CREATE INDEX idx_tarefas_realizado ON tarefas(realizado);
CREATE INDEX idx_tarefas_deadline ON tarefas(deadline_entrega);

-- ============================================================
-- Trigger para atualizar updated_at automaticamente
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_clientes_updated_at
  BEFORE UPDATE ON clientes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_funcionarios_updated_at
  BEFORE UPDATE ON funcionarios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tipos_tarefa_updated_at
  BEFORE UPDATE ON tipos_tarefa
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tarefas_updated_at
  BEFORE UPDATE ON tarefas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- RLS (Row Level Security) - Básico
-- ============================================================
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE funcionarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE tipos_tarefa ENABLE ROW LEVEL SECURITY;
ALTER TABLE tarefas ENABLE ROW LEVEL SECURITY;

-- Políticas públicas (ajustar conforme necessidade de auth)
CREATE POLICY "Permitir tudo para usuários autenticados" ON clientes
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir tudo para usuários autenticados" ON funcionarios
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir tudo para usuários autenticados" ON tipos_tarefa
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir tudo para usuários autenticados" ON tarefas
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- Habilitar REALTIME nas tabelas
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE tarefas;
ALTER PUBLICATION supabase_realtime ADD TABLE clientes;
ALTER PUBLICATION supabase_realtime ADD TABLE funcionarios;
ALTER PUBLICATION supabase_realtime ADD TABLE tipos_tarefa;

-- ============================================================
-- DADOS INICIAIS (Seeds)
-- ============================================================

-- Tipos de Tarefa padrão
INSERT INTO tipos_tarefa (nome, cor, icone) VALUES
  ('Ensaio Fotográfico', '#e91e63', 'camera'),
  ('Reunião de Branding', '#2196f3', 'briefcase'),
  ('Gravação de Vídeo', '#ff9800', 'video'),
  ('Edição de Fotos', '#4caf50', 'image'),
  ('Edição de Vídeo', '#9c27b0', 'film'),
  ('Entrega ao Cliente', '#00bcd4', 'package'),
  ('Reunião Interna', '#607d8b', 'users');

-- ============================================================
-- TABELA: cronograma_posts (Agenda de Conteúdo)
-- ============================================================
CREATE TABLE cronograma_posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
  tipo_post VARCHAR(50) NOT NULL DEFAULT 'Reel',  -- Reel, Carrossel, Foto
  rede_social TEXT[] NOT NULL DEFAULT '{}',         -- ex: {Instagram, Facebook, TikTok}
  legenda TEXT,
  link_midia TEXT,
  data_agendada TIMESTAMPTZ NOT NULL,
  responsavel_id UUID REFERENCES funcionarios(id) ON DELETE SET NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'Planejado', -- Planejado, Em Produção, Aprovado, Postado
  titulo VARCHAR(500),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_cronograma_posts_data ON cronograma_posts(data_agendada);
CREATE INDEX idx_cronograma_posts_cliente ON cronograma_posts(cliente_id);
CREATE INDEX idx_cronograma_posts_responsavel ON cronograma_posts(responsavel_id);
CREATE INDEX idx_cronograma_posts_status ON cronograma_posts(status);

-- Trigger updated_at
CREATE TRIGGER update_cronograma_posts_updated_at
  BEFORE UPDATE ON cronograma_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE cronograma_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir tudo para usuários autenticados" ON cronograma_posts
  FOR ALL USING (auth.role() = 'authenticated');

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE cronograma_posts;

-- ============================================================
-- TABELA: tipos_post (Tipos de Post para Agenda de Conteúdo)
-- ============================================================
CREATE TABLE tipos_post (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_tipos_post_updated_at
  BEFORE UPDATE ON tipos_post
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE tipos_post ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir tudo para usuários autenticados" ON tipos_post
  FOR ALL USING (auth.role() = 'authenticated');

-- Dados iniciais
INSERT INTO tipos_post (nome) VALUES
  ('Reel'),
  ('Carrossel'),
  ('Foto'),
  ('Stories'),
  ('Vídeo');
