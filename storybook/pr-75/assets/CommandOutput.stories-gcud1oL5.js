import{j as r}from"./iframe-BJPr9MUp.js";import{C as e}from"./CommandOutput-D_R2Hc_I.js";import{S as R}from"./rpc-story.fixtures-CwM5yrjP.js";import"./preload-helper-CoNDIDFR.js";import"./DataTable-QmcGmlln.js";import"./SortableHeader-DiZ7FH9q.js";import"./utils-DW-IJACk.js";import"./loading-DIju19wB.js";import"./router-CzcfSLXI.js";import"./Modal-Dovh43vD.js";import"./index-CPdQ4eZx.js";import"./index-DgdWD9e2.js";import"./Icon-BHJH8c2q.js";import"./button-B8dsTuZQ.js";import"./index-CPURVhFy.js";import"./modalStack-QICYOAYs.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-4gzxlg7T.js";import"./floating-ui.react-CsImbkCW.js";import"./FilterPill-D9M1bTkF.js";import"./Combobox-JBD2C9EO.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-CIXhO4AH.js";import"./DateTimePicker-n2tM6Z6k.js";import"./MultiSelect-D05zdTnV.js";import"./RangeSlider-Bm_sMAmX.js";import"./TimeRange-Bgp7jwKT.js";import"./select-RR-XqR1d.js";import"./WorkloadPicker-BdAmb5l0.js";import"./NamespacePicker-B0z_E5rw.js";import"./index-eP72hBTy.js";import"./format-2niohfpq.js";import"./data-table-filter-values-BjWgdAnO.js";import"./Timestamp-QDkyjF4f.js";import"./TagList-CbTuMsvy.js";import"./Badge-CZ5DQmUq.js";import"./HoverCard-t79gA4et.js";import"./Properties-COgPdNtX.js";import"./IconButton-DbvzP4bm.js";import"./DropdownMenu-gwn6Qkw8.js";import"./DropdownMenuSubmenu-DAM3X0pq.js";import"./StatusDot-Bo4wMxRP.js";import"./Clicky-jd6ix5a2.js";import"./queryClient-C6c3XZo6.js";import"./suspense-CuH39Ej-.js";import"./useQuery-BIoTlE58.js";import"./FilterForm-B5P6VqYy.js";import"./formMetadata-C_5JHrQ6.js";import"./ErrorDetails-zZUF4gaJ.js";import"./callout-tones-DN7X2Ehz.js";import"./Tree-DFaSqCpQ.js";import"./TreeNode-BC6FFY00.js";import"./ObjectGraph-BzRHCcYe.js";import"./ExecutionTree-DEYMzjxG.js";import"./CodeBlock-CvXo659P.js";import"./CodeDiff-CcW-1WtC.js";import"./SegmentedControl-CjRB0It9.js";import"./HighlightedTokens-BRDbYid3.js";import"./JsonView-C6JiTHvg.js";import"./RenderedStackTrace-DlUY4O_b.js";import"./frame-heuristics-D62qKi0n.js";import"./StackFrameRow-DRXC1yXe.js";import"./FrameSourceWindow-DJ-Lmds8.js";import"./useDebugAction-DUyvVGcR.js";import"./debugConsoleSignal-B72erEWu.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
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
