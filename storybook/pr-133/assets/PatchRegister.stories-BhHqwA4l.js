import{n as e}from"./rolldown-runtime-BCiCTKAo.js";import{t}from"./react-BcdEFcws.js";import{t as n}from"./jsx-runtime-DKU1u6-r.js";import{n as r,t as i}from"./PatchRegister-N4Mg_4om.js";function a({patches:e,canMutate:t,failures:n}){let[r,a]=(0,o.useState)(e);return(0,s.jsx)(`div`,{className:`h-[420px] p-3`,children:(0,s.jsx)(i,{patches:r,now:d,canMutate:t,failures:n,onRestore:e=>a(t=>t.filter(t=>t!==e)),onRestoreAll:e=>a(t=>t.filter(t=>!e.includes(t))),onRenew:e=>a(t=>t.map(t=>t===e?{...t,leaseExpiresAt:d+12e4}:t)),emptyHint:`Patch a class from the class browser and it appears here.`,renderClassLink:e=>(0,s.jsx)(`a`,{className:`truncate font-mono text-xs text-primary hover:underline`,href:`#/classes/${e.class}`,children:e.class})})})}var o,s,c,l,u,d,f,p,m,h,g,_,v,y;function b(){return(b=e((()=>{o=t(),r(),s=n(),{expect:c,userEvent:l,within:u}=__STORYBOOK_MODULE_TEST__,d=Date.parse(`2026-11-15T08:00:00Z`),f=[{class:`com.example.orders.OrderService`,loader:`app`,patched:!0,leaseExpiresAt:d+12e4},{class:`com.example.payments.PaymentGateway`,loader:`app`,patched:!0},{class:`com.example.legacy.ReportJob`,loader:`gone`,patched:!1,error:`class is no longer loaded`},{class:`com.example.rules.Rule42`,loader:`~janino`,patched:!0,leaseExpiresAt:d+3e4}],p={title:`JVM/PatchRegister`,component:a,parameters:{layout:`fullscreen`},args:{patches:f,canMutate:!0,failures:[]}},m={play:async({canvasElement:e})=>{let t=u(e);await c(t.getByText(`3 classes patched`)).toBeInTheDocument(),await c(t.getByText(/1 class has no lease/)).toBeInTheDocument(),await l.click(t.getByRole(`button`,{name:`Restore com.example.orders.OrderService`})),await c(t.getByText(`2 classes patched`)).toBeInTheDocument()}},h={play:async({canvasElement:e})=>{let t=u(e);await l.click(t.getByRole(`button`,{name:`Restore all (2)`})),await c(t.getByText(`1 class patched`)).toBeInTheDocument(),await c(t.getByRole(`button`,{name:`Restore all (0)`})).toBeDisabled()}},g={args:{canMutate:!1},play:async({canvasElement:e})=>{await c(u(e).getByRole(`button`,{name:`Restore all (2)`})).toBeDisabled()}},_={args:{failures:[{key:`app:com.example.payments.PaymentGateway`,className:`com.example.payments.PaymentGateway`,message:`redefinition rejected: schema change`}]}},v={args:{patches:[]},play:async({canvasElement:e})=>{await c(u(e).getByText(`This JVM is running its original bytecode.`)).toBeInTheDocument()}},y=[`Register`,`RestoreAll`,`WritesDisabled`,`RestoreFailed`,`Empty`],m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("3 classes patched")).toBeInTheDocument();
    await expect(canvas.getByText(/1 class has no lease/)).toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", {
      name: "Restore com.example.orders.OrderService"
    }));
    await expect(canvas.getByText("2 classes patched")).toBeInTheDocument();
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", {
      name: "Restore all (2)"
    }));
    // Rule42 sits in the virtual \`~janino\` loader, which cannot be restored from the register, so it survives "Restore all".
    await expect(canvas.getByText("1 class patched")).toBeInTheDocument();
    await expect(canvas.getByRole("button", {
      name: "Restore all (0)"
    })).toBeDisabled();
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    canMutate: false
  },
  play: async ({
    canvasElement
  }) => {
    await expect(within(canvasElement).getByRole("button", {
      name: "Restore all (2)"
    })).toBeDisabled();
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    failures: [{
      key: "app:com.example.payments.PaymentGateway",
      className: "com.example.payments.PaymentGateway",
      message: "redefinition rejected: schema change"
    }]
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    patches: []
  },
  play: async ({
    canvasElement
  }) => {
    await expect(within(canvasElement).getByText("This JVM is running its original bytecode.")).toBeInTheDocument();
  }
}`,...v.parameters?.docs?.source}}}})))()}b();export{v as Empty,m as Register,h as RestoreAll,_ as RestoreFailed,g as WritesDisabled,y as __namedExportsOrder,p as default};