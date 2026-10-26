import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Phone, ArrowLeft, Send } from "@/components/icons";
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { AuthShell, AuthField, authInputClass } from '@/components/auth/AuthShell';

const forgotPasswordSchema = z.object({
  phone: z.string()
    .min(8, 'Le numéro de téléphone doit contenir au moins 8 chiffres')
    .regex(/^[0-9+\s-]+$/, 'Format de numéro invalide'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { phone: '' },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1500);
  };

  return (
    <AuthShell>
      <Link to="/login" className="flex w-fit items-center gap-[7px] text-sm text-ink2 no-underline hover:text-ink">
        <ArrowLeft className="h-4 w-4" />
        Connexion
      </Link>

      {!isSubmitted ? (
        <>
          <h2 className="mt-[22px] text-[clamp(32px,4vw,42px)] font-semibold leading-[1.05] tracking-[-0.03em]">
            Mot de passe oublié
          </h2>
          <p className="mt-2.5 text-base leading-normal text-ink2">
            Saisissez le numéro de votre structure : nous vous envoyons un lien de réinitialisation par SMS.
          </p>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="mt-[26px]" noValidate>
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem className="space-y-0">
                    <AuthField icon={<Phone className="h-[19px] w-[19px]" />}>
                      <FormControl>
                        <input
                          type="tel"
                          inputMode="tel"
                          autoComplete="tel"
                          aria-label="Numéro de téléphone"
                          placeholder="+241 77 10 20 30"
                          className={authInputClass}
                          {...field}
                        />
                      </FormControl>
                    </AuthField>
                    <FormMessage className="mt-1.5" />
                  </FormItem>
                )}
              />
              <Button type="submit" size="lg" className="mt-[18px] w-full" disabled={isLoading}>
                {isLoading ? (
                  <span className="flex items-center gap-2.5">
                    <span className="h-[18px] w-[18px] animate-spin rounded-full border-[2.5px] border-white/35 border-t-white" />
                    Envoi…
                  </span>
                ) : (
                  'Envoyer le lien'
                )}
              </Button>
            </form>
          </Form>
        </>
      ) : (
        <div className="mt-[26px]">
          <Send className="h-16 w-16 text-acc" />
          <h2 className="mt-3.5 text-[34px] font-semibold tracking-[-0.028em]">Lien envoyé</h2>
          <p className="mt-2.5 text-base leading-normal text-ink2">
            Si le {form.getValues('phone')} est associé à un compte, vous recevrez un SMS avec les instructions pour
            réinitialiser votre mot de passe.
          </p>
          <Button asChild variant="outline" className="mt-[22px] h-[50px] px-[22px] text-[15px] font-medium">
            <Link to="/login" className="no-underline">Retour à la connexion</Link>
          </Button>
        </div>
      )}
    </AuthShell>
  );
}
