import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./jsx-runtime-BG4KOiPz.js";import{Hs as n,Is as r,Ps as i,Rs as a,Tr as o,Tu as s,_s as c,n as l,ws as u,xs as d}from"./icons-N6BqLuiz.js";import{a as f,i as p,r as m,t as h}from"./Icon-IwKVFFs1.js";var g,_,v,y,b,x,S,C,w,T,E;function D(){return(D=e((()=>{m(),l(),f(),g=t(),_={title:`Data/Icon`,component:h,args:{icon:d,className:`text-green-600 text-xl`,title:`approved`,style:`plain`,tone:`neutral`},argTypes:{icon:{table:{disable:!0}},style:{control:`inline-radio`,options:[`plain`,`badge`]},tone:{control:`inline-radio`,options:[`emerald`,`amber`,`rose`,`slate`,`sky`,`violet`,`neutral`]},size:{control:`inline-radio`,options:p}},parameters:{docs:{description:{component:'Renders statically imported icon components for built-in icons. Runtime string names are for user-supplied data handled by a registered fallback provider. Use `style="badge"` when the icon needs its own circular chip.'}}}},v={args:{icon:d,className:`text-green-600 text-xl`}},y={args:{icon:n,className:`text-red-600 text-xl`}},b={args:{icon:u,className:`text-blue-500 text-2xl`}},x={args:{icon:d,style:`badge`,tone:`emerald`,size:`lg`,title:`approved`}},S={render:()=>(0,g.jsx)(`div`,{className:`flex items-end gap-4`,children:p.map(e=>(0,g.jsxs)(`div`,{className:`flex flex-col items-center gap-2`,children:[(0,g.jsx)(h,{icon:d,style:`badge`,tone:`emerald`,size:e,title:`approved`}),(0,g.jsx)(`span`,{className:`font-mono text-[10px] text-muted-foreground`,children:e})]},e))})},C=[`codicon:check`,`codicon:error`,`codicon:warning`,`codicon:info`,`codicon:beaker`,`codicon:rocket`,`svg-spinners:ring-resize`],w={parameters:{docs:{description:{story:`User-supplied runtime icon names resolved by the registered fallback provider. With no provider registered (as in Storybook) each name renders the documented dashed placeholder.`}}},render:()=>(0,g.jsx)(`div`,{className:`flex flex-col gap-density-2`,children:C.map(e=>(0,g.jsxs)(`div`,{className:`flex items-center gap-density-2 text-sm`,children:[(0,g.jsx)(h,{name:e,className:`text-xl`,title:e}),(0,g.jsx)(`code`,{className:`text-xs text-muted-foreground`,children:e})]},e))})},T={render:()=>(0,g.jsxs)(`div`,{className:`flex items-center gap-3`,children:[(0,g.jsx)(h,{icon:d,style:`badge`,tone:`emerald`,size:`lg`,title:`approved`}),(0,g.jsx)(h,{icon:o,style:`badge`,tone:`amber`,size:`lg`,title:`pending`}),(0,g.jsx)(h,{icon:s,style:`badge`,tone:`rose`,size:`lg`,title:`rejected`}),(0,g.jsx)(h,{icon:a,style:`badge`,tone:`sky`,size:`lg`,title:`info`}),(0,g.jsx)(h,{icon:c,style:`badge`,tone:`violet`,size:`lg`,title:`starred`}),(0,g.jsx)(h,{icon:i,style:`badge`,tone:`slate`,size:`lg`,title:`draft`}),(0,g.jsx)(h,{icon:r,style:`badge`,tone:`neutral`,size:`lg`,title:`unknown`})]})},E=[`Check`,`Error`,`Spinner`,`Badge`,`BadgeSizes`,`RuntimeNames`,`BadgeTones`],v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    icon: UiCheck,
    className: "text-green-600 text-xl"
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    icon: UiError,
    className: "text-red-600 text-xl"
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    icon: UiLoader,
    className: "text-blue-500 text-2xl"
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    icon: UiCheck,
    style: "badge",
    tone: "emerald",
    size: "lg",
    title: "approved"
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex items-end gap-4">
      {SIZE_TOKENS.map(size => <div key={size} className="flex flex-col items-center gap-2">
          <Icon icon={UiCheck} style="badge" tone="emerald" size={size} title="approved" />
          <span className="font-mono text-[10px] text-muted-foreground">{size}</span>
        </div>)}
    </div>
}`,...S.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
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
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex items-center gap-3">
      <Icon icon={UiCheck} style="badge" tone="emerald" size="lg" title="approved" />
      <Icon icon={UiHourglass} style="badge" tone="amber" size="lg" title="pending" />
      <Icon icon={UiClose} style="badge" tone="rose" size="lg" title="rejected" />
      <Icon icon={UiInfo} style="badge" tone="sky" size="lg" title="info" />
      <Icon icon={UiStarFilled} style="badge" tone="violet" size="lg" title="starred" />
      <Icon icon={UiCircleOutline} style="badge" tone="slate" size="lg" title="draft" />
      <Icon icon={UiQuestion} style="badge" tone="neutral" size="lg" title="unknown" />
    </div>
}`,...T.parameters?.docs?.source}}}})))()}D();export{x as Badge,S as BadgeSizes,T as BadgeTones,v as Check,y as Error,w as RuntimeNames,b as Spinner,E as __namedExportsOrder,_ as default};