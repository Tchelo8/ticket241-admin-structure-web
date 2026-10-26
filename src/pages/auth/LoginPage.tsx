import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Phone, Lock } from "@/components/icons";
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { auth, sauvegarderSession } from '@/lib/Transmission';
import { AuthShell, AuthField, authInputClass } from '@/components/auth/AuthShell';

const loginSchema = z.object({
  phone: z.string()
    .min(8, 'Le numéro de téléphone doit contenir au moins 8 chiffres')
    .regex(/^[0-9+\s-]+$/, 'Format de numéro invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      phone: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
  setIsLoading(true);

  const { succes, donnees } = await auth.connexion({
    phone: data.phone,
    password: data.password,
  });

  setIsLoading(false);

  if (!succes || !donnees) return;

  sauvegarderSession(donnees.token, {
    phone:       donnees.phone,
    email:       donnees.email,
    firstName:   donnees.firstName,
    lastName:    donnees.lastName,
    structureId: donnees.structureId,
    roles:       donnees.roles,
  });

  toast({
    title: "Connexion réussie",
    description: `Bienvenue ${donnees.firstName} !`,
  });

  navigate('/admin');
};

  return (
    <AuthShell>
      <div className="t-label !text-[10.5px] !font-bold !tracking-[0.2em]">Connexion</div>
      <h2 className="mt-2.5 text-[clamp(34px,4vw,44px)] font-semibold leading-[1.04] tracking-[-0.03em]">Bon retour.</h2>
      <p className="mt-2.5 text-base leading-normal text-ink2">Connectez-vous avec le numéro de votre structure.</p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-7" noValidate>
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem className="space-y-0">
                <FormLabel className="t-label !text-[11px]">Numéro de téléphone</FormLabel>
                <AuthField icon={<Phone className="h-[19px] w-[19px]" />}>
                  <FormControl>
                    <input
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
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

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="mt-4 space-y-0">
                <FormLabel className="t-label !text-[11px]">Mot de passe</FormLabel>
                <AuthField
                  icon={<Lock className="h-[19px] w-[19px]" />}
                  action={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                      className="flex text-ink3 transition-colors hover:text-ink"
                    >
                      {showPassword ? <EyeOff className="h-[19px] w-[19px]" /> : <Eye className="h-[19px] w-[19px]" />}
                    </button>
                  }
                >
                  <FormControl>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      className={authInputClass}
                      {...field}
                    />
                  </FormControl>
                </AuthField>
                <FormMessage className="mt-1.5" />
              </FormItem>
            )}
          />

          <div className="mt-3 flex justify-end">
            <Link to="/forgot-password" className="text-[13.5px] font-medium text-acc no-underline hover:underline">
              Mot de passe oublié ?
            </Link>
          </div>

          <Button type="submit" size="lg" className="mt-[22px] w-full" disabled={isLoading}>
            {isLoading ? (
              <span className="flex items-center gap-2.5">
                <span className="h-[18px] w-[18px] animate-spin rounded-full border-[2.5px] border-white/35 border-t-white" />
                Connexion…
              </span>
            ) : (
              'Se connecter'
            )}
          </Button>
        </form>
      </Form>

      <p className="mt-[22px] text-[13px] leading-normal text-ink3">
        Pas encore de compte organisateur ? Contactez l’équipe Ticket241 pour ouvrir votre structure.
      </p>
    </AuthShell>
  );
}
