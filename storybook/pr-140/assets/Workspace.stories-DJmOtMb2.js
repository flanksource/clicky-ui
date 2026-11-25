import{n as e}from"./rolldown-runtime-BCiCTKAo.js";import{t}from"./react-BcdEFcws.js";import{t as n}from"./jsx-runtime-DKU1u6-r.js";import{Ca as r,Cs as i,Dl as a,Vi as o,Vl as s,n as c,xa as l}from"./icons-gNlgqXHH.js";import{n as u,t as d}from"./Workspace-Bu2zYBWO.js";function f({children:e}){return(0,h.jsx)(`div`,{className:`h-full bg-background p-density-3 text-sm text-muted-foreground`,children:e})}function p(){let[e,t]=(0,m.useState)(!1);return(0,h.jsx)(`div`,{className:`h-[520px]`,children:(0,h.jsx)(d,{panes:b.map(n=>n.id===`editor`?{...n,content:(0,h.jsxs)(`div`,{className:`space-y-2 p-3 text-sm`,children:[(0,h.jsx)(`button`,{type:`button`,className:`rounded border px-2 py-1`,"aria-pressed":e,onClick:()=>t(!e),children:e?`Show the sides`:`Give the editor the full width`}),(0,h.jsx)(`p`,{children:`Held collapsed, the sides lose their toggles; their layout comes back as it was.`})]})}:n),collapsedSides:e?[`left`,`right`]:[]})})}var m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k;function A(){return(A=e((()=>{m=t(),c(),u(),h=n(),{expect:g,userEvent:_,within:v}=__STORYBOOK_MODULE_TEST__,y={title:`Layout/Workspace`,component:d,parameters:{layout:`fullscreen`,docs:{description:{component:`VS Code-style workspace with labeled, collapsible, and resizable panes in left, center, right, and center-aligned bottom locations.`}}}},b=[{id:`explorer`,label:`Explorer`,icon:(0,h.jsx)(l,{}),location:`left`,width:280,content:(0,h.jsx)(f,{children:`Files and folders`})},{id:`outline`,label:`Outline`,icon:(0,h.jsx)(i,{}),location:`left`,width:280,height:180,content:(0,h.jsx)(f,{children:`Document symbols`})},{id:`editor`,label:`Editor`,icon:(0,h.jsx)(r,{}),location:`center`,content:(0,h.jsx)(f,{children:`Primary editor surface`})},{id:`variables`,label:`Variables`,icon:(0,h.jsx)(a,{}),location:`right`,width:320,content:(0,h.jsx)(f,{children:`Local variables`})},{id:`watch`,label:`Watch`,icon:(0,h.jsx)(s,{}),location:`right`,width:320,height:160,content:(0,h.jsx)(f,{children:`Watch expressions`})},{id:`terminal`,label:`Terminal`,icon:(0,h.jsx)(o,{}),location:`bottom`,height:220,content:(0,h.jsx)(f,{children:`Terminal output`})}],x={render:()=>(0,h.jsx)(`div`,{className:`h-[640px]`,children:(0,h.jsx)(d,{panes:b,storageKey:`workspace-story`,slots:{topRightActions:(0,h.jsx)(`button`,{type:`button`,className:`px-1 text-xs`,children:`Layout`})}})})},S={render:()=>(0,h.jsx)(`div`,{className:`h-[520px]`,children:(0,h.jsx)(d,{panes:b.map(e=>e.id===`explorer`?{...e,collapsible:!1,resizable:!1}:e)})})},C={render:()=>(0,h.jsx)(p,{})},w=240,T=360,E={tags:[`browser`],render:()=>(0,h.jsx)(`div`,{className:`h-[520px]`,children:(0,h.jsx)(d,{sideArrangement:{left:`columns`},panes:[{id:`explorer`,label:`Explorer`,icon:(0,h.jsx)(l,{}),location:`left`,width:w,content:(0,h.jsx)(f,{children:`Files and folders`})},{id:`source`,label:`Source`,icon:(0,h.jsx)(r,{}),location:`left`,width:T,minWidth:200,maxWidth:560,content:(0,h.jsx)(f,{children:`Page source`})},{id:`page`,label:`Page`,location:`center`,collapsible:!1,showHeader:!1,content:(0,h.jsx)(f,{children:`The page being edited`})}]})}),play:async({canvasElement:e})=>{let t=v(e),n=e=>t.getByTestId(`workspace-stack-${e}`).getBoundingClientRect().width,r=t.getByTestId(`workspace-resize-pane-source`),i=[n(`explorer`),n(`source`)];r.focus(),await _.keyboard(`{ArrowRight}`),await g(i).toEqual([w,T]),await g([n(`explorer`),n(`source`)]).toEqual([w,376]),await g(t.getByTestId(`workspace-region-left`).getBoundingClientRect().width).toBe(616)}},D=[`Share`,`Export`,`Copy link`,`Comment`,`Review`,`Settings`,`Notifications`,`Preferences`],O={render:()=>(0,h.jsx)(`div`,{className:`h-[420px] max-w-3xl`,children:(0,h.jsx)(d,{panes:b.filter(e=>e.location!==`right`&&e.location!==`bottom`).map(e=>e.id===`editor`?{...e,collapsible:!1,slots:{headerTrailing:D.map(e=>(0,h.jsx)(`button`,{type:`button`,className:`rounded-md border border-border px-2 py-1 text-xs`,children:e},e))}}:e)})})},k=[`IdeLayout`,`FixedExplorer`,`HeldCollapsedSides`,`ColumnsLeftSide`,`CrowdedCenterHeader`],x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: () => <div className="h-[640px]">
      <Workspace panes={panes} storageKey="workspace-story" slots={{
      topRightActions: <button type="button" className="px-1 text-xs">
              Layout
            </button>
    }} />
    </div>
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  render: () => <div className="h-[520px]">
      <Workspace panes={panes.map(pane => pane.id === "explorer" ? {
      ...pane,
      collapsible: false,
      resizable: false
    } : pane)} />
    </div>
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  render: () => <FocusedCenter />
}`,...C.parameters?.docs?.source},description:{story:`A host holding both sides collapsed while its center needs the full width.`,...C.parameters?.docs?.description}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  tags: ["browser"],
  render: () => <div className="h-[520px]">
      <Workspace sideArrangement={{
      left: "columns"
    }} panes={[{
      id: "explorer",
      label: "Explorer",
      icon: <UiFolder />,
      location: "left",
      width: COLUMN_EXPLORER_WIDTH,
      content: <Content>Files and folders</Content>
    }, {
      id: "source",
      label: "Source",
      icon: <UiFileCode />,
      location: "left",
      width: COLUMN_SOURCE_WIDTH,
      minWidth: 200,
      maxWidth: 560,
      content: <Content>Page source</Content>
    }, {
      id: "page",
      label: "Page",
      location: "center",
      collapsible: false,
      showHeader: false,
      content: <Content>The page being edited</Content>
    }]} />
    </div>,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const width = (id: string) => canvas.getByTestId(\`workspace-stack-\${id}\`).getBoundingClientRect().width;
    const separator = canvas.getByTestId("workspace-resize-pane-source");
    const before = [width("explorer"), width("source")];
    separator.focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(before).toEqual([COLUMN_EXPLORER_WIDTH, COLUMN_SOURCE_WIDTH]);
    await expect([width("explorer"), width("source")]).toEqual([COLUMN_EXPLORER_WIDTH, COLUMN_SOURCE_WIDTH + COLUMN_KEY_STEP]);
    await expect(canvas.getByTestId("workspace-region-left").getBoundingClientRect().width).toBe(COLUMN_EXPLORER_WIDTH + COLUMN_SOURCE_WIDTH + COLUMN_KEY_STEP);
  }
}`,...E.parameters?.docs?.source},description:{story:`The left side as columns: Explorer and Source sit next to each other, each with its own resizable width
(the separator on a column's edge), while the page keeps the center. Below the workspace's \`3xl\` width the
side stacks as usual.`,...E.parameters?.docs?.description}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  render: () => <div className="h-[420px] max-w-3xl">
      <Workspace panes={panes.filter(pane => pane.location !== "right" && pane.location !== "bottom").map(pane => pane.id === "editor" ? {
      ...pane,
      collapsible: false,
      slots: {
        headerTrailing: ACTIONS.map(action => <button key={action} type="button" className="rounded-md border border-border px-2 py-1 text-xs">
                        {action}
                      </button>)
      }
    } : pane)} />
    </div>
}`,...O.parameters?.docs?.source},description:{story:`A center header with more trailing actions than its width holds: they wrap onto
a second row, and the header keeps clear of the side toggles floating over the
top-right corner whether or not a right pane is open.`,...O.parameters?.docs?.description}}}})))()}A();export{E as ColumnsLeftSide,O as CrowdedCenterHeader,S as FixedExplorer,C as HeldCollapsedSides,x as IdeLayout,k as __namedExportsOrder,y as default};