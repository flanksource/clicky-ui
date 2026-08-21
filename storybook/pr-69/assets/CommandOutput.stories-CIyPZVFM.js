import{j as r}from"./iframe-DVLyhhyR.js";import{C as e}from"./CommandOutput-DereQP2T.js";import{S as R}from"./rpc-story.fixtures-S0qZSwBp.js";import"./preload-helper-BF_8wlrL.js";import"./DataTable-BZ8dTbrw.js";import"./SortableHeader-3RP-paab.js";import"./utils-DW-IJACk.js";import"./loading-D5f_KmBM.js";import"./Modal-BLSVbdLl.js";import"./index-C9M6r6Gv.js";import"./index-k6ap-kH7.js";import"./Icon-Bcz4oWVg.js";import"./button-BpmYcoer.js";import"./index-CPURVhFy.js";import"./modalStack-tHezNq4t.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-CisZa1vs.js";import"./floating-ui.react-d2RX-2Uc.js";import"./FilterPill-DZc785eX.js";import"./Combobox-BiHWhjrB.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-CIXhO4AH.js";import"./DateTimePicker-D49XbMgL.js";import"./MultiSelect-Cy8_opG-.js";import"./RangeSlider-CPAnfaDB.js";import"./TimeRange-CnFFl-63.js";import"./select-Dhx-RWkR.js";import"./WorkloadPicker-PE1r84ZV.js";import"./NamespacePicker-D8gdpImp.js";import"./index-XBo6aJbL.js";import"./format-2niohfpq.js";import"./data-table-filter-values-BjWgdAnO.js";import"./Timestamp-OHWW41Q5.js";import"./TagList-FXdNxf-m.js";import"./Badge-BPMQmJTm.js";import"./HoverCard-gv6_MrnL.js";import"./Properties-B-cetqq_.js";import"./IconButton-BK8oEHbS.js";import"./DropdownMenu-BnjeottO.js";import"./DropdownMenuSubmenu-DYWaeLWS.js";import"./StatusDot-BGm_u8DQ.js";import"./Clicky-Bwtn3pZv.js";import"./queryClient-DHxULy81.js";import"./suspense-Dz-w0Olr.js";import"./useQuery-Bz-SZVuG.js";import"./FilterForm-CT4X-Pu7.js";import"./formMetadata-UPAAbMVU.js";import"./ErrorDetails-BDdn5lO1.js";import"./callout-tones-DN7X2Ehz.js";import"./Tree-DG6IuCf2.js";import"./TreeNode-ZBbMvg4c.js";import"./ObjectGraph-D68ikylt.js";import"./ExecutionTree-BbLWEp84.js";import"./CodeBlock-CB4TiB7t.js";import"./CodeDiff-dOnzDEr8.js";import"./SegmentedControl-qiWl8AQ0.js";import"./HighlightedTokens-DC7jht55.js";import"./JsonView-BNbm-R-L.js";import"./RenderedStackTrace-DQmqZbae.js";import"./frame-heuristics-D62qKi0n.js";import"./StackFrameRow-BbDu91zt.js";import"./FrameSourceWindow-HfOLzJkd.js";import"./useQueryInfo-ejMEppTf.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
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
