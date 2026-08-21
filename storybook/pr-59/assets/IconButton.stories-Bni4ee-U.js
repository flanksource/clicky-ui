import{e as s,j as e,f as v,g as C,h as B}from"./iframe-Bfqmb9is.js";import{I as o}from"./IconButton-BI2w7Aye.js";import"./preload-helper-B2LPdJL4.js";import"./utils-DW-IJACk.js";import"./Icon-CIXlnKq1.js";const{expect:h,fn:U,userEvent:k,within:D}=__STORYBOOK_MODULE_TEST__,_={title:"Components/IconButton",component:o,tags:["autodocs"],parameters:{docs:{description:{component:"Borderless, background-free icon button: the hover effect lives on the glyph color, not a surrounding chip. Use for inline affordances (close, overflow menu, row actions). For a box-shaped control use `Button`."}}},argTypes:{icon:{control:!1,description:"Imported icon component to render."},label:{control:"text",description:"Accessible name; sets both aria-label and tooltip."},disabled:{control:"boolean"},iconClassName:{control:"text",description:"Extra glyph classes, e.g. size."}},args:{icon:s,label:"More actions",onClick:U()}},a={},n={render:()=>e.jsxs("div",{className:"flex items-center gap-4",children:[e.jsx(o,{icon:s,label:"More actions"}),e.jsx(o,{icon:v,label:"Pick date"}),e.jsx(o,{icon:C,label:"Filter"}),e.jsx(o,{icon:B,label:"Dismiss",iconClassName:"text-base"}),e.jsx(o,{icon:s,label:"Disabled",disabled:!0})]})},t={play:async({args:x,canvasElement:g})=>{const f=D(g);await k.click(f.getByRole("button",{name:"More actions"})),await h(x.onClick).toHaveBeenCalledTimes(1)}};var c,r,i;a.parameters={...a.parameters,docs:{...(c=a.parameters)==null?void 0:c.docs,source:{originalSource:"{}",...(i=(r=a.parameters)==null?void 0:r.docs)==null?void 0:i.source}}};var l,d,m;n.parameters={...n.parameters,docs:{...(l=n.parameters)==null?void 0:l.docs,source:{originalSource:`{
  render: () => <div className="flex items-center gap-4">
      <IconButton icon={UiDotsVertical} label="More actions" />
      <IconButton icon={UiCalendar} label="Pick date" />
      <IconButton icon={UiFilter} label="Filter" />
      <IconButton icon={UiClose} label="Dismiss" iconClassName="text-base" />
      <IconButton icon={UiDotsVertical} label="Disabled" disabled />
    </div>
}`,...(m=(d=n.parameters)==null?void 0:d.docs)==null?void 0:m.source}}};var p,u,b;t.parameters={...t.parameters,docs:{...(p=t.parameters)==null?void 0:p.docs,source:{originalSource:`{
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
}`,...(b=(u=t.parameters)==null?void 0:u.docs)==null?void 0:b.source}}};const M=["Default","Variants","Click"];export{t as Click,a as Default,n as Variants,M as __namedExportsOrder,_ as default};
