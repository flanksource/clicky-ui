import{j as r}from"./iframe-YETa_cG9.js";import{C as e}from"./CommandOutput-DPQrnQsC.js";import{S as R}from"./rpc-story.fixtures-RmLus4H2.js";import"./preload-helper-BF_8wlrL.js";import"./DataTable-CAXjvGV5.js";import"./SortableHeader-B_Shxw0J.js";import"./utils-DW-IJACk.js";import"./loading-BAKLzrcW.js";import"./Modal-B6frkNwF.js";import"./index-OzyaF4V_.js";import"./index-CseixOkg.js";import"./Icon-Ca6PCkd-.js";import"./button-wvsJ1tMU.js";import"./index-CPURVhFy.js";import"./modalStack-Dm7Q2W0x.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-DXZ3cELL.js";import"./floating-ui.react-5Xu4xio0.js";import"./FilterPill-BHlDdZuO.js";import"./Combobox-DwypI7by.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-CIXhO4AH.js";import"./DateTimePicker-BsjKNXxy.js";import"./MultiSelect-DpleDOga.js";import"./RangeSlider-CHZXS3OS.js";import"./TimeRange-DByITHG7.js";import"./select-XRAQCHRk.js";import"./WorkloadPicker-DPNfT-TU.js";import"./NamespacePicker-DJA6GhnN.js";import"./index-kwPzq5DO.js";import"./format-2niohfpq.js";import"./data-table-filter-values-BjWgdAnO.js";import"./Timestamp-CVhQnDFJ.js";import"./TagList-C1AmNstE.js";import"./Badge-DMxUBa2p.js";import"./HoverCard-DKlkGkUA.js";import"./Properties-A0f_QHLO.js";import"./IconButton-Dpkf3rqZ.js";import"./DropdownMenu-CiFq7tJJ.js";import"./DropdownMenuSubmenu-CvY5YgBD.js";import"./StatusDot-X-ZqG0eg.js";import"./Clicky-D26xCt2g.js";import"./queryClient-C-UZ77Bi.js";import"./suspense-HtsdzYnW.js";import"./useQuery-Bv_r98TO.js";import"./FilterForm-BjJqxJtW.js";import"./formMetadata-1MuakVl7.js";import"./ErrorDetails-BEPQGPkA.js";import"./callout-tones-DN7X2Ehz.js";import"./Tree-B468uYWs.js";import"./TreeNode-DI-9saRK.js";import"./ObjectGraph-B7b-KlFN.js";import"./ExecutionTree-CobdLD7E.js";import"./CodeBlock-E0RLpeKQ.js";import"./CodeDiff-ClBPH2-9.js";import"./SegmentedControl-DEMn3w7A.js";import"./HighlightedTokens-BFU-UXqr.js";import"./JsonView-BHce71x3.js";import"./RenderedStackTrace-CzjvYWG-.js";import"./frame-heuristics-D62qKi0n.js";import"./StackFrameRow-CNfiF09A.js";import"./FrameSourceWindow-CCva46Ku.js";import"./useQueryInfo-CWgfKJgA.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
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
