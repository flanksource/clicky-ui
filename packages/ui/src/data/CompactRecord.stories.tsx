import type { Meta, StoryObj } from "@storybook/react-vite";
import { AzureDevops, AzureDevopsPipeline, Deployment } from "@flanksource/icons/mi";
import { CompactRecord, CompactRecordList } from "./CompactRecord";

const meta: Meta = {
  title: "Data/CompactRecord",
  parameters: { layout: "padded" },
};

export default meta;

type Story = StoryObj;

// A promotion's pull request, the pipelines that gate it, and where it deployed.
export const BuildsPullRequestsDeployments: Story = {
  render: () => (
    <div className="max-w-3xl space-y-4">
      <CompactRecordList title="Pull request">
        <CompactRecord
          icon={<AzureDevops />}
          title="#26019 Promote 9 commit(s) from dev-base to dev-tenant-x"
          href="https://dev.azure.com/acme/rules/_git/rules-tenant-x/pullrequest/26019"
          status={{ label: "open", tone: "info" }}
          meta={["oipa-cli/promote-dev-base-dev-tenant-x → main", "acme/rules-tenant-x", "by serve"]}
          trailing={<code>e04d68d</code>}
        />
      </CompactRecordList>
      <CompactRecordList title="Builds">
        <CompactRecord
          icon={<AzureDevopsPipeline />}
          title="Rules validation"
          href="https://dev.azure.com/acme/rules/_build/results?buildId=411&view=results"
          status={{ label: "approved", tone: "success" }}
          meta={["required", "build 411"]}
        />
        <CompactRecord
          icon={<AzureDevopsPipeline />}
          title="Fixture smoke tests"
          status={{ label: "running", tone: "warning" }}
          meta={["optional", "build 412"]}
        />
      </CompactRecordList>
      <CompactRecordList title="Deployments">
        <CompactRecord
          icon={<Deployment />}
          title="dev-tenant-x"
          href="/environment-deployment/29840eec"
          status={{ label: "passed", tone: "success" }}
          meta={["deploy", "12 of 12 tests passed", "2 hours ago"]}
        />
      </CompactRecordList>
      <CompactRecordList title="Reviewers" emptyLabel="No reviewer is assigned." />
    </div>
  ),
};
