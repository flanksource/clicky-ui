import {
  Button,
  DropdownMenu,
  InputField,
  Modal,
  TreePickerField,
  buildPathTree,
  type DropdownMenuItem,
  type PathTreeNode,
} from "@flanksource/clicky-ui";
import {
  UiAdd,
  UiFilePlus,
  UiFolder,
  UiPencilSimpleLine,
  UiTrash,
} from "@flanksource/clicky-ui/icons";
import { useEffect, useMemo, useState, type FormEvent } from "react";

import { pageTitle, type PageEntry } from "../registry";
import { createFolder, createPage, deletePage, movePage } from "./page-api";
import {
  joinPageSlug,
  pageFilename,
  pageFolder,
} from "./page-management-model";
import { pageTemplate } from "./page-template";

export type PageAction =
  | "new-page"
  | "new-folder"
  | "rename"
  | "move"
  | "delete";

type FolderNode = PathTreeNode<string> & { children: FolderNode[] };

function folderRoots(folders: readonly string[]): FolderNode[] {
  return [
    {
      key: "",
      label: "Pages root",
      path: [],
      items: [],
      children: buildPathTree(folders, (folder) =>
        folder.split("/"),
      ) as FolderNode[],
    },
  ];
}

function findFolder(
  nodes: readonly FolderNode[],
  path: string,
): FolderNode | null {
  for (const node of nodes) {
    if (node.key === path) return node;
    const match = findFolder(node.children, path);
    if (match) return match;
  }
  return null;
}

function FolderField({
  folders,
  value,
  onChange,
  label,
}: {
  folders: readonly string[];
  value: string;
  onChange: (folder: string) => void;
  label: string;
}) {
  const roots = useMemo(() => folderRoots(folders), [folders]);
  return (
    <label className="grid gap-1.5 text-xs font-medium">
      {label}
      <TreePickerField<FolderNode>
        roots={roots}
        getKey={(node) => node.key}
        getChildren={(node) => node.children}
        getSearchText={(node) => `${node.key} ${node.label}`}
        renderRow={({ node }) => (
          <span className="inline-flex items-center gap-2">
            <UiFolder className="size-4 text-muted-foreground" />
            {node.key || "Pages root"}
          </span>
        )}
        onSelect={(node) => onChange(node.key)}
        selected={findFolder(roots, value)}
        revealSelected
        label={value || "Pages root"}
        ariaLabel="Page folders"
      />
    </label>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  prefix,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  prefix?: string;
}) {
  return (
    <label htmlFor={id} className="grid gap-1.5 text-xs font-medium">
      {label}
      <InputField
        id={id}
        value={value}
        onChange={onChange}
        {...(prefix
          ? { prefix: <span className="font-mono text-xs">{prefix}</span> }
          : {})}
      />
    </label>
  );
}

export function NewPageMenu({
  disabled,
  disabledReason,
  onSelect,
}: {
  disabled: boolean;
  disabledReason?: string | undefined;
  onSelect: (action: PageAction) => void;
}) {
  const items: DropdownMenuItem[] = [
    {
      label: "New page",
      icon: UiFilePlus,
      disabled,
      onSelect: () => onSelect("new-page"),
    },
    {
      label: "New folder",
      icon: UiFolder,
      disabled,
      onSelect: () => onSelect("new-folder"),
    },
  ];
  if (disabled) {
    return (
      <Button variant="outline" size="sm" disabled title={disabledReason}>
        <UiAdd /> New
      </Button>
    );
  }
  return (
    <DropdownMenu
      label="New"
      icon={UiAdd}
      items={items}
      title="Create a page or folder"
    />
  );
}

export function PageActions({
  disabled,
  disabledReason,
  onSelect,
}: {
  disabled: boolean;
  disabledReason?: string | undefined;
  onSelect: (action: PageAction) => void;
}) {
  return (
    <>
      <Button
        variant="outline"
        size="sm"
        disabled={disabled}
        title={disabledReason}
        onClick={() => onSelect("rename")}
      >
        <UiPencilSimpleLine /> Rename
      </Button>
      <Button
        variant="outline"
        size="sm"
        disabled={disabled}
        title={disabledReason}
        onClick={() => onSelect("move")}
      >
        <UiFolder /> Move
      </Button>
      <Button
        variant="outline"
        size="sm"
        disabled={disabled}
        title={disabledReason}
        onClick={() => onSelect("delete")}
      >
        <UiTrash /> Delete
      </Button>
    </>
  );
}

