'use client';

import { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Upload, X } from 'lucide-react';
import Image from 'next/image';

import { companyProfileSchema } from '@/lib/validations/organization-schema';
import { updateOrganization, uploadLogo } from '@/lib/actions/organization-actions';
import type { Organization } from '@/lib/types';
import type { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type FormData = z.infer<typeof companyProfileSchema>;

export function CompanyProfileForm({ organization }: { organization: Organization | null }) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(companyProfileSchema),
    defaultValues: {
      name: organization?.name ?? '',
      email: organization?.email ?? '',
      phone: organization?.phone ?? '',
      address_line1: organization?.address_line1 ?? '',
      address_line2: organization?.address_line2 ?? '',
      city: organization?.city ?? '',
      state: organization?.state ?? '',
      zip_code: organization?.zip_code ?? '',
      country: organization?.country ?? '',
      tax_id: organization?.tax_id ?? '',
      website: organization?.website ?? '',
      brand_color: organization?.brand_color ?? '#1a1a2e',
    },
  });

  async function onSubmit(data: FormData) {
    try {
      const result = await updateOrganization(data);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Profile saved');
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    }
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Logo must be under 2MB');
      return;
    }

    const result = await uploadLogo(file);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Logo uploaded');
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Logo */}
      <div>
        <h3 className="text-sm font-semibold text-text-primary mb-3">Logo & branding</h3>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-lg border border-border flex items-center justify-center overflow-hidden bg-secondary">
            {organization?.logo_url ? (
              <Image
                src={organization.logo_url}
                alt="Logo"
                width={64}
                height={64}
                className="object-contain"
              />
            ) : (
              <span className="text-xl font-bold text-text-tertiary">
                {(organization?.name ?? 'I')[0]}
              </span>
            )}
          </div>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/svg+xml"
              className="hidden"
              onChange={handleLogoUpload}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-4 h-4 mr-1.5" />
              Upload logo
            </Button>
            <p className="text-xs text-text-tertiary mt-1">PNG, JPG, SVG — max 2MB</p>
          </div>
        </div>

        <div className="mt-4 space-y-1.5">
          <Label htmlFor="brand_color">Brand color</Label>
          <div className="flex items-center gap-2">
            <input
              id="brand_color_picker"
              type="color"
              value={watch('brand_color')}
              onChange={(e) => setValue('brand_color', e.target.value, { shouldDirty: true, shouldValidate: true })}
              className="w-9 h-9 rounded-md border border-border cursor-pointer p-0.5"
            />
            <Input
              id="brand_color"
              {...register('brand_color')}
              placeholder="#1a1a2e"
              className="font-mono w-32"
            />
          </div>
          {errors.brand_color && (
            <p className="text-xs text-destructive">{errors.brand_color.message}</p>
          )}
        </div>
      </div>

      {/* Business info */}
      <div>
        <h3 className="text-sm font-semibold text-text-primary mb-3">Business information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Business name *</Label>
            <Input id="name" {...register('name')} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Business email *</Label>
            <Input id="email" type="email" {...register('email')} />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" {...register('phone')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="website">Website</Label>
            <Input id="website" type="url" placeholder="https://…" {...register('website')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tax_id">Tax ID / GST / VAT</Label>
            <Input id="tax_id" {...register('tax_id')} />
          </div>
        </div>
      </div>

      {/* Address */}
      <div>
        <h3 className="text-sm font-semibold text-text-primary mb-3">Address</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2 space-y-1.5">
            <Label htmlFor="address_line1">Address line 1</Label>
            <Input id="address_line1" {...register('address_line1')} />
          </div>
          <div className="sm:col-span-2 space-y-1.5">
            <Label htmlFor="address_line2">Address line 2</Label>
            <Input id="address_line2" {...register('address_line2')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="city">City</Label>
            <Input id="city" {...register('city')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="state">State / Province</Label>
            <Input id="state" {...register('state')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="zip_code">ZIP / Postal code</Label>
            <Input id="zip_code" {...register('zip_code')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="country">Country</Label>
            <Input id="country" {...register('country')} />
          </div>
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving…' : 'Save changes'}
      </Button>
    </form>
  );
}
