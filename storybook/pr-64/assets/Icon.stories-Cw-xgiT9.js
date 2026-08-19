import{w as a,a7 as T,a8 as w,j as e,I as B,h as M,X as A,a9 as F,aa as H,ab as K}from"./iframe-MH-vj1fJ.js";import{S as R,I as s}from"./Icon-COZMD_wV.js";import"./preload-helper-BAJsONWX.js";import"./utils-DW-IJACk.js";const X={title:"Data/Icon",component:s,args:{icon:a,className:"text-green-600 text-xl",title:"approved",style:"plain",tone:"neutral"},argTypes:{icon:{table:{disable:!0}},style:{control:"inline-radio",options:["plain","badge"]},tone:{control:"inline-radio",options:["emerald","amber","rose","slate","sky","violet","neutral"]},size:{control:"inline-radio",options:R}},parameters:{docs:{description:{component:'Renders statically imported icon components for built-in icons. Runtime string names are for user-supplied data handled by a registered fallback provider. Use `style="badge"` when the icon needs its own circular chip.'}}}},r={args:{icon:a,className:"text-green-600 text-xl"}},n={args:{icon:T,className:"text-red-600 text-xl"}},o={args:{icon:w,className:"text-blue-500 text-2xl"}},i={args:{icon:a,style:"badge",tone:"emerald",size:"lg",title:"approved"}},c={render:()=>e.jsx("div",{className:"flex items-end gap-4",children:R.map(t=>e.jsxs("div",{className:"flex flex-col items-center gap-2",children:[e.jsx(s,{icon:a,style:"badge",tone:"emerald",size:t,title:"approved"}),e.jsx("span",{className:"font-mono text-[10px] text-muted-foreground",children:t})]},t))})},L=["codicon:check","codicon:error","codicon:warning","codicon:info","codicon:beaker","codicon:rocket","svg-spinners:ring-resize"],l={parameters:{docs:{description:{story:"User-supplied runtime icon names resolved by the registered fallback provider. With no provider registered (as in Storybook) each name renders the documented dashed placeholder."}}},render:()=>e.jsx("div",{className:"flex flex-col gap-density-2",children:L.map(t=>e.jsxs("div",{className:"flex items-center gap-density-2 text-sm",children:[e.jsx(s,{name:t,className:"text-xl",title:t}),e.jsx("code",{className:"text-xs text-muted-foreground",children:t})]},t))})},d={render:()=>e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx(s,{icon:a,style:"badge",tone:"emerald",size:"lg",title:"approved"}),e.jsx(s,{icon:B,style:"badge",tone:"amber",size:"lg",title:"pending"}),e.jsx(s,{icon:M,style:"badge",tone:"rose",size:"lg",title:"rejected"}),e.jsx(s,{icon:A,style:"badge",tone:"sky",size:"lg",title:"info"}),e.jsx(s,{icon:F,style:"badge",tone:"violet",size:"lg",title:"starred"}),e.jsx(s,{icon:H,style:"badge",tone:"slate",size:"lg",title:"draft"}),e.jsx(s,{icon:K,style:"badge",tone:"neutral",size:"lg",title:"unknown"})]})};var m,p,g;r.parameters={...r.parameters,docs:{...(m=r.parameters)==null?void 0:m.docs,source:{originalSource:`{
  args: {
    icon: UiCheck,
    className: "text-green-600 text-xl"
  }
}`,...(g=(p=r.parameters)==null?void 0:p.docs)==null?void 0:g.source}}};var x,u,y;n.parameters={...n.parameters,docs:{...(x=n.parameters)==null?void 0:x.docs,source:{originalSource:`{
  args: {
    icon: UiError,
    className: "text-red-600 text-xl"
  }
}`,...(y=(u=n.parameters)==null?void 0:u.docs)==null?void 0:y.source}}};var b,f,v;o.parameters={...o.parameters,docs:{...(b=o.parameters)==null?void 0:b.docs,source:{originalSource:`{
  args: {
    icon: UiLoader,
    className: "text-blue-500 text-2xl"
  }
}`,...(v=(f=o.parameters)==null?void 0:f.docs)==null?void 0:v.source}}};var N,h,U;i.parameters={...i.parameters,docs:{...(N=i.parameters)==null?void 0:N.docs,source:{originalSource:`{
  args: {
    icon: UiCheck,
    style: "badge",
    tone: "emerald",
    size: "lg",
    title: "approved"
  }
}`,...(U=(h=i.parameters)==null?void 0:h.docs)==null?void 0:U.source}}};var z,k,S;c.parameters={...c.parameters,docs:{...(z=c.parameters)==null?void 0:z.docs,source:{originalSource:`{
  render: () => <div className="flex items-end gap-4">
      {SIZE_TOKENS.map(size => <div key={size} className="flex flex-col items-center gap-2">
          <Icon icon={UiCheck} style="badge" tone="emerald" size={size} title="approved" />
          <span className="font-mono text-[10px] text-muted-foreground">{size}</span>
        </div>)}
    </div>
}`,...(S=(k=c.parameters)==null?void 0:k.docs)==null?void 0:S.source}}};var I,j,E;l.parameters={...l.parameters,docs:{...(I=l.parameters)==null?void 0:I.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: "User-supplied runtime icon names resolved by the registered fallback provider. With no provider registered (as in Storybook) each name renders the documented dashed placeholder."
      }
    }
  },
  render: () => <div className="flex flex-col gap-density-2">
      {RUNTIME_ICON_NAMES.map(name => <div key={name} className="flex items-center gap-density-2 text-sm">
          <Icon name={name} className="text-xl" title={name} />
          <code className="text-xs text-muted-foreground">{name}</code>
        </div>)}
    </div>
}`,...(E=(j=l.parameters)==null?void 0:j.docs)==null?void 0:E.source}}};var C,_,O;d.parameters={...d.parameters,docs:{...(C=d.parameters)==null?void 0:C.docs,source:{originalSource:`{
  render: () => <div className="flex items-center gap-3">
      <Icon icon={UiCheck} style="badge" tone="emerald" size="lg" title="approved" />
      <Icon icon={UiHourglass} style="badge" tone="amber" size="lg" title="pending" />
      <Icon icon={UiClose} style="badge" tone="rose" size="lg" title="rejected" />
      <Icon icon={UiInfo} style="badge" tone="sky" size="lg" title="info" />
      <Icon icon={UiStarFilled} style="badge" tone="violet" size="lg" title="starred" />
      <Icon icon={UiCircleOutline} style="badge" tone="slate" size="lg" title="draft" />
      <Icon icon={UiQuestion} style="badge" tone="neutral" size="lg" title="unknown" />
    </div>
}`,...(O=(_=d.parameters)==null?void 0:_.docs)==null?void 0:O.source}}};const q=["Check","Error","Spinner","Badge","BadgeSizes","RuntimeNames","BadgeTones"];export{i as Badge,c as BadgeSizes,d as BadgeTones,r as Check,n as Error,l as RuntimeNames,o as Spinner,q as __namedExportsOrder,X as default};
