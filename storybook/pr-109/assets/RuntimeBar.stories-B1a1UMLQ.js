import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-pByjoP3I.js";import{t as n}from"./jsx-runtime-BG4KOiPz.js";import{Gc as r,n as i}from"./icons-N6BqLuiz.js";import{n as a,t as o}from"./utils-CEDXhWC6.js";import{n as s,t as c}from"./runtime-spec-fields-C3J1CYC5.js";import{o as l,t as u}from"./runtime-mode-CICxlYPe.js";import{n as d,t as f}from"./RuntimeBar-DPO1oNsS.js";function p({initial:e,families:t,className:n,showTimeout:r=!1,showCost:i=!1}){let[a,o]=(0,_.useState)(e);return(0,v.jsxs)(`div`,{className:`grid max-w-3xl gap-4 p-6`,children:[(0,v.jsx)(f,{value:a,onChange:o,models:C,families:t,className:n,showTimeout:r,showCost:i}),(0,v.jsx)(`pre`,{className:`rounded-md border border-border bg-muted/30 p-3 font-mono text-xs text-muted-foreground`,children:JSON.stringify(a,null,2)})]})}function m(){let[e,t]=(0,_.useState)({mode:`cli`,model:`anthropic/claude-sonnet-4-6`,effort:`medium`,budget:{timeout:`30m`,cost:2}});return(0,v.jsx)(`div`,{className:`w-80 max-w-full p-4`,children:(0,v.jsx)(f,{value:e,onChange:t,models:C,showTimeout:!0,showCost:!0,ariaLabel:`Narrow runtime`})})}function h({inline:e}){let[t,n]=(0,_.useState)({mode:`cli`,model:`anthropic/claude-sonnet-4-6`,effort:`medium`});return(0,v.jsx)(`div`,{className:o(`p-4`,e?`max-w-3xl`:`w-80 max-w-full`),children:(0,v.jsx)(f,{value:t,onChange:n,models:C,ariaLabel:e?`Wide runtime`:`Narrow runtime`,actions:{fields:[{id:`presets`,isSet:!0,label:`Presets`,title:`Presets — Guardrails`,caption:(0,v.jsx)(`span`,{className:`text-xs`,children:`Presets 1`}),items:[{label:`Guardrails`,onSelect:()=>{}}]}],menu:[{label:`Advanced`,icon:r,onSelect:()=>{}}]}})})}function g(){let[e,t]=(0,_.useState)({mode:`cli`,model:`anthropic/claude-sonnet-4-6`,effort:`medium`,budget:{timeout:`30m`,cost:2},permissions:{mode:`plan`},setup:{checkout:{worktree:{mode:`none`}}},workflow:{commits:[{on:`run`}]}});return(0,v.jsxs)(`div`,{className:`grid gap-4 p-6`,children:[(0,v.jsx)(f,{value:e,onChange:t,models:C,showTimeout:!0,showCost:!0,actions:{fields:s({value:e,onChange:t,models:C,families:u})}}),(0,v.jsx)(`pre`,{className:`text-xs`,children:JSON.stringify(e,null,2)})]})}var _,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F;function I(){return(I=e((()=>{_=t(),i(),a(),d(),c(),l(),v=n(),{expect:y,userEvent:b,waitFor:x,within:S}=__STORYBOOK_MODULE_TEST__,C=[{id:`anthropic/claude-sonnet-4-6`,provider:`anthropic`,label:`Claude Sonnet 4.6`,reasoning:!0,configured:!0,contextWindow:2e5},{id:`anthropic/claude-opus-4-1`,provider:`anthropic`,label:`Claude Opus 4.1`,reasoning:!0,configured:!0,contextWindow:2e5},{id:`openai/gpt-5-codex`,provider:`openai`,label:`GPT-5 Codex`,reasoning:!0,configured:!0,contextWindow:4e5},{id:`openai/gpt-5-mini`,provider:`openai`,label:`GPT-5 mini`,reasoning:!0,configured:!1,contextWindow:4e5}],w={title:`AI/RuntimeBar`,component:f,tags:[`autodocs`],parameters:{layout:`fullscreen`,docs:{description:{component:`Mode comes first and filters the combined provider/model picker. Supplied settings appear inline when space permits and move them into the three-dot menu on narrower containers. Constrain the parent width or set className (for example, max-w-sm) to cap the bar; resizing either restores settings as space returns. Unset settings are menu-only. Use showTimeout/showCost for run limits and actions.fields with runtimeSpecFields for permission mode, Source and Commit timing. Host fields provide isSet, caption and menu items; actions.menu adds entries such as Advanced. Custom model IDs and limits remain editable in their dropdowns.`}}},render:()=>(0,v.jsx)(p,{initial:{mode:`agent`}})},T={},E={render:()=>(0,v.jsx)(p,{initial:{mode:`cli`,model:`openai/gpt-5-codex`,effort:`high`}})},D={render:()=>(0,v.jsx)(p,{className:`max-w-sm`,initial:{mode:`cli`,model:`anthropic/claude-sonnet-4-6`,effort:`medium`,budget:{timeout:`30m`,cost:2}},showTimeout:!0,showCost:!0})},O={render:()=>(0,v.jsx)(m,{}),play:async({canvasElement:e})=>{let t=S(e).getByRole(`group`,{name:`Narrow runtime`}),n=t.querySelector(`[data-runtime-bar-section=identity]`),r=t.querySelector(`[data-runtime-bar-section=actions]`);await y(r.getBoundingClientRect().top).toBe(n.getBoundingClientRect().top),await y(t.scrollWidth).toBe(t.clientWidth),await b.click(S(t).getByTitle(`Runtime options`)),await y(S(document.body).getAllByRole(`menuitem`).map(e=>e.textContent)).toEqual([`Effort`,`Budget`,`Timeout`]),await b.keyboard(`{Escape}`)}},k={render:()=>(0,v.jsxs)(`div`,{className:`grid gap-4`,children:[(0,v.jsx)(h,{inline:!0}),(0,v.jsx)(h,{inline:!1})]}),play:async({canvasElement:e})=>{let t=S(e),n=t.getByRole(`group`,{name:`Wide runtime`}),r=t.getByRole(`group`,{name:`Narrow runtime`});await y(S(n).getByTitle(`Presets — Guardrails`)).toBeInTheDocument(),await y(S(r).queryByTitle(`Presets — Guardrails`)).not.toBeInTheDocument(),await b.click(S(r).getByTitle(`Runtime options`));let i=S(document.body).getAllByRole(`menu`)[0];await y(S(i).getAllByRole(`menuitem`).map(e=>e.textContent)).toEqual([`Effort`,`Presets`,`Advanced`]),await b.keyboard(`{Escape}`)}},A={render:()=>(0,v.jsx)(p,{initial:{mode:`cli`,model:`openai/gpt-5-codex`,effort:`high`,budget:{timeout:`30m`,cost:2}},showTimeout:!0,showCost:!0}),play:async({canvasElement:e})=>{let t=S(e),n=S(document.body);await y(t.getByTitle(`Runtime mode — CLI`)).toBeInTheDocument(),await b.click(t.getByTitle(`Model — openai/gpt-5-codex`));let r=await n.findByRole(`listbox`,{name:`Model`});await y(n.getByLabelText(`Search Model`)).toBeInTheDocument(),await b.click(S(r).getByRole(`option`,{name:/^Claude Sonnet/})),await y(t.getByTitle(`Runtime mode — CLI`)).toBeInTheDocument(),await y(t.getByTitle(`Model — anthropic/claude-sonnet-4-6`)).toBeInTheDocument(),await b.click(t.getByTitle(`Runtime options`)),await b.click(n.getByRole(`menuitem`,{name:`Budget`})),await y(n.getByLabelText(`Budget (USD)`)).toHaveValue(`2`),await b.keyboard(`{Escape}`),await x(()=>y(n.queryByRole(`menu`,{name:`Budget`})).not.toBeInTheDocument()),await y(n.getByRole(`menu`,{name:`Runtime options`})).toBeInTheDocument(),await b.keyboard(`{Escape}`),await x(()=>y(n.queryByRole(`menu`)).not.toBeInTheDocument())}},j={render:()=>(0,v.jsx)(p,{initial:{mode:`api`},families:[{id:`gemini`,label:`Gemini`,provider:`googleai`,modes:[{id:`api`,label:`API`}]}]}),play:async({canvasElement:e})=>{let t=S(e),n=S(document.body);await b.click(t.getByTitle(`Model — unspecified`)),await b.type(await n.findByLabelText(`Search Model`),`gemini-3-pro`),await b.click(await n.findByRole(`option`,{name:`Use custom: gemini-3-pro`})),await y(t.getByTitle(`Model — gemini-3-pro`)).toBeInTheDocument()}},M={render:()=>(0,v.jsx)(p,{initial:{mode:`cli`,model:`anthropic/claude-opus-4-1`}}),play:async({canvasElement:e})=>{let t=S(e),n=S(document.body);await b.click(t.getByTitle(`Model — anthropic/claude-opus-4-1`)),await b.click(await n.findByRole(`option`,{name:/^GPT-5 Codex/})),await y(t.getByTitle(`Runtime mode — CLI`)).toHaveTextContent(`CLI`),await y(t.getByTitle(`Model — openai/gpt-5-codex`)).toBeInTheDocument()}},N={render:()=>(0,v.jsx)(p,{initial:{mode:`agent`},families:[{id:`claude`,label:`Claude`,provider:`anthropic`,modes:[{id:`agent`,label:`Agent`,mode:`agent`,title:`Claude Agent SDK`},{id:`cli`,label:`CLI`,mode:`cli`,title:`Claude Code CLI`}]}]}),play:async({canvasElement:e})=>{let t=S(e),n=S(document.body);await b.click(t.getByTitle(`Runtime mode — Agent`)),await y(n.queryByRole(`menuitem`,{name:/^API/})).not.toBeInTheDocument()}},P={render:()=>(0,v.jsx)(g,{})},F=[`Default`,`WithModelAndEffort`,`MaximumWidth`,`NarrowContainer`,`HostActions`,`WithLimits`,`NoModelsForFamily`,`SwitchingFamilyKeepsTheMode`,`UnavailableModesAreOmitted`,`WithSpecSettings`],T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  render: () => <RuntimeBarStory initial={{
    mode: "cli",
    model: "openai/gpt-5-codex",
    effort: "high"
  }} />
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  render: () => <RuntimeBarStory className="max-w-sm" initial={{
    mode: "cli",
    model: "anthropic/claude-sonnet-4-6",
    effort: "medium",
    budget: {
      timeout: "30m",
      cost: 2
    }
  }} showTimeout showCost />
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  render: () => <NarrowRuntimeBarStory />,
  play: async ({
    canvasElement
  }) => {
    const bar = within(canvasElement).getByRole("group", {
      name: "Narrow runtime"
    });
    const identity = bar.querySelector("[data-runtime-bar-section=identity]")!;
    const actions = bar.querySelector("[data-runtime-bar-section=actions]")!;
    await expect(actions.getBoundingClientRect().top).toBe(identity.getBoundingClientRect().top);
    await expect(bar.scrollWidth).toBe(bar.clientWidth);
    await userEvent.click(within(bar).getByTitle("Runtime options"));
    await expect(within(document.body).getAllByRole("menuitem").map(item => item.textContent)).toEqual(["Effort", "Budget", "Timeout"]);
    await userEvent.keyboard("{Escape}");
  }
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  render: () => <div className="grid gap-4">
      <HostActionsStory inline />
      <HostActionsStory inline={false} />
    </div>,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const wide = canvas.getByRole("group", {
      name: "Wide runtime"
    });
    const narrow = canvas.getByRole("group", {
      name: "Narrow runtime"
    });
    await expect(within(wide).getByTitle("Presets — Guardrails")).toBeInTheDocument();
    await expect(within(narrow).queryByTitle("Presets — Guardrails")).not.toBeInTheDocument();
    await userEvent.click(within(narrow).getByTitle("Runtime options"));
    const menu = within(document.body).getAllByRole("menu")[0]!;
    await expect(within(menu).getAllByRole("menuitem").map(item => item.textContent)).toEqual(["Effort", "Presets", "Advanced"]);
    await userEvent.keyboard("{Escape}");
  }
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  render: () => <RuntimeBarStory initial={{
    mode: "cli",
    model: "openai/gpt-5-codex",
    effort: "high",
    budget: {
      timeout: "30m",
      cost: 2
    }
  }} showTimeout showCost />,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    await expect(canvas.getByTitle("Runtime mode — CLI")).toBeInTheDocument();
    await userEvent.click(canvas.getByTitle("Model — openai/gpt-5-codex"));
    const listbox = await body.findByRole("listbox", {
      name: "Model"
    });
    await expect(body.getByLabelText("Search Model")).toBeInTheDocument();
    await userEvent.click(within(listbox).getByRole("option", {
      name: /^Claude Sonnet/
    }));
    await expect(canvas.getByTitle("Runtime mode — CLI")).toBeInTheDocument();
    await expect(canvas.getByTitle("Model — anthropic/claude-sonnet-4-6")).toBeInTheDocument();
    await userEvent.click(canvas.getByTitle("Runtime options"));
    await userEvent.click(body.getByRole("menuitem", {
      name: "Budget"
    }));
    await expect(body.getByLabelText("Budget (USD)")).toHaveValue("2");
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body.queryByRole("menu", {
      name: "Budget"
    })).not.toBeInTheDocument());
    await expect(body.getByRole("menu", {
      name: "Runtime options"
    })).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body.queryByRole("menu")).not.toBeInTheDocument());
  }
}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  render: () => <RuntimeBarStory initial={{
    mode: "api"
  }} families={[{
    id: "gemini",
    label: "Gemini",
    provider: "googleai",
    modes: [{
      id: "api",
      label: "API"
    }]
  }]} />,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    await userEvent.click(canvas.getByTitle("Model — unspecified"));
    await userEvent.type(await body.findByLabelText("Search Model"), "gemini-3-pro");
    await userEvent.click(await body.findByRole("option", {
      name: "Use custom: gemini-3-pro"
    }));
    await expect(canvas.getByTitle("Model — gemini-3-pro")).toBeInTheDocument();
  }
}`,...j.parameters?.docs?.source},description:{story:`A hosted-API family the catalog does not describe keeps model entry available
 as free text even when there are no catalog rows.`,...j.parameters?.docs?.description}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  render: () => <RuntimeBarStory initial={{
    mode: "cli",
    model: "anthropic/claude-opus-4-1"
  }} />,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    await userEvent.click(canvas.getByTitle("Model — anthropic/claude-opus-4-1"));
    await userEvent.click(await body.findByRole("option", {
      name: /^GPT-5 Codex/
    }));
    await expect(canvas.getByTitle("Runtime mode — CLI")).toHaveTextContent("CLI");
    await expect(canvas.getByTitle("Model — openai/gpt-5-codex")).toBeInTheDocument();
  }
}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  render: () => <RuntimeBarStory initial={{
    mode: "agent"
  }} families={[{
    id: "claude",
    label: "Claude",
    provider: "anthropic",
    modes: [{
      id: "agent",
      label: "Agent",
      mode: "agent",
      title: "Claude Agent SDK"
    }, {
      id: "cli",
      label: "CLI",
      mode: "cli",
      title: "Claude Code CLI"
    }]
  }]} />,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    await userEvent.click(canvas.getByTitle("Runtime mode — Agent"));
    await expect(body.queryByRole("menuitem", {
      name: /^API/
    })).not.toBeInTheDocument();
  }
}`,...N.parameters?.docs?.source}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  render: () => <SpecSettingsStory />
}`,...P.parameters?.docs?.source}}}})))()}I();export{T as Default,k as HostActions,D as MaximumWidth,O as NarrowContainer,j as NoModelsForFamily,M as SwitchingFamilyKeepsTheMode,N as UnavailableModesAreOmitted,A as WithLimits,E as WithModelAndEffort,P as WithSpecSettings,F as __namedExportsOrder,w as default};