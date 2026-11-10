# Provenance

- Source: https://github.com/Yeachan-Heo/oh-my-claudecode
- Path: `skills/deep-interview/SKILL.md`
- Commit: `ae4f4adfb84eff5d209d8c56ed6a3316f98c6458`
- License: MIT (copy in `LICENSE`)

## Local modifications

The upstream file is unchanged except for one inserted `<Standalone_Adapter>` block
directly after the YAML frontmatter. It maps OMC-only dependencies (`state_write`,
`oh-my-claudecode:explore`, OMC execution skills, quality gates) to built-in Claude Code
equivalents, and replaces the execution bridge with a PRD approval step.

To update: re-fetch the upstream file at a newer commit, re-insert the adapter block
after the frontmatter, and update the commit hash above.

## Outputs written to this project at runtime

- `.omc/specs/deep-interview-<slug>.md` — final spec / PRD
- `.omc/state/deep-interview-state.json` — interview state for resume
