import{j as r}from"./iframe-scM6jv7l.js";import{C as e}from"./CommandOutput-DF-GjbzT.js";import{S as R}from"./rpc-story.fixtures-03KAJIAo.js";import"./preload-helper-BZ6gUoWu.js";import"./DataTable-CDa7TLw-.js";import"./SortableHeader-aQ4v7HNn.js";import"./utils-DW-IJACk.js";import"./loading-CoSFZPt_.js";import"./Modal-BsIAmpjA.js";import"./index-Dg88cS0S.js";import"./index-BHYuFw_a.js";import"./Icon-D1Qa4F67.js";import"./button-DaoW-x1g.js";import"./index-CPURVhFy.js";import"./modalStack-Brf0cgOc.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-DBFAcwAO.js";import"./floating-ui.react-CtGrG4Ss.js";import"./FilterPill-CvQmW-YX.js";import"./Combobox-CoXsdk2a.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-CIXhO4AH.js";import"./DateTimePicker-CN7LoCYr.js";import"./MultiSelect-3Fct0_Kv.js";import"./RangeSlider-k7UQ7Nfq.js";import"./TimeRange-Z1HTj6vd.js";import"./select-sc2EPqZV.js";import"./WorkloadPicker-DqZ87tEj.js";import"./NamespacePicker-PAQ0Nv3-.js";import"./index-CUnqFJI_.js";import"./format-2niohfpq.js";import"./data-table-filter-values-BjWgdAnO.js";import"./Timestamp-BW6UrTA9.js";import"./TagList-CyQjKAHQ.js";import"./Badge-CxWP8_R4.js";import"./HoverCard-v5Ub5wgF.js";import"./Properties-BTdq2sKW.js";import"./IconButton-B3_VSIbb.js";import"./DropdownMenu-DHMrPqIU.js";import"./DropdownMenuSubmenu-BADt-LvZ.js";import"./StatusDot-wHVO6RD_.js";import"./Clicky-B6mat6cy.js";import"./queryClient-MxvyLHUF.js";import"./suspense-BUcFuxZk.js";import"./useQuery-B8xT-nNw.js";import"./FilterForm-j03csS8B.js";import"./formMetadata-DHWWC6Lw.js";import"./ErrorDetails-DuOYRHmU.js";import"./callout-tones-DN7X2Ehz.js";import"./Tree-PiX4YyfS.js";import"./TreeNode-B_Ry_Bfb.js";import"./ObjectGraph-Dyjj4bqY.js";import"./ExecutionTree-DYr51j7N.js";import"./CodeBlock-BuI3trH-.js";import"./CodeDiff-1j-oPl0B.js";import"./SegmentedControl-DsWujpoS.js";import"./HighlightedTokens-DXe1pHlS.js";import"./JsonView-B5S_U7gP.js";import"./RenderedStackTrace-B0i-Vc33.js";import"./frame-heuristics-D62qKi0n.js";import"./StackFrameRow-u7ptKMn2.js";import"./FrameSourceWindow-cZpGYa9e.js";import"./useQueryInfo-BnduC6b0.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
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
