import{j as r}from"./iframe-QA7Jz26Z.js";import{C as o}from"./CommandOutput-D-Hb5ytz.js";import{S as R}from"./rpc-story.fixtures-f6sW8l8u.js";import"./preload-helper-CLp6iKya.js";import"./DataTable-obg13aFv.js";import"./SortableHeader-BX0cuPoa.js";import"./utils-CR52uffu.js";import"./loading-B2I4S6H9.js";import"./router-DhCWlQX7.js";import"./Modal-D8A5p0x2.js";import"./index-CD6l-YRN.js";import"./index-Dr8BpMir.js";import"./Icon-BlQl19kd.js";import"./button-DWVdGjlr.js";import"./index-0zBpNI7D.js";import"./modalStack-DcYdjS_E.js";import"./zIndex-CigQ76av.js";import"./FilterBar-BHJggDmF.js";import"./floating-ui.react-CQCnQ-n1.js";import"./FilterPill-D0RcJ0T0.js";import"./Combobox-DqAIyX98.js";import"./json-schema-form-size-DYVq0lph.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-DPOlPgZj.js";import"./MultiSelect-Do-T0tsS.js";import"./RangeSlider-Ct0MW4Ex.js";import"./TimeRange-Fk9EhN3Y.js";import"./select-Cn2cXgw0.js";import"./Timestamp-DR-BlFrC.js";import"./TagList-By9K3G4_.js";import"./Badge-ByG0TZcC.js";import"./HoverCard-D6ndIhoW.js";import"./Properties-BXPTjvtJ.js";import"./IconButton-Iy7bQXbJ.js";import"./DropdownMenu-BlgOIORC.js";import"./DropdownMenuSubmenu-DHD_yNiY.js";import"./StatusDot-Do6ECJVt.js";import"./Clicky-DCNHmbQ0.js";import"./suspense-BIv9cq63.js";import"./useQuery-CQf0zqFk.js";import"./FilterForm-B1qnaJB-.js";import"./types-BHfRQr8X.js";import"./Tree-yvBKqbyW.js";import"./TreeNode-DpsbWHL-.js";import"./ObjectGraph-DTvJb-AT.js";import"./ExecutionTree-C9-j_QqC.js";import"./CodeBlock-BxM9OG9H.js";import"./CodeDiff-1HW7T_KG.js";import"./SegmentedControl-DE5sxb3k.js";import"./code-highlight-DmoBPuv7.js";import"./JsonView-BgGtl1T4.js";import"./RenderedStackTrace-BlhOUlPC.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
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
