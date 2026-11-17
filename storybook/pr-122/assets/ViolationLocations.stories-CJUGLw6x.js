import{n as e}from"./rolldown-runtime-BCiCTKAo.js";import{n as t,t as n}from"./ViolationLocations-S74TXE42.js";var r,i,a,o,s,c,l,u,d,f,p,m,h,g,_,v,y;function b(){return(b=e((()=>{t(),{expect:r,within:i}=__STORYBOOK_MODULE_TEST__,a=`data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22480%22%20height%3D%22240%22%20viewBox%3D%220%200%20480%20240%22%3E%0A%20%20%20%20%3Crect%20width%3D%22480%22%20height%3D%22240%22%20fill%3D%22%23f4f4f5%22%2F%3E%0A%20%20%20%20%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%22480%22%20height%3D%2240%22%20fill%3D%22%23d4d4d8%22%2F%3E%0A%20%20%20%20%3Ctext%20x%3D%2216%22%20y%3D%2226%22%20font-family%3D%22sans-serif%22%20font-size%3D%2214%22%3EPolicy%20%C2%B7%20Activity%20%C2%B7%20Status%3C%2Ftext%3E%0A%20%20%20%20%3Crect%20x%3D%220%22%20y%3D%2280%22%20width%3D%22480%22%20height%3D%2240%22%20fill%3D%22%23fecaca%22%2F%3E%0A%20%20%20%20%3Ctext%20x%3D%2216%22%20y%3D%22106%22%20font-family%3D%22sans-serif%22%20font-size%3D%2214%22%3EP-1001%20%C2%B7%20Billing%20%C2%B7%2002%20Pending%3C%2Ftext%3E%0A%20%20%20%20%3Ctext%20x%3D%2216%22%20y%3D%2266%22%20font-family%3D%22sans-serif%22%20font-size%3D%2214%22%3EP-1000%20%C2%B7%20Billing%20%C2%B7%2001%20Active%3C%2Ftext%3E%0A%20%20%20%20%3Ctext%20x%3D%2216%22%20y%3D%22146%22%20font-family%3D%22sans-serif%22%20font-size%3D%2214%22%3EP-1002%20%C2%B7%20Billing%20%C2%B7%2001%20Active%3C%2Ftext%3E%0A%20%20%3C%2Fsvg%3E`,o=`/repo/rules`,s={ref:`main`,file:`${o}/pc/ACME/tr/Billing/data.xml`,line:12,column:3,message:`the transaction's PlanGUID`},c={entity:{kind:`Policy`,id:`7f3a2c10-5b0a-4c53-9a73-0c9d3f5e8b11`,name:`P-1001`},message:`spawned InvoiceStart 3 times`},l={entity:{kind:`AsTransaction`,id:`c8d73550-1111-4c53-9a73-0c9d3f5e8b11`}},u={url:{url:`https://oipa.example.com/entity/policy/7f3a2c10`,css:`.row[data-activity='a1']`},message:`the pending activity row`},d={image:{src:a,x:0,y:80,width:480,height:40},message:`the row as captured`},f=e=>e.kind===`Policy`?`#/entity/policy/${e.id}`:void 0,p={title:`Data/Lint/ViolationLocations`,component:n,parameters:{docs:{description:{component:"Every place a lint violation applies, the first one primary. A location renders by its target: a file (with the git ref it was read at) opens through the host's `onOpenFile`; an entity is a `Kind · name` chip the host can link through `entityHref`; a URL is an external link with its selector beside it; an image region is a cropped preview of that rectangle linking to the full image."}}},args:{workDir:o,locations:[s]}},m={args:{locations:[s],onOpenFile:()=>void 0},play:async({canvasElement:e})=>{let t=i(e);await r(t.getByText(`main`)).toBeInTheDocument(),await r(t.getByText(`pc/ACME/tr/Billing/data.xml:12:3`)).toBeInTheDocument()}},h={args:{locations:[c,l],entityHref:f},play:async({canvasElement:e})=>{let t=i(e);await r(t.getByRole(`link`,{name:/Policy · P-1001/})).toHaveAttribute(`href`,`#/entity/policy/7f3a2c10-5b0a-4c53-9a73-0c9d3f5e8b11`),await r(t.queryByRole(`link`,{name:/AsTransaction/})).toBeNull()}},g={args:{locations:[u,{url:{url:`https://oipa.example.com/activity/a1`,xpath:`//tr[@data-id='a1']`}},{url:{url:`https://oipa.example.com/activity/a1`,testId:`activity-status`}},{url:{url:`https://oipa.example.com/activity/a1`,role:`button`,name:`Process`}},{url:{url:`https://oipa.example.com/activity/a1`,text:`02 Pending`}},{url:{url:`https://oipa.example.com/`}}]},play:async({canvasElement:e})=>{let t=i(e);await r(t.getByText(`css: .row[data-activity='a1']`)).toBeInTheDocument(),await r(t.getByText(`role: button[name="Process"]`)).toBeInTheDocument()}},_={args:{locations:[d]},play:async({canvasElement:e})=>{await r(i(e).getByText(`0,80 480×40`)).toBeInTheDocument()}},v={args:{locations:[s,c,u,d,{file:`${o}/pc/ACME/tr/Billing/XMLData.xml`,line:40}],entityHref:f,onOpenFile:()=>void 0},play:async({canvasElement:e})=>{let t=i(e);await r(t.getByText(`5 locations`)).toBeInTheDocument();let n=t.getAllByTestId(`lint-violation-location`);await r(n[0]).toHaveAttribute(`data-primary`),await r(n[1]).not.toHaveAttribute(`data-primary`)}},y=[`FileAtRef`,`Entities`,`UrlSelectors`,`ImageRegion`,`Mixed`],m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    locations: [fileAtRef],
    onOpenFile: () => undefined
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("main")).toBeInTheDocument();
    await expect(canvas.getByText("pc/ACME/tr/Billing/data.xml:12:3")).toBeInTheDocument();
  }
}`,...m.parameters?.docs?.source},description:{story:"A file read at a git ref: the ref is a muted prefix before `path:line:column`.",...m.parameters?.docs?.description}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    locations: [policy, transaction],
    entityHref: policyHref
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("link", {
      name: /Policy · P-1001/
    })).toHaveAttribute("href", "#/entity/policy/7f3a2c10-5b0a-4c53-9a73-0c9d3f5e8b11");
    await expect(canvas.queryByRole("link", {
      name: /AsTransaction/
    })).toBeNull();
  }
}`,...h.parameters?.docs?.source},description:{story:`The host links Policy entities; the AsTransaction stays a plain chip.`,...h.parameters?.docs?.description}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    locations: [page, {
      url: {
        url: "https://oipa.example.com/activity/a1",
        xpath: "//tr[@data-id='a1']"
      }
    }, {
      url: {
        url: "https://oipa.example.com/activity/a1",
        testId: "activity-status"
      }
    }, {
      url: {
        url: "https://oipa.example.com/activity/a1",
        role: "button",
        name: "Process"
      }
    }, {
      url: {
        url: "https://oipa.example.com/activity/a1",
        text: "02 Pending"
      }
    }, {
      url: {
        url: "https://oipa.example.com/"
      }
    }]
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("css: .row[data-activity='a1']")).toBeInTheDocument();
    await expect(canvas.getByText('role: button[name="Process"]')).toBeInTheDocument();
  }
}`,...g.parameters?.docs?.source},description:{story:`One URL per selector strategy; the strategy and value are shown beside the link.`,...g.parameters?.docs?.description}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    locations: [screenshot]
  },
  play: async ({
    canvasElement
  }) => {
    await expect(within(canvasElement).getByText("0,80 480×40")).toBeInTheDocument();
  }
}`,..._.parameters?.docs?.source},description:{story:`A 480×40 region of a screenshot, previewed cropped and linking to the full image.`,..._.parameters?.docs?.description}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    locations: [fileAtRef, policy, page, screenshot, {
      file: \`\${WORK_DIR}/pc/ACME/tr/Billing/XMLData.xml\`,
      line: 40
    }],
    entityHref: policyHref,
    onOpenFile: () => undefined
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("5 locations")).toBeInTheDocument();
    const rows = canvas.getAllByTestId("lint-violation-location");
    await expect(rows[0]).toHaveAttribute("data-primary");
    await expect(rows[1]).not.toHaveAttribute("data-primary");
  }
}`,...v.parameters?.docs?.source},description:{story:`Every kind of target in one list, the file first and therefore primary.`,...v.parameters?.docs?.description}}}})))()}b();export{h as Entities,m as FileAtRef,_ as ImageRegion,v as Mixed,g as UrlSelectors,y as __namedExportsOrder,p as default};