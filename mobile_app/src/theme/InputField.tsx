export interface InputFieldProps {
  label: string;

  value: string;

  onChangeText: (
    text: string
  ) => void;

  placeholder?: string;

  secureTextEntry?: boolean;

  keyboardType?:
    | "default"
    | "email-address"
    | "numeric"
    | "phone-pad";

  autoCapitalize?:
    | "none"
    | "sentences"
    | "words"
    | "characters";

  icon?: string;

  error?: string;

  editable?: boolean;

  maxLength?: number;

  multiline?: boolean;
}