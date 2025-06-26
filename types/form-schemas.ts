/**
 * Form validation schemas and types
 */

import { z } from "zod"

// Figma URL validation schema
export const figmaUrlSchema = z.object({
  url: z
    .string()
    .min(1, "URL is required")
    .url("Please enter a valid URL")
    .refine(
      (url) => {
        const figmaUrlPattern = /^https:\/\/(www\.)?figma\.com\/(file|proto|design)\/[a-zA-Z0-9]+/
        return figmaUrlPattern.test(url)
      },
      {
        message: "Please enter a valid Figma file URL",
      },
    ),
  nodeId: z.string().optional(),
  version: z.string().optional(),
})

// API Key validation schema
export const apiKeySchema = z.object({
  apiKey: z
    .string()
    .min(1, "API key is required")
    .min(40, "API key must be at least 40 characters")
    .max(200, "API key is too long")
    .regex(/^figd_[a-zA-Z0-9_-]+$/, "Invalid Figma API key format"),
  keyName: z.string().min(1, "Key name is required").max(50, "Key name is too long"),
  description: z.string().max(200, "Description is too long").optional(),
  expiresAt: z.date().optional(),
})

// File upload schema
export const fileUploadSchema = z.object({
  files: z
    .array(z.instanceof(File))
    .min(1, "At least one file is required")
    .max(10, "Maximum 10 files allowed")
    .refine(
      (files) => files.every((file) => file.size <= 100 * 1024 * 1024), // 100MB
      "File size must be less than 100MB",
    )
    .refine(
      (files) => files.every((file) => ["application/json", "text/plain"].includes(file.type)),
      "Only JSON and text files are allowed",
    ),
  processInBackground: z.boolean().default(false),
  priority: z.enum(["low", "normal", "high"]).default("normal"),
})

// Batch import schema
export const batchImportSchema = z.object({
  urls: z.array(figmaUrlSchema.shape.url).min(1, "At least one URL is required").max(50, "Maximum 50 URLs allowed"),
  apiKey: apiKeySchema.shape.apiKey,
  options: z.object({
    includeComponents: z.boolean().default(true),
    includeStyles: z.boolean().default(true),
    includeAssets: z.boolean().default(false),
    processInParallel: z.boolean().default(true),
    maxConcurrency: z.number().min(1).max(10).default(3),
  }),
})

// Connection settings schema
export const connectionSettingsSchema = z.object({
  timeout: z.number().min(1000).max(60000).default(30000), // 1-60 seconds
  retryAttempts: z.number().min(0).max(10).default(3),
  retryDelay: z.number().min(100).max(10000).default(1000), // 100ms - 10s
  enableCaching: z.boolean().default(true),
  cacheTimeout: z.number().min(60).max(86400).default(3600), // 1 minute - 24 hours
  enableRateLimiting: z.boolean().default(true),
  maxRequestsPerMinute: z.number().min(1).max(1000).default(60),
})

// Export settings schema
export const exportSettingsSchema = z.object({
  format: z.enum(["json", "typescript", "javascript", "csv", "xml"]).default("json"),
  includeMetadata: z.boolean().default(true),
  includeImages: z.boolean().default(false),
  compression: z.enum(["none", "gzip", "brotli"]).default("none"),
  filename: z.string().min(1, "Filename is required").max(100, "Filename is too long"),
  destination: z.enum(["download", "clipboard", "api"]).default("download"),
})

// Security settings schema
export const securitySettingsSchema = z.object({
  enableEncryption: z.boolean().default(true),
  encryptionAlgorithm: z.enum(["AES-256-GCM", "ChaCha20-Poly1305"]).default("AES-256-GCM"),
  enableAuditLogging: z.boolean().default(true),
  sessionTimeout: z.number().min(300).max(86400).default(3600), // 5 minutes - 24 hours
  enableMFA: z.boolean().default(false),
  allowedOrigins: z.array(z.string().url()).default([]),
  ipWhitelist: z.array(z.string().ip()).default([]),
})

// Team collaboration schema
export const collaborationSettingsSchema = z.object({
  enableSharing: z.boolean().default(false),
  shareLevel: z.enum(["view", "comment", "edit"]).default("view"),
  allowPublicAccess: z.boolean().default(false),
  expiresAt: z.date().optional(),
  allowedUsers: z.array(z.string().email()).default([]),
  enableComments: z.boolean().default(true),
  enableVersionHistory: z.boolean().default(true),
})

// Form state types
export type FigmaUrlFormData = z.infer<typeof figmaUrlSchema>
export type ApiKeyFormData = z.infer<typeof apiKeySchema>
export type FileUploadFormData = z.infer<typeof fileUploadSchema>
export type BatchImportFormData = z.infer<typeof batchImportSchema>
export type ConnectionSettingsData = z.infer<typeof connectionSettingsSchema>
export type ExportSettingsData = z.infer<typeof exportSettingsSchema>
export type SecuritySettingsData = z.infer<typeof securitySettingsSchema>
export type CollaborationSettingsData = z.infer<typeof collaborationSettingsSchema>

// Validation result types
export interface ValidationResult<T> {
  success: boolean
  data?: T
  errors?: ValidationError[]
}

export interface ValidationError {
  field: string
  message: string
  code: string
}

// Form submission states
export interface FormSubmissionState {
  isSubmitting: boolean
  isSuccess: boolean
  isError: boolean
  error?: string
  submittedAt?: Date
}

// Advanced validation options
export interface ValidationOptions {
  validateOnChange: boolean
  validateOnBlur: boolean
  validateOnSubmit: boolean
  debounceMs: number
  showErrorsImmediately: boolean
  enableAsyncValidation: boolean
}

// Custom validation rules
export interface CustomValidationRule<T> {
  name: string
  validator: (value: T, formData: any) => Promise<boolean> | boolean
  message: string
  dependencies?: string[]
}

// Form field metadata
export interface FormFieldMetadata {
  label: string
  placeholder?: string
  helpText?: string
  required: boolean
  disabled: boolean
  readonly: boolean
  autoComplete?: string
  inputMode?: string
  pattern?: string
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
  step?: number
}

// Form configuration
export interface FormConfiguration<T> {
  schema: z.ZodSchema<T>
  defaultValues: Partial<T>
  validationOptions: ValidationOptions
  fieldMetadata: Record<keyof T, FormFieldMetadata>
  customValidators?: CustomValidationRule<any>[]
  onSubmit: (data: T) => Promise<void> | void
  onError?: (errors: ValidationError[]) => void
  onSuccess?: (data: T) => void
}
