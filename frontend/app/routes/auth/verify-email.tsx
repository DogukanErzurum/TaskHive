import { Card, CardContent, CardHeader } from "@/components/ui/card";
import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { ArrowLeft, CheckCircle, Loader, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVerifyEmailMutation } from "@/hooks/use-auth";
import { toast } from "sonner";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");
  const [isSuccess, setIsSuccess] = useState(false);
  const { mutate, isPending: isVerifying } = useVerifyEmailMutation();

  useEffect(() => {
    if (token) {
      mutate(
        { token },
        {
          onSuccess: () => {
            setIsSuccess(true);
          },
          onError: (error: any) => {
            const errorMessage =
              error.response?.data?.message || "Bir hata oluştu";
            setIsSuccess(false);
            console.log(error);

            toast.error(errorMessage);
          },
        }
      );
    }
  }, [searchParams]);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold">E-postayı Doğrula</h1>
      <p className="text-sm text-gray-500">E-postanız doğrulanıyor...</p>

      <Card className="w-full max-w-md">
        {/* <CardHeader>
          <Link to="/sign-in" className="flex items-center gap-2 text-sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Giriş sayfasına dön
          </Link>
        </CardHeader> */}

        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 ">
            {isVerifying ? (
              <>
                <Loader className="w-10 h-10 text-gray-500 animate-spin" />
                <h3 className="text-lg font-semibold">E-posta doğrulanıyor...</h3>
                <p className="text-sm text-gray-500">
                  Lütfen e-postanızı doğrularken bekleyin.
                </p>
              </>
            ) : isSuccess ? (
              <>
                <CheckCircle className="w-10 h-10 text-green-500" />
                <h3 className="text-lg font-semibold">E-posta Doğrulandı</h3>
                <p className="text-sm text-gray-500">
                  E-posta doğrulaması başarılı.
                </p>
                <Link to="/sign-in" className="text-sm text-blue-500 mt-6">
                  <Button variant="outline">Giriş sayfasına dön</Button>
                </Link>
              </>
            ) : (
              <>
                <XCircle className="w-10 h-10 text-red-500" />
                <h3 className="text-lg font-semibold">
                  E-posta Doğrulama Başarısız
                </h3>
                <p className="text-sm text-gray-500">
                  E-posta doğrulama işlemi başarısız oldu. Lütfen tekrar deneyin.
                </p>

                <Link to="/sign-in" className="text-sm text-blue-500 mt-6">
                  <Button variant="outline">Giriş sayfasına dön</Button>
                </Link>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyEmail;