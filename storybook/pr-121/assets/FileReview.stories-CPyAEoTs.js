import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-pByjoP3I.js";import{t as n}from"./jsx-runtime-BG4KOiPz.js";import{c as r,l as i}from"./findings-comments-DHzrU_Da.js";import{S as a,a as o,b as s,d as c,n as l,o as u,s as d,t as ee,u as te,v as f,x as ne,y as p}from"./FileReview-BAnSyz-l.js";function m(e,t,n,r){return{file:y,line:e,severity:t,rule:n,message:r,source:`markdownlint`,kind:`lint`}}function h(e,t,n,r,i=`open`){return{id:e,author:t,body:r,status:i,anchor:p(n),createdAt:`2026-10-24T09:00:00.000Z`}}function g(e,t,n,r){return{id:e,parentId:t,author:n,body:r,createdAt:`2026-10-25T14:00:00.000Z`}}function re(){let e=[`# ${ce}`];for(let{heading:t,lines:n}of le)e.push(``,`## ${t}`),n.forEach((t,r)=>{let i=n[r-1];i!==void 0&&/^[-|]/.test(i)&&t[0]===i[0]||e.push(``),e.push(t)});return e.join(`
`)}function _(e){let t=O.split(`
`).findIndex(t=>t.includes(e));if(t<0)throw Error(`runbook fixture has no line containing ${JSON.stringify(e)}`);return t+1}function v(e,t,n,r){return{file:D,line:_(e),severity:t,rule:n,message:r,source:`markdownlint`,kind:`lint`}}function ie(e,t,n,r,i){let a=j.split(`
`)[n-1].indexOf(r);if(a<0)throw Error(`fixture: "${r}" is not on line ${n}`);let o=u(j,{line:n,column:a},{line:n,column:a+r.length});if(!o)throw Error(`fixture: "${r}" on line ${n} is blank`);return{id:e,author:t,body:i,status:`open`,anchor:d(o),createdAt:`2026-10-24T09:00:00.000Z`}}var y,ae,oe,b,x,S,C,w,T,se,E,D,ce,le,O,k,ue,de,fe,A,j,pe,me,M,N,P,he,F;function ge(){return(ge=e((()=>{f(),o(),y=`docs/release-checklist.md`,ae=`# Release checklist((This guide walks a maintainer through cutting a release of the example service, from freezing the branch to announcing the build.((## Before you start((Confirm the changelog lists every merged change and that the staging deploy has been green for a full day.((- Freeze the release branch(- Run the full test suite(- Ask a second maintainer to review the notes((## Cutting the build((Tag the commit with the next semantic version and push the tag; CI builds the artifacts and publishes them to the registry.((| Step | Owner | Time |(| --- | --- | --- |(| Tag | Release lead | 5 min |(| Publish | CI | 20 min |(| Announce | Release lead | 10 min |((## After the release((Watch the error dashboard for an hour and roll back if the error rate doubles.((Post a short summary in the team channel with a link to the changelog.((> Releases on a Friday need a second approver.`.split(`(`).join(`
`),oe=[m(3,`warning`,`MD013`,`Line length exceeds 80 characters`),m(3,`info`,`write-good`,`“cutting” is jargon; consider “publishing”`),m(15,`warning`,`MD013`,`Line length exceeds 80 characters`),m(20,`error`,`vale.Units`,`Spell out “min” as “minutes”`)],b={id:`dana`,name:`Dana Reyes`,kind:`user`},x={id:`sam`,name:`Sam Okafor`,kind:`user`},S={id:`priya`,name:`Priya Shah`,kind:`user`},C=[`Release checklist`,`Before you start`],w=[`Release checklist`,`Cutting the build`],T=[`Release checklist`,`After the release`],se=[h(`c-day`,b,{path:C,prefix:`staging deploy has been`,quote:`green for a full day`,suffix:`.`},`Is a full day enough? The last release regressed after 30 hours.`),g(`c-day-r1`,`c-day`,x,`Let's make it 48 hours for major versions.`),h(`c-freeze`,x,{path:C,prefix:``,quote:`Freeze the release branch`,suffix:`Run the full`},`Who owns the freeze? Name the role.`),h(`c-review`,S,{path:C,prefix:`full test suite`,quote:`Ask a second maintainer`,suffix:`to review the`},`Should this be the on-call reviewer instead?`),h(`c-semver`,b,{path:w,prefix:`commit with the`,quote:`next semantic version`,suffix:`and push the`},`Link to the versioning policy here.`),h(`c-publish`,S,{path:w,prefix:`lead 5 min`,quote:`Publish`,suffix:`CI 20 min`},`Publishing took 45 minutes last time; 20 is optimistic.`),h(`c-announce`,x,{path:w,prefix:`20 min Announce`,quote:`Release lead`,suffix:`10 min`},`The announcement should come from the on-call lead, not the release lead.`),h(`c-error`,b,{path:T,prefix:`roll back if the`,quote:`error`,suffix:`rate doubles`},`Which error rate: 5xx only, or client errors too?`),h(`c-rollback`,S,{path:T,prefix:`for an hour and`,quote:`roll back if the error rate doubles`,suffix:`.`},`Doubles from what baseline?`,`resolved`),g(`c-rollback-r1`,`c-rollback`,b,`Added the 7-day median as the baseline.`)],E={id:`short`,label:`Short`,path:y,source:ae,comments:se,findings:oe},D=`docs/incident-runbook.md`,ce=`Incident response runbook`,le=[{heading:`Overview`,lines:[`This runbook covers how the on-call engineer detects, triages, mitigates and closes an incident in the example platform, and who to involve at each stage.`,`It assumes access to the paging tool, the metrics dashboards and the deploy pipeline; request access during onboarding rather than mid-incident.`]},{heading:`Severity levels`,lines:[`Pick the severity from customer impact, not from how alarming the alert looks.`,`- SEV1: the product is down for most customers`,`- SEV2: a core feature is degraded for many customers`,`- SEV3: a minor feature is broken or a single tenant is affected`,`When in doubt, start one level higher and downgrade once the impact is understood.`]},{heading:`Detection`,lines:[`Most incidents start from an alert in the paging tool; others arrive as a support ticket or a message from a customer success manager.`,`Every alert links to a dashboard and a short description of what it measures; an alert without a dashboard link should be fixed after the incident.`]},{heading:`Acknowledge the page`,lines:[`Acknowledge the page within five minutes so the escalation policy does not wake the secondary.`,`- Open the incident channel from the paging tool`,`- Post the alert link and your first read of the impact`,`- Set the severity, even if it is a guess`]},{heading:`Triage`,lines:[`Start with the four golden signals: latency, traffic, errors and saturation, for the service named in the alert and its direct dependencies.`,`Check the deploy log for changes in the last two hours; a recent deploy is the most common cause and the fastest to undo.`,`If no deploy lines up, compare the failing region with a healthy one before digging into a single host.`]},{heading:`Roles`,lines:[`| Role | Responsibility | Default |`,`| --- | --- | --- |`,`| Incident commander | Coordinates and decides | On-call engineer |`,`| Communications lead | Status page and updates | Support lead |`,`| Scribe | Timeline in the channel | Anyone free |`,`For a SEV1, hand the incident commander role to someone not debugging so decisions do not wait on a terminal.`]},{heading:`Mitigation`,lines:[`Prefer actions that are quick to apply and quick to reverse: roll back the deploy, disable the feature flag, or shift traffic to the healthy region.`,`Write down each action in the channel before you take it, with the time and the expected effect, so the scribe can build the timeline.`]},{heading:`Rolling back`,lines:[`Roll back with the deploy pipeline's revert button rather than a manual redeploy, which skips the pre-flight checks.`,`- Confirm the previous build is still in the registry`,`- Revert and watch the error rate for ten minutes`,`- Leave the faulty commit on the branch until the review`]},{heading:`Customer communication`,lines:[`Post the first status page update within fifteen minutes of declaring a SEV1 or SEV2, even if it only says that the team is investigating.`,`Update the status page every thirty minutes until resolution; silence reads as neglect.`]},{heading:`Escalation`,lines:[`Page the owning team's secondary if you have made no progress in thirty minutes, and the engineering manager for any SEV1.`,`> Never wait for permission to escalate; a page that turns out to be unneeded costs far less than a slow response.`]},{heading:`Resolution`,lines:[`Declare the incident resolved once the signals have been normal for thirty minutes and no mitigation is still being applied.`,`Close the status page incident with a one-line summary and a promise of a review.`]},{heading:`Post-incident review`,lines:[`Schedule the review within five working days while the details are fresh; invite everyone who joined the channel.`,`- Build the timeline from the channel and the deploy log`,`- Name contributing factors, not a single root cause`,`- File every follow-up as a tracked task with an owner`]},{heading:`Follow-up`,lines:[`Review open follow-ups in the weekly operations meeting; a follow-up with no owner after two weeks is escalated to the engineering manager.`,`Close the review document once every follow-up is done or explicitly declined.`]},{heading:`Contacts`,lines:[`| Team | Channel | Escalation |`,`| --- | --- | --- |`,`| Platform | #platform-oncall | Platform manager |`,`| Payments | #payments-oncall | Payments manager |`,`| Support | #support-leads | Head of support |`]}],O=re(),k=(e,t,n,r)=>({path:[ce,e],prefix:t,quote:n,suffix:r}),ue=[h(`r-impact`,b,k(`Severity levels`,`severity from`,`customer impact`,`, not from`),`Can we give examples of impact per product area?`),h(`r-higher`,x,k(`Severity levels`,`doubt, start`,`one level higher`,`and downgrade`),`Downgrading later is cheap; agreed.`),h(`r-dashboard`,S,k(`Detection`,`fixed after the`,`incident`,`.`),`Who tracks these? Suggest a label on the follow-up.`),h(`r-five`,b,k(`Acknowledge the page`,`page within`,`five minutes`,`so the`),`Five minutes is tight overnight; ten for SEV3?`),g(`r-five-r1`,`r-five`,x,`Keep five; the secondary page is the safety net.`),h(`r-channel`,x,k(`Acknowledge the page`,`Open the`,`incident channel`,`from the`),`Link the channel naming convention.`),h(`r-guess`,S,k(`Acknowledge the page`,`even if it is a`,`guess`,``),`Worth saying it can change without asking anyone.`),h(`r-signals`,b,k(`Triage`,`four`,`golden signals`,`: latency`),`Add a link to the dashboard that shows all four.`),h(`r-region`,x,k(`Triage`,`compare the`,`failing region`,`with a healthy`),`We only have two regions; is this always possible?`),h(`r-comms`,S,k(`Roles`,`updates`,`Support lead`,`Scribe`),`Support lead is often asleep; name a backup.`),h(`r-scribe`,b,k(`Roles`,`channel`,`Anyone free`,``),`In practice nobody volunteers. Assign it explicitly.`),h(`r-terminal`,x,k(`Roles`,`do not wait on a`,`terminal`,`.`),`Great point, keep this.`),h(`r-flag`,S,k(`Mitigation`,`deploy,`,`disable the feature flag`,`, or shift`),`Which flags are safe to flip without a review?`),h(`r-revert`,b,k(`Rolling back`,`deploy pipeline's`,`revert button`,`rather than`),`The revert button is hidden for non-admins.`),g(`r-revert-r1`,`r-revert`,S,`Filed access change for on-call.`),h(`r-registry`,x,k(`Rolling back`,`previous build is`,`still in the registry`,``),`Registry keeps 30 builds; mention the retention.`),h(`r-ten`,S,k(`Rolling back`,`error rate for`,`ten minutes`,``),`Ten minutes misses slow leaks; make it thirty?`),h(`r-fifteen`,b,k(`Customer communication`,`update within`,`fifteen minutes`,`of declaring`),`Legal asked for ten for SEV1.`),h(`r-silence`,x,k(`Customer communication`,`resolution;`,`silence reads as neglect`,`.`),`Love this line.`),h(`r-permission`,S,k(`Escalation`,`Never wait for`,`permission`,`to escalate`),`Should be bold, it is the most-missed rule.`),h(`r-normal`,b,k(`Resolution`,`have been`,`normal for thirty minutes`,`and no`),`Normal by which threshold?`,`resolved`),h(`r-days`,x,k(`Post-incident review`,`review within`,`five working days`,`while the`),`Three days for SEV1.`),h(`r-factors`,S,k(`Post-incident review`,`Name`,`contributing factors`,`, not a`),`Link the review template.`),h(`r-weekly`,b,k(`Follow-up`,`in the`,`weekly operations meeting`,`; a follow-up`),`This meeting was cancelled; use the ops review.`),h(`r-payments`,x,k(`Contacts`,`Payments`,`#payments-oncall`,`Payments manager`),`Channel was renamed to #payments-incidents.`)],de=[v(`This runbook covers`,`warning`,`MD013`,`Line length exceeds 80 characters`),v(`golden signals`,`info`,`write-good`,`“golden signals” is jargon; link a definition`),v(`revert button`,`warning`,`MD013`,`Line length exceeds 80 characters`),v(`#payments-oncall`,`error`,`vale.Links`,`Channel name is out of date`)],fe={id:`long`,label:`Long`,path:D,source:O,comments:ue,findings:de},A=`pkg/retry/retry.go`,j=`package retry

