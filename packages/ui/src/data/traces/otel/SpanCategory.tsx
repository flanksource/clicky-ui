import { Icon } from "../../Icon";
import { UiClock } from "../../../icons";
export function Tinted({ icon, color, label }: { icon: typeof UiClock; color: string; label?: string }) {
  return <span className="inline-flex shrink-0" style={{ color }} {...(label ? { role: "img", "aria-label": label, title: label } : {})}><Icon icon={icon} /></span>;
}
