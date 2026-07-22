import{j as r}from"./iframe-Bv6gAHUq.js";import{C as o}from"./CommandOutput-DblIfgOr.js";import{S as R}from"./rpc-story.fixtures-Cgb9Aqpn.js";import"./preload-helper-B0hK8ODC.js";import"./DataTable-DwpvdDms.js";import"./SortableHeader-BlzVlcT5.js";import"./utils-CR52uffu.js";import"./loading-B6_ukMCj.js";import"./router-C0Vn02UO.js";import"./Modal-CMDFICFE.js";import"./index-B3BSmVaF.js";import"./index-V2QXoyuL.js";import"./Icon-CE_TMgWG.js";import"./button-CsEq_IVC.js";import"./index-0zBpNI7D.js";import"./modalStack-BUGVIEM5.js";import"./zIndex-CigQ76av.js";import"./FilterBar-Ha_SZp4U.js";import"./floating-ui.react-BRelZoEz.js";import"./FilterPill-DeuicIev.js";import"./Combobox-PEoRC-Wv.js";import"./json-schema-form-size-DYVq0lph.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-J91is-yu.js";import"./MultiSelect-DdiTeQa-.js";import"./RangeSlider-s9LOvIj5.js";import"./TimeRange-Bcj2q2KW.js";import"./select-Boyd-XNG.js";import"./Timestamp-C-TxOZVt.js";import"./TagList-DNKGw2qH.js";import"./Badge-TV7g7i20.js";import"./HoverCard-DMQGmO8o.js";import"./Properties-BADF2Zqv.js";import"./IconButton-CG3Z6G9y.js";import"./DropdownMenu-84u2Dr9o.js";import"./DropdownMenuSubmenu-BkBfphEi.js";import"./StatusDot-2jfairtX.js";import"./Clicky-D9TXPkI2.js";import"./suspense-9mJ7e_qZ.js";import"./useQuery-DhPM3z2y.js";import"./FilterForm-CmwVIrj7.js";import"./types-BHfRQr8X.js";import"./Tree-xwnRj7Af.js";import"./TreeNode-BfzUA3Ps.js";import"./ObjectGraph-erLvwyW3.js";import"./ExecutionTree-C0nomx9_.js";import"./CodeBlock-DgCqiVEU.js";import"./CodeDiff-CBoMXOST.js";import"./SegmentedControl-CpEjE6Dg.js";import"./code-highlight-DTvn2rNL.js";import"./JsonView-BmNa_f8t.js";import"./RenderedStackTrace-CWQDn_Cj.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
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
