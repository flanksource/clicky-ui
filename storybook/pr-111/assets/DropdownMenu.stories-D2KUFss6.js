import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-pByjoP3I.js";import{t as n}from"./jsx-runtime-BG4KOiPz.js";import{Ai as r,Ji as i,Ki as a,Wc as o,n as s}from"./icons-Dd_HwYAK.js";import{n as c,t as l}from"./button-6-GcSFqM.js";import{n as u,t as d}from"./DropdownMenu-BU6HoL9q.js";import{n as f,t as p}from"./Modal-KRUcqrbU.js";function m(e){return{args:{label:`Actions`,items:[{label:`Edit`,onSelect:v()},{label:`Duplicate`,onSelect:v()},{label:`Delete`,onSelect:v()}]},decorators:[t=>(0,g.jsx)(`div`,{className:`fixed inset-0`,children:(0,g.jsx)(`div`,{className:`absolute ${e}`,children:(0,g.jsx)(t,{})})})],play:async({canvasElement:e})=>{let t=x(e),n=x(document.body);await y.click(t.getByRole(`button`,{name:`Actions`}));let r=(await n.findByRole(`menu`)).getBoundingClientRect();await _(r.left).toBeGreaterThanOrEqual(-1),await _(r.top).toBeGreaterThanOrEqual(-1),await _(r.right).toBeLessThanOrEqual(window.innerWidth+1),await _(r.bottom).toBeLessThanOrEqual(window.innerHeight+1)}}}var h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N;function P(){return(P=e((()=>{h=t(),u(),f(),c(),s(),g=n(),{expect:_,fn:v,userEvent:y,waitFor:b,within:x}=__STORYBOOK_MODULE_TEST__,S={title:`Overlay/DropdownMenu`,component:d,parameters:{docs:{description:{component:"Click-triggered dropdown menu. Closes on outside click or Escape. Provide declarative `items` or a `children` render-prop for custom content; the trigger defaults to a Button but accepts any node via `trigger`."}}}},C={args:{label:`Download`,icon:r,items:[{label:`JSON`,icon:i,onSelect:()=>{}},{label:`Markdown`,icon:a,onSelect:()=>{}}]}},w={args:{label:`Actions`,align:`left`,items:[{label:`Rename`,onSelect:()=>{}},{label:`Duplicate`,onSelect:()=>{}},{label:`Delete`,onSelect:()=>{},disabled:!0}]}},T={args:{trigger:(0,g.jsx)(l,{variant:`ghost`,size:`icon`,"aria-label":`Open menu`,children:(0,g.jsx)(o,{})}),items:[{label:`Profile`,onSelect:()=>{}},{label:`Settings`,onSelect:()=>{}}]}},E={args:{label:`Filters`,children:e=>(0,g.jsxs)(`div`,{className:`px-3 py-2 text-xs`,children:[(0,g.jsx)(`p`,{className:`mb-2 text-muted-foreground`,children:`Custom content goes here.`}),(0,g.jsx)(l,{size:`sm`,onClick:e,children:`Apply`})]})}},D={parameters:{docs:{description:{story:"A button inside the menu opens a Modal. Because the Modal portals to `document.body`, it renders centered over the whole viewport instead of being clipped to the dropdown's box — and the menu stays open behind it (closing the menu would otherwise unmount the Modal it renders)."}}},render:()=>{let[e,t]=(0,h.useState)(!1);return(0,g.jsx)(d,{label:`Actions`,children:()=>(0,g.jsxs)(`div`,{className:`px-1 py-1`,children:[(0,g.jsx)(l,{size:`sm`,variant:`ghost`,onClick:()=>t(!0),children:`View log`}),(0,g.jsx)(p,{open:e,onClose:()=>t(!1),title:`Log output`,size:`lg`,children:(0,g.jsx)(`pre`,{className:`whitespace-pre-wrap text-xs`,children:`[12:00:01] starting build…
[12:00:03] compiling 248 modules
[12:00:07] bundle written to dist/
[12:00:07] done in 6.2s`})})]})})},play:async({canvasElement:e,step:t})=>{let n=x(e),r=x(document.body),i=null;if(await t(`opens a Modal from a button inside the menu`,async()=>{await y.click(n.getByRole(`button`,{name:`Actions`})),i=await r.findByRole(`menu`),await y.click(x(i).getByRole(`button`,{name:`View log`}))}),!i)throw Error(`Dropdown menu did not open`);await t(`the Modal escapes the dropdown's box`,async()=>{let e=await r.findByRole(`dialog`);await _(i.contains(e)).toBe(!1);let t=i.getBoundingClientRect(),n=e.getBoundingClientRect();await _(n.width).toBeGreaterThan(t.width),await _(n.right).toBeGreaterThan(t.right)}),await t(`the menu stays open behind the Modal`,async()=>{await _(document.body.contains(i)).toBe(!0)})}},O={args:{label:`Actions`,items:[{label:`Edit`,onSelect:v()},{label:`Duplicate`,onSelect:v()},{label:`Delete`,onSelect:v()}]},play:async({args:e,canvasElement:t,step:n})=>{let r=x(t),i=x(document.body);await n(`opens the menu in a portal above the canvas`,async()=>{await y.click(r.getByRole(`button`,{name:`Actions`}));let e=await i.findByRole(`menu`);await _(t.contains(e)).toBe(!1),await _(document.body.contains(e)).toBe(!0)}),await n(`selecting an item fires its handler and closes`,async()=>{await y.click(i.getByRole(`menuitem`,{name:`Edit`})),await _(e.items?.[0]?.onSelect).toHaveBeenCalledTimes(1),await b(()=>_(i.queryByRole(`menu`)).toBeNull())})}},k=m(`top-1 left-1`),A=m(`top-1 right-1`),j=m(`bottom-1 left-1`),M=m(`bottom-1 right-1`),N=[`Items`,`AlignLeft`,`CustomTrigger`,`CustomContent`,`OpensModal`,`Interaction`,`EdgeTopLeft`,`EdgeTopRight`,`EdgeBottomLeft`,`EdgeBottomRight`],C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    label: "Download",
    icon: UiDownload,
    items: [{
      label: "JSON",
      icon: UiJson,
      onSelect: () => {}
    }, {
      label: "Markdown",
      icon: UiMarkdown,
      onSelect: () => {}
    }]
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    label: "Actions",
    align: "left",
    items: [{
      label: "Rename",
      onSelect: () => {}
    }, {
      label: "Duplicate",
      onSelect: () => {}
    }, {
      label: "Delete",
      onSelect: () => {},
      disabled: true
    }]
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    trigger: <Button variant="ghost" size="icon" aria-label="Open menu">
        <UiMenu />
      </Button>,
    items: [{
      label: "Profile",
      onSelect: () => {}
    }, {
      label: "Settings",
      onSelect: () => {}
    }]
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    label: "Filters",
    children: closeMenu => <div className="px-3 py-2 text-xs">
        <p className="mb-2 text-muted-foreground">Custom content goes here.</p>
        <Button size="sm" onClick={closeMenu}>
          Apply
        </Button>
      </div>
  }
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: "A button inside the menu opens a Modal. Because the Modal portals to \`document.body\`, it renders centered over the whole viewport instead of being clipped to the dropdown's box — and the menu stays open behind it (closing the menu would otherwise unmount the Modal it renders)."
      }
    }
  },
  render: () => {
    const [open, setOpen] = useState(false);
    return <DropdownMenu label="Actions">
        {() => <div className="px-1 py-1">
            <Button size="sm" variant="ghost" onClick={() => setOpen(true)}>
              View log
            </Button>
            <Modal open={open} onClose={() => setOpen(false)} title="Log output" size="lg">
              <pre className="whitespace-pre-wrap text-xs">
                {["[12:00:01] starting build…", "[12:00:03] compiling 248 modules", "[12:00:07] bundle written to dist/", "[12:00:07] done in 6.2s"].join("\\n")}
              </pre>
            </Modal>
          </div>}
      </DropdownMenu>;
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    let menu: HTMLElement | null = null;
    await step("opens a Modal from a button inside the menu", async () => {
      await userEvent.click(canvas.getByRole("button", {
        name: "Actions"
      }));
      menu = await body.findByRole("menu");
      await userEvent.click(within(menu).getByRole("button", {
        name: "View log"
      }));
    });
    if (!menu) throw new Error("Dropdown menu did not open");
    await step("the Modal escapes the dropdown's box", async () => {
      const dialog = await body.findByRole("dialog");
      // Portaled out of the menu's DOM subtree, and overflows the menu's box
      // rather than being clipped to it.
      await expect(menu.contains(dialog)).toBe(false);
      const menuRect = menu.getBoundingClientRect();
      const dialogRect = dialog.getBoundingClientRect();
      await expect(dialogRect.width).toBeGreaterThan(menuRect.width);
      await expect(dialogRect.right).toBeGreaterThan(menuRect.right);
    });
    await step("the menu stays open behind the Modal", async () => {
      // Closing the menu would unmount the Modal it renders, so it must persist.
      await expect(document.body.contains(menu)).toBe(true);
    });
  }
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  args: {
    label: "Actions",
    items: [{
      label: "Edit",
      onSelect: fn()
    }, {
      label: "Duplicate",
      onSelect: fn()
    }, {
      label: "Delete",
      onSelect: fn()
    }]
  },
  play: async ({
    args,
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    await step("opens the menu in a portal above the canvas", async () => {
      await userEvent.click(canvas.getByRole("button", {
        name: "Actions"
      }));
      const menu = await body.findByRole("menu");
      await expect(canvasElement.contains(menu)).toBe(false);
      await expect(document.body.contains(menu)).toBe(true);
    });
    await step("selecting an item fires its handler and closes", async () => {
      await userEvent.click(body.getByRole("menuitem", {
        name: "Edit"
      }));
      await expect(args.items?.[0]?.onSelect).toHaveBeenCalledTimes(1);
      await waitFor(() => expect(body.queryByRole("menu")).toBeNull());
    });
  }
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`makeEdgeStory("top-1 left-1")`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`makeEdgeStory("top-1 right-1")`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`makeEdgeStory("bottom-1 left-1")`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`makeEdgeStory("bottom-1 right-1")`,...M.parameters?.docs?.source}}}})))()}P();export{w as AlignLeft,E as CustomContent,T as CustomTrigger,j as EdgeBottomLeft,M as EdgeBottomRight,k as EdgeTopLeft,A as EdgeTopRight,O as Interaction,C as Items,D as OpensModal,N as __namedExportsOrder,S as default};