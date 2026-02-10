import { z } from 'zod';

// Ethiopian phone number validation
const ethiopianPhoneRegex = /^(\+251|251|0)?[79]\d{8}$/;

// Password strength validation
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/\d/, "Password must contain at least one number")
  .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character");

// Ethiopian phone validation with normalization
export const ethiopianPhoneSchema = z
  .string()
  .min(1, "Phone number is required")
  .refine((phone) => {
    return ethiopianPhoneRegex.test(phone.replace(/\s/g, ''));
  }, "Please enter a valid Ethiopian phone number");

// Signup form validation schema
export const signupSchema = z.object({
  businessName: z
    .string()
    .min(2, "Business name must be at least 2 characters")
    .max(100, "Business name must be less than 100 characters")
    .regex(/^[a-zA-Z0-9\s\-&.,'()]+$/, "Business name contains invalid characters"),
  
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must be less than 50 characters")
    .regex(/^[a-zA-Z\s\-']+$/, "First name can only contain letters, spaces, hyphens, and apostrophes"),
  
  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must be less than 50 characters")
    .regex(/^[a-zA-Z\s\-']+$/, "Last name can only contain letters, spaces, hyphens, and apostrophes"),
  
  email: z
    .string()
    .email("Please enter a valid email address")
    .min(5, "Email must be at least 5 characters")
    .max(100, "Email must be less than 100 characters"),
  
  password: passwordSchema,
  
  confirmPassword: z.string(),
  
  phone: ethiopianPhoneSchema,
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type SignupFormData = z.infer<typeof signupSchema>;

// Password strength checker
export const getPasswordStrength = (password: string): {
  score: number;
  label: string;
  color: string;
  requirements: { met: boolean; text: string }[];
} => {
  const requirements = [
    { met: password.length >= 8, text: "At least 8 characters" },
    { met: /[a-z]/.test(password), text: "One lowercase letter" },
    { met: /[A-Z]/.test(password), text: "One uppercase letter" },
    { met: /\d/.test(password), text: "One number" },
    { met: /[!@#$%^&*(),.?":{}|<>]/.test(password), text: "One special character" },
  ];

  const score = requirements.filter(req => req.met).length;
  
  let label = "";
  let color = "";
  
  switch (score) {
    case 0:
    case 1:
      label = "Very Weak";
      color = "bg-red-500";
      break;
    case 2:
      label = "Weak";
      color = "bg-orange-500";
      break;
    case 3:
      label = "Fair";
      color = "bg-yellow-500";
      break;
    case 4:
      label = "Good";
      color = "bg-blue-500";
      break;
    case 5:
      label = "Strong";
      color = "bg-green-500";
      break;
    default:
      label = "Very Weak";
      color = "bg-red-500";
  }

  return { score, label, color, requirements };
};

// Normalize Ethiopian phone number
export const normalizeEthiopianPhone = (phone: string): string => {
  if (!phone) return '';
  
  // Remove all spaces and non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  // Handle different formats
  if (cleaned.startsWith('+251')) {
    return cleaned;
  } else if (cleaned.startsWith('251')) {
    return '+' + cleaned;
  } else if (cleaned.startsWith('0')) {
    return '+251' + cleaned.substring(1);
  } else if (cleaned.match(/^[79]\d{8}$/)) {
    return '+251' + cleaned;
  }
  
  return phone; // Return original if no pattern matches
};

// Validate individual field
export const validateField = (fieldName: keyof SignupFormData, value: any, allValues?: Partial<SignupFormData>): string | null => {
  try {
    if (fieldName === 'confirmPassword' && allValues) {
      // Special handling for confirm password
      if (value !== allValues.password) {
        return "Passwords don't match";
      }
      return null;
    }
    
    const fieldSchema = signupSchema.shape[fieldName];
    if (!fieldSchema) {
      return null; // Field doesn't exist in schema
    }
    
    fieldSchema.parse(value);
    return null;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.issues?.[0]?.message || 'Invalid input';
    }
    return 'Invalid input';
  }
};