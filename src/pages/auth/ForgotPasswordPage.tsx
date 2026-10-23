import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Phone, ArrowLeft, CheckCircle, ArrowRight, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

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
    <div className="min-h-screen flex">

      {/* ── Côté gauche — Branding (identique à LoginPage) ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <h1 className="text-5xl font-bold leading-tight mb-6">
            Récupérez l'accès<br />
            <span className="text-accent">à votre espace</span>
          </h1>

          <p className="text-xl text-primary-foreground/80 mb-12 max-w-md">
            Pas de panique. Entrez votre numéro de téléphone et nous vous enverrons
            un SMS et un Mail pour réinitialiser votre mot de passe.
          </p>

          <div className="space-y-4">
            {[
              'Procédure rapide et sécurisée',
              'SMS et Mail envoyés en quelques secondes',
              'Lien valable 30 minutes',
              'Support disponible si besoin',
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center">
                  <ArrowRight className="w-4 h-4 text-accent" />
                </div>
                <span className="text-primary-foreground/90">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Côté droit — Formulaire ── */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">

          {/* Logo */}
          <div className="text-center mb-6 -mt-16">
            <img
              src="/images/logo/logo.png"
              alt="Logo"
              className="mx-auto mb-6 h-36 w-auto"
            />
            <p className="text-muted-foreground">
              {isSubmitted
                ? 'Vérifiez vos SMS'
                : 'Réinitialisez votre mot de passe'}
            </p>
          </div>

          {!isSubmitted ? (
            /* ── Formulaire ── */
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Numéro de téléphone</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <Input
                            placeholder="+241 XX XX XX XX"
                            className="pl-11 h-12"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full h-12 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold text-base"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Envoi en cours...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      Envoyer le lien
                    </div>
                  )}
                </Button>
              </form>
            </Form>
          ) : (
            /* ── État succès ── */
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Lien envoyé !</h2>
              <p className="text-muted-foreground">
                Si ce numéro est associé à un compte, vous recevrez un SMS avec
                les instructions pour réinitialiser votre mot de passe.
              </p>
            </div>
          )}

          {/* Retour connexion */}
          <Link
            to="/login"
            className="flex items-center justify-center gap-2 mt-8 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  );
}