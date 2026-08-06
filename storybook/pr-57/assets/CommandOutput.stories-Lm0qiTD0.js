import{j as r}from"./iframe-CE7GD-h8.js";import{C as o}from"./CommandOutput-ceFryjbr.js";import{S as R}from"./rpc-story.fixtures-d7hwJXf6.js";import"./preload-helper-DOqJbnTS.js";import"./DataTable-Bop9K-qg.js";import"./SortableHeader-BAB4U5Ui.js";import"./utils-CR52uffu.js";import"./loading-15Hwt9WZ.js";import"./Modal-CZUbhf8B.js";import"./index-IGCOwme-.js";import"./index-6cRtMSMf.js";import"./Icon-BYgNnDJy.js";import"./button-Dfg9Rs1O.js";import"./index-0zBpNI7D.js";import"./modalStack-57EfdgD-.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-Dd9EalVM.js";import"./floating-ui.react-gU3tFPBH.js";import"./FilterPill-7Y-DWDmD.js";import"./Combobox-BjvKe1Jd.js";import"./json-schema-form-size-DYVq0lph.js";import"./timestamp-format-CIXhO4AH.js";import"./DateTimePicker-DdTkh6kd.js";import"./MultiSelect-BLPs6sS7.js";import"./RangeSlider-lhOTECAK.js";import"./TimeRange-C_7NCR-V.js";import"./select-CNGRSNZC.js";import"./Timestamp-DyyiwMnA.js";import"./TagList-BgZW4-NK.js";import"./Badge-BHcCCgJC.js";import"./HoverCard-D3qpovMQ.js";import"./Properties-LS7Ju88c.js";import"./IconButton-CABk5ATW.js";import"./DropdownMenu-C35R8nCF.js";import"./DropdownMenuSubmenu-tQ6OzFem.js";import"./StatusDot-BmMmkvnL.js";import"./Clicky-B48usc7v.js";import"./queryClient-DFjd3SlB.js";import"./suspense-g7QRuhIw.js";import"./useQuery-VSBMGO80.js";import"./FilterForm-XXTr4K2D.js";import"./types-BHfRQr8X.js";import"./Tree-DSIOigUp.js";import"./TreeNode-DAFMYy1L.js";import"./ObjectGraph-v02b2fZX.js";import"./ExecutionTree-Dii7GXb2.js";import"./CodeBlock-CN1wJteJ.js";import"./CodeDiff-g41cXhed.js";import"./SegmentedControl-48DH_reb.js";import"./code-highlight-Ccv-x-l0.js";import"./JsonView-BK9Nf3kg.js";import"./RenderedStackTrace-DfFUu8lS.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
3 pods updated`},N={success:!1,exit_code:1,contentType:"text/plain",stdout:"",stderr:"Error: forbidden — token lacks scope deployments:write"},vr={title:"Clicky-RPC/CommandOutput",component:o,tags:["autodocs"],parameters:{docs:{description:{component:"Renders an operation's `ExecutionResponse`: a Clicky document (e.g. a table) is rendered richly via `Clicky`/`DataTable`; plain text and JSON fall back to their viewers. Handles loading and empty states. Pure — pass the response in."}}},argTypes:{response:{control:!1},loading:{control:"boolean"}},args:{response:R}},t={render:e=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(o,{...e})})},s={args:{response:v},render:e=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(o,{...e})})},a={args:{response:N},render:e=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(o,{...e})})},n={args:{response:null,loading:!0,loadingMessage:"Running command…"},render:e=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(o,{...e})})};var m,i,p;t.parameters={...t.parameters,docs:{...(m=t.parameters)==null?void 0:m.docs,source:{originalSource:`{
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
}`,...(O=(S=n.parameters)==null?void 0:S.docs)==null?void 0:O.source}}};const Nr=["Table","Text","ErrorOutput","Loading"];export{a as ErrorOutput,n as Loading,t as Table,s as Text,Nr as __namedExportsOrder,vr as default};
