import{j as n,r as D}from"./iframe-C9yFQwwi.js";import{S as u}from"./SegmentedControl-489AXyt0.js";import{U as E}from"./UiRobotAi-B5rLtVeK.js";import"./preload-helper-C4wV90-x.js";import"./utils-CR52uffu.js";import"./Icon-CPfok5dB.js";const{expect:t,userEvent:p,within:R}=__STORYBOOK_MODULE_TEST__,V={title:"Components/SegmentedControl",component:u,tags:["autodocs"],parameters:{docs:{description:{component:"Single-select toggle group (the Gavel `Segmented` Mine / All / Bots pattern). Built on clicky density + theme tokens; keyboard-navigable with arrow keys."}}}},O=[{id:"me",label:"Mine"},{id:"all",label:"All"},{id:"bots",label:"Bots",icon:E}];function m({size:a}){const[e,r]=D.useState("all");return n.jsx(u,{"aria-label":"Scope",value:e,onChange:r,options:O,size:a})}const s={render:()=>n.jsx(m,{})},i={render:()=>n.jsx(m,{size:"sm"})},c={render:()=>{const[a,e]=D.useState("day");return n.jsx(u,{"aria-label":"Range",value:a,onChange:e,options:[{id:"hour",label:"Hour"},{id:"day",label:"Day"},{id:"week",label:"Week",disabled:!0}]})}},l={render:()=>n.jsx(m,{}),play:async({canvasElement:a,step:e})=>{const r=R(a),d=r.getByRole("radio",{name:"All"}),o=r.getByRole("radio",{name:"Mine"});await e("default selection is reflected via aria-checked",async()=>{await t(d).toHaveAttribute("aria-checked","true"),await t(o).toHaveAttribute("aria-checked","false")}),await e("clicking a segment selects it",async()=>{await p.click(o),await t(o).toHaveAttribute("aria-checked","true"),await t(d).toHaveAttribute("aria-checked","false")}),await e("arrow key moves the selection",async()=>{o.focus(),await p.keyboard("{ArrowRight}"),await t(d).toHaveAttribute("aria-checked","true")})}};var b,v,w;s.parameters={...s.parameters,docs:{...(b=s.parameters)==null?void 0:b.docs,source:{originalSource:`{
  render: () => <Demo />
}`,...(w=(v=s.parameters)==null?void 0:v.docs)==null?void 0:w.source}}};var y,g,h;i.parameters={...i.parameters,docs:{...(y=i.parameters)==null?void 0:y.docs,source:{originalSource:`{
  render: () => <Demo size="sm" />
}`,...(h=(g=i.parameters)==null?void 0:g.docs)==null?void 0:h.source}}};var k,S,A;c.parameters={...c.parameters,docs:{...(k=c.parameters)==null?void 0:k.docs,source:{originalSource:`{
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
}`,...(A=(S=c.parameters)==null?void 0:S.docs)==null?void 0:A.source}}};var f,x,H;l.parameters={...l.parameters,docs:{...(f=l.parameters)==null?void 0:f.docs,source:{originalSource:`{
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
}`,...(H=(x=l.parameters)==null?void 0:x.docs)==null?void 0:H.source}}};const W=["Default","Small","WithDisabledOption","SelectAndKeyboard"];export{s as Default,l as SelectAndKeyboard,i as Small,c as WithDisabledOption,W as __namedExportsOrder,V as default};
