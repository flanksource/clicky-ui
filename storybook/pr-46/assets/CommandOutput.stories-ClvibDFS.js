import{j as r}from"./iframe-Brz7uG0w.js";import{C as o}from"./CommandOutput-CDTEPhFO.js";import{S as R}from"./rpc-story.fixtures-Bg7o7-EF.js";import"./preload-helper-CWjhL4mC.js";import"./DataTable-BYEePOQQ.js";import"./SortableHeader-Cybr6CMk.js";import"./utils-CR52uffu.js";import"./loading-BMlqM7sR.js";import"./router-BA7_k8TG.js";import"./Modal-I9QDA5n7.js";import"./index-Depi-ijF.js";import"./index-Bal-wItA.js";import"./Icon-TBHX6vaP.js";import"./button-D7cFQgQy.js";import"./index-0zBpNI7D.js";import"./modalStack-Dup504Ib.js";import"./zIndex-CigQ76av.js";import"./FilterBar-BFwKXoO-.js";import"./floating-ui.react-0ijvpx2q.js";import"./FilterPill-DEONZcwa.js";import"./Combobox-3u3vZ6Yg.js";import"./json-schema-form-size-DYVq0lph.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-CZPDGSAY.js";import"./MultiSelect-BGa2l5UM.js";import"./RangeSlider-BuNMf_7-.js";import"./TimeRange-JZb_pc_Z.js";import"./select-C279HRC6.js";import"./Timestamp-D1tTwYRn.js";import"./TagList-JHQgApis.js";import"./Badge-DiMqGgpq.js";import"./HoverCard-kOJMaq5_.js";import"./Properties-sA1UXR1u.js";import"./IconButton-Bq8v92WK.js";import"./DropdownMenu-DhyI35ja.js";import"./DropdownMenuSubmenu-C_w83Fau.js";import"./StatusDot-D9vr_Kup.js";import"./Clicky-JBdsyd2D.js";import"./suspense-CTwlXSEU.js";import"./useQuery-D2LqNsI2.js";import"./FilterForm-BKoqAeBx.js";import"./types-BHfRQr8X.js";import"./Tree-T0qblCre.js";import"./TreeNode-BXyCwLDB.js";import"./ObjectGraph-DtR2R5_b.js";import"./ExecutionTree-E64dtYJG.js";import"./CodeBlock-CFfHgiK1.js";import"./CodeDiff-BvVewkuk.js";import"./SegmentedControl-CT7U2uw-.js";import"./code-highlight-BFJi_bUq.js";import"./JsonView-CHUUuX2x.js";import"./RenderedStackTrace-BmeOKeu0.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
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
