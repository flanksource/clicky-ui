import type { ReactNode } from "react";
import type { FormSize } from "../../components/json-schema-form-size";
import type { JsonSchemaObject } from "../../components/json-schema-form-types";
import type { SpecRuntimeEditorProps } from "../ai/SpecRuntimeEditor";

export type FixtureEditorSize = FormSize;

export type FixtureFenceSchemas = Record<string, JsonSchemaObject>;

export type FixtureFrontmatterMode = "default" | "verification";

export type FixtureFrontmatterEditorOptions = Pick<
  SpecRuntimeEditorProps,
  | "models"
  | "families"
  | "tools"
  | "permissionCatalog"
  | "secretSelector"
  | "cliOptions"
> & {
  /** Verification fixtures inherit their parent runtime/workspace and cannot configure nested scoring. */
  mode?: FixtureFrontmatterMode | undefined;
};

export type FixtureFenceOption =
  | string
  | {
      info: string;
      label?: ReactNode;
      description?: ReactNode;
    };

export type FixtureEditorProps = {
  /** Controlled fixture markdown source. */
  value: string;
  /** Called with the serialized fixture markdown after an edit. */
  onChange: (markdown: string) => void;
  /**
   * Host-provided runner schemas keyed by logical fixture kind ("test", "lint")
   * or full fence info string ("yaml test", "yaml lint").
   * AI/reviewer instructions are markdown/source content, not fence schemas.
   */
  schemas?: FixtureFenceSchemas;
  /** Optional allow-list/order for the add-fence menu. Defaults to schema keys. */
  allowedFences?: readonly FixtureFenceOption[];
  /**
   * Enables a dialog for top-level fixture frontmatter. The dialog edits Gavel
   * `ai:` runtime options and fixture `env:` while preserving unrelated keys.
   */
  frontmatterEditor?: boolean | FixtureFrontmatterEditorOptions;
  /** Disables all editing controls while preserving the markdown rendering. */
  readOnly?: boolean;
  /** Form/input density forwarded to nested editors. */
  size?: FixtureEditorSize;
  /** Text shown in the empty markdown editor. */
  placeholder?: string;
  /** Classes applied to the component root. */
  className?: string;
};
