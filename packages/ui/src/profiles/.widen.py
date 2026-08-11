"""Widen optional properties to `?: T | undefined` in named type declarations.

clicky-ui builds with exactOptionalPropertyTypes, where an optional property may
be absent but not present-and-undefined. For the draft models and component
props here that distinction is noise -- a React caller passing a possibly-absent
value is ordinary -- and the package's own components already declare
`prop?: T | undefined` (see data/CodeBlock.tsx). This aligns these declarations
with that convention.

It deliberately does NOT touch the places where absent-vs-undefined is real:
those are the objects serialized to the server, and they were fixed to `delete`
the key instead.
"""

import pathlib
import re
import sys

TARGETS = {
    "esQueryBuilderModel.ts": ["EsSearch", "EsSortBy", "EsCondition"],
    "profileEditorModel.ts": ["ProfileSectionStatus"],
    "profileWizardModel.ts": ["ProfileWizardDraft", "ProfileRowLimits", "ParamDraft"],
    "esQueryPreview.tsx": ["EsCompilation"],
    "connectionQueryWorkspace.tsx": ["ConnectionQueryWorkspaceProps"],
}

PROP = re.compile(r"^(\s+)([A-Za-z_$][\w$]*)\?: ([^;]+);$")


def widen_block(lines, start):
    """Widen `x?: T;` lines of the type literal opening at `start` until its `};`."""
    depth = 0
    changed = 0
    for index in range(start, len(lines)):
        depth += lines[index].count("{") - lines[index].count("}")
        match = PROP.match(lines[index])
        if match and "| undefined" not in match.group(3):
            indent, name, type_text = match.groups()
            lines[index] = f"{indent}{name}?: {type_text} | undefined;"
            changed += 1
        if depth <= 0 and index > start:
            return index, changed
    return len(lines) - 1, changed


total = 0
for filename, type_names in TARGETS.items():
    path = pathlib.Path(filename)
    if not path.exists():
        sys.exit(f"missing {filename}")
    lines = path.read_text().split("\n")
    for type_name in type_names:
        for index, line in enumerate(lines):
            if re.match(rf"^export type {type_name} = .*\{{\s*$", line):
                _, changed = widen_block(lines, index)
                total += changed
                print(f"{filename}:{type_name}: widened {changed}")
                break
        else:
            print(f"{filename}:{type_name}: NOT FOUND")
    path.write_text("\n".join(lines))
print(f"total {total}")
