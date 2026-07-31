import{j as r}from"./iframe-BxSHt6am.js";import{C as o}from"./CommandOutput-CgIsy0Gd.js";import{S as R}from"./rpc-story.fixtures-B3YiDNdO.js";import"./preload-helper-CMdjLrOk.js";import"./DataTable-UjqqKjKz.js";import"./SortableHeader-BCGeEp4q.js";import"./utils-CR52uffu.js";import"./loading-BVbt5uSK.js";import"./Modal-CtAbINeY.js";import"./index-C7qnLePO.js";import"./index-BfNp2C0W.js";import"./Icon-69Sjv527.js";import"./button-BQC6J4zs.js";import"./index-0zBpNI7D.js";import"./modalStack-Btv7ibBQ.js";import"./zIndex-CigQ76av.js";import"./FilterBar-CK0lGJQQ.js";import"./floating-ui.react-Dx5zIT9R.js";import"./FilterPill-BXAtaj_U.js";import"./Combobox-BMngNnPG.js";import"./json-schema-form-size-DYVq0lph.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-DTXgJA8r.js";import"./MultiSelect-DEq1Ppq0.js";import"./RangeSlider-CseA40wp.js";import"./TimeRange-e7JkhGYw.js";import"./select-CzvdH8B6.js";import"./Timestamp-CuKSw4xt.js";import"./TagList-fP9goIol.js";import"./Badge-OKhDnUsv.js";import"./HoverCard-gBAMqwCn.js";import"./Properties-D9BwRAsD.js";import"./IconButton-C1VcIWe0.js";import"./DropdownMenu-CDSlUuAS.js";import"./DropdownMenuSubmenu-C85W3XG-.js";import"./StatusDot-BQjy2RYT.js";import"./Clicky-8sgVTajb.js";import"./queryClient-BrHJJWPF.js";import"./suspense-Dfu9i9E4.js";import"./useQuery-BsaAbF3J.js";import"./FilterForm-CDvbn6s3.js";import"./types-BHfRQr8X.js";import"./Tree-Bw19uotx.js";import"./TreeNode-Bvra1SyR.js";import"./ObjectGraph-B4DzYYw6.js";import"./ExecutionTree-C4M8KWr1.js";import"./CodeBlock-Cc5F0wvm.js";import"./CodeDiff-CRooDBGu.js";import"./SegmentedControl-CJn_8XKa.js";import"./code-highlight-DoRYE0Aj.js";import"./JsonView-lGaX26s-.js";import"./RenderedStackTrace-ClbG9iky.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
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
