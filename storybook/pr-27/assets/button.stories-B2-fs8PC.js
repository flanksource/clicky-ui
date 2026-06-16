import{j as a}from"./iframe-BpjD9CLN.js";import{B as p}from"./button-CIXvgs_R.js";import"./preload-helper-BZuLNX-z.js";import"./utils-BLSKlp9E.js";import"./index-1evVQkiP.js";import"./loading-BFNT0xXo.js";const{expect:v,fn:J,userEvent:N,within:Q}=__STORYBOOK_MODULE_TEST__,te={title:"Components/Button",component:p,tags:["autodocs"],parameters:{docs:{description:{component:"Primary command button with Clicky density tokens, shadcn-style variants, optional loading state, and Radix Slot support via `asChild`."}}},argTypes:{variant:{description:"Visual treatment for the command.",control:"select",options:["default","destructive","outline","secondary","ghost","link"]},size:{description:"Button size preset. `icon` creates a square icon-only button.",control:"select",options:["default","sm","lg","icon"]},disabled:{description:"Disable pointer and keyboard activation.",control:"boolean"},loading:{description:"Show spinner and disable the button while pending.",control:"boolean"},loadingLabel:{description:"Content shown while loading; defaults to `children`."},asChild:{description:"Render styles onto the child element with Radix Slot."},onClick:{description:"Click handler.",action:"click"}},args:{children:"Button",onClick:J()}},n={},t={args:{variant:"destructive"}},s={args:{variant:"outline"}},r={args:{variant:"secondary"}},o={args:{variant:"ghost"}},i={args:{variant:"link"}},c={render:e=>a.jsxs("div",{style:{display:"flex",gap:"0.5rem",alignItems:"center"},children:[a.jsx(p,{...e,size:"sm",children:"Small"}),a.jsx(p,{...e,size:"default",children:"Default"}),a.jsx(p,{...e,size:"lg",children:"Large"})]})},l={args:{disabled:!0}},d={args:{loading:!0,children:"Saving"}},u={args:{children:"Click me"},play:async({args:e,canvasElement:A,step:g})=>{const m=Q(A).getByRole("button",{name:/click me/i});await g("button is focusable via keyboard",async()=>{m.focus(),await v(m).toHaveFocus()}),await g("click fires the handler",async()=>{await N.click(m),await v(e.onClick).toHaveBeenCalledTimes(1)})}};var h,y,b;n.parameters={...n.parameters,docs:{...(h=n.parameters)==null?void 0:h.docs,source:{originalSource:"{}",...(b=(y=n.parameters)==null?void 0:y.docs)==null?void 0:b.source}}};var k,S,f;t.parameters={...t.parameters,docs:{...(k=t.parameters)==null?void 0:k.docs,source:{originalSource:`{
  args: {
    variant: "destructive"
  }
}`,...(f=(S=t.parameters)==null?void 0:S.docs)==null?void 0:f.source}}};var w,B,C;s.parameters={...s.parameters,docs:{...(w=s.parameters)==null?void 0:w.docs,source:{originalSource:`{
  args: {
    variant: "outline"
  }
}`,...(C=(B=s.parameters)==null?void 0:B.docs)==null?void 0:C.source}}};var x,z,D;r.parameters={...r.parameters,docs:{...(x=r.parameters)==null?void 0:x.docs,source:{originalSource:`{
  args: {
    variant: "secondary"
  }
}`,...(D=(z=r.parameters)==null?void 0:z.docs)==null?void 0:D.source}}};var E,L,_;o.parameters={...o.parameters,docs:{...(E=o.parameters)==null?void 0:E.docs,source:{originalSource:`{
  args: {
    variant: "ghost"
  }
}`,...(_=(L=o.parameters)==null?void 0:L.docs)==null?void 0:_.source}}};var O,R,j;i.parameters={...i.parameters,docs:{...(O=i.parameters)==null?void 0:O.docs,source:{originalSource:`{
  args: {
    variant: "link"
  }
}`,...(j=(R=i.parameters)==null?void 0:R.docs)==null?void 0:j.source}}};var T,H,I;c.parameters={...c.parameters,docs:{...(T=c.parameters)==null?void 0:T.docs,source:{originalSource:`{
  render: args => <div style={{
    display: "flex",
    gap: "0.5rem",
    alignItems: "center"
  }}>
      <Button {...args} size="sm">
        Small
      </Button>
      <Button {...args} size="default">
        Default
      </Button>
      <Button {...args} size="lg">
        Large
      </Button>
    </div>
}`,...(I=(H=c.parameters)==null?void 0:H.docs)==null?void 0:I.source}}};var F,G,q;l.parameters={...l.parameters,docs:{...(F=l.parameters)==null?void 0:F.docs,source:{originalSource:`{
  args: {
    disabled: true
  }
}`,...(q=(G=l.parameters)==null?void 0:G.docs)==null?void 0:q.source}}};var K,M,P;d.parameters={...d.parameters,docs:{...(K=d.parameters)==null?void 0:K.docs,source:{originalSource:`{
  args: {
    loading: true,
    children: "Saving"
  }
}`,...(P=(M=d.parameters)==null?void 0:M.docs)==null?void 0:P.source}}};var U,V,Y;u.parameters={...u.parameters,docs:{...(U=u.parameters)==null?void 0:U.docs,source:{originalSource:`{
  args: {
    children: "Click me"
  },
  play: async ({
    args,
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    const btn = canvas.getByRole("button", {
      name: /click me/i
    });
    await step("button is focusable via keyboard", async () => {
      btn.focus();
      await expect(btn).toHaveFocus();
    });
    await step("click fires the handler", async () => {
      await userEvent.click(btn);
      await expect(args.onClick).toHaveBeenCalledTimes(1);
    });
  }
}`,...(Y=(V=u.parameters)==null?void 0:V.docs)==null?void 0:Y.source}}};const se=["Default","Destructive","Outline","Secondary","Ghost","Link","Sizes","Disabled","Loading","ClickInteraction"];export{u as ClickInteraction,n as Default,t as Destructive,l as Disabled,o as Ghost,i as Link,d as Loading,s as Outline,r as Secondary,c as Sizes,se as __namedExportsOrder,te as default};
