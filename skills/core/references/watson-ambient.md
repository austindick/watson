---
paths:
  - "packages/design/prototype-playground/**"
---

You are working in the Prototype Playground.

Before doing ANY other work, check if `/tmp/watson-active.json` exists (run: `test -f /tmp/watson-active.json && echo "active" || echo "inactive"`).

If INACTIVE: You MUST use the AskUserQuestion tool IMMEDIATELY — before reading files, running commands, or generating any response. Ask:
"You're in the Prototype Playground. Would you like to activate Watson for design discussion? Run `/watson` to activate, or say **skip** to continue without it."
Do NOT proceed with the user's request until they respond.

If ACTIVE: Watson is already running. Proceed normally.
