import{j as r}from"./iframe-8a3mxbiL.js";import{C as o}from"./CommandOutput-D6cdZElc.js";import{S as R}from"./rpc-story.fixtures-DhSY7xMC.js";import"./preload-helper-BH-fM7Kg.js";import"./DataTable-B3asNR-o.js";import"./SortableHeader-CJ_0oo49.js";import"./utils-CR52uffu.js";import"./loading-CTKxppdZ.js";import"./router-dUsbDzRp.js";import"./Modal-AWbib2uC.js";import"./index-OVEhUYYK.js";import"./index-CJR232Yw.js";import"./Icon-DoTJG9m4.js";import"./button-DRmzN4zq.js";import"./index-0zBpNI7D.js";import"./modalStack-CQiTd9mY.js";import"./zIndex-CigQ76av.js";import"./FilterBar-C8PasQEo.js";import"./floating-ui.react-B9xkSNms.js";import"./FilterPill-COqhhJjB.js";import"./Combobox-BvYvKhMp.js";import"./json-schema-form-size-DYVq0lph.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-CD40w4Yw.js";import"./MultiSelect-pySzacFs.js";import"./RangeSlider-BP1NKhfb.js";import"./TimeRange-2ZM8Dupb.js";import"./select--4PtNUCo.js";import"./Timestamp-DnrZ4rEj.js";import"./TagList-mYSAqpIA.js";import"./Badge-B7UBvqYL.js";import"./HoverCard-CrdrYCz8.js";import"./Properties-jCER9gJx.js";import"./IconButton-CcpOtKON.js";import"./DropdownMenu-DsuCn4Tz.js";import"./DropdownMenuSubmenu-DH-o0gzi.js";import"./StatusDot-hpoYGNF-.js";import"./Clicky-DODFHh4w.js";import"./suspense-B1pvEZd6.js";import"./useQuery-CT3kaCMG.js";import"./FilterForm-DbmD0hO0.js";import"./types-BHfRQr8X.js";import"./Tree-DEduaNC0.js";import"./TreeNode-0e8lYeI-.js";import"./ObjectGraph-C7BqzeeA.js";import"./ExecutionTree-CPIuhJ35.js";import"./CodeBlock-CyYpw4im.js";import"./CodeDiff-DD54JYEE.js";import"./SegmentedControl-DdUmX-61.js";import"./code-highlight-BpkgIRXS.js";import"./JsonView-DI61V85f.js";import"./RenderedStackTrace-DXZY26-v.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
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
