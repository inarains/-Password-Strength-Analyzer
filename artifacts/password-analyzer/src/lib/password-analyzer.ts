export interface PasswordAnalysis {
  score: number; // 0 to 4
  entropy: number;
  label: 'Very Weak' | 'Weak' | 'Fair' | 'Strong' | 'Very Strong';
  crackTimes: {
    onlineThrottled: string;
    onlineUnthrottled: string;
    offlineFastHash: string;
  };
  checks: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    numbers: boolean;
    symbols: boolean;
    noCommonPatterns: boolean;
  };
  recommendations: string[];
}

const COMMON_PASSWORDS = new Set([
  'password', '123456', '123456789', '12345678', '12345', 'qwerty', 'password123',
  'admin', 'iloveyou', '1234567', '1234567890', '1234567890', '123123', 'admin123',
  '111111', 'letmein', 'password1', '1234', 'qazwsx', 'welcome', 'monkey', 'sunshine'
]);

const KEYBOARD_PATTERNS = [
  'qwerty', 'asdfgh', 'zxcvbn', 'qazwsx', 'edcrfv', 'tgbyhn', 'yhnujm', 'ujmik', 'ikol',
  '12345', '23456', '34567', '45678', '56789', '67890', '09876', '98765', '87654', '76543', '65432', '54321'
];

function calculateEntropy(password: string): number {
  if (!password) return 0;
  
  let poolSize = 0;
  if (/[a-z]/.test(password)) poolSize += 26;
  if (/[A-Z]/.test(password)) poolSize += 26;
  if (/[0-9]/.test(password)) poolSize += 10;
  if (/[^a-zA-Z0-9]/.test(password)) poolSize += 32;

  if (poolSize === 0) return 0;

  return password.length * Math.log2(poolSize);
}

function formatCrackTime(seconds: number): string {
  if (seconds < 1) return 'less than a second';
  if (seconds < 60) return `${Math.round(seconds)} seconds`;
  
  const minutes = seconds / 60;
  if (minutes < 60) return `${Math.round(minutes)} minutes`;
  
  const hours = minutes / 60;
  if (hours < 24) return `${Math.round(hours)} hours`;
  
  const days = hours / 24;
  if (days < 30) return `${Math.round(days)} days`;
  
  const months = days / 30;
  if (months < 12) return `${Math.round(months)} months`;
  
  const years = months / 12;
  if (years < 100) return `${Math.round(years)} years`;
  if (years < 1000) return `${Math.round(years / 100) * 100} years`;
  
  return 'centuries';
}

