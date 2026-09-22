import{j as r}from"./iframe-CyxCReIN.js";import{C as e}from"./CommandOutput-DdPPsP9U.js";import{S as R}from"./rpc-story.fixtures-C2UEUBiE.js";import"./preload-helper-CcRYDqr-.js";import"./DataTable-BYgE4oAs.js";import"./SortableHeader-B0HyXeaN.js";import"./utils-DW-IJACk.js";import"./loading-BjMuVtzF.js";import"./router-B7vLChae.js";import"./Modal-DmP5tSFH.js";import"./index-B_nLbyow.js";import"./index-D2DBLvBJ.js";import"./Icon-DjRCcNb6.js";import"./button-DJHVQAtF.js";import"./index-CPURVhFy.js";import"./modalStack-CVif_cxP.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-BlW3EBi1.js";import"./floating-ui.react-CRn3EQ6Q.js";import"./FilterPill-Wl0EfThz.js";import"./Combobox-BuZoOMU4.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-RJRT6Aov.js";import"./MultiSelect-XYzUrmey.js";import"./RangeSlider-Doy3eAUN.js";import"./TimeRange-NMlxqe7N.js";import"./select-BNxmB0s_.js";import"./WorkloadPicker-FcwurbaN.js";import"./NamespacePicker-Dj84hLOC.js";import"./index-oOn8ZiEy.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";import"./Timestamp-DBzZmdpI.js";import"./TagList-DT1Et61X.js";import"./Badge-DUYXoHnk.js";import"./HoverCard-BMGnmMzi.js";import"./Properties-ThDeoCbc.js";import"./IconButton-BbI_yPN9.js";import"./DropdownMenu-CIAQcaUe.js";import"./DropdownMenuSubmenu-D16MVwd1.js";import"./StatusDot-CF3v5o0C.js";import"./Clicky-CUT-ySC1.js";import"./queryClient-oQx7fs2g.js";import"./suspense-BFUvbtfZ.js";import"./useQuery-DTueS3mB.js";import"./FilterForm-_C1EPZH7.js";import"./formMetadata-BD7aOhq_.js";import"./ErrorDetails-DOraGMP6.js";import"./callout-tones-EFt49BYo.js";import"./Tree-6fLNNFra.js";import"./TreeNode-BFVNqgXr.js";import"./ObjectGraph-Dct2MAeK.js";import"./ExecutionTree-Heexz6lt.js";import"./CodeBlock-DMHMhI42.js";import"./CodeDiff-XfVf50oY.js";import"./SegmentedControl-CEjKH6ZW.js";import"./HighlightedTokens-D-xYBr9j.js";import"./JsonView-4QSG-iiA.js";import"./RenderedStackTrace-52mQEOLe.js";import"./frame-heuristics-D62qKi0n.js";import"./StackFrameRow-cdR2SYFI.js";import"./FrameSourceWindow-CPJLy9Ai.js";import"./useDebugAction-bjEzn1dt.js";import"./debugConsoleSignal-B72erEWu.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
3 pods updated`},N={success:!1,exit_code:1,contentType:"text/plain",stdout:"",stderr:"Error: forbidden — token lacks scope deployments:write"},Lr={title:"Clicky-RPC/CommandOutput",component:e,tags:["autodocs"],parameters:{docs:{description:{component:"Renders an operation's `ExecutionResponse`: a Clicky document (e.g. a table) is rendered richly via `Clicky`/`DataTable`; plain text and JSON fall back to their viewers. Handles loading and empty states. Pure — pass the response in."}}},argTypes:{response:{control:!1},loading:{control:"boolean"}},args:{response:R}},t={render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(e,{...o})})},s={args:{response:v},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(e,{...o})})},a={args:{response:N},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(e,{...o})})},m={args:{response:null,loading:!0,loadingMessage:"Running command…"},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(e,{...o})})};var i,p,n;t.parameters={...t.parameters,docs:{...(i=t.parameters)==null?void 0:i.docs,source:{originalSource:`{
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
}`,...(O=(S=m.parameters)==null?void 0:S.docs)==null?void 0:O.source}}};const Mr=["Table","Text","ErrorOutput","Loading"];export{a as ErrorOutput,m as Loading,t as Table,s as Text,Mr as __namedExportsOrder,Lr as default};
