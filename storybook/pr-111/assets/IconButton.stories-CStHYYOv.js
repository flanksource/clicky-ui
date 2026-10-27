import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./jsx-runtime-BG4KOiPz.js";import{Eu as n,Hc as r,Qs as i,n as a,pu as o}from"./icons-Dd_HwYAK.js";import{n as s,t as c}from"./IconButton-cK_o4tqU.js";var l,u,d,f,p,m,h,g,_,v;function y(){return(y=e((()=>{s(),a(),l=t(),{expect:u,fn:d,userEvent:f,within:p}=__STORYBOOK_MODULE_TEST__,m={title:`Components/IconButton`,component:c,tags:[`autodocs`],parameters:{docs:{description:{component:"Borderless, background-free icon button: the hover effect lives on the glyph color, not a surrounding chip. Use for inline affordances (close, overflow menu, row actions). For a box-shaped control use `Button`."}}},argTypes:{icon:{control:!1,description:`Imported icon component to render.`},label:{control:`text`,description:`Accessible name; sets both aria-label and tooltip.`},disabled:{control:`boolean`},iconClassName:{control:`text`,description:`Extra glyph classes, e.g. size.`}},args:{icon:r,label:`More actions`,onClick:d()}},h={},g={render:()=>(0,l.jsxs)(`div`,{className:`flex items-center gap-4`,children:[(0,l.jsx)(c,{icon:r,label:`More actions`}),(0,l.jsx)(c,{icon:i,label:`Pick date`}),(0,l.jsx)(c,{icon:o,label:`Filter`}),(0,l.jsx)(c,{icon:n,label:`Dismiss`,iconClassName:`text-base`}),(0,l.jsx)(c,{icon:r,label:`Disabled`,disabled:!0})]})},_={play:async({args:e,canvasElement:t})=>{let n=p(t);await f.click(n.getByRole(`button`,{name:`More actions`})),await u(e.onClick).toHaveBeenCalledTimes(1)}},v=[`Default`,`Variants`,`Click`],h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex items-center gap-4">
      <IconButton icon={UiDotsVertical} label="More actions" />
      <IconButton icon={UiCalendar} label="Pick date" />
      <IconButton icon={UiFilter} label="Filter" />
      <IconButton icon={UiClose} label="Dismiss" iconClassName="text-base" />
      <IconButton icon={UiDotsVertical} label="Disabled" disabled />
    </div>
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
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
}`,..._.parameters?.docs?.source}}}})))()}y();export{_ as Click,h as Default,g as Variants,v as __namedExportsOrder,m as default};