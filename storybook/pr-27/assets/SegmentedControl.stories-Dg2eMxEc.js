import{r as b,j as n}from"./iframe-CgiBotGO.js";import{c as x}from"./utils-BLSKlp9E.js";import{I as M}from"./Icon-rg52Hzgd.js";import{U as q}from"./UiRobotAi-YXAiUaTJ.js";import"./preload-helper-BZuLNX-z.js";const z={sm:"text-xs px-density-2 py-density-1 gap-1",md:"text-sm px-density-3 py-1.5 gap-1.5"};function u({value:r,options:t,onChange:s,size:l="md",className:o,"aria-label":L}){const k=b.useRef([]),v=(e,c)=>{var w;const i=t.length;let a=e;for(let S=0;S<i;S++){a=(a+c+i)%i;const f=t[a];if(f&&!f.disabled){s(f.id),(w=k.current[a])==null||w.focus();return}}};return n.jsx("div",{role:"radiogroup","aria-label":L,className:x("inline-flex items-center rounded-md bg-muted p-0.5",o),children:t.map((e,c)=>{const i=e.id===r;return n.jsxs("button",{ref:a=>{k.current[c]=a},type:"button",role:"radio","aria-checked":i,title:e.title,disabled:e.disabled,tabIndex:i?0:-1,onClick:()=>!e.disabled&&s(e.id),onKeyDown:a=>{a.key==="ArrowRight"||a.key==="ArrowDown"?(a.preventDefault(),v(c,1)):(a.key==="ArrowLeft"||a.key==="ArrowUp")&&(a.preventDefault(),v(c,-1))},className:x("inline-flex items-center whitespace-nowrap rounded-[5px] font-medium transition-colors","focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring","disabled:cursor-not-allowed disabled:opacity-50",z[l],i?"bg-card text-foreground shadow-sm":"text-muted-foreground hover:text-foreground"),children:[e.icon&&n.jsx(M,{...typeof e.icon=="string"?{name:e.icon}:{icon:e.icon}}),n.jsx("span",{children:e.label})]},e.id)})})}try{u.displayName="SegmentedControl",u.__docgenInfo={description:'Single-select toggle group (the Gavel `Segmented` "Mine / All / Bots"\npattern). A muted track holds mutually-exclusive segments; the active\nsegment lifts onto the card surface. Built on clicky tokens so it inherits\ndark-mode and density. Use for small, flat choice sets — reach for `Select`\nwhen the option count grows.',displayName:"SegmentedControl",filePath:"/home/runner/work/clicky-ui/clicky-ui/packages/ui/src/components/SegmentedControl.tsx",methods:[],props:{value:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/components/SegmentedControl.tsx",name:"TypeLiteral"}],description:"Currently selected option id.",name:"value",required:!0,tags:{},type:{name:"string"}},options:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/components/SegmentedControl.tsx",name:"TypeLiteral"}],description:"Mutually-exclusive options rendered left to right.",name:"options",required:!0,tags:{},type:{name:"SegmentedOption<T>[]"}},onChange:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/components/SegmentedControl.tsx",name:"TypeLiteral"}],description:"Called with the newly selected id.",name:"onChange",required:!0,tags:{},type:{name:"(id: T) => void"}},size:{defaultValue:{value:"md"},declarations:[{fileName:"clicky-ui/packages/ui/src/components/SegmentedControl.tsx",name:"TypeLiteral"}],description:"Control size. `md` (default) matches form controls; `sm` is denser.",name:"size",required:!1,tags:{},type:{name:"enum",raw:"SegmentedSize",value:[{value:'"sm"'},{value:'"md"'}]}},"aria-label":{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/components/SegmentedControl.tsx",name:"TypeLiteral"}],description:"Accessible group label.",name:"aria-label",required:!1,tags:{},type:{name:"string"}},className:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/components/SegmentedControl.tsx",name:"TypeLiteral"}],description:"Classes applied to the track.",name:"className",required:!1,tags:{},type:{name:"string"}}},tags:{}}}catch{}const{expect:d,userEvent:A,within:I}=__STORYBOOK_MODULE_TEST__,Z={title:"Components/SegmentedControl",component:u,tags:["autodocs"],parameters:{docs:{description:{component:"Single-select toggle group (the Gavel `Segmented` Mine / All / Bots pattern). Built on clicky density + theme tokens; keyboard-navigable with arrow keys."}}}},U=[{id:"me",label:"Mine"},{id:"all",label:"All"},{id:"bots",label:"Bots",icon:q}];function h({size:r}){const[t,s]=b.useState("all");return n.jsx(u,{"aria-label":"Scope",value:t,onChange:s,options:U,size:r})}const m={render:()=>n.jsx(h,{})},p={render:()=>n.jsx(h,{size:"sm"})},g={render:()=>{const[r,t]=b.useState("day");return n.jsx(u,{"aria-label":"Range",value:r,onChange:t,options:[{id:"hour",label:"Hour"},{id:"day",label:"Day"},{id:"week",label:"Week",disabled:!0}]})}},y={render:()=>n.jsx(h,{}),play:async({canvasElement:r,step:t})=>{const s=I(r),l=s.getByRole("radio",{name:"All"}),o=s.getByRole("radio",{name:"Mine"});await t("default selection is reflected via aria-checked",async()=>{await d(l).toHaveAttribute("aria-checked","true"),await d(o).toHaveAttribute("aria-checked","false")}),await t("clicking a segment selects it",async()=>{await A.click(o),await d(o).toHaveAttribute("aria-checked","true"),await d(l).toHaveAttribute("aria-checked","false")}),await t("arrow key moves the selection",async()=>{o.focus(),await A.keyboard("{ArrowRight}"),await d(l).toHaveAttribute("aria-checked","true")})}};var C,_,D;m.parameters={...m.parameters,docs:{...(C=m.parameters)==null?void 0:C.docs,source:{originalSource:`{
  render: () => <Demo />
}`,...(D=(_=m.parameters)==null?void 0:_.docs)==null?void 0:D.source}}};var R,E,N;p.parameters={...p.parameters,docs:{...(R=p.parameters)==null?void 0:R.docs,source:{originalSource:`{
  render: () => <Demo size="sm" />
}`,...(N=(E=p.parameters)==null?void 0:E.docs)==null?void 0:N.source}}};var H,T,j;g.parameters={...g.parameters,docs:{...(H=g.parameters)==null?void 0:H.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState("day");
    return <SegmentedControl aria-label="Range" value={value} onChange={setValue} options={[{
      id: "hour",
      label: "Hour"
    }, {
      id: "day",
      label: "Day"
    }, {
      id: "week",
      label: "Week",
      disabled: true
    }]} />;
  }
}`,...(j=(T=g.parameters)==null?void 0:T.docs)==null?void 0:j.source}}};var O,B,V;y.parameters={...y.parameters,docs:{...(O=y.parameters)==null?void 0:O.docs,source:{originalSource:`{
  render: () => <Demo />,
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    const all = canvas.getByRole("radio", {
      name: "All"
    });
    const mine = canvas.getByRole("radio", {
      name: "Mine"
    });
    await step("default selection is reflected via aria-checked", async () => {
      await expect(all).toHaveAttribute("aria-checked", "true");
      await expect(mine).toHaveAttribute("aria-checked", "false");
    });
    await step("clicking a segment selects it", async () => {
      await userEvent.click(mine);
      await expect(mine).toHaveAttribute("aria-checked", "true");
      await expect(all).toHaveAttribute("aria-checked", "false");
    });
    await step("arrow key moves the selection", async () => {
      mine.focus();
      await userEvent.keyboard("{ArrowRight}");
      await expect(all).toHaveAttribute("aria-checked", "true");
    });
  }
}`,...(V=(B=y.parameters)==null?void 0:B.docs)==null?void 0:V.source}}};const F=["Default","Small","WithDisabledOption","SelectAndKeyboard"];export{m as Default,y as SelectAndKeyboard,p as Small,g as WithDisabledOption,F as __namedExportsOrder,Z as default};
