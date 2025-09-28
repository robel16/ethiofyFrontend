import * as React from "react";
import { useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  name: string;
  label?: string;
  placeholder?: string;
  type?: "text" | "email" | "password" | "number" | "tel" | "url";
  required?: boolean;
  className?: string;
  description?: string;
}

export function FormField({
  name,
  label,
  placeholder,
  type = "text",
  required = false,
  className,
  description,
}: FormFieldProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const error = errors[name];

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label
          htmlFor={name}
          className={
            required
              ? "after:ml-0.5 after:text-red-500 after:content-['*']"
              : ""
          }
        >
          {label}
        </Label>
      )}
      <Input
        id={name}
        type={type}
        placeholder={placeholder}
        {...register(name)}
        className={error ? "border-red-500" : ""}
      />
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      {error && (
        <p className="text-sm text-red-500">{error.message as string}</p>
      )}
    </div>
  );
}

interface FormSelectFieldProps {
  name: string;
  label?: string;
  placeholder?: string;
  options: { value: string; label: string }[];
  required?: boolean;
  className?: string;
  description?: string;
}

export function FormSelectField({
  name,
  label,
  placeholder,
  options,
  required = false,
  className,
  description,
}: FormSelectFieldProps) {
  const {
    setValue,
    watch,
    formState: { errors },
  } = useFormContext();

  const value = watch(name);
  const error = errors[name];

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label
          htmlFor={name}
          className={
            required
              ? "after:ml-0.5 after:text-red-500 after:content-['*']"
              : ""
          }
        >
          {label}
        </Label>
      )}
      <Select value={value} onValueChange={(value) => setValue(name, value)}>
        <SelectTrigger className={error ? "border-red-500" : ""}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      {error && (
        <p className="text-sm text-red-500">{error.message as string}</p>
      )}
    </div>
  );
}

interface FormTextareaFieldProps {
  name: string;
  label?: string;
  placeholder?: string;
  rows?: number;
  required?: boolean;
  className?: string;
  description?: string;
}

export function FormTextareaField({
  name,
  label,
  placeholder,
  rows = 3,
  required = false,
  className,
  description,
}: FormTextareaFieldProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const error = errors[name];

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label
          htmlFor={name}
          className={
            required
              ? "after:ml-0.5 after:text-red-500 after:content-['*']"
              : ""
          }
        >
          {label}
        </Label>
      )}
      <textarea
        id={name}
        rows={rows}
        placeholder={placeholder}
        {...register(name)}
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          error ? "border-red-500" : ""
        )}
      />
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      {error && (
        <p className="text-sm text-red-500">{error.message as string}</p>
      )}
    </div>
  );
}
