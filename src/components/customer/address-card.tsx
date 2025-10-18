"use client";

import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Address {
  id: string;
  type: "billing" | "shipping";
  first_name: string;
  last_name: string;
  company?: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone?: string;
  is_default: boolean;
  street: string;
}

interface AddressCardProps {
  address: Address;
  onEdit: (address: Address) => void;
  onDelete: (addressId: string) => void;
}

export function AddressCard({ address, onEdit, onDelete }: AddressCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:border-purple-400 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800/50 dark:hover:border-purple-500">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-purple-50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-purple-900/10 dark:to-transparent" />

      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          {/* Header with name and badges */}
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {address.first_name} {address.last_name}
            </h3>
            <Badge
              variant="secondary"
              className="bg-gray-100 text-xs capitalize text-gray-700 dark:bg-gray-700 dark:text-gray-300"
            >
              {address.type}
            </Badge>
            {address.is_default && (
              <Badge className="bg-purple-600 text-xs text-white hover:bg-purple-700">
                Default
              </Badge>
            )}
          </div>

          {/* Company */}
          {address.company && (
            <p className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
              {address.company}
            </p>
          )}

          {/* Address details */}
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <p className="leading-relaxed">
              {address.address_line_1}
              {address.address_line_2 && (
                <>
                  <br />
                  {address.address_line_2}
                </>
              )}
            </p>
            <p>
              {address.city}, {address.state} {address.postal_code}
            </p>
            <p className="font-medium text-gray-700 dark:text-gray-300">
              {address.country}
            </p>
            {address.phone && (
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                <span className="font-medium">Phone:</span> {address.phone}
              </p>
            )}
          </div>
        </div>

        {/* Action buttons - visible on hover */}
        <div className="flex flex-shrink-0 gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <Button
            variant="outline"
            size="sm"
            className="h-9 w-9 border-gray-300 bg-white p-0 transition-colors duration-200 hover:border-purple-400 hover:bg-purple-50 dark:border-gray-600 dark:bg-gray-800 dark:hover:border-purple-500 dark:hover:bg-purple-900/20"
            onClick={() => onEdit(address)}
            title="Edit address"
          >
            <Edit className="h-4 w-4 text-gray-600 transition-colors group-hover:text-purple-600 dark:text-gray-400 dark:group-hover:text-purple-400" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-9 w-9 border-gray-300 bg-white p-0 transition-colors duration-200 hover:border-red-400 hover:bg-red-50 dark:border-gray-600 dark:bg-gray-800 dark:hover:border-red-500 dark:hover:bg-red-900/20"
            onClick={() => {
              if (confirm("Are you sure you want to delete this address?")) {
                onDelete(address.id);
              }
            }}
            title="Delete address"
          >
            <Trash2 className="h-4 w-4 text-gray-600 transition-colors group-hover:text-red-600 dark:text-gray-400 dark:group-hover:text-red-400" />
          </Button>
        </div>
      </div>
    </div>
  );
}
