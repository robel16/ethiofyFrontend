"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, MapPin, Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { userService } from "@/services/user.service";

interface Address {
  id: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state?: string;
  postal_code: string;
  country: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

interface AddressListProps {
  onAddAddress: () => void;
  onEditAddress: (address: Address) => void;
}

export function AddressList({ onAddAddress, onEditAddress }: AddressListProps) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      const response = await userService.getUserAddresses(user.id);
      setAddresses(response.data || []);
    } catch (err) {
      console.error("Error fetching addresses:", err);
      setError("Failed to load addresses");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm("Are you sure you want to delete this address?")) {
      return;
    }

    try {
      await userService.deleteAddress(addressId);
      setAddresses(addresses.filter((addr) => addr.id !== addressId));
    } catch (err) {
      console.error("Error deleting address:", err);
      setError("Failed to delete address");
    }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      await userService.setDefaultAddress(addressId);
      setAddresses(
        addresses.map((addr) => ({
          ...addr,
          is_default: addr.id === addressId,
        }))
      );
    } catch (err) {
      console.error("Error setting default address:", err);
      setError("Failed to set default address");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="mb-4 text-red-600">{error}</p>
        <Button onClick={fetchAddresses} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Your Addresses</h3>
          <p className="text-sm text-gray-600">
            Manage your billing and shipping addresses
          </p>
        </div>
        <Button onClick={onAddAddress} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Address
        </Button>
      </div>

      {addresses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MapPin className="mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium text-gray-900">
              No addresses found
            </h3>
            <p className="mb-4 text-center text-gray-600">
              Add your first address to get started with orders and deliveries.
            </p>
            <Button onClick={onAddAddress} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Your First Address
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {addresses.map((address) => (
            <Card key={address.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base">
                      {address.address_line_1}
                    </CardTitle>
                    {address.is_default && (
                      <Badge variant="secondary" className="text-xs">
                        Default
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditAddress(address)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteAddress(address.id)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-1 text-sm text-gray-600">
                  {address.address_line_2 && <p>{address.address_line_2}</p>}
                  <p>
                    {address.city}
                    {address.state && `, ${address.state}`}{" "}
                    {address.postal_code}
                  </p>
                  <p>{address.country}</p>
                </div>
                {!address.is_default && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSetDefault(address.id)}
                    className="mt-3"
                  >
                    Set as Default
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