type DialogProps = {
  action: PageAction | null;
  active: PageEntry | undefined;
  initialFolder?: string;
  folders: readonly string[];
  commentCount: number;
  onClose: () => void;
  onFolderCreated: (folder: string) => void;
  onNavigate: (slug?: string) => void;
  fallbackAfterDelete: (deletedSlug: string) => string | undefined;
};

export function PageManagementDialogs(props: DialogProps) {
  const { action, active, initialFolder, folders, commentCount, onClose } =
    props;
  const [folder, setFolder] = useState("");
  const [filename, setFilename] = useState("");
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setFolder(initialFolder ?? (active ? pageFolder(active.slug) : ""));
    setFilename(action === "rename" && active ? pageFilename(active.slug) : "");
    setTitle(action === "rename" && active ? pageTitle(active) : "");
    setError(null);
    setBusy(false);
  }, [action, active, initialFolder]);

  const finish = async (
    operation: () => Promise<string | undefined>,
    navigate = true,
  ) => {
    if (busy) return;
    setBusy(true);
    try {
      const slug = await operation();
      onClose();
      if (navigate) props.onNavigate(slug);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
      setBusy(false);
    }
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (action === "new-page") {
      const slug = joinPageSlug(folder, filename.trim());
      void finish(
        async () =>
          (await createPage(slug, pageTemplate(slug, title.trim()))).slug,
      );
    } else if (action === "new-folder") {
      const nextFolder = joinPageSlug(folder, filename.trim());
      void finish(async () => {
        const result = await createFolder(nextFolder);
        props.onFolderCreated(result.folder);
        return undefined;
      }, false);
    } else if (action === "rename" && active) {
      const nextSlug = joinPageSlug(pageFolder(active.slug), filename.trim());
      void finish(
        async () =>
          (await movePage({ slug: active.slug, nextSlug, title: title.trim() }))
            .slug,
      );
    } else if (action === "move" && active) {
      const nextSlug = joinPageSlug(folder, pageFilename(active.slug));
      void finish(
        async () => (await movePage({ slug: active.slug, nextSlug })).slug,
      );
    } else if (action === "delete" && active) {
      void finish(async () => {
        await deletePage(active.slug);
        return props.fallbackAfterDelete(active.slug);
      });
    }
  };

  const needsTitle = action === "new-page" || action === "rename";
  const needsFilename = action !== "move" && action !== "delete";
  const invalid =
    busy ||
    (needsFilename && filename.trim() === "") ||
    (needsTitle && title.trim() === "");
  const modalTitle =
    action &&
    {
      "new-page": "New page",
      "new-folder": "New folder",
      rename: "Rename page",
      move: "Move page",
      delete: "Delete page",
    }[action];

  return (
    <Modal
      open={action !== null}
      onClose={onClose}
      title={modalTitle}
      size="sm"
      expandable={false}
      footer={
        <div className="flex justify-end gap-density-2">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="page-management-form"
            size="sm"
            variant={action === "delete" ? "destructive" : "default"}
            loading={busy}
            disabled={invalid}
          >
            {action === "delete"
              ? "Delete page"
              : action === "move"
                ? "Move page"
                : "Save"}
          </Button>
        </div>
      }
    >
      <form
        id="page-management-form"
        onSubmit={submit}
        className="grid gap-density-3"
      >
        {(action === "new-page" ||
          action === "new-folder" ||
          action === "move") && (
          <FolderField
            folders={folders}
            value={folder}
            onChange={setFolder}
            label="Folder"
          />
        )}
        {needsFilename && (
          <Field
            id="page-filename"
            label={action === "new-folder" ? "Folder name" : "Filename"}
            value={filename}
            onChange={setFilename}
            {...(action !== "new-folder"
              ? {
                  prefix: `src/pages/${
                    action === "rename" && active
                      ? `${pageFolder(active.slug)}/`
                      : ""
                  }`,
                }
              : {})}
          />
        )}
        {needsTitle && (
          <Field
            id="page-title"
            label="Title"
            value={title}
            onChange={setTitle}
          />
        )}
        {action === "delete" && active && (
          <p className="text-sm text-muted-foreground">
            Delete{" "}
            <code className="text-foreground">src/pages/{active.slug}.tsx</code>
            ? This also deletes {commentCount} feedback comment
            {commentCount === 1 ? "" : "s"}.
          </p>
        )}
        {error && (
          <p role="alert" className="text-xs text-destructive">
            {error}
          </p>
        )}
      </form>
    </Modal>
  );
}
