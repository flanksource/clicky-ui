import{j as r}from"./iframe-Dm9WDfFk.js";import{C as e}from"./CommandOutput-C6UK6R32.js";import{S as R}from"./rpc-story.fixtures-8rmYNZZH.js";import"./preload-helper-C0z-shBz.js";import"./DataTable-CeOfk4Uz.js";import"./SortableHeader-JDO5J5Id.js";import"./utils-DW-IJACk.js";import"./loading-CJ6V0nN9.js";import"./router-oF-f9wpK.js";import"./Modal-PsjUms9d.js";import"./index-Bx4ElzK1.js";import"./index-Dgu1a0Qq.js";import"./Icon-C0Xeje0M.js";import"./button-CENLUU5j.js";import"./index-CPURVhFy.js";import"./modalStack-CvvHbawO.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-Hmt9C_ts.js";import"./floating-ui.react-DeWqyg5S.js";import"./FilterPill-DLi3O7KQ.js";import"./Combobox-B6cKgKZT.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-DdbNDnim.js";import"./MultiSelect-BTw-vIYs.js";import"./RangeSlider-CTxK6L3-.js";import"./TimeRange-GzY8P0so.js";import"./select-Bec3eoyV.js";import"./WorkloadPicker-PMTbjtOo.js";import"./NamespacePicker-CkK3AU_h.js";import"./index-DeTidxWH.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";import"./Timestamp-DLU2eSYb.js";import"./TagList-CFxRXuAa.js";import"./Badge-yGc8mW4C.js";import"./HoverCard-BSW2cf0b.js";import"./Properties-Di6szT3e.js";import"./IconButton-CjT-t9Vt.js";import"./DropdownMenu-DymU7aS1.js";import"./DropdownMenuSubmenu-BWkoW6LP.js";import"./StatusDot-d2ZrEGhv.js";import"./Clicky-CNs55V1K.js";import"./queryClient-DK96IZlq.js";import"./suspense-DXDp9Nya.js";import"./useQuery-ILNxclNQ.js";import"./FilterForm-BmEh2IgA.js";import"./formMetadata-CqPP-2iJ.js";import"./ErrorDetails-CkG53x7d.js";import"./string-Ye519DiV.js";import"./callout-tones-EFt49BYo.js";import"./Tree-BxNUFOEw.js";import"./TreeNode-BNtJUGlp.js";import"./ObjectGraph-Ce10ywC1.js";import"./ExecutionTree-Dbeg-ZvF.js";import"./CodeBlock-4dLkcMVd.js";import"./CodeDiff-CgCKqRcG.js";import"./SegmentedControl-DaA1qzu_.js";import"./HighlightedTokens-BzzDcGha.js";import"./JsonView-CTnjgbsl.js";import"./RenderedStackTrace-BgRw9R9r.js";import"./frame-heuristics-D62qKi0n.js";import"./StackFrameRow-D3Gm4f5F.js";import"./FrameSourceWindow-Co-q8l-I.js";import"./useDebugAction-iz_e7RAD.js";import"./debugConsoleSignal-B72erEWu.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
3 pods updated`},N={success:!1,exit_code:1,contentType:"text/plain",stdout:"",stderr:"Error: forbidden — token lacks scope deployments:write"},Mr={title:"Clicky-RPC/CommandOutput",component:e,tags:["autodocs"],parameters:{docs:{description:{component:"Renders an operation's `ExecutionResponse`: a Clicky document (e.g. a table) is rendered richly via `Clicky`/`DataTable`; plain text and JSON fall back to their viewers. Handles loading and empty states. Pure — pass the response in."}}},argTypes:{response:{control:!1},loading:{control:"boolean"}},args:{response:R}},t={render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(e,{...o})})},s={args:{response:v},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(e,{...o})})},a={args:{response:N},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(e,{...o})})},m={args:{response:null,loading:!0,loadingMessage:"Running command…"},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(e,{...o})})};var i,p,n;t.parameters={...t.parameters,docs:{...(i=t.parameters)==null?void 0:i.docs,source:{originalSource:`{
  render: args => <div className="max-w-3xl">
      <CommandOutput {...args} />
    </div>
}`,...(n=(p=t.parameters)==null?void 0:p.docs)==null?void 0:n.source}}};var d,c,l;s.parameters={...s.parameters,docs:{...(d=s.parameters)==null?void 0:d.docs,source:{originalSource:`{
  args: {
    response: TEXT_RESPONSE
  },
  render: args => <div className="max-w-3xl">
      <CommandOutput {...args} />
    </div>
}`,...(l=(c=s.parameters)==null?void 0:c.docs)==null?void 0:l.source}}};var u,x,g;a.parameters={...a.parameters,docs:{...(u=a.parameters)==null?void 0:u.docs,source:{originalSource:`{
  args: {
    response: ERROR_RESPONSE
  },
  render: args => <div className="max-w-3xl">
      <CommandOutput {...args} />
    </div>
}`,...(g=(x=a.parameters)==null?void 0:x.docs)==null?void 0:g.source}}};var E,S,O;m.parameters={...m.parameters,docs:{...(E=m.parameters)==null?void 0:E.docs,source:{originalSource:`{
  args: {
    response: null,
    loading: true,
    loadingMessage: "Running command…"
  },
  render: args => <div className="max-w-3xl">
      <CommandOutput {...args} />
    </div>
}`,...(O=(S=m.parameters)==null?void 0:S.docs)==null?void 0:O.source}}};const Xr=["Table","Text","ErrorOutput","Loading"];export{a as ErrorOutput,m as Loading,t as Table,s as Text,Xr as __namedExportsOrder,Mr as default};
