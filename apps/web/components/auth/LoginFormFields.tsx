import { AlertCircle, Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

export interface LoginFormFieldsProps {
  email: string; setEmail: (val: string) => void;
  password: string; setPassword: (val: string) => void;
  showPassword: boolean; setShowPassword: (val: boolean) => void;
  loading: boolean; onSubmit: (e: React.FormEvent) => void;
  emailError?: string; passwordError?: string;
}

const FOCUS_RING = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-grape";
const INPUT_CLASS = `w-full pl-10 h-[40px] bg-surface border rounded-md text-[14px] text-text-primary placeholder-text-muted focus:border-grape focus:ring-[3px] focus:ring-grape-soft ${FOCUS_RING} transition-all`;

function renderError(id: string, message?: string) {
  if (!message) return null;
  return (
    <p id={id} className="text-[11px] text-danger mt-1 flex items-center gap-1">
      <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      <span className="sr-only">Error: </span><span>{message}</span>
    </p>
  );
}

export function LoginFormFields({
  email, setEmail, password, setPassword, showPassword, setShowPassword,
  loading, onSubmit, emailError, passwordError,
}: LoginFormFieldsProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="login-email" className="block text-[12px] font-medium text-text-primary">
          Correo electrónico
        </label>
        <div className="relative">
          <Mail className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
          <input
            id="login-email" name="email" type="email" inputMode="email"
            autoComplete="email" autoCorrect="off" autoCapitalize="none" spellCheck={false}
            value={email} onChange={(e) => setEmail(e.target.value)} required
            aria-invalid={Boolean(emailError)} aria-describedby={emailError ? "login-email-error" : undefined}
            placeholder="tu@negocio.com"
            className={cn(INPUT_CLASS, "pr-3.5", emailError ? "border-danger" : "border-border")}
          />
        </div>
        {renderError("login-email-error", emailError)}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="login-password" className="block text-[12px] font-medium text-text-primary">
            Contraseña
          </label>
          <span className="text-[12px] text-grape hover:underline cursor-pointer">
            ¿Olvidaste tu contraseña?
          </span>
        </div>
        <div className="relative">
          <Lock className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
          <input
            id="login-password" name="password" type={showPassword ? "text" : "password"}
            autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)}
            required aria-invalid={Boolean(passwordError)}
            aria-describedby={passwordError ? "login-password-error" : undefined}
            placeholder="••••••••"
            className={cn(INPUT_CLASS, "pr-10", passwordError ? "border-danger" : "border-border")}
          />
          <button
            type="button" onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"} aria-pressed={showPassword}
            className={cn("absolute right-3.5 top-1/2 -translate-y-1/2 rounded-sm text-text-muted hover:text-text-primary transition-colors", FOCUS_RING)}
          >
            {showPassword ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
          </button>
        </div>
        {renderError("login-password-error", passwordError)}
      </div>

      <button
        type="submit" disabled={loading}
        className={cn("w-full h-[40px] rounded-md bg-grape hover:opacity-90 text-white font-medium text-[14px] flex items-center justify-center gap-2 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed mt-2", FOCUS_RING)}
      >
        {loading ? (<><Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />Iniciando...</>) : "Iniciar sesión"}
      </button>
    </form>
  );
}
