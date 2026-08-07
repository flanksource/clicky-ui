import{j as r}from"./iframe-BW12FETW.js";import{C as o}from"./CommandOutput-Bydfo_U6.js";import{S as R}from"./rpc-story.fixtures-CobuhziG.js";import"./preload-helper-B2LPdJL4.js";import"./DataTable-BIyKT2jy.js";import"./SortableHeader-B-Dlosao.js";import"./utils-CR52uffu.js";import"./loading-Dbw8cjcb.js";import"./Modal-wCkM4yzI.js";import"./index-D-nQD73E.js";import"./index-9NU1mlqD.js";import"./Icon-hksqPAe3.js";import"./button-C1MH17Zc.js";import"./index-0zBpNI7D.js";import"./modalStack-M98G4Zz7.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-bG1WS0u1.js";import"./floating-ui.react-DmmqB0te.js";import"./FilterPill-Dv7xoXaX.js";import"./Combobox-ZYnGyNSg.js";import"./json-schema-form-size-DYVq0lph.js";import"./timestamp-format-CIXhO4AH.js";import"./DateTimePicker-DajyfDhj.js";import"./MultiSelect-DKILBgj5.js";import"./RangeSlider-DXo4a9IS.js";import"./TimeRange-UGOJtU8h.js";import"./select-Dq3oow6c.js";import"./Timestamp-CMbIlKnE.js";import"./TagList-Grm9sVQM.js";import"./Badge-CvknhbZU.js";import"./HoverCard-1h0LYB4r.js";import"./Properties-Bq7G0PgT.js";import"./IconButton-DO-nC4dq.js";import"./DropdownMenu-CPl8kDYM.js";import"./DropdownMenuSubmenu-B6JHjlBN.js";import"./StatusDot-BWRIHMXy.js";import"./Clicky-BjhAuvQC.js";import"./queryClient-D1p-ZcUj.js";import"./suspense-DH49EHFp.js";import"./useQuery-CqT5a6dN.js";import"./FilterForm-BVNPfD6F.js";import"./types-BHfRQr8X.js";import"./Tree-CD3SVePX.js";import"./TreeNode-DUQ309FG.js";import"./ObjectGraph-C3dQVL_9.js";import"./ExecutionTree-A70UhzDK.js";import"./CodeBlock-CADMdYrZ.js";import"./CodeDiff-CBLDd1IQ.js";import"./SegmentedControl-BbV1j_MF.js";import"./code-highlight-Dq2IweCb.js";import"./JsonView-BsWn6jlo.js";import"./RenderedStackTrace-DbxGGGqp.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
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
