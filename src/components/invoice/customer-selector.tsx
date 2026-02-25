'use client';

import { useState, useCallback } from 'react';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';
import { toast } from 'sonner';

import type { Customer } from '@/lib/types';
import { createCustomer } from '@/lib/actions/customer-actions';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface CustomerSelectorProps {
  customers: Customer[];
  value: string | null;
  onChange: (customerId: string | null, customer: Customer | null) => void;
}

export function CustomerSelector({ customers, value, onChange }: CustomerSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const selected = customers.find((c) => c.id === value);

  const filtered = customers.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.company_name?.toLowerCase() ?? '').includes(q)
    );
  });

  const handleSelect = useCallback(
    (customer: Customer) => {
      onChange(customer.id, customer);
      setOpen(false);
      setSearch('');
    },
    [onChange],
  );

  const handleQuickCreate = useCallback(async () => {
    if (!search.trim()) return;
    const result = await createCustomer({
      name: search.trim(),
      email: `${search.trim().toLowerCase().replace(/\s+/g, '.')}@example.com`,
      phone: null,
      company_name: null,
      address_line1: null,
      address_line2: null,
      city: null,
      state: null,
      zip_code: null,
      country: null,
      tax_id: null,
      currency_preference: null,
      payment_terms: null,
      notes: null,
    });
    if (result.error || !result.data) {
      toast.error(result.error ?? 'Failed to create customer');
      return;
    }
    onChange(result.data.id, result.data);
    setOpen(false);
    setSearch('');
    toast.success(`Created customer "${search.trim()}" — edit their details in Customers`);
  }, [search, onChange]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal text-sm h-10"
        >
          {selected ? (
            <span className="text-text-primary">
              {selected.company_name ?? selected.name}
              {selected.company_name && (
                <span className="text-text-tertiary ml-1">({selected.name})</span>
              )}
            </span>
          ) : (
            <span className="text-text-tertiary">Select customer…</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-text-tertiary" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Search customers…"
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {filtered.length === 0 && search && (
              <CommandEmpty className="p-0">
                <button
                  className="flex items-center gap-2 w-full px-3 py-2.5 text-sm hover:bg-secondary transition-colors text-left"
                  onClick={handleQuickCreate}
                >
                  <Plus className="w-4 h-4 text-text-tertiary" />
                  Create &ldquo;{search}&rdquo; as new customer
                </button>
              </CommandEmpty>
            )}
            {filtered.length === 0 && !search && (
              <CommandEmpty>No customers yet.</CommandEmpty>
            )}
            <CommandGroup>
              {filtered.map((customer) => (
                <CommandItem
                  key={customer.id}
                  value={customer.id}
                  onSelect={() => handleSelect(customer)}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4 shrink-0',
                      value === customer.id ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  <div className="min-w-0">
                    <p className="font-medium truncate">
                      {customer.company_name ?? customer.name}
                    </p>
                    <p className="text-xs text-text-tertiary truncate">{customer.email}</p>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
            {search && filtered.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem onSelect={handleQuickCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create &ldquo;{search}&rdquo; as new customer
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
