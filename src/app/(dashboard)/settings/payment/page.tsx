import { getOrganization } from '@/lib/queries/organization-queries';
import { PaymentConfigForm } from '@/components/settings/payment-config-form';

export default async function PaymentSettingsPage() {
  const organization = await getOrganization();

  return <PaymentConfigForm organization={organization} />;
}
