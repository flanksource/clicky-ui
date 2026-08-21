import{j as r}from"./iframe-Bfqmb9is.js";import{C as e}from"./CommandOutput-RI4w6963.js";import{S as R}from"./rpc-story.fixtures-DxxG1e66.js";import"./preload-helper-B2LPdJL4.js";import"./DataTable-z5HAeWdy.js";import"./SortableHeader-D6uyLbqw.js";import"./utils-DW-IJACk.js";import"./loading-fzmQI4xp.js";import"./Modal-Ij3jRwS_.js";import"./index-C-v_fhIh.js";import"./index-CJnhqCAt.js";import"./Icon-CIXlnKq1.js";import"./button-DnQ0YN3u.js";import"./index-CPURVhFy.js";import"./modalStack-C5GZLWHZ.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-BM3ZdkSP.js";import"./floating-ui.react-DVsWwasi.js";import"./FilterPill-CqkGiVIF.js";import"./Combobox-RKis7mk3.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-CIXhO4AH.js";import"./DateTimePicker-DpM556qb.js";import"./MultiSelect-Bkir6wmV.js";import"./RangeSlider-BT91M6o2.js";import"./TimeRange-MscDrASO.js";import"./select-2vUPU0qA.js";import"./WorkloadPicker-tli5gWqm.js";import"./NamespacePicker-B_vEGaSn.js";import"./index-g2mC4pdU.js";import"./format-2niohfpq.js";import"./data-table-filter-values-BjWgdAnO.js";import"./Timestamp-DTj6PXDh.js";import"./TagList-BuiWsNdS.js";import"./Badge-ZzdJCCmU.js";import"./HoverCard-JZtZSXyK.js";import"./Properties-Dc8gkttr.js";import"./IconButton-BI2w7Aye.js";import"./DropdownMenu-DURoOFZK.js";import"./DropdownMenuSubmenu-BI4NbaSx.js";import"./StatusDot-BQQRUu5K.js";import"./Clicky-D1d1YHx7.js";import"./queryClient-DPxX1V9q.js";import"./suspense-BS8xFguF.js";import"./useQuery-CIHs76jR.js";import"./FilterForm-DFf9tK9P.js";import"./formMetadata-ju0c2YXu.js";import"./ErrorDetails-BENHOukl.js";import"./callout-tones-DN7X2Ehz.js";import"./Tree-BkyVAIuI.js";import"./TreeNode-DWk6sI2u.js";import"./ObjectGraph-DqyttWJQ.js";import"./ExecutionTree-0Gxetw4H.js";import"./CodeBlock-C2O3aeL9.js";import"./CodeDiff-NpNuPjHT.js";import"./SegmentedControl-CA_ysDTk.js";import"./HighlightedTokens-BZpO2Voi.js";import"./JsonView-D11UJCK0.js";import"./RenderedStackTrace-Cogclpan.js";import"./frame-heuristics-D62qKi0n.js";import"./StackFrameRow-DtDEci4W.js";import"./FrameSourceWindow-Cju4iMWY.js";import"./useQueryInfo-BmWNGY2D.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
3 pods updated`},N={success:!1,exit_code:1,contentType:"text/plain",stdout:"",stderr:"Error: forbidden — token lacks scope deployments:write"},hr={title:"Clicky-RPC/CommandOutput",component:e,tags:["autodocs"],parameters:{docs:{description:{component:"Renders an operation's `ExecutionResponse`: a Clicky document (e.g. a table) is rendered richly via `Clicky`/`DataTable`; plain text and JSON fall back to their viewers. Handles loading and empty states. Pure — pass the response in."}}},argTypes:{response:{control:!1},loading:{control:"boolean"}},args:{response:R}},t={render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(e,{...o})})},s={args:{response:v},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(e,{...o})})},a={args:{response:N},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(e,{...o})})},m={args:{response:null,loading:!0,loadingMessage:"Running command…"},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(e,{...o})})};var i,p,n;t.parameters={...t.parameters,docs:{...(i=t.parameters)==null?void 0:i.docs,source:{originalSource:`{
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
}`,...(O=(S=m.parameters)==null?void 0:S.docs)==null?void 0:O.source}}};const kr=["Table","Text","ErrorOutput","Loading"];export{a as ErrorOutput,m as Loading,t as Table,s as Text,kr as __namedExportsOrder,hr as default};