import (
	"context"
	"time"
)

// Do calls fn until it succeeds, waiting longer after each failure.
func Do(ctx context.Context, attempts int, fn func() error) error {
	delay := 100 * time.Millisecond
	var err error
	for i := 0; i < attempts; i++ {
		if err = fn(); err == nil {
			return nil
		}
		select {
		case <-ctx.Done():
			return ctx.Err()
		case <-time.After(delay):
		}
		delay *= 2
	}
	return err
}`,pe=[{file:A,line:18,severity:`warning`,rule:`wrapcheck`,message:`error returned from external package is unwrapped`,source:`golangci`,kind:`lint`},{file:A,line:21,severity:`info`,rule:`mnd`,message:`Magic number: 2`,source:`golangci`,kind:`lint`},{file:A,line:23,severity:`error`,rule:`errcheck`,message:`Wrap the last error with the attempt count`,source:`golangci`,kind:`lint`}],me=[ie(`g-delay`,b,10,`100 * time.Millisecond`,`Should the first delay come from an option? Callers hitting rate limits want seconds.`),g(`g-delay-r1`,`g-delay`,x,`Agreed, take a Backoff struct with Initial and Max.`),ie(`g-double`,S,21,`delay *= 2`,`No cap: ten attempts wait 51 seconds before the last one.`)],M={sha:`3f9c2a1b7d4e5f60718293a4b5c6d7e8f9012345`,author:`Dana Reyes`,date:`2025-03-14T10:12:00Z`,summary:`Add retry helper`},N={sha:`8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b`,author:`Sam Okafor`,date:`2025-11-02T16:40:00Z`,summary:`Stop retrying when the context is cancelled`},P={sha:`c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0`,author:`Priya Shah`,date:`2026-10-20T09:05:00Z`,summary:`Back off exponentially`},he=[{startLine:1,lineCount:3,commit:M},{startLine:4,lineCount:1,commit:N},{startLine:5,lineCount:4,commit:M},{startLine:9,lineCount:1,commit:N},{startLine:10,lineCount:1,commit:P},{startLine:11,lineCount:5,commit:M},{startLine:16,lineCount:5,commit:N},{startLine:21,lineCount:1,commit:P},{startLine:22,lineCount:3,commit:M}],F={id:`code`,label:`Go file`,path:A,source:j,comments:me,findings:pe,blame:he}})))()}function _e(){return new Worker(new URL(`/clicky-ui/storybook/pr-121/assets/editor.worker-BlfIGhym.js`,``+import.meta.url),{type:`module`})}function ve(e,t){let[n,r]=(0,I.useState)(e),i=(0,I.useRef)(0);return{items:n,callbacks:(0,I.useMemo)(()=>{let e=e=>{let t={...e,id:`local-${++i.current}`,createdAt:new Date().toISOString(),author:U};r(e=>[...e,t])};return{onCreate:async n=>{await t?.(n),e({body:n.body,anchor:n.anchor??null,status:`open`})},onReply:t=>e({body:t.body,anchor:t.anchor??null,parentId:t.parentId}),onUpdateStatus:(e,t)=>r(n=>n.map(n=>n.id===e?{...n,status:t}:n)),onDelete:e=>r(t=>t.filter(t=>t.id!==e&&t.parentId!==e))}},[t])}}function ye({fixture:e=E,withComments:t=!1,withFindings:n=!1,withBlame:i=!1,editable:a=!1,onCreate:o,anchoring:s,targets:c,...l}){let[u,d]=(0,I.useState)(l.view??`preview`),[f,ne]=(0,I.useState)(l.layout??`margin`),[p,m]=(0,I.useState)(te),[h,g]=(0,I.useState)(e.source),re=ve(e.comments,o),_=(0,L.jsx)(ee,{path:e.path,source:h,...l,view:u,onViewChange:d,layout:f,onLayoutChange:ne,...t?{comments:{...re,...s?{anchoring:s}:{},...c?{targets:c}:{}}}:{},...n?{findings:e.findings,problemFilters:p,onProblemFiltersChange:m}:{},...i?{blame:e.blame}:{},...a?{onSourceChange:g}:{}});return a?(0,L.jsx)(r,{getWorker:_e,children:_}):_}var I,L,R,z,B,V,H,U,be,W,G,K,q,J,Y,X,Z,Q,xe,$,Se;function Ce(){return(Ce=e((()=>{I=t(),ne(),i(),l(),c(),ge(),f(),o(),L=n(),{expect:R,fn:z,userEvent:B,waitFor:V,within:H}=__STORYBOOK_MODULE_TEST__,U={id:`you`,name:`You`,kind:`user`},be={title:`Git/FileReview`,component:ye,parameters:{docs:{description:{component:"Google Docs-style review of one file. Markdown gets a rendered Preview; any other file a syntax-highlighted Source listing with threads under their lines. Each feature turns on with its prop: `findings` adds a severity rail, squiggles, read-only finding threads and a Problems tab; `comments` adds quote highlights with threads in a margin sidebar or inline under the text; `selectToComment` lets a reader select or right-click words to start a thread; `blame` adds a Blame toggle with who last changed each line; `onSourceChange` turns Source into a Monaco editor. Without them it is a plain rendered/source viewer."}}}},W={tags:[`browser`],args:{withComments:!0,withFindings:!0,selectToComment:!0,authorFilter:!0,onCreate:z()},play:async({canvasElement:e,args:t})=>{let n=H(e),r=await V(()=>{let t=[...e.querySelectorAll(`p`)].find(e=>e.textContent?.includes(`CI builds the artifacts`));if(!t)throw Error(`the build paragraph has not rendered yet`);return t}),i=[...r.childNodes].find(e=>e instanceof Text&&e.data.includes(`artifacts`)),a=i.data.indexOf(`artifacts`),o=document.createRange();o.setStart(i,a),o.setEnd(i,a+9);let s=window.getSelection();s.removeAllRanges(),s.addRange(o),r.dispatchEvent(new MouseEvent(`mouseup`,{bubbles:!0,button:0})),await B.click(await n.findByRole(`button`,{name:`Comment`})),await B.type(n.getByTestId(`comment-compose-input`),`Which registry?`),await B.click(n.getByRole(`button`,{name:`Post comment`}));let c=p({path:[`Release checklist`,`Cutting the build`],prefix:`builds the`,quote:`artifacts`,suffix:`and publishes`});await V(()=>R(t.onCreate).toHaveBeenCalledWith(R.objectContaining({anchor:c,body:`Which registry?`}))),await V(()=>R(e.querySelector(`[data-card-anchor='${CSS.escape(c)}']`)).not.toBeNull())}},G={tags:[`browser`],args:{withComments:!0,withFindings:!0,selectToComment:!0,layout:`inline`}},K={tags:[`browser`],args:{fixture:fe,withComments:!0,withFindings:!0,selectToComment:!0,className:`h-[720px]`}},q={args:{withFindings:!0,view:`problems`},play:async({canvasElement:e})=>{let t=H(e);R(t.getAllByRole(`tab`).map(e=>e.textContent?.replace(/\d+$/,``))).toEqual([`Preview`,`Source`,`Problems`]),R(e.querySelectorAll(`[data-problem-line]`)).toHaveLength(E.findings.length)}},J={args:{withFindings:!0,view:`problems`,getFindingActions:e=>[{label:`Copy rule ID`,onSelect:()=>{navigator.clipboard.writeText(e.rule??e.source)}}]},play:async({canvasElement:e})=>{await B.click(H(e).getAllByRole(`button`,{name:`Problem actions`})[0]),await R(H(document.body).getByRole(`menuitem`,{name:`Copy rule ID`})).toBeVisible()}},Y={args:{withComments:!0,view:`source`}},X={play:async({canvasElement:e})=>{let t=H(e);R(t.getAllByRole(`tab`).map(e=>e.textContent)).toEqual([`Preview`,`Source`]),R(t.queryByText(/open ·/)).toBeNull()}},Z={tags:[`browser`],args:{fixture:F,view:`source`,withComments:!0,withFindings:!0,withBlame:!0,selectToComment:!0,onCreate:z(),className:`h-[720px]`},play:async({canvasElement:e,args:t})=>{let n=H(e);R(n.getAllByRole(`tab`).map(e=>e.textContent?.replace(/\d+$/,``))).toEqual([`Source`,`Problems`]);let r=await V(()=>{let t=e.querySelector(`[data-source-text="12"]`);if(!t?.querySelector(`span[style*='color']`))throw Error(`line 12 is not highlighted yet`);return t},{timeout:5e3}),i=document.createTreeWalker(r,NodeFilter.SHOW_TEXT),a=null;for(;i.nextNode();)i.currentNode.data.includes(`attempts`)&&(a=i.currentNode);if(!a)throw Error(`line 12 has no text node holding "attempts"`);let o=a.data.indexOf(`attempts`),s=document.createRange();s.setStart(a,o),s.setEnd(a,o+8),window.getSelection().removeAllRanges(),window.getSelection().addRange(s),r.dispatchEvent(new MouseEvent(`mouseup`,{bubbles:!0,button:0})),await B.click(await n.findByRole(`button`,{name:`Comment`})),await B.type(n.getByTestId(`comment-compose-input`),`Off by one?`),await B.click(n.getByRole(`button`,{name:`Post comment`}));let c=j.split(`
`)[11].indexOf(`attempts`),l=d(u(j,{line:12,column:c},{line:12,column:c+8}));await V(()=>R(t.onCreate).toHaveBeenCalledWith(R.objectContaining({anchor:l,body:`Off by one?`}))),await V(()=>R(e.querySelector(`[data-source-thread='${CSS.escape(l)}']`)).not.toBeNull()),await B.click(n.getByRole(`button`,{name:`Blame`})),R(e.querySelectorAll(`[data-blame-sha]`)).toHaveLength(F.blame.length)}},Q={tags:[`browser`],args:{withFindings:!0,editable:!0,view:`source`}},xe={id:`patch-1`,body:`Is a green day still the bar for major versions?`,status:`open`,anchor:a(s(E.source,7,7)),createdAt:`2026-10-24T09:00:00.000Z`,author:U},$={tags:[`browser`],args:{fixture:{...E,comments:[xe]},withComments:!0,editable:!0,selectToComment:!0,anchoring:`patch`,targets:{element:!0,document:!0,screenshot:!0},view:`source`,className:`h-[720px]`},play:async({canvasElement:e})=>{let t=H(e);await B.click(await t.findByRole(`button`,{name:`Review`}));let n=await V(()=>{let t=e.querySelector(`[data-source-line="7"] [data-source-thread]`);if(!t)throw Error(`the patch thread is not listed under line 7 yet`);return t});await R(n).toHaveTextContent(`Is a green day still the bar`)}},Se=[`AllFeatures`,`InlineThreads`,`LongDocument`,`LintOnly`,`ContextualProblemActions`,`CommentsOnly`,`ReadOnly`,`CodeFile`,`EditableSource`,`PatchComments`],W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
  tags: ["browser"],
  args: {
    withComments: true,
    withFindings: true,
    selectToComment: true,
    authorFilter: true,
    onCreate: fn()
  },
  play: async ({
    canvasElement,
    args
  }) => {
    const canvas = within(canvasElement);
    const paragraph = await waitFor(() => {
      const p = [...canvasElement.querySelectorAll("p")].find(el => el.textContent?.includes("CI builds the artifacts"));
      if (!p) throw new Error("the build paragraph has not rendered yet");
      return p;
    });
    const text = [...paragraph.childNodes].find((node): node is Text => node instanceof Text && node.data.includes("artifacts"))!;
    const start = text.data.indexOf("artifacts");
    const range = document.createRange();
    range.setStart(text, start);
    range.setEnd(text, start + "artifacts".length);
    const selection = window.getSelection()!;
    selection.removeAllRanges();
    selection.addRange(range);
    paragraph.dispatchEvent(new MouseEvent("mouseup", {
      bubbles: true,
      button: 0
    }));
    await userEvent.click(await canvas.findByRole("button", {
      name: "Comment"
    }));
    await userEvent.type(canvas.getByTestId("comment-compose-input"), "Which registry?");
    await userEvent.click(canvas.getByRole("button", {
      name: "Post comment"
    }));
    const anchor = quoteAnchor({
      path: ["Release checklist", "Cutting the build"],
      prefix: "builds the",
      quote: "artifacts",
      suffix: "and publishes"
    });
    await waitFor(() => expect(args.onCreate).toHaveBeenCalledWith(expect.objectContaining({
      anchor,
      body: "Which registry?"
    })));
    await waitFor(() => expect(canvasElement.querySelector(\`[data-card-anchor='\${CSS.escape(anchor)}']\`)).not.toBeNull());
  }
}`,...W.parameters?.docs?.source}}},G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
  tags: ["browser"],
  args: {
    withComments: true,
    withFindings: true,
    selectToComment: true,
    layout: "inline"
  }
}`,...G.parameters?.docs?.source}}},K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:`{
  tags: ["browser"],
  args: {
    fixture: LONG_DOC,
    withComments: true,
    withFindings: true,
    selectToComment: true,
    className: "h-[720px]"
  }
}`,...K.parameters?.docs?.source}}},q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
  args: {
    withFindings: true,
    view: "problems"
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    expect(canvas.getAllByRole("tab").map(tab => tab.textContent?.replace(/\\d+$/, ""))).toEqual(["Preview", "Source", "Problems"]);
    expect(canvasElement.querySelectorAll("[data-problem-line]")).toHaveLength(SHORT_DOC.findings.length);
  }
}`,...q.parameters?.docs?.source}}},J.parameters={...J.parameters,docs:{...J.parameters?.docs,source:{originalSource:`{
  args: {
    withFindings: true,
    view: "problems",
    getFindingActions: finding => [{
      label: "Copy rule ID",
      onSelect: () => {
        void navigator.clipboard.writeText(finding.rule ?? finding.source);
      }
    }]
  },
  play: async ({
    canvasElement
  }) => {
    await userEvent.click(within(canvasElement).getAllByRole("button", {
      name: "Problem actions"
    })[0]!);
    await expect(within(document.body).getByRole("menuitem", {
      name: "Copy rule ID"
    })).toBeVisible();
  }
}`,...J.parameters?.docs?.source},description:{story:`Host actions are typed menu items shared by Problems, Source and Preview.`,...J.parameters?.docs?.description}}},Y.parameters={...Y.parameters,docs:{...Y.parameters?.docs,source:{originalSource:`{
  args: {
    withComments: true,
    view: "source"
  }
}`,...Y.parameters?.docs?.source}}},X.parameters={...X.parameters,docs:{...X.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    expect(canvas.getAllByRole("tab").map(tab => tab.textContent)).toEqual(["Preview", "Source"]);
    expect(canvas.queryByText(/open ·/)).toBeNull();
  }
}`,...X.parameters?.docs?.source}}},Z.parameters={...Z.parameters,docs:{...Z.parameters?.docs,source:{originalSource:`{
  tags: ["browser"],
  args: {
    fixture: CODE_FILE,
    view: "source",
    withComments: true,
    withFindings: true,
    withBlame: true,
    selectToComment: true,
    onCreate: fn(),
    className: "h-[720px]"
  },
  play: async ({
    canvasElement,
    args
  }) => {
    const canvas = within(canvasElement);
    expect(canvas.getAllByRole("tab").map(tab => tab.textContent?.replace(/\\d+$/, ""))).toEqual(["Source", "Problems"]);
    // Select once the syntax colours have replaced the plain text, so the selected node stays in the document.
    const line = await waitFor(() => {
      const el = canvasElement.querySelector<HTMLElement>('[data-source-text="12"]');
      if (!el?.querySelector("span[style*='color']")) throw new Error("line 12 is not highlighted yet");
      return el;
    }, {
      timeout: 5_000
    });
    const walker = document.createTreeWalker(line, NodeFilter.SHOW_TEXT);
    let text: Text | null = null;
    while (walker.nextNode()) if ((walker.currentNode as Text).data.includes("attempts")) text = walker.currentNode as Text;
    if (!text) throw new Error("line 12 has no text node holding \\"attempts\\"");
    const start = text.data.indexOf("attempts");
    const range = document.createRange();
    range.setStart(text, start);
    range.setEnd(text, start + "attempts".length);
    window.getSelection()!.removeAllRanges();
    window.getSelection()!.addRange(range);
    line.dispatchEvent(new MouseEvent("mouseup", {
      bubbles: true,
      button: 0
    }));
    await userEvent.click(await canvas.findByRole("button", {
      name: "Comment"
    }));
    await userEvent.type(canvas.getByTestId("comment-compose-input"), "Off by one?");
    await userEvent.click(canvas.getByRole("button", {
      name: "Post comment"
    }));
    const column = CODE_SOURCE.split("\\n")[11]!.indexOf("attempts");
    const anchor = sourceAnchor(locateSource(CODE_SOURCE, {
      line: 12,
      column
    }, {
      line: 12,
      column: column + "attempts".length
    })!);
    await waitFor(() => expect(args.onCreate).toHaveBeenCalledWith(expect.objectContaining({
      anchor,
      body: "Off by one?"
    })));
    await waitFor(() => expect(canvasElement.querySelector(\`[data-source-thread='\${CSS.escape(anchor)}']\`)).not.toBeNull());
    await userEvent.click(canvas.getByRole("button", {
      name: "Blame"
    }));
    expect(canvasElement.querySelectorAll("[data-blame-sha]")).toHaveLength(CODE_FILE.blame!.length);
  }
}`,...Z.parameters?.docs?.source}}},Q.parameters={...Q.parameters,docs:{...Q.parameters?.docs,source:{originalSource:`{
  tags: ["browser"],
  args: {
    withFindings: true,
    editable: true,
    view: "source"
  }
}`,...Q.parameters?.docs?.source}}},$.parameters={...$.parameters,docs:{...$.parameters?.docs,source:{originalSource:`{
  tags: ["browser"],
  args: {
    fixture: {
      ...SHORT_DOC,
      comments: [PATCH_THREAD]
    },
    withComments: true,
    editable: true,
    selectToComment: true,
    anchoring: "patch",
    targets: {
      element: true,
      document: true,
      screenshot: true
    },
    view: "source",
    className: "h-[720px]"
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole("button", {
      name: "Review"
    }));
    const thread = await waitFor(() => {
      const el = canvasElement.querySelector<HTMLElement>('[data-source-line="7"] [data-source-thread]');
      if (!el) throw new Error("the patch thread is not listed under line 7 yet");
      return el;
    });
    await expect(thread).toHaveTextContent("Is a green day still the bar");
  }
}`,...$.parameters?.docs?.source},description:{story:`An editable file whose threads are git-style patch anchors (\`r:\`): select
lines in the editor, the Source listing or the Preview and the thread keeps
to those lines as the text changes. Switch **Edit / Review** in the header;
the Comment menu comments on an element or the whole file.`,...$.parameters?.docs?.description}}}})))()}Ce();export{W as AllFeatures,Z as CodeFile,Y as CommentsOnly,J as ContextualProblemActions,Q as EditableSource,G as InlineThreads,q as LintOnly,K as LongDocument,$ as PatchComments,X as ReadOnly,Se as __namedExportsOrder,be as default};