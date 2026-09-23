import{j as r}from"./iframe-DjmnUs_s.js";import{C as e}from"./CommandOutput-f0RD8Jmm.js";import{S as R}from"./rpc-story.fixtures-DwPqESFe.js";import"./preload-helper-BlVIKJwt.js";import"./DataTable-CcWyv-KS.js";import"./SortableHeader-BNrSMm_o.js";import"./utils-DW-IJACk.js";import"./loading-jlJ4TQvy.js";import"./router-B4hYsQFa.js";import"./Modal-DJ5NvytA.js";import"./index-DsmV4W2z.js";import"./index-CouXz6mu.js";import"./Icon-CWJyCkxy.js";import"./button-DfMIapuu.js";import"./index-CPURVhFy.js";import"./modalStack-Bqy7OkQU.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-Ch27q_Qp.js";import"./floating-ui.react-DWJ6pxmL.js";import"./FilterPill--WlUWj89.js";import"./Combobox-FRHPTizX.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-9a9vmkUi.js";import"./MultiSelect-DFFpOHWp.js";import"./RangeSlider-nwtIr3gw.js";import"./TimeRange-tYWtzpEp.js";import"./select-BmbPgT_c.js";import"./WorkloadPicker-ChqqGMOn.js";import"./NamespacePicker-CPEwYjOg.js";import"./index-BGRDfamw.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";import"./Timestamp-DK3eV-W2.js";import"./TagList-B5SNPfDR.js";import"./Badge-DRzP6dli.js";import"./HoverCard-dWtrhYr9.js";import"./Properties-B63-iTbR.js";import"./IconButton-CPXwZoyZ.js";import"./DropdownMenu-BzgZIIYx.js";import"./DropdownMenuSubmenu-CYFI-0pu.js";import"./StatusDot-Bzzd-akD.js";import"./Clicky-9xCWy8xO.js";import"./queryClient-WWMP9yZo.js";import"./suspense-Dj5pR5v4.js";import"./useQuery-CK5G_QNO.js";import"./FilterForm-cVz6UVoh.js";import"./formMetadata-DVrz3p05.js";import"./ErrorDetails-CwulswKJ.js";import"./string-Ye519DiV.js";import"./callout-tones-EFt49BYo.js";import"./Tree-fCJ2E4k3.js";import"./TreeNode-DyyyypDE.js";import"./ObjectGraph-j0jqg0ai.js";import"./ExecutionTree-BwsJdFUj.js";import"./CodeBlock-BKY-n_kB.js";import"./CodeDiff-CvJ1rh3J.js";import"./SegmentedControl-C3smeAq4.js";import"./HighlightedTokens-CwICtm63.js";import"./JsonView-0809oQhO.js";import"./RenderedStackTrace-CQo2mTb3.js";import"./frame-heuristics-D62qKi0n.js";import"./StackFrameRow-ccl_lQS3.js";import"./FrameSourceWindow-BPPZnSYI.js";import"./useDebugAction-phCEI4dI.js";import"./debugConsoleSignal-B72erEWu.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
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
