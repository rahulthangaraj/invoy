import { getOrganization } from '@/lib/queries/organization-queries';
import { CompanyProfileForm } from '@/components/settings/company-profile-form';

export default async function ProfileSettingsPage() {
  const organization = await getOrganization();

  return <CompanyProfileForm organization={organization} />;
}
