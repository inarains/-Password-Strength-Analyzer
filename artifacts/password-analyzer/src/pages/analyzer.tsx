import { useState, useEffect } from 'react';
import { Eye, EyeOff, ShieldAlert, ShieldCheck, Copy, RefreshCw, Info, Lock, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { analyzePassword, generatePassword } from '../lib/password-analyzer';
import { cn } from '../lib/utils';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function Analyzer() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [analysis, setAnalysis] = useState(analyzePassword(''));

  // Generator State
  const [genLength, setGenLength] = useState([16]);
  const [genOpts, setGenOpts] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true
  });
  const [generatedCopied, setGeneratedCopied] = useState(false);

  useEffect(() => {
    setAnalysis(analyzePassword(password));
  }, [password]);

  const handleGenerate = () => {
    const pwd = generatePassword(genLength[0], genOpts);
    if (pwd) {
      setPassword(pwd);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(password);
      setGeneratedCopied(true);
      setTimeout(() => setGeneratedCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const scoreColors = [
    'bg-strength-very-weak',
    'bg-strength-weak',
    'bg-strength-fair',
    'bg-strength-strong',
    'bg-strength-very-strong'
  ];

  const scoreTextColors = [
    'text-destructive',
    'text-orange-500',
    'text-yellow-500',
    'text-green-500',
    'text-emerald-500'
  ];

  const currentScoreColor = password ? scoreColors[analysis.score] : 'bg-muted';
  const currentScoreTextColor = password ? scoreTextColors[analysis.score] : 'text-muted-foreground';

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="space-y-2 mb-12">
          <div className="flex items-center gap-3 text-primary mb-2">
            <Lock className="w-8 h-8" />
            <h1 className="text-3xl font-bold tracking-tight">VaultTech Password Auditor</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl text-lg">
            Client-side cryptographic strength analysis. 
            <span className="text-foreground font-medium ml-1">No data ever leaves your device.</span>
          </p>
        </header>

        <div className="grid md:grid-cols-[1fr_350px] gap-8 items-start">
          
          {/* Main Analysis Column */}
          <div className="space-y-8">
            
            {/* Input Section */}
            <div className="space-y-4">
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter a password to analyze..."
                  className="w-full bg-card border border-border rounded-lg px-4 py-4 text-lg font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm"
                  autoComplete="off"
                  spellCheck="false"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Strength Meter */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm font-medium">
                  <span className="text-muted-foreground uppercase tracking-wider text-xs font-bold">Strength</span>
                  <span className={cn("uppercase tracking-wider text-xs font-bold transition-colors", currentScoreTextColor)}>
                    {password ? analysis.label : 'Waiting for input'}
                  </span>
                </div>
                <div className="flex gap-2 h-2">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={cn(
                        "flex-1 rounded-full transition-all duration-500",
                        password && i <= analysis.score ? currentScoreColor : "bg-muted"
                      )}
                    />
                  ))}
                </div>
                {password && (
                  <div className="flex justify-between items-center text-xs text-muted-foreground font-mono pt-1">
                    <span>Entropy: {analysis.entropy.toFixed(1)} bits</span>
                  </div>
                )}
              </div>
            </div>

            {password.length > 0 && (
              <div className="animate-in fade-in slide-in-from-top-4 duration-500 space-y-8">
                
                {/* Time to Crack */}
                <div className="bg-card border border-border rounded-lg p-6 space-y-6">
                  <h3 className="flex items-center gap-2 text-lg font-semibold border-b border-border pb-4">
                    <Clock className="w-5 h-5 text-primary" />
                    Estimated Time to Crack
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Online (Throttled)</div>
                      <div className="font-mono font-medium text-lg">{analysis.crackTimes.onlineThrottled}</div>
                      <div className="text-xs text-muted-foreground">100 / hour</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Online (Unthrottled)</div>
                      <div className="font-mono font-medium text-lg">{analysis.crackTimes.onlineUnthrottled}</div>
                      <div className="text-xs text-muted-foreground">10k / second</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Offline (Fast Hash)</div>
                      <div className="font-mono font-medium text-lg">{analysis.crackTimes.offlineFastHash}</div>
                      <div className="text-xs text-muted-foreground">10B / second</div>
                    </div>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="bg-card border border-border rounded-lg p-6 space-y-6">
                  <h3 className="flex items-center gap-2 text-lg font-semibold border-b border-border pb-4">
                    {analysis.recommendations.length > 0 && analysis.score < 4 ? (
                      <ShieldAlert className="w-5 h-5 text-orange-500" />
                    ) : (
                      <ShieldCheck className="w-5 h-5 text-emerald-500" />
                    )}
                    Analysis & Recommendations
                  </h3>
                  
                  <ul className="space-y-3">
                    {analysis.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm">
                        <span className="mt-0.5 text-primary">•</span>
                        <span className="leading-relaxed">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>
            )}
            
            {!password && (
              <div className="bg-card/50 border border-border/50 rounded-lg p-6 text-center text-muted-foreground flex flex-col items-center justify-center min-h-[200px] border-dashed">
                <ShieldAlert className="w-8 h-8 mb-4 opacity-50" />
                <p>Awaiting input to begin cryptographic analysis.</p>
              </div>
            )}

          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Checklist */}
            <div className="bg-card border border-border rounded-lg p-5 space-y-4">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">Criteria Checklist</h3>
              <div className="space-y-3">
                {[
                  { key: 'length', label: '12+ Characters' },
                  { key: 'uppercase', label: 'Uppercase Letters' },
                  { key: 'lowercase', label: 'Lowercase Letters' },
                  { key: 'numbers', label: 'Numbers' },
                  { key: 'symbols', label: 'Symbols' },
                  { key: 'noCommonPatterns', label: 'No Common Patterns' }
                ].map((item) => {
                  const passed = analysis.checks[item.key as keyof typeof analysis.checks];
                  return (
                    <div key={item.key} className={cn("flex items-center gap-3 text-sm transition-colors duration-300", passed ? "text-foreground" : "text-muted-foreground opacity-60")}>
                      {passed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                      {item.label}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Generator */}
            <div className="bg-card border border-border rounded-lg p-5 space-y-6">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <RefreshCw className="w-4 h-4" /> Secure Generator
              </h3>
              
              <div className="space-y-5">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm">Length</Label>
                    <span className="font-mono text-xs">{genLength[0]}</span>
                  </div>
                  <Slider 
                    value={genLength} 
                    onValueChange={setGenLength} 
                    max={64} 
                    min={8} 
                    step={1} 
                    className="py-2"
                  />
                </div>

                <div className="space-y-3">
                  {[
                    { key: 'uppercase', label: 'Uppercase (A-Z)' },
                    { key: 'lowercase', label: 'Lowercase (a-z)' },
                    { key: 'numbers', label: 'Numbers (0-9)' },
                    { key: 'symbols', label: 'Symbols (!@#$)' }
                  ].map(opt => (
                    <div key={opt.key} className="flex items-center justify-between">
                      <Label htmlFor={`opt-${opt.key}`} className="text-sm font-normal cursor-pointer">{opt.label}</Label>
                      <Switch 
                        id={`opt-${opt.key}`} 
                        checked={genOpts[opt.key as keyof typeof genOpts]}
                        onCheckedChange={(c) => {
                          const newOpts = { ...genOpts, [opt.key]: c };
                          // Ensure at least one is checked
                          if (!Object.values(newOpts).some(Boolean)) return;
                          setGenOpts(newOpts);
                        }}
                      />
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button onClick={handleGenerate} className="w-full" variant="secondary">
                    Generate
                  </Button>
                  <Button 
                    onClick={copyToClipboard} 
                    variant="outline" 
                    disabled={!password}
                    className="shrink-0 px-3"
                    title="Copy to clipboard"
                  >
                    {generatedCopied ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Education Section */}
        <section className="mt-16 border-t border-border pt-12 space-y-8">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Info className="w-6 h-6 text-primary" />
            Security Best Practices
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-card/50 border border-border rounded-lg p-5 space-y-3">
              <h4 className="font-semibold text-primary">Use a Password Manager</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Human memory is not built to securely store unique, 16+ character random strings for every service. A password manager generates, stores, and autofills them for you.
              </p>
            </div>
            <div className="bg-card/50 border border-border rounded-lg p-5 space-y-3">
              <h4 className="font-semibold text-primary">Never Reuse Passwords</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                If a single service gets breached, attackers will test that password across your other accounts (credential stuffing). Unique passwords isolate the damage.
              </p>
            </div>
            <div className="bg-card/50 border border-border rounded-lg p-5 space-y-3">
              <h4 className="font-semibold text-primary">Enable 2FA Everywhere</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Two-Factor Authentication (especially hardware keys or authenticator apps) protects your account even if the password is stolen or guessed.
              </p>
            </div>
            <div className="bg-card/50 border border-border rounded-lg p-5 space-y-3">
              <h4 className="font-semibold text-primary">Consider Passphrases</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                For the master password you must remember, use 4-5 random words (e.g., "correct horse battery staple"). They offer high entropy but remain memorable.
              </p>
            </div>
            <div className="bg-card/50 border border-border rounded-lg p-5 space-y-3">
              <h4 className="font-semibold text-primary">Avoid Personal Info</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Pet names, birthdays, and sports teams are easily discoverable via social media and are the first things targeted spear-phishing attacks will try.
              </p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
