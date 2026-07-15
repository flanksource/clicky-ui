import{j as e}from"./iframe-BpRSSwZm.js";import{P as o}from"./PromptInput-TU4iiWVL.js";import"./preload-helper-CLp6iKya.js";import"./utils-CR52uffu.js";import"./button-DLaYyks1.js";import"./index-0zBpNI7D.js";import"./loading-B8gOCNAl.js";import"./Icon-mdei39NN.js";import"./Attachment-C3E5EalR.js";const{fn:s}=__STORYBOOK_MODULE_TEST__,v={title:"Chat/PromptInput",component:o,tags:["autodocs"],parameters:{docs:{description:{component:"The chat composer: an auto-growing textarea with a submit/stop button driven by `status`, optional attachment button + chips (`enableAttachments`), and a footer `toolbar` slot for model/effort selectors. Calls `onSubmit(text, files)` on send."}}},argTypes:{status:{control:"inline-radio",options:["ready","submitted","streaming","error"]},enableAttachments:{control:"boolean"},placeholder:{control:"text"},toolbar:{control:!1}},args:{onSubmit:s(),onStop:s(),status:"ready",enableAttachments:!0,placeholder:"Ask anything…"}},t={render:a=>e.jsx("div",{className:"max-w-2xl",children:e.jsx(o,{...a})})},r={args:{status:"streaming"},render:a=>e.jsx("div",{className:"max-w-2xl",children:e.jsx(o,{...a})})};var n,m,i;t.parameters={...t.parameters,docs:{...(n=t.parameters)==null?void 0:n.docs,source:{originalSource:`{
  render: args => <div className="max-w-2xl">
      <PromptInput {...args} />
    </div>
}`,...(i=(m=t.parameters)==null?void 0:m.docs)==null?void 0:i.source}}};var c,p,l;r.parameters={...r.parameters,docs:{...(c=r.parameters)==null?void 0:c.docs,source:{originalSource:`{
  args: {
    status: "streaming"
  },
  render: args => <div className="max-w-2xl">
      <PromptInput {...args} />
    </div>
}`,...(l=(p=r.parameters)==null?void 0:p.docs)==null?void 0:l.source}}};const y=["Ready","Streaming"];export{t as Ready,r as Streaming,y as __namedExportsOrder,v as default};
