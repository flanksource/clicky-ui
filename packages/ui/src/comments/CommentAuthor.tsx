import { Avatar } from "../data/Avatar";
import { Icon } from "../data/Icon";
import { HoverCard } from "../overlay/HoverCard";
import { resolveSize, type SizeToken } from "../lib/size";
import { useDensityValue } from "../hooks/use-density";
import { UiRobotAi } from "../icons";
import { authorDisplayName } from "./comment-utils";
import type { CommentAuthor as CommentAuthorModel } from "./comment-types";

export type CommentAuthorAvatarProps = {
  /** Author to render; null renders an anonymous user. */
  author: CommentAuthorModel | null;
  /** Avatar size token. */
  size?: SizeToken;
  /** Render only the glyph (no hover card). */
  bare?: boolean;
};

/**
 * Renders a comment author's identity glyph: a person avatar for `user`
 * authors, an icon chip for `agent` authors. Wrapped in a hover card naming the
 * author unless `bare`.
 */
export function CommentAuthorAvatar({
  author,
  size = "sm",
  bare = false,
}: CommentAuthorAvatarProps) {
  const density = useDensityValue();
  const name = authorDisplayName(author);
  const isAgent = author?.kind === "agent";

  const glyph = isAgent ? (
    <AgentChip author={author} size={resolveSize(size, density)} />
  ) : (
    <Avatar
      alt={name}
      size={size}
      {...(author?.avatar ? { src: author.avatar } : {})}
      title={name}
    />
  );

  if (bare) return glyph;

  return (
    <HoverCard trigger={glyph} placement="top">
      <span className="font-medium">{name}</span>
      {isAgent && <span className="ml-1 text-muted-foreground">· agent</span>}
    </HoverCard>
  );
}

function AgentChip({
  author,
  size,
}: {
  author: CommentAuthorModel;
  size: number;
}) {
  const icon = author.icon;
  return (
    <span
      role="img"
      aria-label={author.name}
      className="inline-flex shrink-0 items-center justify-center rounded-full border border-border bg-muted text-foreground"
      style={{ width: size, height: size }}
    >
      <Icon
        {...(typeof icon === "string"
          ? { name: icon }
          : { icon: icon ?? UiRobotAi })}
        width={Math.max(10, Math.round(size * 0.6))}
        height={Math.max(10, Math.round(size * 0.6))}
      />
    </span>
  );
}
