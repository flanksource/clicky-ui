export interface JsonSchemaFormError {
  instancePath: string;
  schemaPath?: string;
  keyword?: string;
  message: string;
}

export interface FieldInstancePath {
  /**
   * RFC 6901 JSON Pointer for this field in the form's root value. Container
   * renderers set this explicitly for array indices and map keys.
   */
  instancePath?: string;
}

export interface FormErrorContext {
  // RFC 6901 pointer for the value currently being rendered.
  instancePath: string;
  // Authoritative validation errors supplied by the host.
  errors: JsonSchemaFormError[];
}

export interface FormErrorProps {
  /**
   * Authoritative server validation errors keyed by RFC 6901 JSON Pointer.
   * Exact field matches render below their controls; root and unmatched errors
   * render in the form summary.
   */
  errors?: JsonSchemaFormError[];
}
