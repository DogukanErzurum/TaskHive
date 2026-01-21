import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useLoginMutation } from "@/hooks/use-auth";
import { signInSchema } from "@/lib/schema";
import { useAuth } from "@/provider/auth-context";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { z } from "zod";

type SigninFormData = z.infer<typeof signInSchema>;

const SignIn = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const form = useForm<SigninFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const { mutate, isPending } = useLoginMutation();

  const handleOnSubmit = (values: SigninFormData) => {
    mutate(values, {
      onSuccess: (data) => {
        login(data);
        console.log(data);
        toast.success("Giriş Başarılı");
        navigate("/dashboard");
      },
      onError: (error: any) => {
        const errorMessage =
          error.response?.data?.message || "Bir hata oluştu";
        console.log(error);
        toast.error(errorMessage);
      },
    });
  };
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/40 p-4">
      <Card className="max-w-md w-full shadow-xl">
        <CardHeader className="text-center mb-5">
          <CardTitle className="text-2xl font-bold">Tekrar hoş geldiniz</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Devam etmek için hesabına giriş yap
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleOnSubmit)}
              className="space-y-6"
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-posta Adresi</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="ornek@eposta.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Şifre</FormLabel>
                      <Link
                        to="/forgot-password"
                        className="text-sm text-blue-600"
                      >
                        Şifremi unuttum
                      </Link>
                    </div>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="********"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? <Loader2 className="w-4 h-4 mr-2" /> : "Giriş Yap"}
              </Button>
            </form>
          </Form>

          <CardFooter className="flex items-center justify-center mt-6">
            <div className="flex items-center justify-center">
              <p className="text-sm text-muted-foreground">
                Hesabın yok mu? <Link to="/sign-up">Kayıt Ol</Link>
              </p>
            </div>
          </CardFooter>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignIn;