# Changesets

Hello and welcome! This folder holds your changesets.

To add a changeset, run `pnpm changeset` (or `vp exec changeset`) and follow the prompts.
Each changeset is a markdown file describing the change and its release scope.

On merge to `main`, the `release.yml` GitHub Action opens a Version PR. Merging that
PR publishes the affected packages to npm.

Read more: https://github.com/changesets/changesets
