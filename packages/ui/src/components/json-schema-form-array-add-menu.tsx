import { createPortal } from "react-dom";
import { UiAdd } from "../icons";
import { DropdownMenu } from "../overlay/DropdownMenu";
import { useSectionActionsSlot } from "./json-schema-form-section-actions";

// ArrayAddMenu offers the arrays an object hides (empty ones, or every one
// still taking items) from one Add menu. Inside a headed section it is a plus
// button in the section's header row (SectionActionsContext); without a header
// it is an "Add" button in the object's own grid.
export function ArrayAddMenu({ owner, items }: {
  /** The instance path of the object the arrays belong to; matches its section's header slot. */
  owner: string;
  items: { key: string; label: string; onSelect: () => void }[];
}) {
  const slot = useSectionActionsSlot(owner);
  const menuItems = items.map((item) => ({ label: item.label, onSelect: item.onSelect }));
  if (slot) {
    return createPortal(
      <DropdownMenu label={<span className="sr-only">Add</span>} icon={UiAdd} hideChevron variant="ghost" size="icon"
        align="right" title="Add" menuLabel="Add" items={menuItems} />,
      slot,
    );
  }
  return (
    <div data-jsf-add-menu="" className="col-span-full" style={{ gridColumn: "1 / -1" }}>
      <DropdownMenu label="Add" icon={UiAdd} variant="outline" size="sm" align="left" menuLabel="Add" items={menuItems} />
    </div>
  );
}
