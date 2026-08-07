import{j as r}from"./iframe-BMFBCv_6.js";import{C as o}from"./CommandOutput-DSewqKN5.js";import{S as R}from"./rpc-story.fixtures-D9dhMp9u.js";import"./preload-helper-XHXHPdWU.js";import"./DataTable-ytwYjHZi.js";import"./SortableHeader-WRdhtjCt.js";import"./utils-CR52uffu.js";import"./loading-6hDWTPbr.js";import"./Modal-C2tSaU6I.js";import"./index-Dbcmk1Ba.js";import"./index-C0LRYh99.js";import"./Icon-rDmXslRI.js";import"./button-DdAX4yWv.js";import"./index-0zBpNI7D.js";import"./modalStack-vzTQsCJ3.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-BMIgwjCe.js";import"./floating-ui.react-iWwRdKWF.js";import"./FilterPill-Duw4fxQQ.js";import"./Combobox-D4JxQ_Ex.js";import"./json-schema-form-size-DYVq0lph.js";import"./timestamp-format-CIXhO4AH.js";import"./DateTimePicker-D9V9-0ug.js";import"./MultiSelect-g9tyQV7f.js";import"./RangeSlider-CfBgCZn9.js";import"./TimeRange-BLD6rnMy.js";import"./select-8Uwg0MuP.js";import"./Timestamp-DbQKcMwO.js";import"./TagList-WBMmhCQ4.js";import"./Badge--gSTK7-C.js";import"./HoverCard-CfIJkTvI.js";import"./Properties-CF2rtjsQ.js";import"./IconButton-c1QHMig1.js";import"./DropdownMenu-TalBA55R.js";import"./DropdownMenuSubmenu-YgknNbsv.js";import"./StatusDot-CsrJx1SH.js";import"./Clicky-B27Xoe8G.js";import"./queryClient-COiClV0I.js";import"./suspense-HiIhmXCZ.js";import"./useQuery-DbWgus6c.js";import"./FilterForm-B-JY3-St.js";import"./types-BHfRQr8X.js";import"./Tree-DIeNLRYO.js";import"./TreeNode-CaeFq0iH.js";import"./ObjectGraph-Dp1J9n4O.js";import"./ExecutionTree-B_evD2Z_.js";import"./CodeBlock-k5ldqZbG.js";import"./CodeDiff-Dks0ufUS.js";import"./SegmentedControl-CH9wcuGB.js";import"./code-highlight-C03wEi4q.js";import"./JsonView-BOKPq2ZA.js";import"./RenderedStackTrace-C7eXylfj.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
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
