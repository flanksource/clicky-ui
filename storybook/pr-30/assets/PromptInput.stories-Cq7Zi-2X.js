import{j as e}from"./iframe-D5a9zzxb.js";import{P as a}from"./PromptInput-DX-3Jvu4.js";import"./preload-helper-D5l2DbWZ.js";import"./utils-BLSKlp9E.js";import"./button-Bu96Zmyu.js";import"./index-1evVQkiP.js";import"./loading-C4NUXH3t.js";import"./Icon-BWpUElqS.js";import"./Attachment-CIau5Iq5.js";import"./UiFile-DE04nOc5.js";import"./UiClose-BjYk5SS2.js";import"./UiAdd-DQ1mHvnk.js";import"./UiStop-DbjJ5rII.js";import"./UiArrowUp-IMjYSg3G.js";const{fn:s}=__STORYBOOK_MODULE_TEST__,P={title:"Chat/PromptInput",component:a,tags:["autodocs"],parameters:{docs:{description:{component:"The chat composer: an auto-growing textarea with a submit/stop button driven by `status`, optional attachment button + chips (`enableAttachments`), and a footer `toolbar` slot for model/effort selectors. Calls `onSubmit(text, files)` on send."}}},argTypes:{status:{control:"inline-radio",options:["ready","submitted","streaming","error"]},enableAttachments:{control:"boolean"},placeholder:{control:"text"},toolbar:{control:!1}},args:{onSubmit:s(),onStop:s(),status:"ready",enableAttachments:!0,placeholder:"Ask anything…"}},t={render:o=>e.jsx("div",{className:"max-w-2xl",children:e.jsx(a,{...o})})},r={args:{status:"streaming"},render:o=>e.jsx("div",{className:"max-w-2xl",children:e.jsx(a,{...o})})};var n,m,i;t.parameters={...t.parameters,docs:{...(n=t.parameters)==null?void 0:n.docs,source:{originalSource:`{
  render: args => <div className="max-w-2xl">
      <PromptInput {...args} />
    </div>
}`,...(i=(m=t.parameters)==null?void 0:m.docs)==null?void 0:i.source}}};var p,c,l;r.parameters={...r.parameters,docs:{...(p=r.parameters)==null?void 0:p.docs,source:{originalSource:`{
  args: {
    status: "streaming"
  },
  render: args => <div className="max-w-2xl">
      <PromptInput {...args} />
    </div>
}`,...(l=(c=r.parameters)==null?void 0:c.docs)==null?void 0:l.source}}};const T=["Ready","Streaming"];export{t as Ready,r as Streaming,T as __namedExportsOrder,P as default};
