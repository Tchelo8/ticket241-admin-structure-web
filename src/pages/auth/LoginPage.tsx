import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Ticket, Phone, Lock, ArrowRight } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';
import { auth, sauvegarderSession } from '@/lib/Transmission';

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
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          {/* Logo */}
          {/* <div className="flex items-center gap-3 mb-12">
            <div className="w-14 h-14 bg-accent rounded-xl flex items-center justify-center">
              <Ticket className="w-8 h-8 text-white" />
            </div>
            <span className="text-3xl font-bold">Ticket241</span>
          </div> */}

          {/* Main heading */}
          <h1 className="text-5xl font-bold leading-tight mb-6">
            Gérez vos événements<br />
            <span className="text-accent">en toute simplicité</span>
          </h1>

          {/* Description */}
          <p className="text-xl text-primary-foreground/80 mb-12 max-w-md">
            La plateforme de billetterie qui vous permet de créer, promouvoir et gérer vos événements de manière professionnelle.
          </p>

          {/* Features list */}
          <div className="space-y-4">
            {[
              'Tableau de bord intuitif',
              'Gestion complète des événements',
              'Statistiques en temps réel',
              'Paiements sécurisés',
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

      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          {/* Form header */}
          <div className="text-center mb-6 -mt-16">
            <img
              src="/images/logo/logo.png"
              alt="Logo"
              className="mx-auto mb-6 h-36 w-auto"
            />

            {/* <h2 className="text-3xl font-bold text-foreground mb-2">
              Connexion
            </h2> */}
            <p className="text-muted-foreground">
              Accédez à votre espace organisateur
            </p>
          </div>


          {/* Login form */}
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

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mot de passe</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          className="pl-11 pr-11 h-12"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Forgot password link */}
              <div className="flex justify-end">
                <Link
                  to="/forgot-password"
                  className="text-sm text-accent hover:text-accent/80 transition-colors font-medium"
                >
                  Mot de passe oublié ?
                </Link>
              </div>

              {/* Submit button */}
              <Button
                type="submit"
                className="w-full h-12 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold text-base"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Connexion en cours...
                  </div>
                ) : (
                  'Se connecter'
                )}
              </Button>
            </form>
          </Form>

          {/* Footer */}
          {/* <p className="mt-8 text-center text-sm text-muted-foreground">
            Vous n'avez pas de compte ?{' '}
            <Link
              to="/register"
              className="text-accent hover:text-accent/80 transition-colors font-medium"
            >
              Créer un compte
            </Link>
          </p> */}
        </div>
      </div>
    </div>
  );
}
