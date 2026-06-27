/**
 * Custom form validation hooks
 * Handles form state, validation, and error management
 */

import {
    TouchedFields,
    ValidationErrors,
    validators,
} from "@/shared/validators";
import { useCallback, useState } from "react";

/**
 * Generic form validation hook
 * Manages form state with automatic validation
 */
export function useFormValidation<T extends Record<string, any>>(
  initialValues: T,
  validationRules: Record<keyof T, (value: any, formValues?: T) => string>,
) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<ValidationErrors<T>>({});
  const [touched, setTouched] = useState<TouchedFields<T>>({});

  const validateField = useCallback(
    (fieldName: keyof T, fieldValue: any) => {
      const rule = validationRules[fieldName];
      if (rule) {
        return rule(fieldValue, values);
      }
      return "";
    },
    [validationRules, values],
  );

  const handleChange = useCallback(
    (fieldName: keyof T, value: any) => {
      setValues((prev) => ({ ...prev, [fieldName]: value }));
      if (touched[fieldName]) {
        const error = validateField(fieldName, value);
        setErrors((prev) => ({ ...prev, [fieldName]: error }));
      }
    },
    [touched, validateField],
  );

  const handleBlur = useCallback(
    (fieldName: keyof T) => {
      setTouched((prev) => ({ ...prev, [fieldName]: true }));
      const error = validateField(fieldName, values[fieldName]);
      setErrors((prev) => ({ ...prev, [fieldName]: error }));
    },
    [validateField, values],
  );

  const validateAll = useCallback(() => {
    const newErrors: ValidationErrors<T> = {};
    let isValid = true;

    (Object.keys(validationRules) as Array<keyof T>).forEach((fieldName) => {
      const error = validateField(fieldName, values[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    });

    setTouched(
      Object.keys(validationRules).reduce((acc, key) => {
        acc[key as keyof T] = true;
        return acc;
      }, {} as TouchedFields<T>),
    );
    setErrors(newErrors);
    return isValid;
  }, [validateField, validationRules, values]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  const setFieldValue = useCallback((fieldName: keyof T, value: any) => {
    setValues((prev) => ({ ...prev, [fieldName]: value }));
  }, []);

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAll,
    reset,
    setFieldValue,
  };
}

/**
 * Login form hook
 */
export function useLoginForm() {
  return useFormValidation(
    { email: "", password: "" },
    {
      email: validators.email,
      password: validators.passwordLogin,
    },
  );
}

/**
 * Sign up form hook
 */
export function useSignUpForm() {
  return useFormValidation(
    {
      full_name: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
    },
    {
      full_name: validators.full_name,
      email: validators.email,
      phone: validators.phone,

      password: validators.passwordStrong,

      confirmPassword: (confirmPassword, formValues) =>
        validators.passwordMatch(
          confirmPassword,
          formValues?.password || ""
        ),
    },
  );
}

/**
 * Reset password form hook
 */
export function useResetPasswordForm() {
  return useFormValidation(
    { newPassword: "", confirmPassword: "" },
    {
      newPassword: validators.passwordStrong,
      confirmPassword: (confirmPassword, formValues) =>
        validators.passwordMatch(
          confirmPassword,
          formValues?.newPassword || "",
        ),
    },
  );
}

/**
 * Change password form hook
 */
export function useChangePasswordForm() {
  return useFormValidation(
    { currentPassword: "", newPassword: "", confirmPassword: "" },
    {
      currentPassword: validators.passwordLogin,
      newPassword: validators.passwordStrong,
      confirmPassword: (confirmPassword, formValues) =>
        validators.passwordMatch(
          confirmPassword,
          formValues?.newPassword || "",
        ),
    },
  );
}

/**
 * Forgot password form hook
 */
export function useForgotPasswordForm() {
  return useFormValidation(
    { email: "" },
    {
      email: validators.email,
    },
  );
}

/**
 * Verification code form hook
 */
export function useVerificationCodeForm() {
  return useFormValidation(
    { code: "" },
    {
      code: validators.verificationCode,
    },
  );
}
