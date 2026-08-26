/**
 * Vrinda Vihar — Phone Number Validation Utility
 * Validates Indian 10-digit mobile numbers, +91 prefixes, leading zeroes,
 * and valid international phone numbers (7 to 15 digits).
 */

export const validatePhoneNumber = (rawPhone) => {
  if (!rawPhone || !rawPhone.trim()) {
    return { isValid: false, message: 'Please enter your mobile or WhatsApp number.' };
  }

  const cleaned = rawPhone.trim().replace(/[\s\-\(\)]/g, '');
  const digitsOnly = cleaned.replace(/\D/g, '');

  let localDigits = digitsOnly;
  if (cleaned.startsWith('+91')) {
    localDigits = cleaned.slice(3).replace(/\D/g, '');
  } else if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) {
    localDigits = digitsOnly.slice(2);
  } else if (digitsOnly.length === 11 && digitsOnly.startsWith('0')) {
    localDigits = digitsOnly.slice(1);
  }

  // 10-digit Indian Mobile Number
  if (localDigits.length === 10) {
    if (/^[6-9]\d{9}$/.test(localDigits)) {
      return {
        isValid: true,
        formatted: `+91 ${localDigits.slice(0, 5)} ${localDigits.slice(5)}`,
        clean: `+91${localDigits}`
      };
    }
    return { isValid: false, message: 'Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.' };
  }

  // International phone numbers (7 to 15 digits)
  if (digitsOnly.length >= 7 && digitsOnly.length <= 15) {
    return {
      isValid: true,
      formatted: cleaned.startsWith('+') ? cleaned : `+${digitsOnly}`,
      clean: cleaned.startsWith('+') ? cleaned : `+${digitsOnly}`
    };
  }

  return { isValid: false, message: 'Please enter a valid 10-digit mobile number.' };
};
