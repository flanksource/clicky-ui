import { createElement } from "react";
import {
  ConnectionDashboardSurface,
  ConnectionsPage,
  FlanksourceIcon,
  connectionLoggingFormExtensions,
  createConnectionDashboardResultRenderer,
  createConnectionFormActions,
  type ConnectionLinkRenderer,
  type ConnectionsPageProps,
} from "@flanksource/clicky-ui/connections";

const renderConnectionLink: ConnectionLinkRenderer = (connection, { children, ...link }) =>
  createElement("a", { href: `/connection/${connection.id}`, ...link }, children);

export const pageProps = {
  apiBase: "/api/v1",
  onSelect: (id: string | undefined) => void id,
  connectionHref: (id: string) => `/connections?connection=${id}`,
} satisfies ConnectionsPageProps;

export const explorerParts = {
  resultRenderer: createConnectionDashboardResultRenderer({
    apiBase: "/api/v1",
    renderConnectionLink,
  }),
  formActions: createConnectionFormActions({ apiBase: "/api/v1" }),
  formExtensions: connectionLoggingFormExtensions,
};

export const components = [ConnectionsPage, ConnectionDashboardSurface, FlanksourceIcon];
