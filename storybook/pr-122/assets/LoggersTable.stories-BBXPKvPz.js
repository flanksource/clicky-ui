import{n as e}from"./rolldown-runtime-BCiCTKAo.js";import{t}from"./react-BcdEFcws.js";import{t as n}from"./jsx-runtime-DKU1u6-r.js";import{a as r,u as i}from"./classes-BeUaZMhY.js";import{n as a,t as o}from"./LoggersTable-D9yO-ONu.js";function s({filter:e,canEdit:t}){let[n,i]=(0,c.useState)(e);return(0,l.jsx)(`div`,{className:`flex h-[420px] flex-col p-3`,children:(0,l.jsx)(o,{loggers:r,filter:n,onFilterChange:i,onEdit:()=>{},canEdit:t})})}var c,l,u,d,f,p,m,h,g,_;function v(){return(v=e((()=>{c=t(),i(),a(),l=n(),{expect:u,userEvent:d,within:f}=__STORYBOOK_MODULE_TEST__,p={title:`JVM/LoggersTable`,component:s,parameters:{layout:`fullscreen`},args:{filter:``,canEdit:!0}},m={play:async({canvasElement:e})=>{await u(f(e).getByText(`(inherit) → FINE`)).toBeInTheDocument()}},h={play:async({canvasElement:e})=>{let t=f(e);await d.type(t.getByRole(`textbox`,{name:`Filter loggers`}),`catalina`),await u(t.getByText(`2 of 7 loggers`)).toBeInTheDocument()}},g={args:{canEdit:!1}},_=[`AllLoggers`,`Filtering`,`ReadOnly`],m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    await expect(within(canvasElement).getByText("(inherit) → FINE")).toBeInTheDocument();
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole("textbox", {
      name: "Filter loggers"
    }), "catalina");
    await expect(canvas.getByText("2 of 7 loggers")).toBeInTheDocument();
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    canEdit: false
  }
}`,...g.parameters?.docs?.source}}}})))()}v();export{m as AllLoggers,h as Filtering,g as ReadOnly,_ as __namedExportsOrder,p as default};