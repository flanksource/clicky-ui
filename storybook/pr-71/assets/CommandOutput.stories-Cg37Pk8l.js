import{j as r}from"./iframe-CIC35eeX.js";import{C as e}from"./CommandOutput-B-Gv3W48.js";import{S as R}from"./rpc-story.fixtures-CwPZzz-p.js";import"./preload-helper-CrzHa85r.js";import"./DataTable-DnGNT9Nj.js";import"./SortableHeader-CGH-BS53.js";import"./utils-DW-IJACk.js";import"./loading-nBEUV0ex.js";import"./Modal-C2Nn2nyp.js";import"./index-DwO5TgZY.js";import"./index-C6gbLGVc.js";import"./Icon-BApSHLDT.js";import"./button-jrxQ6vwL.js";import"./index-CPURVhFy.js";import"./modalStack-CfG6hB1c.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-BDMNzfC5.js";import"./floating-ui.react-B-Amc-L4.js";import"./FilterPill-DKv4DvZD.js";import"./Combobox-l6NoX43q.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-CIXhO4AH.js";import"./DateTimePicker-DDs3I4g0.js";import"./MultiSelect-CsY2Ffa8.js";import"./RangeSlider-r13dYiUP.js";import"./TimeRange-B-elXoE0.js";import"./select-BwS4L93K.js";import"./WorkloadPicker-F9bLsS7a.js";import"./NamespacePicker-DItY5PNm.js";import"./index-Dwoe35I0.js";import"./format-2niohfpq.js";import"./data-table-filter-values-BjWgdAnO.js";import"./Timestamp-BqvOD4-r.js";import"./TagList-BstNaFnn.js";import"./Badge-92x0HdAg.js";import"./HoverCard-DJWsTzDy.js";import"./Properties-5HU2Gyt3.js";import"./IconButton-DNcu9Byf.js";import"./DropdownMenu-CGr2_0le.js";import"./DropdownMenuSubmenu--8qNQwq7.js";import"./StatusDot-aQvF58TV.js";import"./Clicky-DsoNufnZ.js";import"./queryClient-Dlhl3_zo.js";import"./suspense-JoMc3dmy.js";import"./useQuery-C_yjEjoY.js";import"./FilterForm-C0vf8Of9.js";import"./formMetadata-BpkrjKBY.js";import"./ErrorDetails-JabqApvu.js";import"./callout-tones-DN7X2Ehz.js";import"./Tree-Bi_od6R0.js";import"./TreeNode-DECl2gLo.js";import"./ObjectGraph-Wcssp5Dh.js";import"./ExecutionTree-C9egMlgf.js";import"./CodeBlock-Dt8ylXeY.js";import"./CodeDiff-CXFGbD7q.js";import"./SegmentedControl-B_5LYB9M.js";import"./HighlightedTokens-7bbtkSeq.js";import"./JsonView-1d85aInv.js";import"./RenderedStackTrace-DeaQX9Or.js";import"./frame-heuristics-D62qKi0n.js";import"./StackFrameRow-DyDwb1vW.js";import"./FrameSourceWindow-fXw2jrmn.js";import"./useDebugAction-CUBj1Cj4.js";import"./debugConsoleSignal-B72erEWu.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
3 pods updated`},N={success:!1,exit_code:1,contentType:"text/plain",stdout:"",stderr:"Error: forbidden — token lacks scope deployments:write"},kr={title:"Clicky-RPC/CommandOutput",component:e,tags:["autodocs"],parameters:{docs:{description:{component:"Renders an operation's `ExecutionResponse`: a Clicky document (e.g. a table) is rendered richly via `Clicky`/`DataTable`; plain text and JSON fall back to their viewers. Handles loading and empty states. Pure — pass the response in."}}},argTypes:{response:{control:!1},loading:{control:"boolean"}},args:{response:R}},t={render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(e,{...o})})},s={args:{response:v},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(e,{...o})})},a={args:{response:N},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(e,{...o})})},m={args:{response:null,loading:!0,loadingMessage:"Running command…"},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(e,{...o})})};var i,p,n;t.parameters={...t.parameters,docs:{...(i=t.parameters)==null?void 0:i.docs,source:{originalSource:`{
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
}`,...(O=(S=m.parameters)==null?void 0:S.docs)==null?void 0:O.source}}};const Lr=["Table","Text","ErrorOutput","Loading"];export{a as ErrorOutput,m as Loading,t as Table,s as Text,Lr as __namedExportsOrder,kr as default};
