import { getOrganization } from '@/lib/queries/organization-queries';
import { InvoiceDefaultsForm } from '@/components/settings/invoice-defaults-form';

export default async function InvoiceSettingsPage() {
  const organization = await getOrganization();

  return <InvoiceDefaultsForm organization={organization} />;
}
