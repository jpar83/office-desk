# Start Office Desk in Codex

## 1. Put this folder where Codex can access it

Extract this package into a normal local development location, for example:

```text
C:\Users\<your-user>\Documents\GitHub\office-desk
```

Open that exact folder as the Codex project or primary folder. Do not leave the files only inside the ZIP or in a ChatGPT sandbox link.

## 2. Optional preflight check in PowerShell

From the extracted folder, run:

```powershell
Get-ChildItem
Get-Content .\AGENTS.md -TotalCount 10
git --version
node --version
npm --version
gh auth status
```

If GitHub CLI is not authenticated, run:

```powershell
gh auth login
```

## 3. Send this exact request to Codex

```text
Execute the complete Office Desk project described in ./AGENTS.md. Treat AGENTS.md as the controlling product, engineering, design, QA, security, and release specification.

Start from the current folder and carry the work through implementation, testing, review, correction, Git initialization, GitHub repository creation or connection, push, GitHub Pages deployment, live-site verification, PWA verification, and generation of the portable OfficeDesk.html release file.

Do not stop after analysis, planning, scaffolding, mockups, or a partial prototype. Make reasonable decisions without asking me questions unless a genuine credential, permission, or external-service blocker prevents further execution.

Complete all ten required review-and-improvement passes in AGENTS.md. For every pass, inspect the actual running application and tests, record findings, fix the findings, and rerun the relevant checks before moving to the next pass. Ten passes means ten distinct quality reviews, not ten superficial summaries.

Before reporting completion, verify all acceptance criteria in AGENTS.md, confirm the public GitHub Pages URL works in a clean browser session, confirm the app works at the repository subpath, confirm offline/PWA behavior, confirm local data persistence, and confirm OfficeDesk.html works without a server.

Your final response must include:
1. Repository URL and visibility.
2. Live GitHub Pages URL.
3. Latest commit hash and release tag.
4. Commands run and test results.
5. Build and bundle results.
6. The output path for OfficeDesk.html.
7. A concise summary of each of the ten review passes, findings, corrections, and retest results.
8. Remaining limitations or blockers stated plainly.
9. Confirmation that the working tree is clean and the deployed site matches the final commit.

Begin execution now.
```

## 4. If Codex still says it cannot see AGENTS.md

In Codex CLI or another surface that supports it, attach the file explicitly:

```text
/mention AGENTS.md
```

Then resend the request above.

Also verify that Codex is opened in the extracted folder—not its parent Downloads folder and not another empty workspace.
