import{j as r}from"./iframe-Dfw8bSNS.js";import{C as o}from"./CommandOutput-B9HzhKlt.js";import{S as R}from"./rpc-story.fixtures-CHbQu3c1.js";import"./preload-helper-BQQafFCE.js";import"./DataTable-DJ5neLza.js";import"./SortableHeader-BB2wx33A.js";import"./utils-CR52uffu.js";import"./loading-CpXoKWIl.js";import"./router-BzXhn_jc.js";import"./Modal-Dj3IEMjB.js";import"./index-BU0kTGIV.js";import"./index-IjAocXud.js";import"./Icon-LnpkfR7o.js";import"./button-BnAxhu06.js";import"./index-0zBpNI7D.js";import"./modalStack-DgyyCbuz.js";import"./zIndex-CigQ76av.js";import"./FilterBar-C_l7MsOY.js";import"./floating-ui.react-Dfb6Fdco.js";import"./FilterPill-cAKS2MQW.js";import"./Combobox-N-gi9U5b.js";import"./json-schema-form-size-DYVq0lph.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-DjrCC5mn.js";import"./MultiSelect-DP0vs2EK.js";import"./RangeSlider-CEOBS3Kk.js";import"./TimeRange-DaAzKBV7.js";import"./select-DPvmnLRg.js";import"./Timestamp-BM-WhPgr.js";import"./TagList-2Ch11ceu.js";import"./Badge-C6EJhCkw.js";import"./HoverCard-BKsTK3HR.js";import"./Properties-CXeme7Ox.js";import"./IconButton-Dtrc3UyE.js";import"./DropdownMenu-DRP4j-ru.js";import"./DropdownMenuSubmenu-DmHV_tzh.js";import"./StatusDot-Daspm8Um.js";import"./Clicky-DKp8QvDo.js";import"./suspense-B4Snpy5w.js";import"./useQuery-CVPhMSGf.js";import"./FilterForm-D7ChAT8W.js";import"./types-BHfRQr8X.js";import"./Tree-C5As8cyP.js";import"./TreeNode-gtxieY-C.js";import"./ObjectGraph-TmG8SitJ.js";import"./ExecutionTree-iTCBt80Z.js";import"./CodeBlock-DDIY_OAl.js";import"./CodeDiff-iv3x786i.js";import"./SegmentedControl-d9EOhKCs.js";import"./code-highlight-BRZJmHgt.js";import"./JsonView-DwyJaB-0.js";import"./RenderedStackTrace-CO4rT5pR.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
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
