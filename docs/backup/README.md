# Nutrifit — plano de backup externo

## Estado

Esta implementação está sendo preparada em uma branch separada. Nenhum backup é executado automaticamente e nenhum dado de produção é alterado por estes arquivos.

## Destinos

- Cloudflare R2: cópia primária, bucket privado.
- Google Drive: segunda cópia independente, usando rclone com OAuth.
- Os arquivos enviados são criptografados com GPG AES-256 antes do upload.

## Conteúdo incluído

- Dump lógico do schema e dos dados geridos pelo Supabase CLI.
- Dump dos roles customizados.
- Download do código-fonte das Edge Functions atualmente implantadas no Supabase.
- Histórico de migrações do schema `supabase_migrations`.
- Snapshot dos arquivos versionados no commit atual (inclui código, funções e imagens presentes no Git).

## Limitação importante do dump lógico Supabase

O comando `supabase db dump` exclui os schemas gerenciados `auth`, `storage` e schemas de extensões. Portanto, este pacote protege o schema/dados de aplicação incluídos no dump, mas não deve ser tratado como restauração completa de usuários Auth nem de objetos do Storage. A auditoria atual não encontrou buckets no Storage. Antes de declarar a proteção completa, é necessário definir e validar um método separado para recuperação dos usuários Auth e verificar se a aplicação depende de algum objeto armazenado fora do repositório. Os valores dos secrets das Edge Functions também não são exportados pelo CLI e precisam permanecer guardados em um cofre de senhas/segredos.

## Pré-requisitos para ativar

Configurar estes GitHub Actions Secrets (não colocar valores no repositório nem enviar por chat):

- `SUPABASE_DB_URL`: connection string PostgreSQL do projeto.
- `SUPABASE_ACCESS_TOKEN`: token de acesso Supabase com permissão mínima para listar/baixar Edge Functions.
- `SUPABASE_PROJECT_REF`: referência do projeto, apenas para o manifesto.
- `BACKUP_PASSPHRASE`: frase-senha longa e exclusiva para criptografia GPG.
- `R2_ACCOUNT_ID`, `R2_BUCKET_NAME`.
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`: token R2 restrito ao bucket de backup, Object Read & Write.
- `RCLONE_CONFIG_B64`: arquivo de configuração rclone codificado em Base64, contendo o OAuth da conta Google dedicada.
- `RCLONE_DRIVE_REMOTE`: destino no formato `remote:folder`.

A configuração do rclone deve ser obtida em uma máquina confiável com uma conta Google dedicada à Nutrifit e guardada como secret protegido. Não compartilhar tokens OAuth ou chaves privadas em mensagens, issues ou commits.

## Execução local

Instalar Supabase CLI, AWS CLI, rclone, GPG e Git. Exportar as variáveis acima e executar. No GitHub Actions, o workflow `.github/workflows/nutrifit-offsite-backup.yml` instala versões fixadas das ferramentas, reconstrói o arquivo rclone a partir de `RCLONE_CONFIG_B64` e chama este script.

```bash
bash scripts/backup/nutrifit-backup.sh
```

O script faz apenas leituras do banco. Gera dumps lógicos, arquiva o commit atual, cifra o pacote e envia para os dois destinos. Verifica a presença dos objetos enviados. Não executa exclusões remotas nem restaura dados.

## Agendamento e retenção

O workflow está preparado para execução manual e possui agendamento diário às 00:00 (horário de Brasília). Como ele está em uma branch de preparação, o evento agendado só passará a existir depois que a branch for revisada e integrada à `main`; mesmo assim, as execuções agendadas permanecerão bloqueadas até criar a variável de repositório `NUTRIFIT_BACKUP_ENABLED=true`. O agendamento só deve ser ativado depois de:
1. Criar e testar o bucket privado no R2.
2. Configurar o acesso Google Drive dedicado.
3. Cadastrar os secrets no GitHub Actions.
4. Executar um backup manual e validar os dois uploads.
5. Fazer teste de descriptografia e restauração em projeto Supabase separado.

Aplicar retenção de 30 dias no R2 por regra de ciclo de vida após validar o prefixo `daily/`. No Drive, manter política equivalente após confirmar a conta e a pasta de destino. Não habilitar exclusão automática antes de comprovar a integridade dos backups.

## Recuperação

O teste de recuperação deve ocorrer em um projeto Supabase novo, nunca sobrescrevendo o projeto de produção. A restauração requer a senha GPG e a sequência documentada dos arquivos SQL. Os schemas gerenciados pelo Supabase, em especial Auth, exigem um procedimento próprio e validação adicional.
