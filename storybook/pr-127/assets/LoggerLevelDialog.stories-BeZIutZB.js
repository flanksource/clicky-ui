import{n as e}from"./rolldown-runtime-BCiCTKAo.js";import{a as t,u as n}from"./classes-BeUaZMhY.js";import{i as r,r as i}from"./loggers-BVQqgKFZ.js";import{n as a,t as o}from"./LoggerLevelDialog-Bm3cqXN6.js";var s,c,l,u,d,f,p,m,h,g;function _(){return(_=e((()=>{n(),i(),a(),{expect:s,screen:c,userEvent:l}=__STORYBOOK_MODULE_TEST__,u=r(t),d=e=>u.find(t=>t.name===e),f={title:`JVM/LoggerLevelDialog`,component:o,parameters:{layout:`fullscreen`},args:{logger:d(`com.example.orders`),onSave:async()=>{},onClose:()=>{}}},p={play:async()=>{await s(await c.findByRole(`combobox`)).toHaveValue(`FINE`)}},m={args:{logger:d(`com.example.orders.OrderService`)},play:async()=>{await s(await c.findByRole(`combobox`)).toHaveValue(`__inherit__`)}},h={args:{onSave:async()=>{throw Error(`mutation disabled for setLoggerLevel`)}},play:async()=>{await l.click(await c.findByRole(`button`,{name:`Set level`})),await s(await c.findByRole(`alert`)).toHaveTextContent(`mutation disabled`)}},g=[`SetLevel`,`Inheriting`,`WriteFails`],p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  play: async () => {
    await expect(await screen.findByRole("combobox")).toHaveValue("FINE");
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    logger: row("com.example.orders.OrderService")
  },
  play: async () => {
    await expect(await screen.findByRole("combobox")).toHaveValue("__inherit__");
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    onSave: async () => {
      throw new Error("mutation disabled for setLoggerLevel");
    }
  },
  play: async () => {
    await userEvent.click(await screen.findByRole("button", {
      name: "Set level"
    }));
    await expect(await screen.findByRole("alert")).toHaveTextContent("mutation disabled");
  }
}`,...h.parameters?.docs?.source}}}})))()}_();export{m as Inheriting,p as SetLevel,h as WriteFails,g as __namedExportsOrder,f as default};