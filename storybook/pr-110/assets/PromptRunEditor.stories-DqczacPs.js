import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-pByjoP3I.js";import{t as n}from"./jsx-runtime-BG4KOiPz.js";import{i as r,r as i}from"./SpecRuntimeEditor-CL8bLT2u.js";import{n as a,t as o}from"./PromptRunEditor-BOvWljsC.js";function s(){let[e,t]=(0,l.useState)({variables:{company:`Acme`},spec:{model:`claude-sonnet-4-6`,id:`anthropic/claude-sonnet-4-6`,backend:`anthropic`,prompt:{user:`Review {{company}}`}},chat:!0});return(0,u.jsx)(`div`,{className:`max-w-3xl p-density-4`,children:(0,u.jsx)(o,{value:e,onChange:t,models:m})})}function c(){let[e,t]=(0,l.useState)({variables:{company:`Acme`},spec:{model:`claude-sonnet-4-6`,id:`anthropic/claude-sonnet-4-6`,prompt:{user:`Review {{company}}`,system:`Be precise`},budget:{maxTokens:8e3}}});return(0,u.jsx)(`div`,{className:`max-w-3xl p-density-4`,children:(0,u.jsx)(o,{value:e,onChange:t,models:m,specTabs:i,recentRuntimes:[{model:`gpt-5.5`,id:`openai/gpt-5.5`,mode:`agent`,effort:`high`}]})})}var l,u,d,f,p,m,h,g,_,v;function y(){return(y=e((()=>{l=t(),a(),r(),u=n(),{expect:d,userEvent:f,within:p}=__STORYBOOK_MODULE_TEST__,m=[{id:`anthropic/claude-sonnet-4-6`,provider:`anthropic`,label:`Claude Sonnet 4.6`,reasoning:!0,configured:!0,runtime:{model:`claude-sonnet-4-6`,id:`anthropic/claude-sonnet-4-6`,backend:`anthropic`}},{id:`openai/gpt-5.5`,provider:`openai`,label:`GPT-5.5`,reasoning:!0,configured:!0,runtime:{model:`gpt-5.5`,id:`openai/gpt-5.5`,backend:`openai`}}],h={title:`AI/PromptRunEditor`,component:o,parameters:{layout:`fullscreen`}},g={render:()=>(0,u.jsx)(s,{}),play:async({canvasElement:e})=>{let t=p(e);await d(t.getByRole(`group`,{name:`Runtime 1`})).toBeInTheDocument(),await d(t.queryByRole(`group`,{name:`Runtime 2`})).not.toBeInTheDocument(),await f.click(t.getByRole(`radio`,{name:`Multi-model`}));let n=await t.findByRole(`group`,{name:`Runtime 2`});await d(p(n).getByRole(`group`,{name:`Runtime 2 controls`})).toBeInTheDocument(),await f.click(t.getByRole(`button`,{name:`Add runtime`})),await f.click(await t.findByRole(`button`,{name:`Remove runtime 3`})),await d(t.queryByRole(`group`,{name:`Runtime 3`})).not.toBeInTheDocument(),await d(t.getAllByTitle(`Runtime options`).filter(e=>!e.closest(`[role="group"][aria-label$=" controls"]`))).toHaveLength(1),await f.click(t.getByRole(`radio`,{name:`Single model`})),await d(t.queryByRole(`group`,{name:`Runtime 2`})).not.toBeInTheDocument()}},_={render:()=>(0,u.jsx)(c,{}),play:async({canvasElement:e})=>{let t=p(e),n=t.getByRole(`group`,{name:`Runtime 1 controls`});await f.click(p(n).getByTitle(`Runtime options`));let r=await p(document.body).findByRole(`menu`,{name:`Runtime options`});await d(p(r).queryByRole(`menuitem`,{name:`Advanced`})).not.toBeInTheDocument(),await f.keyboard(`{Escape}`),await f.click(p(t.getByRole(`list`,{name:`Recently used runtimes`})).getByRole(`button`)),await d(p(t.getByRole(`group`,{name:`Runtime 1 controls`})).getByTitle(`Model — gpt-5.5`)).toBeInTheDocument(),await f.click(t.getByRole(`tab`,{name:`System Prompt`})),await d(t.getByLabelText(`System`)).toHaveValue(`Be precise`),await f.click(t.getByRole(`tab`,{name:`Model`}));let i=t.getByRole(`region`,{name:`Model`});await d(i).toHaveTextContent(`Provider status`),await d(i).not.toHaveTextContent(`Max tokens`)}},v=[`CanonicalRequest`,`TabbedSpec`],g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: () => <CanonicalRequestStory />,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("group", {
      name: "Runtime 1"
    })).toBeInTheDocument();
    await expect(canvas.queryByRole("group", {
      name: "Runtime 2"
    })).not.toBeInTheDocument();

    // Multi-model seeds a comparison row from the first row's mode; rows only
    // become removable past the two a comparison needs.
    await userEvent.click(canvas.getByRole("radio", {
      name: "Multi-model"
    }));
    const second = await canvas.findByRole("group", {
      name: "Runtime 2"
    });
    await expect(within(second).getByRole("group", {
      name: "Runtime 2 controls"
    })).toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", {
      name: "Add runtime"
    }));
    await userEvent.click(await canvas.findByRole("button", {
      name: "Remove runtime 3"
    }));
    await expect(canvas.queryByRole("group", {
      name: "Runtime 3"
    })).not.toBeInTheDocument();

    // Permissions and Advanced belong to the spec, so comparison rows share one
    // actions section rather than repeating it per row. Each row keeps its own
    // ⋮ menu for runtime settings such as effort.
    await expect(canvas.getAllByTitle("Runtime options").filter(trigger => !trigger.closest('[role="group"][aria-label$=" controls"]'))).toHaveLength(1);
    await userEvent.click(canvas.getByRole("radio", {
      name: "Single model"
    }));
    await expect(canvas.queryByRole("group", {
      name: "Runtime 2"
    })).not.toBeInTheDocument();
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  render: () => <TabbedSpecStory />,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const controls = canvas.getByRole("group", {
      name: "Runtime 1 controls"
    });
    await userEvent.click(within(controls).getByTitle("Runtime options"));
    const options = await within(document.body).findByRole("menu", {
      name: "Runtime options"
    });
    await expect(within(options).queryByRole("menuitem", {
      name: "Advanced"
    })).not.toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    await userEvent.click(within(canvas.getByRole("list", {
      name: "Recently used runtimes"
    })).getByRole("button"));
    await expect(within(canvas.getByRole("group", {
      name: "Runtime 1 controls"
    })).getByTitle("Model — gpt-5.5")).toBeInTheDocument();
    await userEvent.click(canvas.getByRole("tab", {
      name: "System Prompt"
    }));
    await expect(canvas.getByLabelText("System")).toHaveValue("Be precise");

    // Token and turn limits moved to the runtime bar; the Model tab keeps
    // provider readiness and the advanced model settings.
    await userEvent.click(canvas.getByRole("tab", {
      name: "Model"
    }));
    const model = canvas.getByRole("region", {
      name: "Model"
    });
    await expect(model).toHaveTextContent("Provider status");
    await expect(model).not.toHaveTextContent("Max tokens");
  }
}`,..._.parameters?.docs?.source}}}})))()}y();export{g as CanonicalRequest,_ as TabbedSpec,v as __namedExportsOrder,h as default};