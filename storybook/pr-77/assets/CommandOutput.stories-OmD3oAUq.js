import{j as r}from"./iframe-CiA63uuc.js";import{C as e}from"./CommandOutput-DR1d21Tg.js";import{S as R}from"./rpc-story.fixtures-DChmLaqx.js";import"./preload-helper-DqldIB3Q.js";import"./DataTable-Bi0OViGE.js";import"./SortableHeader-DjdVrVVK.js";import"./utils-DW-IJACk.js";import"./loading-X8NYIprp.js";import"./router-DdDvAp2k.js";import"./Modal-BWkFQvgr.js";import"./index-BzPaU3HF.js";import"./index-CDCKIc0i.js";import"./Icon-ChAy_Zq6.js";import"./button-ppGJePHl.js";import"./index-CPURVhFy.js";import"./modalStack-B1ctHZfJ.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-C4LglIFa.js";import"./floating-ui.react-BzcB7PEn.js";import"./FilterPill-2pMT1Pki.js";import"./Combobox-C-Pmuu7J.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-CIXhO4AH.js";import"./DateTimePicker-MwGYzabr.js";import"./MultiSelect-BEb4QcU1.js";import"./RangeSlider-BF5vIFTr.js";import"./TimeRange-CVxt8508.js";import"./select-SOFw-W8N.js";import"./WorkloadPicker-KNnpqbtg.js";import"./NamespacePicker-CPYiebHw.js";import"./index-CZSejjdY.js";import"./format-2niohfpq.js";import"./data-table-filter-values-BjWgdAnO.js";import"./Timestamp-ByIXWA6S.js";import"./TagList-CMlkTEXD.js";import"./Badge-C7FdoOOR.js";import"./HoverCard-BaejSNIH.js";import"./Properties-BBtZhA7f.js";import"./IconButton-CHbaJLVA.js";import"./DropdownMenu-DEcSbpCu.js";import"./DropdownMenuSubmenu-DGyluL-z.js";import"./StatusDot-C66wLCQs.js";import"./Clicky-D71NJWh0.js";import"./queryClient-BmAv53Yf.js";import"./suspense-DbNuRuet.js";import"./useQuery-BaHYQtxz.js";import"./FilterForm-CSFezSd5.js";import"./formMetadata-CG1ONdQs.js";import"./ErrorDetails-FCPkGK_7.js";import"./callout-tones-EFt49BYo.js";import"./Tree-b58f5oGs.js";import"./TreeNode-Bssf1cx2.js";import"./ObjectGraph-B_GhG6CM.js";import"./ExecutionTree-Ds-7Ixe1.js";import"./CodeBlock-D6-FWHVb.js";import"./CodeDiff-BpeI9I83.js";import"./SegmentedControl-aXRpxQ4b.js";import"./HighlightedTokens-CbIDuBkT.js";import"./JsonView-CuM0h6Lr.js";import"./RenderedStackTrace-BsI4IHY7.js";import"./frame-heuristics-D62qKi0n.js";import"./StackFrameRow-BMJ6NcLi.js";import"./FrameSourceWindow-wJcc-JjB.js";import"./useDebugAction-BNeKEHMg.js";import"./debugConsoleSignal-B72erEWu.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
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
