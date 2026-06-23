import{j as e}from"./iframe-Ch1BYoLl.js";import{I as o}from"./IconButton-BZMyE5bc.js";import{U as s}from"./UiDotsVertical-1XrUpQPM.js";import{U as v}from"./UiCalendar-CC_TAq6h.js";import{U as C}from"./UiFilter-BYfbi1Ux.js";import{U}from"./UiClose-B7EVqjbt.js";import"./preload-helper-B4w--iqy.js";import"./utils-BLSKlp9E.js";import"./Icon-CajlMFHd.js";const{expect:B,fn:h,userEvent:k,within:D}=__STORYBOOK_MODULE_TEST__,N={title:"Components/IconButton",component:o,tags:["autodocs"],parameters:{docs:{description:{component:"Borderless, background-free icon button: the hover effect lives on the glyph color, not a surrounding chip. Use for inline affordances (close, overflow menu, row actions). For a box-shaped control use `Button`."}}},argTypes:{icon:{control:!1,description:"Imported icon component to render."},label:{control:"text",description:"Accessible name; sets both aria-label and tooltip."},disabled:{control:"boolean"},iconClassName:{control:"text",description:"Extra glyph classes, e.g. size."}},args:{icon:s,label:"More actions",onClick:h()}},a={},t={render:()=>e.jsxs("div",{className:"flex items-center gap-4",children:[e.jsx(o,{icon:s,label:"More actions"}),e.jsx(o,{icon:v,label:"Pick date"}),e.jsx(o,{icon:C,label:"Filter"}),e.jsx(o,{icon:U,label:"Dismiss",iconClassName:"text-base"}),e.jsx(o,{icon:s,label:"Disabled",disabled:!0})]})},n={play:async({args:f,canvasElement:x})=>{const g=D(x);await k.click(g.getByRole("button",{name:"More actions"})),await B(f.onClick).toHaveBeenCalledTimes(1)}};var r,i,c;a.parameters={...a.parameters,docs:{...(r=a.parameters)==null?void 0:r.docs,source:{originalSource:"{}",...(c=(i=a.parameters)==null?void 0:i.docs)==null?void 0:c.source}}};var l,m,d;t.parameters={...t.parameters,docs:{...(l=t.parameters)==null?void 0:l.docs,source:{originalSource:`{
  render: () => <div className="flex items-center gap-4">
      <IconButton icon={UiDotsVertical} label="More actions" />
      <IconButton icon={UiCalendar} label="Pick date" />
      <IconButton icon={UiFilter} label="Filter" />
      <IconButton icon={UiClose} label="Dismiss" iconClassName="text-base" />
      <IconButton icon={UiDotsVertical} label="Disabled" disabled />
    </div>
}`,...(d=(m=t.parameters)==null?void 0:m.docs)==null?void 0:d.source}}};var p,u,b;n.parameters={...n.parameters,docs:{...(p=n.parameters)==null?void 0:p.docs,source:{originalSource:`{
  play: async ({
    args,
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", {
      name: "More actions"
    }));
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  }
}`,...(b=(u=n.parameters)==null?void 0:u.docs)==null?void 0:b.source}}};const O=["Default","Variants","Click"];export{n as Click,a as Default,t as Variants,O as __namedExportsOrder,N as default};
