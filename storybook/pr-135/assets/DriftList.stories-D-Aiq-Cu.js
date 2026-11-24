import{n as e}from"./rolldown-runtime-BCiCTKAo.js";import{t}from"./react-BcdEFcws.js";import{t as n}from"./jsx-runtime-DKU1u6-r.js";import{c as r,i,n as a,o}from"./DriftList-DSDQIHnV.js";function s(){let[e,t]=(0,c.useState)([]);return(0,l.jsxs)(`div`,{className:`space-y-3`,children:[(0,l.jsx)(a,{items:d,retarget:{pickAnchor:async e=>({anchor:`${e}→new`}),onRetarget:(e,n)=>t(t=>[...t,`onRetarget(${e}, ${n})`])}}),(0,l.jsx)(`ul`,{className:`text-xs text-muted-foreground`,children:e.map((e,t)=>(0,l.jsx)(`li`,{children:e},t))})]})}var c,l,u,d,f,p,m,h;function g(){return(g=e((()=>{c=t(),r(),i(),l=n(),u={title:`Comments/DriftList`,component:a,parameters:{layout:`padded`},tags:[`autodocs`]},d=[{ids:[`t1`],anchor:`r:outdated`,label:`Lines 7–8`,drift:{state:`outdated`,note:o(`outdated`,`lines`)}},{ids:[`t2`],anchor:`r:ambiguous`,label:`Line 10`,drift:{state:`ambiguous`,note:o(`ambiguous`,`lines`)}},{ids:[`t3`],anchor:`e:orphaned`,label:`Pay button`,drift:{state:`orphaned`,note:o(`orphaned`,`element`)}},{ids:[`t4`],anchor:`e:moved`,label:`Order total`,drift:{state:`moved`,note:o(`moved`,`element`)}}],f={args:{items:d}},p={args:{items:d},render:()=>(0,l.jsx)(s,{})},m={args:{items:[{...d[0],drift:{...d[0].drift,reanchor:!1}},d[2]],retarget:{pickAnchor:async()=>null,onRetarget:()=>void 0}}},h=[`AllStates`,`WithReanchor`,`NotReanchorable`],f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    items: ITEMS
  }
}`,...f.parameters?.docs?.source},description:{story:`Patch threads that are outdated or ambiguous, with element threads that are orphaned or moved, in one list.`,...f.parameters?.docs?.description}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    items: ITEMS
  },
  render: () => <Retargeting />
}`,...p.parameters?.docs?.source},description:{story:`Re-anchor starts a pick, then calls onRetarget(id, anchor); it is rendered only when the host can retarget.`,...p.parameters?.docs?.description}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    items: [{
      ...ITEMS[0]!,
      drift: {
        ...ITEMS[0]!.drift,
        reanchor: false
      }
    }, ITEMS[2]!],
    retarget: {
      pickAnchor: async () => null,
      onRetarget: () => undefined
    }
  }
}`,...m.parameters?.docs?.source},description:{story:`A surface that cannot re-pick an item (no source selection to make) leaves Re-anchor off it.`,...m.parameters?.docs?.description}}}})))()}g();export{f as AllStates,m as NotReanchorable,p as WithReanchor,h as __namedExportsOrder,u as default};