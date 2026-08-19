import{j as r}from"./iframe-MH-vj1fJ.js";import{C as e}from"./CommandOutput-BKBnSrKo.js";import{S as R}from"./rpc-story.fixtures-DIBIqz6d.js";import"./preload-helper-BAJsONWX.js";import"./DataTable-Cvmk9neY.js";import"./SortableHeader-DVFaNomf.js";import"./utils-DW-IJACk.js";import"./loading-BHrW_Xpr.js";import"./Modal-CeptBYBr.js";import"./index-CFyMYuKU.js";import"./index-Ov6R7Iok.js";import"./Icon-COZMD_wV.js";import"./button-BwokIHeX.js";import"./index-CPURVhFy.js";import"./modalStack-BJTaq2IY.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-Dewo640Y.js";import"./floating-ui.react-DzOgc0ph.js";import"./FilterPill-Dk-VCZK7.js";import"./Combobox-DMYZKXth.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-CIXhO4AH.js";import"./DateTimePicker-l1Mub5_l.js";import"./MultiSelect-CG1lWNDU.js";import"./RangeSlider-C5gqdPn1.js";import"./TimeRange-D1w3A_A6.js";import"./select-DENU96S5.js";import"./WorkloadPicker-DNXkzLlc.js";import"./NamespacePicker-BHDuMTgv.js";import"./index-OvPbd-dd.js";import"./format-2niohfpq.js";import"./data-table-filter-values-BjWgdAnO.js";import"./Timestamp-BP12F390.js";import"./TagList-BmjvDKgQ.js";import"./Badge-Dvd-uKDd.js";import"./HoverCard-CNefJPBd.js";import"./Properties-BYKPxYt2.js";import"./IconButton-D4wLlq_a.js";import"./DropdownMenu-CgObs0Qc.js";import"./DropdownMenuSubmenu-BpJCh-cF.js";import"./StatusDot-B2SCzMQd.js";import"./Clicky-BVidZeZm.js";import"./queryClient-J72CU7YW.js";import"./suspense-BW3jUvGv.js";import"./useQuery-CzblYxlF.js";import"./FilterForm-DUsrMyJL.js";import"./formMetadata-CvfD97Cw.js";import"./types-BHfRQr8X.js";import"./ErrorDetails-DF4ZU2wo.js";import"./callout-tones-DN7X2Ehz.js";import"./Tree-2ykvjrmL.js";import"./TreeNode-BuwPrsag.js";import"./ObjectGraph-y-asVjIW.js";import"./ExecutionTree-D3OZvWgr.js";import"./CodeBlock-D4Ws4V76.js";import"./CodeDiff-Df0FYV_3.js";import"./SegmentedControl-Dmbzz7PX.js";import"./code-highlight-DknG25m0.js";import"./JsonView-DIQCGyLw.js";import"./RenderedStackTrace-CpNSspED.js";import"./useQueryInfo-FwTBJSQ_.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
3 pods updated`},N={success:!1,exit_code:1,contentType:"text/plain",stdout:"",stderr:"Error: forbidden — token lacks scope deployments:write"},Pr={title:"Clicky-RPC/CommandOutput",component:e,tags:["autodocs"],parameters:{docs:{description:{component:"Renders an operation's `ExecutionResponse`: a Clicky document (e.g. a table) is rendered richly via `Clicky`/`DataTable`; plain text and JSON fall back to their viewers. Handles loading and empty states. Pure — pass the response in."}}},argTypes:{response:{control:!1},loading:{control:"boolean"}},args:{response:R}},t={render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(e,{...o})})},s={args:{response:v},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(e,{...o})})},a={args:{response:N},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(e,{...o})})},m={args:{response:null,loading:!0,loadingMessage:"Running command…"},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(e,{...o})})};var i,n,p;t.parameters={...t.parameters,docs:{...(i=t.parameters)==null?void 0:i.docs,source:{originalSource:`{
  render: args => <div className="max-w-3xl">
      <CommandOutput {...args} />
    </div>
}`,...(p=(n=t.parameters)==null?void 0:n.docs)==null?void 0:p.source}}};var d,c,l;s.parameters={...s.parameters,docs:{...(d=s.parameters)==null?void 0:d.docs,source:{originalSource:`{
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
}`,...(O=(S=m.parameters)==null?void 0:S.docs)==null?void 0:O.source}}};const br=["Table","Text","ErrorOutput","Loading"];export{a as ErrorOutput,m as Loading,t as Table,s as Text,br as __namedExportsOrder,Pr as default};
