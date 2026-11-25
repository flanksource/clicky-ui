import{n as e}from"./rolldown-runtime-BCiCTKAo.js";import{t}from"./jsx-runtime-DKU1u6-r.js";import{t as n,u as r}from"./classes-BFK0cEJ7.js";import{n as i,t as a}from"./PatchedClassList-D7FQ8-Xm.js";var o,s,c,l,u,d,f,p,m,h;function g(){return(g=e((()=>{r(),i(),o=t(),{expect:s,fn:c,userEvent:l,within:u}=__STORYBOOK_MODULE_TEST__,d={title:`JVM/PatchedClassList`,component:a,decorators:[e=>(0,o.jsx)(`div`,{className:`w-80`,children:(0,o.jsx)(e,{})})],args:{onSelect:c(),patches:[{class:`com.example.orders.OrderService`,loader:n,patched:!0,leaseExpiresAt:18e11},{class:`com.example.orders.Ledger`,loader:n,patched:!0}]}},f={play:async({args:e,canvasElement:t})=>{await l.click(u(t).getByRole(`button`,{name:`com.example.orders.Ledger`})),await s(e.onSelect).toHaveBeenCalledWith({name:`com.example.orders.Ledger`,loader:n})}},p={args:{selected:{name:`com.example.orders.OrderService`,loader:n}}},m={args:{patches:[{class:`com.example.orders.Gone`,loader:n,patched:!0,error:`class is no longer loaded`}]}},h=[`Default`,`ClassInView`,`StalePatch`],f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  play: async ({
    args,
    canvasElement
  }) => {
    await userEvent.click(within(canvasElement).getByRole("button", {
      name: "com.example.orders.Ledger"
    }));
    await expect(args.onSelect).toHaveBeenCalledWith({
      name: "com.example.orders.Ledger",
      loader: APP_LOADER
    });
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    selected: {
      name: "com.example.orders.OrderService",
      loader: APP_LOADER
    }
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    patches: [{
      class: "com.example.orders.Gone",
      loader: APP_LOADER,
      patched: true,
      error: "class is no longer loaded"
    }]
  }
}`,...m.parameters?.docs?.source}}}})))()}g();export{p as ClassInView,f as Default,m as StalePatch,h as __namedExportsOrder,d as default};