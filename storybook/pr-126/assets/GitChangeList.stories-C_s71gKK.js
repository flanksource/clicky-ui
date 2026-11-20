import{n as e}from"./rolldown-runtime-BCiCTKAo.js";import{t}from"./react-BcdEFcws.js";import{t as n}from"./jsx-runtime-DKU1u6-r.js";import{a as r,i,n as a,t as o}from"./GitChangeList-CKGgUOXb.js";import{n as s,t as c}from"./CodeDiff-GVXM0CuT.js";function l(){let[e,t]=(0,d.useState)([]);return(0,f.jsxs)(`div`,{className:`max-w-3xl space-y-2`,children:[(0,f.jsxs)(`p`,{className:`text-xs text-muted-foreground`,"data-testid":`picked`,children:[`Picked: `,e.map(e=>e.slice(0,7)).join(` → `)||`none`]}),(0,f.jsx)(a,{commits:x,groupByDate:!1,selectedShas:e,onToggleSelect:e=>t(t=>t.includes(e.sha)?t.filter(t=>t!==e.sha):[...t,e.sha].slice(-2)),selectLabel:e=>`Pick ${e.sha.slice(0,7)} for comparison`,renderBadges:e=>(0,f.jsx)(`span`,{className:`rounded px-1.5 text-[10px] font-medium ${S[e.change]}`,children:e.change}),renderSubtitle:e=>e.previousPath?(0,f.jsxs)(`div`,{className:`mt-1 font-mono text-[11px] text-muted-foreground`,children:[`from `,e.previousPath]}):null,renderExpanded:e=>e.before===e.after?(0,f.jsx)(`p`,{className:`px-3 py-2 text-xs text-muted-foreground`,children:`Content unchanged; only the path moved.`}):(0,f.jsx)(`div`,{className:`px-3 py-2`,children:(0,f.jsx)(c,{original:e.before,modified:e.after,language:`xml`})})})]})}function u(){let[e,t]=(0,d.useState)([]);return(0,f.jsx)(`div`,{className:`max-w-3xl`,children:(0,f.jsx)(a,{commits:w,groupByDate:!1,selectedShas:e,onToggleSelect:e=>t(t=>t.includes(e.sha)?t.filter(t=>t!==e.sha):[...t,e.sha]),selectBlockReason:e=>e.merge?`A merge commit cannot be cherry-picked; pick the commits it merges.`:null})})}var d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D;function O(){return(O=e((()=>{d=t(),s(),r(),f=n(),{expect:p,userEvent:m,waitFor:h,within:g}=__STORYBOOK_MODULE_TEST__,_=[{sha:`392799902c7fa82130fb4a43e6ea8734e11d1e98`,title:`fix(deps): update pgx in test module`,authorLogin:`adityathebe`,committedAt:`2026-07-01T18:20:34Z`,additions:3,deletions:3,changedFiles:2,href:`https://github.com/flanksource/postgres/commit/392799902c7fa82130fb4a43e6ea8734e11d1e98`},{sha:`4ce8aa03c7a750a8aa83f80529b8512bafde70d9`,title:`chore: update lockfile`,authorLogin:`moshe`,committedAt:`2026-07-02T09:00:00Z`,additions:12,deletions:4,changedFiles:1}],v=[{path:`test/go.mod`,status:`modified`,additions:1,deletions:1},{path:`test/go.sum`,status:`modified`,additions:2,deletions:2},{path:`docs/dependencies.md`,status:`added`,additions:18,deletions:0}],y={title:`Git/GitChangeList`,parameters:{layout:`padded`}},b={render:()=>(0,f.jsx)(`div`,{className:`max-w-3xl`,children:(0,f.jsx)(a,{commits:_,loadDiff:async e=>({commit:e.sha,diff:`diff --git a/test/go.mod b/test/go.mod
@@ -1 +1 @@
-github.com/jackc/pgx/v5 v5.7.4
+github.com/jackc/pgx/v5 v5.7.5`})})})},x=[{sha:`9f8e7d6c5b4a39281706f5e4d3c2b1a098765432`,title:`Move AddRider under the Annuity plan`,authorName:`Dana Reviewer`,committedAt:`2026-10-12T09:30:00Z`,change:`renamed`,previousPath:`pr/Legacy/tr/AddRider`,before:`<Transaction>
  <Rider>Basic</Rider>
</Transaction>`,after:`<Transaction>
  <Rider>Basic</Rider>
</Transaction>`},{sha:`1a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d`,title:`Raise the rider age limit`,body:`Underwriting asked for 75 instead of 70.`,authorName:`Alex Author`,committedAt:`2026-10-05T14:00:00Z`,change:`modified`,before:`<Transaction>
  <MaxAge>70</MaxAge>
</Transaction>`,after:`<Transaction>
  <MaxAge>75</MaxAge>
</Transaction>`},{sha:`0f1e2d3c4b5a69788796a5b4c3d2e1f0a9b8c7d6`,title:`Add AddRider`,authorName:`Alex Author`,committedAt:`2026-09-28T08:15:00Z`,change:`added`,before:``,after:`<Transaction>
  <MaxAge>70</MaxAge>
</Transaction>`}],S={added:`bg-emerald-500/15 text-emerald-700`,modified:`bg-amber-500/15 text-amber-700`,renamed:`bg-sky-500/15 text-sky-700`},C={render:()=>(0,f.jsx)(l,{}),play:async({canvasElement:e,step:t})=>{let n=g(e);await t(`ticking two commits picks them without expanding either`,async()=>{await m.click(n.getByRole(`checkbox`,{name:`Pick 1a2b3c4 for comparison`})),await m.click(n.getByRole(`checkbox`,{name:`Pick 0f1e2d3 for comparison`})),await p(n.getByTestId(`picked`)).toHaveTextContent(`Picked: 1a2b3c4 → 0f1e2d3`),await p(n.queryAllByRole(`button`,{expanded:!0})).toHaveLength(0)}),await t(`expanding a commit renders the host body instead of GitDiffPanel`,async()=>{await m.click(n.getByText(`Raise the rider age limit`)),await h(()=>p(e.querySelectorAll(`[data-diff-line="add"]`).length).toBeGreaterThan(0)),await p(n.getByText(`renamed`)).toBeInTheDocument(),await p(n.getByText(`from pr/Legacy/tr/AddRider`)).toBeInTheDocument()})}},w=[{sha:`1111111111111111111111111111111111111111`,title:`ValidateBillGroup: reject empty groups`,authorName:`Thandi`,committedAt:`2026-10-17T08:00:00Z`,changedFiles:1},{sha:`2222222222222222222222222222222222222222`,title:`Merge feature/dates`,authorName:`bot`,committedAt:`2026-10-17T09:00:00Z`,merge:!0},{sha:`3333333333333333333333333333333333333333`,title:`GroupLifeCover: default start`,authorName:`Sipho`,committedAt:`2026-10-17T10:00:00Z`,changedFiles:1}],T={render:()=>(0,f.jsx)(u,{}),play:async({canvasElement:e})=>{let t=g(e);await p(t.getByRole(`checkbox`,{name:`Select commit 2222222`})).toBeDisabled(),await m.click(t.getByRole(`checkbox`,{name:`Select commit 1111111`})),await p(t.getByRole(`checkbox`,{name:`Select commit 1111111`})).toBeChecked()}},E={render:()=>(0,f.jsxs)(`div`,{className:`max-w-3xl space-y-2`,children:[(0,f.jsx)(o,{files:v.length,additions:21,deletions:3}),(0,f.jsx)(i,{files:v,loadDiff:async e=>({path:e.path,diff:`diff --git a/${e.path} b/${e.path}\n@@ -1 +1 @@\n-old dependency\n+new dependency`})})]})},D=[`Commits`,`SelectableWithBadgesAndCustomBody`,`SelectableWithBlockedCommit`,`Files`],b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: () => <div className="max-w-3xl">
      <GitCommitList commits={commits} loadDiff={async commit => ({
      commit: commit.sha,
      diff: \`diff --git a/test/go.mod b/test/go.mod\\n@@ -1 +1 @@\\n-github.com/jackc/pgx/v5 v5.7.4\\n+github.com/jackc/pgx/v5 v5.7.5\`
    })} />
    </div>
}`,...b.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  render: () => <SelectableHistory />,
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("ticking two commits picks them without expanding either", async () => {
      await userEvent.click(canvas.getByRole("checkbox", {
        name: "Pick 1a2b3c4 for comparison"
      }));
      await userEvent.click(canvas.getByRole("checkbox", {
        name: "Pick 0f1e2d3 for comparison"
      }));
      await expect(canvas.getByTestId("picked")).toHaveTextContent("Picked: 1a2b3c4 → 0f1e2d3");
      await expect(canvas.queryAllByRole("button", {
        expanded: true
      })).toHaveLength(0);
    });
    await step("expanding a commit renders the host body instead of GitDiffPanel", async () => {
      await userEvent.click(canvas.getByText("Raise the rider age limit"));
      await waitFor(() => expect(canvasElement.querySelectorAll('[data-diff-line="add"]').length).toBeGreaterThan(0));
      await expect(canvas.getByText("renamed")).toBeInTheDocument();
      await expect(canvas.getByText("from pr/Legacy/tr/AddRider")).toBeInTheDocument();
    });
  }
}`,...C.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  render: () => <PickableWithBlocked />,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("checkbox", {
      name: "Select commit 2222222"
    })).toBeDisabled();
    await userEvent.click(canvas.getByRole("checkbox", {
      name: "Select commit 1111111"
    }));
    await expect(canvas.getByRole("checkbox", {
      name: "Select commit 1111111"
    })).toBeChecked();
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  render: () => <div className="max-w-3xl space-y-2">
      <GitChangedFilesSummary files={files.length} additions={21} deletions={3} />
      <GitFileList files={files} loadDiff={async file => ({
      path: file.path,
      diff: \`diff --git a/\${file.path} b/\${file.path}\\n@@ -1 +1 @@\\n-old dependency\\n+new dependency\`
    })} />
    </div>
}`,...E.parameters?.docs?.source}}}})))()}O();export{b as Commits,E as Files,C as SelectableWithBadgesAndCustomBody,T as SelectableWithBlockedCommit,D as __namedExportsOrder,y as default};