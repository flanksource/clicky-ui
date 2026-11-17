import{n as e}from"./rolldown-runtime-BCiCTKAo.js";import{n as t,t as n}from"./PatchRegisterTable-BidgIP_r.js";var r,i,a,o,s,c,l,u,d;function f(){return(f=e((()=>{t(),{expect:r,within:i}=__STORYBOOK_MODULE_TEST__,a=Date.parse(`2026-11-15T08:00:00Z`),o=[{class:`com.example.orders.OrderService`,loader:`app`,patched:!0,leaseExpiresAt:a+125e3},{class:`com.example.payments.PaymentGateway`,loader:`app`,patched:!0},{class:`com.example.legacy.ReportJob`,loader:`gone`,patched:!1,error:`class is no longer loaded`}],s={title:`JVM/PatchRegisterTable`,component:n,parameters:{layout:`padded`},args:{patches:o,now:a,canMutate:!0,onRestore:()=>{},onRenew:()=>{}}},c={play:async({canvasElement:e})=>{let t=i(e);await r(t.getByText(`in 2m 5s`)).toBeInTheDocument(),await r(t.getByText(`no lease`)).toBeInTheDocument()}},l={args:{canMutate:!1},play:async({canvasElement:e})=>{await r(i(e).getByRole(`button`,{name:`Restore com.example.orders.OrderService`})).toBeDisabled()}},u={args:{busyKey:`app:com.example.orders.OrderService`}},d=[`Default`,`WritesDisabled`,`RowBusy`],c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("in 2m 5s")).toBeInTheDocument();
    await expect(canvas.getByText("no lease")).toBeInTheDocument();
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    canMutate: false
  },
  play: async ({
    canvasElement
  }) => {
    await expect(within(canvasElement).getByRole("button", {
      name: "Restore com.example.orders.OrderService"
    })).toBeDisabled();
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    busyKey: "app:com.example.orders.OrderService"
  }
}`,...u.parameters?.docs?.source}}}})))()}f();export{c as Default,u as RowBusy,l as WritesDisabled,d as __namedExportsOrder,s as default};