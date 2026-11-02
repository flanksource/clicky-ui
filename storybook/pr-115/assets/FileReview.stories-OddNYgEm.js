import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-pByjoP3I.js";import{t as n}from"./jsx-runtime-BG4KOiPz.js";import{n as r,t as i}from"./MonacoProvider-DfyDAmQC.js";import{a,d as o,f as s,i as c,n as l,o as u,r as d,t as ee}from"./FileReview-Nu8vvdMp.js";function f(e,t,n,r){return{file:_,line:e,severity:t,rule:n,message:r,source:`markdownlint`,kind:`lint`}}function p(e,t,n,r,i=`open`){return{id:e,author:t,body:r,status:i,anchor:s(n),createdAt:`2026-10-24T09:00:00.000Z`}}function m(e,t,n,r){return{id:e,parentId:t,author:n,body:r,createdAt:`2026-10-25T14:00:00.000Z`}}function te(){let e=[`# ${E}`];for(let{heading:t,lines:n}of oe)e.push(``,`## ${t}`),n.forEach((t,r)=>{let i=n[r-1];i!==void 0&&/^[-|]/.test(i)&&t[0]===i[0]||e.push(``),e.push(t)});return e.join(`
`)}function ne(e){let t=D.split(`
`).findIndex(t=>t.includes(e));if(t<0)throw Error(`runbook fixture has no line containing ${JSON.stringify(e)}`);return t+1}function h(e,t,n,r){return{file:T,line:ne(e),severity:t,rule:n,message:r,source:`markdownlint`,kind:`lint`}}function g(e,t,n,r,i){let o=j.split(`
`)[n-1].indexOf(r);if(o<0)throw Error(`fixture: "${r}" is not on line ${n}`);let s=c(j,{line:n,column:o},{line:n,column:o+r.length});if(!s)throw Error(`fixture: "${r}" on line ${n} is blank`);return{id:e,author:t,body:i,status:`open`,anchor:a(s),createdAt:`2026-10-24T09:00:00.000Z`}}var _,re,ie,v,y,b,x,S,C,ae,w,T,E,oe,D,O,se,ce,k,A,j,le,M,N,P,F,I,L;function ue(){return(ue=e((()=>{o(),d(),_=`docs/release-checklist.md`,re=`# Release checklist((This guide walks a maintainer through cutting a release of the example service, from freezing the branch to announcing the build.((## Before you start((Confirm the changelog lists every merged change and that the staging deploy has been green for a full day.((- Freeze the release branch(- Run the full test suite(- Ask a second maintainer to review the notes((## Cutting the build((Tag the commit with the next semantic version and push the tag; CI builds the artifacts and publishes them to the registry.((| Step | Owner | Time |(| --- | --- | --- |(| Tag | Release lead | 5 min |(| Publish | CI | 20 min |(| Announce | Release lead | 10 min |((## After the release((Watch the error dashboard for an hour and roll back if the error rate doubles.((Post a short summary in the team channel with a link to the changelog.((> Releases on a Friday need a second approver.`.split(`(`).join(`
`),ie=[f(3,`warning`,`MD013`,`Line length exceeds 80 characters`),f(3,`info`,`write-good`,`“cutting” is jargon; consider “publishing”`),f(15,`warning`,`MD013`,`Line length exceeds 80 characters`),f(20,`error`,`vale.Units`,`Spell out “min” as “minutes”`)],v={id:`dana`,name:`Dana Reyes`,kind:`user`},y={id:`sam`,name:`Sam Okafor`,kind:`user`},b={id:`priya`,name:`Priya Shah`,kind:`user`},x=[`Release checklist`,`Before you start`],S=[`Release checklist`,`Cutting the build`],C=[`Release checklist`,`After the release`],ae=[p(`c-day`,v,{path:x,prefix:`staging deploy has been`,quote:`green for a full day`,suffix:`.`},`Is a full day enough? The last release regressed after 30 hours.`),m(`c-day-r1`,`c-day`,y,`Let's make it 48 hours for major versions.`),p(`c-freeze`,y,{path:x,prefix:``,quote:`Freeze the release branch`,suffix:`Run the full`},`Who owns the freeze? Name the role.`),p(`c-review`,b,{path:x,prefix:`full test suite`,quote:`Ask a second maintainer`,suffix:`to review the`},`Should this be the on-call reviewer instead?`),p(`c-semver`,v,{path:S,prefix:`commit with the`,quote:`next semantic version`,suffix:`and push the`},`Link to the versioning policy here.`),p(`c-publish`,b,{path:S,prefix:`lead 5 min`,quote:`Publish`,suffix:`CI 20 min`},`Publishing took 45 minutes last time; 20 is optimistic.`),p(`c-announce`,y,{path:S,prefix:`20 min Announce`,quote:`Release lead`,suffix:`10 min`},`The announcement should come from the on-call lead, not the release lead.`),p(`c-error`,v,{path:C,prefix:`roll back if the`,quote:`error`,suffix:`rate doubles`},`Which error rate: 5xx only, or client errors too?`),p(`c-rollback`,b,{path:C,prefix:`for an hour and`,quote:`roll back if the error rate doubles`,suffix:`.`},`Doubles from what baseline?`,`resolved`),m(`c-rollback-r1`,`c-rollback`,v,`Added the 7-day median as the baseline.`)],w={id:`short`,label:`Short`,path:_,source:re,comments:ae,findings:ie},T=`docs/incident-runbook.md`,E=`Incident response runbook`,oe=[{heading:`Overview`,lines:[`This runbook covers how the on-call engineer detects, triages, mitigates and closes an incident in the example platform, and who to involve at each stage.`,`It assumes access to the paging tool, the metrics dashboards and the deploy pipeline; request access during onboarding rather than mid-incident.`]},{heading:`Severity levels`,lines:[`Pick the severity from customer impact, not from how alarming the alert looks.`,`- SEV1: the product is down for most customers`,`- SEV2: a core feature is degraded for many customers`,`- SEV3: a minor feature is broken or a single tenant is affected`,`When in doubt, start one level higher and downgrade once the impact is understood.`]},{heading:`Detection`,lines:[`Most incidents start from an alert in the paging tool; others arrive as a support ticket or a message from a customer success manager.`,`Every alert links to a dashboard and a short description of what it measures; an alert without a dashboard link should be fixed after the incident.`]},{heading:`Acknowledge the page`,lines:[`Acknowledge the page within five minutes so the escalation policy does not wake the secondary.`,`- Open the incident channel from the paging tool`,`- Post the alert link and your first read of the impact`,`- Set the severity, even if it is a guess`]},{heading:`Triage`,lines:[`Start with the four golden signals: latency, traffic, errors and saturation, for the service named in the alert and its direct dependencies.`,`Check the deploy log for changes in the last two hours; a recent deploy is the most common cause and the fastest to undo.`,`If no deploy lines up, compare the failing region with a healthy one before digging into a single host.`]},{heading:`Roles`,lines:[`| Role | Responsibility | Default |`,`| --- | --- | --- |`,`| Incident commander | Coordinates and decides | On-call engineer |`,`| Communications lead | Status page and updates | Support lead |`,`| Scribe | Timeline in the channel | Anyone free |`,`For a SEV1, hand the incident commander role to someone not debugging so decisions do not wait on a terminal.`]},{heading:`Mitigation`,lines:[`Prefer actions that are quick to apply and quick to reverse: roll back the deploy, disable the feature flag, or shift traffic to the healthy region.`,`Write down each action in the channel before you take it, with the time and the expected effect, so the scribe can build the timeline.`]},{heading:`Rolling back`,lines:[`Roll back with the deploy pipeline's revert button rather than a manual redeploy, which skips the pre-flight checks.`,`- Confirm the previous build is still in the registry`,`- Revert and watch the error rate for ten minutes`,`- Leave the faulty commit on the branch until the review`]},{heading:`Customer communication`,lines:[`Post the first status page update within fifteen minutes of declaring a SEV1 or SEV2, even if it only says that the team is investigating.`,`Update the status page every thirty minutes until resolution; silence reads as neglect.`]},{heading:`Escalation`,lines:[`Page the owning team's secondary if you have made no progress in thirty minutes, and the engineering manager for any SEV1.`,`> Never wait for permission to escalate; a page that turns out to be unneeded costs far less than a slow response.`]},{heading:`Resolution`,lines:[`Declare the incident resolved once the signals have been normal for thirty minutes and no mitigation is still being applied.`,`Close the status page incident with a one-line summary and a promise of a review.`]},{heading:`Post-incident review`,lines:[`Schedule the review within five working days while the details are fresh; invite everyone who joined the channel.`,`- Build the timeline from the channel and the deploy log`,`- Name contributing factors, not a single root cause`,`- File every follow-up as a tracked task with an owner`]},{heading:`Follow-up`,lines:[`Review open follow-ups in the weekly operations meeting; a follow-up with no owner after two weeks is escalated to the engineering manager.`,`Close the review document once every follow-up is done or explicitly declined.`]},{heading:`Contacts`,lines:[`| Team | Channel | Escalation |`,`| --- | --- | --- |`,`| Platform | #platform-oncall | Platform manager |`,`| Payments | #payments-oncall | Payments manager |`,`| Support | #support-leads | Head of support |`]}],D=te(),O=(e,t,n,r)=>({path:[E,e],prefix:t,quote:n,suffix:r}),se=[p(`r-impact`,v,O(`Severity levels`,`severity from`,`customer impact`,`, not from`),`Can we give examples of impact per product area?`),p(`r-higher`,y,O(`Severity levels`,`doubt, start`,`one level higher`,`and downgrade`),`Downgrading later is cheap; agreed.`),p(`r-dashboard`,b,O(`Detection`,`fixed after the`,`incident`,`.`),`Who tracks these? Suggest a label on the follow-up.`),p(`r-five`,v,O(`Acknowledge the page`,`page within`,`five minutes`,`so the`),`Five minutes is tight overnight; ten for SEV3?`),m(`r-five-r1`,`r-five`,y,`Keep five; the secondary page is the safety net.`),p(`r-channel`,y,O(`Acknowledge the page`,`Open the`,`incident channel`,`from the`),`Link the channel naming convention.`),p(`r-guess`,b,O(`Acknowledge the page`,`even if it is a`,`guess`,``),`Worth saying it can change without asking anyone.`),p(`r-signals`,v,O(`Triage`,`four`,`golden signals`,`: latency`),`Add a link to the dashboard that shows all four.`),p(`r-region`,y,O(`Triage`,`compare the`,`failing region`,`with a healthy`),`We only have two regions; is this always possible?`),p(`r-comms`,b,O(`Roles`,`updates`,`Support lead`,`Scribe`),`Support lead is often asleep; name a backup.`),p(`r-scribe`,v,O(`Roles`,`channel`,`Anyone free`,``),`In practice nobody volunteers. Assign it explicitly.`),p(`r-terminal`,y,O(`Roles`,`do not wait on a`,`terminal`,`.`),`Great point, keep this.`),p(`r-flag`,b,O(`Mitigation`,`deploy,`,`disable the feature flag`,`, or shift`),`Which flags are safe to flip without a review?`),p(`r-revert`,v,O(`Rolling back`,`deploy pipeline's`,`revert button`,`rather than`),`The revert button is hidden for non-admins.`),m(`r-revert-r1`,`r-revert`,b,`Filed access change for on-call.`),p(`r-registry`,y,O(`Rolling back`,`previous build is`,`still in the registry`,``),`Registry keeps 30 builds; mention the retention.`),p(`r-ten`,b,O(`Rolling back`,`error rate for`,`ten minutes`,``),`Ten minutes misses slow leaks; make it thirty?`),p(`r-fifteen`,v,O(`Customer communication`,`update within`,`fifteen minutes`,`of declaring`),`Legal asked for ten for SEV1.`),p(`r-silence`,y,O(`Customer communication`,`resolution;`,`silence reads as neglect`,`.`),`Love this line.`),p(`r-permission`,b,O(`Escalation`,`Never wait for`,`permission`,`to escalate`),`Should be bold, it is the most-missed rule.`),p(`r-normal`,v,O(`Resolution`,`have been`,`normal for thirty minutes`,`and no`),`Normal by which threshold?`,`resolved`),p(`r-days`,y,O(`Post-incident review`,`review within`,`five working days`,`while the`),`Three days for SEV1.`),p(`r-factors`,b,O(`Post-incident review`,`Name`,`contributing factors`,`, not a`),`Link the review template.`),p(`r-weekly`,v,O(`Follow-up`,`in the`,`weekly operations meeting`,`; a follow-up`),`This meeting was cancelled; use the ops review.`),p(`r-payments`,y,O(`Contacts`,`Payments`,`#payments-oncall`,`Payments manager`),`Channel was renamed to #payments-incidents.`)],ce=[h(`This runbook covers`,`warning`,`MD013`,`Line length exceeds 80 characters`),h(`golden signals`,`info`,`write-good`,`“golden signals” is jargon; link a definition`),h(`revert button`,`warning`,`MD013`,`Line length exceeds 80 characters`),h(`#payments-oncall`,`error`,`vale.Links`,`Channel name is out of date`)],k={id:`long`,label:`Long`,path:T,source:D,comments:se,findings:ce},A=`pkg/retry/retry.go`,j=`package retry

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
}`,le=[{file:A,line:18,severity:`warning`,rule:`wrapcheck`,message:`error returned from external package is unwrapped`,source:`golangci`,kind:`lint`},{file:A,line:21,severity:`info`,rule:`mnd`,message:`Magic number: 2`,source:`golangci`,kind:`lint`},{file:A,line:23,severity:`error`,rule:`errcheck`,message:`Wrap the last error with the attempt count`,source:`golangci`,kind:`lint`}],M=[g(`g-delay`,v,10,`100 * time.Millisecond`,`Should the first delay come from an option? Callers hitting rate limits want seconds.`),m(`g-delay-r1`,`g-delay`,y,`Agreed, take a Backoff struct with Initial and Max.`),g(`g-double`,b,21,`delay *= 2`,`No cap: ten attempts wait 51 seconds before the last one.`)],N={sha:`3f9c2a1b7d4e5f60718293a4b5c6d7e8f9012345`,author:`Dana Reyes`,date:`2025-03-14T10:12:00Z`,summary:`Add retry helper`},P={sha:`8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b`,author:`Sam Okafor`,date:`2025-11-02T16:40:00Z`,summary:`Stop retrying when the context is cancelled`},F={sha:`c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0`,author:`Priya Shah`,date:`2026-10-20T09:05:00Z`,summary:`Back off exponentially`},I=[{startLine:1,lineCount:3,commit:N},{startLine:4,lineCount:1,commit:P},{startLine:5,lineCount:4,commit:N},{startLine:9,lineCount:1,commit:P},{startLine:10,lineCount:1,commit:F},{startLine:11,lineCount:5,commit:N},{startLine:16,lineCount:5,commit:P},{startLine:21,lineCount:1,commit:F},{startLine:22,lineCount:3,commit:N}],L={id:`code`,label:`Go file`,path:A,source:j,comments:M,findings:le,blame:I}})))()}function de(){return new Worker(new URL(`/clicky-ui/storybook/pr-115/assets/editor.worker-BlfIGhym.js`,``+import.meta.url),{type:`module`})}function fe(e,t){let[n,r]=(0,R.useState)(e),i=(0,R.useRef)(0);return{items:n,callbacks:(0,R.useMemo)(()=>{let e=e=>r(t=>[...t,{...e,id:`local-${++i.current}`,createdAt:new Date().toISOString(),author:me}]);return{onCreate:async n=>{await t?.(n),e({body:n.body,anchor:n.anchor??null,status:`open`})},onReply:t=>e({body:t.body,anchor:t.anchor??null,parentId:t.parentId}),onUpdateStatus:(e,t)=>r(n=>n.map(n=>n.id===e?{...n,status:t}:n)),onDelete:e=>r(t=>t.filter(t=>t.id!==e&&t.parentId!==e))}},[t])}}function pe({fixture:e=w,withComments:t=!1,withFindings:n=!1,withBlame:r=!1,editable:a=!1,onCreate:o,...s}){let[c,l]=(0,R.useState)(s.view??`preview`),[d,f]=(0,R.useState)(s.layout??`margin`),[p,m]=(0,R.useState)(u),[te,ne]=(0,R.useState)(e.source),h=fe(e.comments,o),g=(0,z.jsx)(ee,{path:e.path,source:te,...s,view:c,onViewChange:l,layout:d,onLayoutChange:f,...t?{comments:h}:{},...n?{findings:e.findings,problemFilters:p,onProblemFiltersChange:m}:{},...r?{blame:e.blame}:{},...a?{onSourceChange:ne}:{}});return a?(0,z.jsx)(i,{getWorker:de,children:g}):g}var R,z,B,V,H,U,W,me,he,G,K,q,J,Y,X,Z,Q,$,ge;function _e(){return(_e=e((()=>{R=t(),r(),l(),ue(),o(),d(),z=n(),{expect:B,fn:V,userEvent:H,waitFor:U,within:W}=__STORYBOOK_MODULE_TEST__,me={id:`you`,name:`You`,kind:`user`},he={title:`Git/FileReview`,component:pe,parameters:{docs:{description:{component:"Google Docs-style review of one file. Markdown gets a rendered Preview; any other file a syntax-highlighted Source listing with threads under their lines. Each feature turns on with its prop: `findings` adds a severity rail, squiggles, read-only finding threads and a Problems tab; `comments` adds quote highlights with threads in a margin sidebar or inline under the text; `selectToComment` lets a reader select or right-click words to start a thread; `blame` adds a Blame toggle with who last changed each line; `onSourceChange` turns Source into a Monaco editor. Without them it is a plain rendered/source viewer."}}}},G={tags:[`browser`],args:{withComments:!0,withFindings:!0,selectToComment:!0,authorFilter:!0,onCreate:V()},play:async({canvasElement:e,args:t})=>{let n=W(e),r=await U(()=>{let t=[...e.querySelectorAll(`p`)].find(e=>e.textContent?.includes(`CI builds the artifacts`));if(!t)throw Error(`the build paragraph has not rendered yet`);return t}),i=[...r.childNodes].find(e=>e instanceof Text&&e.data.includes(`artifacts`)),a=i.data.indexOf(`artifacts`),o=document.createRange();o.setStart(i,a),o.setEnd(i,a+9);let c=window.getSelection();c.removeAllRanges(),c.addRange(o),r.dispatchEvent(new MouseEvent(`mouseup`,{bubbles:!0,button:0})),await H.click(await n.findByRole(`button`,{name:`Comment`})),await H.type(n.getByTestId(`comment-compose-input`),`Which registry?`),await H.click(n.getByTestId(`comment-compose-send`));let l=s({path:[`Release checklist`,`Cutting the build`],prefix:`builds the`,quote:`artifacts`,suffix:`and publishes`});await U(()=>B(t.onCreate).toHaveBeenCalledWith(B.objectContaining({anchor:l,body:`Which registry?`}))),await U(()=>B(e.querySelector(`[data-card-anchor='${CSS.escape(l)}']`)).not.toBeNull())}},K={tags:[`browser`],args:{withComments:!0,withFindings:!0,selectToComment:!0,layout:`inline`}},q={tags:[`browser`],args:{fixture:k,withComments:!0,withFindings:!0,selectToComment:!0,className:`h-[720px]`}},J={args:{withFindings:!0,view:`problems`},play:async({canvasElement:e})=>{let t=W(e);B(t.getAllByRole(`tab`).map(e=>e.textContent?.replace(/\d+$/,``))).toEqual([`Preview`,`Source`,`Problems`]),B(e.querySelectorAll(`[data-problem-line]`)).toHaveLength(w.findings.length)}},Y={args:{withFindings:!0,view:`problems`,getFindingActions:e=>[{label:`Copy rule ID`,onSelect:()=>{navigator.clipboard.writeText(e.rule??e.source)}}]},play:async({canvasElement:e})=>{await H.click(W(e).getAllByRole(`button`,{name:`Problem actions`})[0]),await B(W(document.body).getByRole(`menuitem`,{name:`Copy rule ID`})).toBeVisible()}},X={args:{withComments:!0,view:`source`}},Z={play:async({canvasElement:e})=>{let t=W(e);B(t.getAllByRole(`tab`).map(e=>e.textContent)).toEqual([`Preview`,`Source`]),B(t.queryByText(/open ·/)).toBeNull()}},Q={tags:[`browser`],args:{fixture:L,view:`source`,withComments:!0,withFindings:!0,withBlame:!0,selectToComment:!0,onCreate:V(),className:`h-[720px]`},play:async({canvasElement:e,args:t})=>{let n=W(e);B(n.getAllByRole(`tab`).map(e=>e.textContent?.replace(/\d+$/,``))).toEqual([`Source`,`Problems`]);let r=await U(()=>{let t=e.querySelector(`[data-source-text="12"]`);if(!t?.querySelector(`span[style*='color']`))throw Error(`line 12 is not highlighted yet`);return t},{timeout:5e3}),i=document.createTreeWalker(r,NodeFilter.SHOW_TEXT),o=null;for(;i.nextNode();)i.currentNode.data.includes(`attempts`)&&(o=i.currentNode);if(!o)throw Error(`line 12 has no text node holding "attempts"`);let s=o.data.indexOf(`attempts`),l=document.createRange();l.setStart(o,s),l.setEnd(o,s+8),window.getSelection().removeAllRanges(),window.getSelection().addRange(l),r.dispatchEvent(new MouseEvent(`mouseup`,{bubbles:!0,button:0})),await H.click(await n.findByRole(`button`,{name:`Comment`})),await H.type(n.getByTestId(`comment-compose-input`),`Off by one?`),await H.click(n.getByTestId(`comment-compose-send`));let u=j.split(`
`)[11].indexOf(`attempts`),d=a(c(j,{line:12,column:u},{line:12,column:u+8}));await U(()=>B(t.onCreate).toHaveBeenCalledWith(B.objectContaining({anchor:d,body:`Off by one?`}))),await U(()=>B(e.querySelector(`[data-source-thread='${CSS.escape(d)}']`)).not.toBeNull()),await H.click(n.getByRole(`button`,{name:`Blame`})),B(e.querySelectorAll(`[data-blame-sha]`)).toHaveLength(L.blame.length)}},$={tags:[`browser`],args:{withFindings:!0,editable:!0,view:`source`}},ge=[`AllFeatures`,`InlineThreads`,`LongDocument`,`LintOnly`,`ContextualProblemActions`,`CommentsOnly`,`ReadOnly`,`CodeFile`,`EditableSource`],G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
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
    await userEvent.click(canvas.getByTestId("comment-compose-send"));
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
}`,...G.parameters?.docs?.source}}},K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:`{
  tags: ["browser"],
  args: {
    withComments: true,
    withFindings: true,
    selectToComment: true,
    layout: "inline"
  }
}`,...K.parameters?.docs?.source}}},q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
  tags: ["browser"],
  args: {
    fixture: LONG_DOC,
    withComments: true,
    withFindings: true,
    selectToComment: true,
    className: "h-[720px]"
  }
}`,...q.parameters?.docs?.source}}},J.parameters={...J.parameters,docs:{...J.parameters?.docs,source:{originalSource:`{
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
}`,...J.parameters?.docs?.source}}},Y.parameters={...Y.parameters,docs:{...Y.parameters?.docs,source:{originalSource:`{
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
}`,...Y.parameters?.docs?.source},description:{story:`Host actions are typed menu items shared by Problems, Source and Preview.`,...Y.parameters?.docs?.description}}},X.parameters={...X.parameters,docs:{...X.parameters?.docs,source:{originalSource:`{
  args: {
    withComments: true,
    view: "source"
  }
}`,...X.parameters?.docs?.source}}},Z.parameters={...Z.parameters,docs:{...Z.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    expect(canvas.getAllByRole("tab").map(tab => tab.textContent)).toEqual(["Preview", "Source"]);
    expect(canvas.queryByText(/open ·/)).toBeNull();
  }
}`,...Z.parameters?.docs?.source}}},Q.parameters={...Q.parameters,docs:{...Q.parameters?.docs,source:{originalSource:`{
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
    await userEvent.click(canvas.getByTestId("comment-compose-send"));
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
}`,...Q.parameters?.docs?.source}}},$.parameters={...$.parameters,docs:{...$.parameters?.docs,source:{originalSource:`{
  tags: ["browser"],
  args: {
    withFindings: true,
    editable: true,
    view: "source"
  }
}`,...$.parameters?.docs?.source}}}})))()}_e();export{G as AllFeatures,Q as CodeFile,X as CommentsOnly,Y as ContextualProblemActions,$ as EditableSource,K as InlineThreads,J as LintOnly,q as LongDocument,Z as ReadOnly,ge as __namedExportsOrder,he as default};