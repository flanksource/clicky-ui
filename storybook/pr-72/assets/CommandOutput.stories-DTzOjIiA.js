import{j as r}from"./iframe-CNG2zCjB.js";import{C as e}from"./CommandOutput-CaehGakJ.js";import{S as R}from"./rpc-story.fixtures-kuW6Wqfk.js";import"./preload-helper-Dy2teTf6.js";import"./DataTable-BTAQ5pUr.js";import"./SortableHeader-CTrXBABy.js";import"./utils-DW-IJACk.js";import"./loading-DC-8TGYt.js";import"./Modal-SC1Zb0Eg.js";import"./index-59KQ2cX2.js";import"./index-7WZkUODE.js";import"./Icon-BBALXVqj.js";import"./button-CZ-gv9rN.js";import"./index-CPURVhFy.js";import"./modalStack-DGtA3y-v.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-HmXIoju5.js";import"./floating-ui.react-DrmKW2um.js";import"./FilterPill-Dn47F8iw.js";import"./Combobox-DOn8_5aU.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-CIXhO4AH.js";import"./DateTimePicker-CZc_0ceA.js";import"./MultiSelect-DgncBLgQ.js";import"./RangeSlider-B4_d-otG.js";import"./TimeRange-444tVzJk.js";import"./select-D7LCQN6n.js";import"./WorkloadPicker-EFH6lSHv.js";import"./NamespacePicker-NX8PbPxf.js";import"./index-aDDnMnJi.js";import"./format-2niohfpq.js";import"./data-table-filter-values-BjWgdAnO.js";import"./Timestamp-BtQjbk46.js";import"./TagList-CQbDQonH.js";import"./Badge-CACGwmvZ.js";import"./HoverCard-CpQHKydd.js";import"./Properties-CZjUyk4S.js";import"./IconButton-BvFpkkWp.js";import"./DropdownMenu-DVEZsuvh.js";import"./DropdownMenuSubmenu-BGu2RB67.js";import"./StatusDot-CNYqqgpi.js";import"./Clicky-hd9Fdud6.js";import"./queryClient-BkHG9wCF.js";import"./suspense-DPanNIjz.js";import"./useQuery-BY7353JW.js";import"./FilterForm-Cf8CgN2B.js";import"./formMetadata-BGHBRrD9.js";import"./ErrorDetails-pb5z_0kD.js";import"./callout-tones-DN7X2Ehz.js";import"./Tree-6ttvzpNU.js";import"./TreeNode-0bQRXtMh.js";import"./ObjectGraph-BL5ktmRz.js";import"./ExecutionTree-D0qC9qWq.js";import"./CodeBlock-mgE2e-AW.js";import"./CodeDiff-CrpWph0o.js";import"./SegmentedControl-CJzlFuHL.js";import"./HighlightedTokens-e-idyh4_.js";import"./JsonView-D462wRr4.js";import"./RenderedStackTrace-C3VF70EO.js";import"./frame-heuristics-D62qKi0n.js";import"./StackFrameRow-B5PEkOH0.js";import"./FrameSourceWindow-BHj1OMks.js";import"./useDebugAction-CCkaTfmA.js";import"./debugConsoleSignal-B72erEWu.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
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
