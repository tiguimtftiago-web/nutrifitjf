-- Capture a one-time stock baseline so all future movement-ledger balances can be audited.
create table if not exists public.inventory_stock_ledger_baselines (
  item_id uuid primary key references public.inventory_items(id) on delete cascade,
  baseline_quantity numeric not null check (baseline_quantity>=0),
  baseline_at timestamptz not null default clock_timestamp(),
  note text not null default 'Saldo de sistema capturado como ponto de partida; não substitui contagem física.'
);

alter table public.inventory_stock_ledger_baselines enable row level security;
drop policy if exists admin_inventory_stock_ledger_baselines on public.inventory_stock_ledger_baselines;
create policy admin_inventory_stock_ledger_baselines
on public.inventory_stock_ledger_baselines
for all to authenticated
using (public.is_admin_user())
with check (public.is_admin_user());

insert into public.inventory_stock_ledger_baselines(item_id,baseline_quantity,note)
select id,current_quantity,
       'Saldo do sistema capturado em 19/11/2026 como marco inicial da auditoria; não representa nova contagem física.'
from public.inventory_items
on conflict(item_id) do nothing;

create or replace view public.inventory_stock_ledger_audit
with (security_invoker=true)
as
select
  i.id as item_id,
  i.name,
  i.unit,
  b.baseline_quantity,
  b.baseline_at,
  i.current_quantity as displayed_stock,
  b.baseline_quantity + coalesce(sum(
    case when m.movement_type in ('entrada','devolucao','ajuste') then m.quantity
         when m.movement_type in ('consumo','perda') then -m.quantity
         else 0 end
  ) filter (where m.created_at>b.baseline_at),0) as ledger_expected_stock,
  i.current_quantity - (
    b.baseline_quantity + coalesce(sum(
      case when m.movement_type in ('entrada','devolucao','ajuste') then m.quantity
           when m.movement_type in ('consumo','perda') then -m.quantity
           else 0 end
    ) filter (where m.created_at>b.baseline_at),0)
  ) as difference,
  case when abs(i.current_quantity - (
    b.baseline_quantity + coalesce(sum(
      case when m.movement_type in ('entrada','devolucao','ajuste') then m.quantity
           when m.movement_type in ('consumo','perda') then -m.quantity
           else 0 end
    ) filter (where m.created_at>b.baseline_at),0)
  ))<0.0005 then 'OK' else 'DIVERGENTE' end as audit_status
from public.inventory_items i
join public.inventory_stock_ledger_baselines b on b.item_id=i.id
left join public.inventory_movements m on m.item_id=i.id
group by i.id,i.name,i.unit,i.current_quantity,b.baseline_quantity,b.baseline_at;

grant select on public.inventory_stock_ledger_audit to authenticated;
notify pgrst,'reload schema';
