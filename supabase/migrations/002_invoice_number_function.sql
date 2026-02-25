-- Atomically increment the invoice counter for an organization
create or replace function public.increment_invoice_number(org_id uuid)
returns void as $$
begin
  update public.organizations
  set next_invoice_number = next_invoice_number + 1
  where id = org_id;
end;
$$ language plpgsql security definer;
