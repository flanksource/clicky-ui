import{j as r}from"./iframe-Bk9swcUR.js";import{C as e}from"./CommandOutput-BbufyEmb.js";import{S as R}from"./rpc-story.fixtures-BfyUnbT4.js";import"./preload-helper-BpddQVpQ.js";import"./DataTable-CWDLplT2.js";import"./SortableHeader-CNy8zCPY.js";import"./utils-DW-IJACk.js";import"./loading-CDKfpJbq.js";import"./router-D3XO_z-F.js";import"./Modal-C5IY1XlS.js";import"./index-CLDbtA8-.js";import"./index-B8STd8gT.js";import"./Icon-CT2tkhoJ.js";import"./button-BwQwEt7k.js";import"./index-CPURVhFy.js";import"./modalStack-CaNd2wxr.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-EmtL7p92.js";import"./floating-ui.react-6IB_hdLH.js";import"./FilterPill-CVfnxEYE.js";import"./Combobox-FqMST2xS.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-B8Somcyq.js";import"./MultiSelect-C0fLbA24.js";import"./RangeSlider-tdtmcZfs.js";import"./TimeRange-CGJEfSXy.js";import"./select-N3OZpg7E.js";import"./WorkloadPicker-dWfhUWSm.js";import"./NamespacePicker-CKLL9-TX.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";import"./Timestamp-BAd48HDa.js";import"./TagList-BCa_fqYa.js";import"./Badge-CMQ3mwrx.js";import"./HoverCard-B8M4ULNJ.js";import"./Properties-D-ofUfhJ.js";import"./IconButton-BVA8dYdd.js";import"./DropdownMenu-20164xk8.js";import"./DropdownMenuSubmenu-CBBihWZH.js";import"./StatusDot-1wwk9z-3.js";import"./Clicky-9oa5mBb_.js";import"./queryClient-bHl9vIbB.js";import"./suspense-Cn4jCU9d.js";import"./useQuery-D5goCVZl.js";import"./FilterForm-PpMuZq0k.js";import"./formMetadata-BMSLWh73.js";import"./ErrorDetails-BJibrJF-.js";import"./string-Ye519DiV.js";import"./callout-tones-EFt49BYo.js";import"./Tree-CzQzLCVS.js";import"./TreeNode-BVvLCmRg.js";import"./ObjectGraph-CR95mLol.js";import"./ExecutionTree-BpxPwfmF.js";import"./CodeBlock-ZaGV8WpW.js";import"./CodeDiff-CQZu6CxO.js";import"./SegmentedControl-GIOpFwGu.js";import"./HighlightedTokens-DCZYa5In.js";import"./JsonView-CPcCIR-n.js";import"./RenderedStackTrace-xZAzNxOM.js";import"./frame-heuristics-D62qKi0n.js";import"./StackFrameRow-366FvHR-.js";import"./FrameSourceWindow-Bwy9_jza.js";import"./useDebugAction-CilCnzcN.js";import"./debugConsoleSignal-B72erEWu.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
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
