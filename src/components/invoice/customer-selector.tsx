'use client';

import { useState, useCallback } from 'react';
import { Check, ChevronsUpDown, Plus, Pencil } from 'lucide-react';

import type { Customer } from '@/lib/types';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CustomerForm } from './customer-form';

interface CustomerSelectorProps {
  customers: Customer[];
  value: string | null;
  onChange: (customerId: string | null, customer: Customer | null) => void;
  onNewCustomerCreated?: (customer: Customer) => void;
  onCustomerUpdated?: (customer: Customer) => void;
}

function getDisplayName(customer: Customer): string {
  return customer.company_name || customer.email;
}

export function CustomerSelector({ customers, value, onChange, onNewCustomerCreated, onCustomerUpdated }: CustomerSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [showNewCustomerModal, setShowNewCustomerModal] = useState(false);
  const [showEditCustomerModal, setShowEditCustomerModal] = useState(false);

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

  function handleNewCustomerSuccess(customer: Customer) {
    onChange(customer.id, customer);
    onNewCustomerCreated?.(customer);
    setShowNewCustomerModal(false);
    setOpen(false);
    setSearch('');
  }

  function handleEditCustomerSuccess(customer: Customer) {
    onChange(customer.id, customer);
    onCustomerUpdated?.(customer);
    setShowEditCustomerModal(false);
  }

  return (
    <>
      <div className="flex items-center gap-2">
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
                  {getDisplayName(selected)}
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
              {filtered.length === 0 && !search && (
                <CommandEmpty>No customers yet.</CommandEmpty>
              )}
              {filtered.length === 0 && search && (
                <CommandEmpty>No matching customers.</CommandEmpty>
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
                        {getDisplayName(customer)}
                      </p>
                      {customer.company_name && (
                        <p className="text-xs text-text-tertiary truncate">{customer.name}</p>
                      )}
                      <p className="text-xs text-text-tertiary truncate">{customer.email}</p>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    setOpen(false);
                    setShowNewCustomerModal(true);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add new customer
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

        {selected && (
          <button
            type="button"
            onClick={() => setShowEditCustomerModal(true)}
            className="flex items-center justify-center w-10 h-10 rounded-md border border-border text-text-tertiary hover:text-text-primary hover:bg-secondary transition-colors shrink-0"
            aria-label="Edit customer"
          >
            <Pencil className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* New customer modal */}
      <Dialog open={showNewCustomerModal} onOpenChange={setShowNewCustomerModal}>
        <DialogContent className="max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Customer</DialogTitle>
          </DialogHeader>
          <CustomerForm onSuccess={handleNewCustomerSuccess} modal />
        </DialogContent>
      </Dialog>

      {/* Edit customer modal */}
      {selected && (
        <Dialog open={showEditCustomerModal} onOpenChange={setShowEditCustomerModal}>
          <DialogContent className="max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Customer</DialogTitle>
            </DialogHeader>
            <CustomerForm customer={selected} onSuccess={handleEditCustomerSuccess} modal />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
