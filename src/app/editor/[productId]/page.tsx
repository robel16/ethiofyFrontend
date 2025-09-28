"use client";

import { useParams } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { ProductEditor } from "@/components/editor/product-editor";
import { Loading } from "@/components/ui/loading";

export default function ProductEditorPage() {
  const params = useParams();
  const { user, isLoading } = useAuth();
  const productId = params.productId as string;

  if (isLoading) {
    return <Loading />;
  }

  return (
    <ProtectedRoute requiredRoles={["customer"]}>
      <div className="min-h-screen bg-gray-50">
        <ProductEditor productId={productId} />
      </div>
    </ProtectedRoute>
  );
}