export function analyzePassword(password: string): PasswordAnalysis {
  if (!password) {
    return {
      score: 0,
      entropy: 0,
      label: 'Very Weak',
      crackTimes: {
        onlineThrottled: 'instant',
        onlineUnthrottled: 'instant',
        offlineFastHash: 'instant'
      },
      checks: {
        length: false,
        uppercase: false,
        lowercase: false,
        numbers: false,
        symbols: false,
        noCommonPatterns: false
      },
      recommendations: ['Enter a password to begin analysis.']
    };
  }

  const entropy = calculateEntropy(password);
  
  const checks = {
    length: password.length >= 12,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    numbers: /[0-9]/.test(password),
    symbols: /[^a-zA-Z0-9]/.test(password),
    noCommonPatterns: true
  };

  const recommendations: string[] = [];
  let penalty = 0;

  // Pattern checks
  const lowerPass = password.toLowerCase();
  
  // Dictionary / Common
  if (COMMON_PASSWORDS.has(lowerPass)) {
    checks.noCommonPatterns = false;
    penalty += 3;
    recommendations.push('This is a highly common password and can be guessed instantly.');
  }

  // Keyboard patterns
  if (KEYBOARD_PATTERNS.some(p => lowerPass.includes(p))) {
    checks.noCommonPatterns = false;
    penalty += 1.5;
    recommendations.push('Contains a common keyboard pattern (e.g., "qwerty" or "12345").');
  }

  // Repeated characters (e.g., "aaaaa")
  if (/(.)\1{2,}/.test(password)) {
    checks.noCommonPatterns = false;
    penalty += 1;
    recommendations.push('Avoid repeating the same character multiple times.');
  }

  // Purely numeric
  if (/^[0-9]+$/.test(password)) {
    checks.noCommonPatterns = false;
    penalty += 2;
    recommendations.push('A password with only numbers is easily guessable. Add letters and symbols.');
  }

  // Common substitutions
  const unscrambled = lowerPass
    .replace(/@/g, 'a')
    .replace(/0/g, 'o')
    .replace(/1/g, 'i')
    .replace(/3/g, 'e')
    .replace(/!/g, 'i')
    .replace(/5/g, 's')
    .replace(/\$/g, 's');
    
  if (unscrambled !== lowerPass && COMMON_PASSWORDS.has(unscrambled)) {
    checks.noCommonPatterns = false;
    penalty += 2;
    recommendations.push('Using predictable substitutions (like "@" for "a") does not significantly increase security.');
  }

  // Basic checks recommendations
  if (!checks.length) {
    if (password.length < 8) {
      recommendations.push('Password is extremely short. Aim for at least 12-16 characters.');
    } else {
      recommendations.push('Increase length to 12+ characters for better security.');
    }
  }
  if (!checks.uppercase) recommendations.push('Add uppercase letters to increase complexity.');
  if (!checks.lowercase) recommendations.push('Add lowercase letters to increase complexity.');
  if (!checks.numbers) recommendations.push('Add numbers to increase complexity.');
  if (!checks.symbols) recommendations.push('Add symbols (e.g., !, @, #, $) to increase complexity.');

  if (recommendations.length === 0 && entropy > 60) {
    recommendations.push('Excellent password. Consider using a password manager to store it.');
  }

  // Score calculation based on entropy and penalties
  // Entropy ranges: <25 very weak, 25-45 weak, 45-65 fair, 65-85 strong, >85 very strong
  let rawScore = 0;
  if (entropy < 25) rawScore = 0;
  else if (entropy < 45) rawScore = 1;
  else if (entropy < 65) rawScore = 2;
  else if (entropy < 85) rawScore = 3;
  else rawScore = 4;

  rawScore -= penalty;
  const score = Math.max(0, Math.min(4, Math.floor(rawScore)));

  const labels: Array<PasswordAnalysis['label']> = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
  const label = labels[score];

  // Crack times estimation based on guesses (2^effectiveEntropy)
  // These are rough estimates for educational purposes.
  // A pattern-matched password (common word, keyboard walk, numeric-only, etc.)
  // is not actually searched via the full random charset space -- an attacker
  // tries dictionaries/pattern lists first, so each penalty point knocks
  // roughly 10x off the effective guess space (dictionaries/rulesets rank
  // these candidates extremely early). This keeps crack-time estimates
  // consistent with the weakness flags instead of contradicting them.
  const effectiveEntropy = Math.max(0, entropy - penalty * 10);
  const guesses = Math.pow(2, effectiveEntropy);
  
  // Online attack throttled: 100 guesses / hour (approx 0.027 guesses/sec)
  const onlineThrottledSeconds = guesses / 0.027;
  
  // Online attack unthrottled: 10,000 guesses / sec
  const onlineUnthrottledSeconds = guesses / 10000;
  
  // Offline fast hash (MD5/SHA1): 10 billion guesses / sec
  const offlineFastHashSeconds = guesses / 10000000000;

  return {
    score,
    entropy: effectiveEntropy,
    label,
    crackTimes: {
      onlineThrottled: formatCrackTime(onlineThrottledSeconds),
      onlineUnthrottled: formatCrackTime(onlineUnthrottledSeconds),
      offlineFastHash: formatCrackTime(offlineFastHashSeconds)
    },
    checks,
    recommendations
  };
}

export function generatePassword(length: number, options: { uppercase: boolean, lowercase: boolean, numbers: boolean, symbols: boolean }): string {
  let charset = '';
  if (options.lowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
  if (options.uppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (options.numbers) charset += '0123456789';
  if (options.symbols) charset += '!@#$%^&*()_+~`|}{[]:;?><,./-=';

  if (!charset) return '';

  let password = '';
  const array = new Uint32Array(length);
  crypto.getRandomValues(array);
  
  for (let i = 0; i < length; i++) {
    password += charset[array[i] % charset.length];
  }

  // Ensure at least one character from each selected set exists
  let finalPassword = password.split('');
  let guaranteeIndex = 0;
  
  if (options.lowercase) {
    finalPassword[guaranteeIndex++] = 'abcdefghijklmnopqrstuvwxyz'[crypto.getRandomValues(new Uint32Array(1))[0] % 26];
  }
  if (options.uppercase) {
    finalPassword[guaranteeIndex++] = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[crypto.getRandomValues(new Uint32Array(1))[0] % 26];
  }
  if (options.numbers) {
    finalPassword[guaranteeIndex++] = '0123456789'[crypto.getRandomValues(new Uint32Array(1))[0] % 10];
  }
  if (options.symbols) {
    const syms = '!@#$%^&*()_+~`|}{[]:;?><,./-=';
    finalPassword[guaranteeIndex++] = syms[crypto.getRandomValues(new Uint32Array(1))[0] % syms.length];
  }

  // Shuffle
  for (let i = finalPassword.length - 1; i > 0; i--) {
    const j = crypto.getRandomValues(new Uint32Array(1))[0] % (i + 1);
    [finalPassword[i], finalPassword[j]] = [finalPassword[j], finalPassword[i]];
  }

  return finalPassword.join('');
}
