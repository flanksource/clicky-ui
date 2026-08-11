import{j as r}from"./iframe-CxzpxXnf.js";import{C as o}from"./CommandOutput-PTuVV4e-.js";import{S as R}from"./rpc-story.fixtures-D0BGTng8.js";import"./preload-helper-Bz0j3TbD.js";import"./DataTable-D7tXsMsL.js";import"./SortableHeader-Cb8nB1Wn.js";import"./utils-CR52uffu.js";import"./loading-BWXL-EJN.js";import"./Modal-CMDPRFgu.js";import"./index-znxQrsYw.js";import"./index-BE6eQQjG.js";import"./Icon-G_P9Ael4.js";import"./button-Dv1c-HWl.js";import"./index-0zBpNI7D.js";import"./modalStack-C0ppkTLD.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-DidRgj3A.js";import"./floating-ui.react-DYQK7KlJ.js";import"./FilterPill-CAf8OcYI.js";import"./Combobox-YmscG384.js";import"./json-schema-form-size-DYVq0lph.js";import"./timestamp-format-CIXhO4AH.js";import"./DateTimePicker-9YQZB76C.js";import"./MultiSelect-DuRxVK12.js";import"./RangeSlider-DQ3giTXw.js";import"./TimeRange-BGyoGrKO.js";import"./select-D2hBC6sn.js";import"./data-table-filter-values-DUyokwAE.js";import"./Timestamp-BD8uhT97.js";import"./TagList-DG2m8EBp.js";import"./Badge-DRutLBkV.js";import"./HoverCard-D-_YQGqt.js";import"./Properties-ocMY2fzX.js";import"./IconButton-DFtTY-ef.js";import"./DropdownMenu-ClNljnW2.js";import"./DropdownMenuSubmenu-p1eb8qgT.js";import"./StatusDot-DHJrM0ji.js";import"./Clicky-CPFQYbeV.js";import"./queryClient-BrKFu1tL.js";import"./suspense-CalEbgp-.js";import"./useQuery-BlW5tbIw.js";import"./FilterForm-BH1u_02Y.js";import"./formMetadata-C_zoVUF9.js";import"./types-BHfRQr8X.js";import"./Tree-CYZBTczY.js";import"./TreeNode-C1_k8td9.js";import"./ObjectGraph-CIXEO91g.js";import"./ExecutionTree-Cl7n0EhH.js";import"./CodeBlock-B2nlRz-5.js";import"./CodeDiff-BRBJbzBc.js";import"./SegmentedControl-OFhKl5o1.js";import"./code-highlight-Ev9vknTQ.js";import"./JsonView-B8b33lGC.js";import"./RenderedStackTrace-CdwtkC7W.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
3 pods updated`},N={success:!1,exit_code:1,contentType:"text/plain",stdout:"",stderr:"Error: forbidden — token lacks scope deployments:write"},Tr={title:"Clicky-RPC/CommandOutput",component:o,tags:["autodocs"],parameters:{docs:{description:{component:"Renders an operation's `ExecutionResponse`: a Clicky document (e.g. a table) is rendered richly via `Clicky`/`DataTable`; plain text and JSON fall back to their viewers. Handles loading and empty states. Pure — pass the response in."}}},argTypes:{response:{control:!1},loading:{control:"boolean"}},args:{response:R}},t={render:e=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(o,{...e})})},s={args:{response:v},render:e=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(o,{...e})})},a={args:{response:N},render:e=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(o,{...e})})},n={args:{response:null,loading:!0,loadingMessage:"Running command…"},render:e=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(o,{...e})})};var m,i,p;t.parameters={...t.parameters,docs:{...(m=t.parameters)==null?void 0:m.docs,source:{originalSource:`{
  render: args => <div className="max-w-3xl">
      <CommandOutput {...args} />
    </div>
}`,...(p=(i=t.parameters)==null?void 0:i.docs)==null?void 0:p.source}}};var d,c,l;s.parameters={...s.parameters,docs:{...(d=s.parameters)==null?void 0:d.docs,source:{originalSource:`{
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
}`,...(g=(x=a.parameters)==null?void 0:x.docs)==null?void 0:g.source}}};var E,S,O;n.parameters={...n.parameters,docs:{...(E=n.parameters)==null?void 0:E.docs,source:{originalSource:`{
  args: {
    response: null,
    loading: true,
    loadingMessage: "Running command…"
  },
  render: args => <div className="max-w-3xl">
      <CommandOutput {...args} />
    </div>
}`,...(O=(S=n.parameters)==null?void 0:S.docs)==null?void 0:O.source}}};const yr=["Table","Text","ErrorOutput","Loading"];export{a as ErrorOutput,n as Loading,t as Table,s as Text,yr as __namedExportsOrder,Tr as default};
