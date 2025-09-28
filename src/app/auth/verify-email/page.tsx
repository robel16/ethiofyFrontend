"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import { useAuthActions } from "@/hooks/use-auth";
import { CheckCircle, XCircle } from "lucide-react";

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();
  const { verifyEmail } = useAuthActions();

  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link");
      return;
    }

    const verify = async () => {
      try {
        const result = await verifyEmail(token);
        if (result.success) {
          setStatus("success");
          setMessage("Your email has been successfully verified!");
        } else {
          setStatus("error");
          setMessage(result.error || "Email verification failed");
        }
      } catch (error: any) {
        setStatus("error");
        setMessage(error.message || "Email verification failed");
      }
    };

    verify();
  }, [token, verifyEmail]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Ethiofy</h1>
          <p className="mt-2 text-sm text-gray-600">Print-on-Demand Platform</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Email Verification</CardTitle>
            <CardDescription>
              {status === "loading" && "Verifying your email address..."}
              {status === "success" && "Email verification successful"}
              {status === "error" && "Email verification failed"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-center">
              {status === "loading" && (
                <div className="flex justify-center">
                  <Loading />
                </div>
              )}

              {status === "success" && (
                <>
                  <div className="flex justify-center">
                    <CheckCircle className="h-16 w-16 text-green-500" />
                  </div>
                  <p className="text-sm text-gray-600">{message}</p>
                  <Link href="/auth/login">
                    <Button className="w-full">Continue to Sign In</Button>
                  </Link>
                </>
              )}

              {status === "error" && (
                <>
                  <div className="flex justify-center">
                    <XCircle className="h-16 w-16 text-red-500" />
                  </div>
                  <p className="text-sm text-red-600">{message}</p>
                  <div className="space-y-2">
                    <Link href="/auth/register">
                      <Button variant="outline" className="w-full">
                        Create New Account
                      </Button>
                    </Link>
                    <Link href="/auth/login">
                      <Button variant="ghost" className="w-full">
                        Back to Sign In
                      </Button>
                    </Link>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
