import{j as e,r as S}from"./iframe-Dd752MYf.js";import{S as i}from"./Switch-CuCl6Jdy.js";import"./preload-helper-B2LPdJL4.js";import"./utils-CR52uffu.js";const{expect:p,userEvent:E,within:_}=__STORYBOOK_MODULE_TEST__,A={title:"Components/Switch",component:i,tags:["autodocs"],parameters:{docs:{description:{component:'On/off toggle switch (`role="switch"`). Density-aware — the track and knob scale with the active density.'}}}};function l({label:a}){const[t,d]=S.useState(!1);return e.jsx(i,{checked:t,onChange:d,label:a,"aria-label":a?void 0:"Toggle"})}const s={render:()=>e.jsx(l,{})},r={render:()=>e.jsx(l,{label:"Dark mode"})},n={render:()=>e.jsx(i,{checked:!0,onChange:()=>{},disabled:!0,"aria-label":"Locked"})},o={render:()=>e.jsx(l,{label:"Notifications"}),play:async({canvasElement:a,step:t})=>{const c=_(a).getByRole("switch");await t("starts off",async()=>{await p(c).toHaveAttribute("aria-checked","false")}),await t("clicking flips it on",async()=>{await E.click(c),await p(c).toHaveAttribute("aria-checked","true")})}};var m,u,w;s.parameters={...s.parameters,docs:{...(m=s.parameters)==null?void 0:m.docs,source:{originalSource:`{
  render: () => <Demo />
}`,...(w=(u=s.parameters)==null?void 0:u.docs)==null?void 0:w.source}}};var h,g,f;r.parameters={...r.parameters,docs:{...(h=r.parameters)==null?void 0:h.docs,source:{originalSource:`{
  render: () => <Demo label="Dark mode" />
}`,...(f=(g=r.parameters)==null?void 0:g.docs)==null?void 0:f.source}}};var b,k,v;n.parameters={...n.parameters,docs:{...(b=n.parameters)==null?void 0:b.docs,source:{originalSource:`{
  render: () => <Switch checked onChange={() => {}} disabled aria-label="Locked" />
}`,...(v=(k=n.parameters)==null?void 0:k.docs)==null?void 0:v.source}}};var x,y,D;o.parameters={...o.parameters,docs:{...(x=o.parameters)==null?void 0:x.docs,source:{originalSource:`{
  render: () => <Demo label="Notifications" />,
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    const sw = canvas.getByRole("switch");
    await step("starts off", async () => {
      await expect(sw).toHaveAttribute("aria-checked", "false");
    });
    await step("clicking flips it on", async () => {
      await userEvent.click(sw);
      await expect(sw).toHaveAttribute("aria-checked", "true");
    });
  }
}`,...(D=(y=o.parameters)==null?void 0:y.docs)==null?void 0:D.source}}};const C=["Default","WithLabel","Disabled","Toggles"];export{s as Default,n as Disabled,o as Toggles,r as WithLabel,C as __namedExportsOrder,A as default};
