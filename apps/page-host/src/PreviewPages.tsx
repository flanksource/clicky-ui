import { useState, type ComponentProps } from "react";
import { CommentPreview } from "./comments/CommentPreview";

export function PreviewPages(props: ComponentProps<typeof CommentPreview>) {
  const [visited, setVisited] = useState([props.project.entry]);
  if (!visited.includes(props.project.entry)) setVisited([...visited, props.project.entry]);
  return <div className="relative h-full min-h-0">
    {visited.filter((entry) => props.project.files[entry] !== undefined).map((entry) => <div key={entry} className="absolute inset-0" aria-hidden={entry !== props.project.entry} style={{ visibility: entry === props.project.entry ? "visible" : "hidden" }}>
      <CommentPreview {...props} project={{ ...props.project, entry }} />
    </div>)}
  </div>;
}
