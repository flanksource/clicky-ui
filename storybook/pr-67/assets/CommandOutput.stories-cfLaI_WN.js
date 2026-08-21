import{j as r}from"./iframe-3AGyK8hb.js";import{C as e}from"./CommandOutput-riSLJQuu.js";import{S as R}from"./rpc-story.fixtures-Dk5rYFFG.js";import"./preload-helper-BZ6gUoWu.js";import"./DataTable-n3o_Eku2.js";import"./SortableHeader-C2ljIuZh.js";import"./utils-DW-IJACk.js";import"./loading-Cj7UYS4Y.js";import"./Modal-B1tvo5No.js";import"./index-DRDyDoJZ.js";import"./index-WSCvljIm.js";import"./Icon-CAsTbVJm.js";import"./button-U8MTciKW.js";import"./index-CPURVhFy.js";import"./modalStack-BmabxbPz.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-DR1omuLj.js";import"./floating-ui.react-B2E0q2HE.js";import"./FilterPill-BOG8GCjc.js";import"./Combobox-DkXUqrJM.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-CIXhO4AH.js";import"./DateTimePicker-Ja-Uwep0.js";import"./MultiSelect-vs6U-zF2.js";import"./RangeSlider-YYrhN8Zb.js";import"./TimeRange-Dize49gQ.js";import"./select-CSClMOXH.js";import"./WorkloadPicker-hkIkikYM.js";import"./NamespacePicker-BKrOAaI2.js";import"./index-qZ6dogUk.js";import"./format-2niohfpq.js";import"./data-table-filter-values-BjWgdAnO.js";import"./Timestamp-Bw6NxVpK.js";import"./TagList-CnuLxkVG.js";import"./Badge-BMQ82CjC.js";import"./HoverCard-Dsdb2i08.js";import"./Properties-Kuwl6NR5.js";import"./IconButton-CzUhDj7B.js";import"./DropdownMenu-BZBF6lnq.js";import"./DropdownMenuSubmenu-CRyGnaom.js";import"./StatusDot-C_eh4z_k.js";import"./Clicky-DiJzAHO3.js";import"./queryClient-D4igQv2Y.js";import"./suspense-B8QZv9FK.js";import"./useQuery-Cb_yMbLc.js";import"./FilterForm-5B0J7uLB.js";import"./formMetadata-CckkYDfi.js";import"./ErrorDetails-Df9Wud3b.js";import"./callout-tones-DN7X2Ehz.js";import"./Tree-ijNllTxm.js";import"./TreeNode-D5Yll6uG.js";import"./ObjectGraph-5B3yFNyY.js";import"./ExecutionTree-CieblfPe.js";import"./CodeBlock-wPhW2EU8.js";import"./CodeDiff-5-J-PAkr.js";import"./SegmentedControl-DXahW2R9.js";import"./HighlightedTokens-A5tM11q1.js";import"./JsonView-CewC2E7K.js";import"./RenderedStackTrace-P49X_ERd.js";import"./frame-heuristics-BYkwT_IR.js";import"./StackFrameRow-CejuRXn9.js";import"./FrameSourceWindow-DepruKpG.js";import"./useQueryInfo-CXMMXnvS.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
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
