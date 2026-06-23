import{j as r}from"./iframe-tozGD2Qm.js";import{C as t}from"./CommandOutput-C63xYN2i.js";import{S as R}from"./rpc-story.fixtures-DGHkng_A.js";import"./preload-helper-DMBmwiZ1.js";import"./DataTable-DjUtVDTl.js";import"./SortableHeader-CGYXTxMB.js";import"./utils-BLSKlp9E.js";import"./Modal-D40HVwtV.js";import"./index-DpZMNVsH.js";import"./index-CoipAafu.js";import"./Icon-DV6apHHG.js";import"./button-BYIHgtoG.js";import"./index-1evVQkiP.js";import"./loading-B_J6UqsB.js";import"./modalStack-Bh_XSQ11.js";import"./zIndex-CigQ76av.js";import"./UiFullscreen-CA0cvJo9.js";import"./UiClose-DbbVB4Tg.js";import"./FilterBar-B-5vm8KD.js";import"./floating-ui.react-Cr0Yg90Q.js";import"./FilterPill-_qy4kQee.js";import"./UiAdd-B-QRjwmL.js";import"./UiRemove-MonctF9Y.js";import"./UiCheck-C56O4kNi.js";import"./timestamp-format-DJzkpO9P.js";import"./Combobox-ejxhN_W4.js";import"./json-schema-form-size-DYVq0lph.js";import"./UiChevronDown-CG_aM3Ba.js";import"./DateTimePicker-Bcbe3I2p.js";import"./UiCalendar-aD5ISbw5.js";import"./MultiSelect-DoS0LuaN.js";import"./UiChevronUp-CBnSOBHr.js";import"./RangeSlider-DpY3MCBh.js";import"./TimeRange-GNI-uP9a.js";import"./select-DX8Y4cr4.js";import"./UiWatch-D1gWowsV.js";import"./UiArrowRight-Cd74eEmp.js";import"./UiSearch-OIvii3ib.js";import"./UiFilter-D3hSyEKT.js";import"./UiChevronRight-C7XWtqzN.js";import"./Timestamp-CBS7aJN9.js";import"./TagList-DO0eOV2J.js";import"./Badge-Bd6WN4rF.js";import"./HoverCard-ClY83-uE.js";import"./Properties-CFT9GCE4.js";import"./UiZoomOut-Dt72zYRU.js";import"./UiCopy-BRNqKBow.js";import"./StatusDot-CbU3ncgB.js";import"./UiEllipsis-O-R66GtS.js";import"./UiArrowLeft-1A_ZjAGj.js";import"./UiRows-IKgd0V29.js";import"./UiListFlat-BeH-OoQV.js";import"./UiSun-DnONiuk9.js";import"./Clicky-DJeWiJXS.js";import"./suspense-zHp8QjVW.js";import"./useQuery-VF1ne8P2.js";import"./FilterForm-DXOGDVNi.js";import"./types-BHfRQr8X.js";import"./Tree-CA5j7UpN.js";import"./TreeNode-_gvIWw6k.js";import"./UiExpandAll-BVhmqjV-.js";import"./ObjectGraph-CdDu-igw.js";import"./ExecutionTree-BFNOwgRc.js";import"./CodeBlock-_BSfZ0Fh.js";import"./JsonView-BdmDNAWj.js";import"./code-highlight-DOLUZiqQ.js";import"./RenderedStackTrace-BfYf5mIK.js";import"./UiError-QMQ3tlPf.js";import"./UiStackFrameDot-D1VsBjme.js";import"./UiChip-DgOWNSn2.js";import"./UiDebugStepOver-BF5qcsXM.js";import"./UiMethod-tGd6ZUhZ.js";import"./UiCloudDownload-utHLhvr1.js";import"./UiComment-DDumnwAR.js";import"./UiTable-FNr8WtnP.js";import"./UiFileCode-BOQPOyi4.js";import"./UiFileSpreadsheet-Do3lfZKR.js";import"./UiMarkdown-CJtE9vHE.js";import"./UiFileText-BlMtZDCA.js";import"./UiJson-BecyUxkH.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
3 pods updated`},N={success:!1,exit_code:1,contentType:"text/plain",stdout:"",stderr:"Error: forbidden — token lacks scope deployments:write"},Ur={title:"Clicky-RPC/CommandOutput",component:t,tags:["autodocs"],parameters:{docs:{description:{component:"Renders an operation's `ExecutionResponse`: a Clicky document (e.g. a table) is rendered richly via `Clicky`/`DataTable`; plain text and JSON fall back to their viewers. Handles loading and empty states. Pure — pass the response in."}}},argTypes:{response:{control:!1},loading:{control:"boolean"}},args:{response:R}},e={render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(t,{...o})})},s={args:{response:v},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(t,{...o})})},m={args:{response:N},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(t,{...o})})},i={args:{response:null,loading:!0,loadingMessage:"Running command…"},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(t,{...o})})};var p,a,n;e.parameters={...e.parameters,docs:{...(p=e.parameters)==null?void 0:p.docs,source:{originalSource:`{
  render: args => <div className="max-w-3xl">
      <CommandOutput {...args} />
    </div>
}`,...(n=(a=e.parameters)==null?void 0:a.docs)==null?void 0:n.source}}};var d,c,l;s.parameters={...s.parameters,docs:{...(d=s.parameters)==null?void 0:d.docs,source:{originalSource:`{
  args: {
    response: TEXT_RESPONSE
  },
  render: args => <div className="max-w-3xl">
      <CommandOutput {...args} />
    </div>
}`,...(l=(c=s.parameters)==null?void 0:c.docs)==null?void 0:l.source}}};var u,x,g;m.parameters={...m.parameters,docs:{...(u=m.parameters)==null?void 0:u.docs,source:{originalSource:`{
  args: {
    response: ERROR_RESPONSE
  },
  render: args => <div className="max-w-3xl">
      <CommandOutput {...args} />
    </div>
}`,...(g=(x=m.parameters)==null?void 0:x.docs)==null?void 0:g.source}}};var E,S,O;i.parameters={...i.parameters,docs:{...(E=i.parameters)==null?void 0:E.docs,source:{originalSource:`{
  args: {
    response: null,
    loading: true,
    loadingMessage: "Running command…"
  },
  render: args => <div className="max-w-3xl">
      <CommandOutput {...args} />
    </div>
}`,...(O=(S=i.parameters)==null?void 0:S.docs)==null?void 0:O.source}}};const Vr=["Table","Text","ErrorOutput","Loading"];export{m as ErrorOutput,i as Loading,e as Table,s as Text,Vr as __namedExportsOrder,Ur as default};
