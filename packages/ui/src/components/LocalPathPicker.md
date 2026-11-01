# LocalPathPicker

Use the shared picker with a metadata loader owned by the host app:

```tsx
<LocalPathPicker
  open={open}
  onClose={() => setOpen(false)}
  initialPath="/data/example.csv"
  load={async (path, signal) => {
    const response = await fetch(`/api/v1/connections/files?path=${encodeURIComponent(path)}`, { signal });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  }}
  onSelect={path => setPath(path)}
/>
```

`initialPath` selects the initial directory or file whose parent the backend lists. `load` returns a `LocalPathListing` and must respect cancellation. `onSelect` receives the chosen absolute path after confirmation. `onClose` dismisses the dialog. The host should use `isLocalHostname` to hide the browsing affordance remotely and enforce access separately in its backend.

The picker uses the shared Tree with lazy directory expansion. Filtering searches loaded entries; it does not scan unopened folders. Directory errors are shown inline with retry. Requests are cancelled on navigation and dismissal.

Omit `accept` (or pass an empty array) to show all files. Set `accept={[".csv", ".json"]}` for case-insensitive extension filtering with an All files override. Folders remain navigable. Hidden files are controlled separately.

The shared picker returns a plain absolute path. Hosts own URL conversion, domain-specific defaults, and persistence.
