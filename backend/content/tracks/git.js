module.exports = {
  slug: 'git',
  title: 'Git & Version Control',
  subtitle: 'Branching, merging, workflows',
  description: 'Git interview questions: core concepts, merge vs rebase, resolving conflicts, undoing changes, branching strategies and team workflows.',
  category: 'devops',
  roles: ['frontend', 'backend', 'fullstack', 'software-engineer', 'mobile', 'devops'],
  icon: 'merge',
  color: '#F05032',
  order: 50,
  topics: [
    {
      slug: 'core',
      title: 'Core Concepts & Commands',
      questions: [
        {
          t: 'qa', l: 1,
          q: 'Explain the working directory, staging area and repository in Git.',
          e: `
- **Working directory:** your actual files on disk.
- **Staging area (index):** a snapshot of changes you've selected for the next commit (\`git add\`).
- **Local repository:** committed history in \`.git\` (\`git commit\`).
- **Remote repository:** shared copy (GitHub/GitLab) synced with \`git push\` / \`git fetch\` / \`git pull\`.

~~~
edit -> git add -> git commit -> git push
~~~`,
        },
        {
          t: 'mcq', l: 1,
          q: 'What is the difference between git fetch and git pull?',
          o: ['No difference', 'fetch downloads remote changes without merging; pull = fetch + merge (or rebase) into the current branch', 'pull only downloads', 'fetch deletes local branches'],
          a: 1,
          e: 'fetch is safe to run anytime; it updates remote-tracking branches like origin/main.',
        },
        {
          t: 'mcq', l: 1,
          q: 'Which command shows a compact history with branches as a graph?',
          o: ['git status', 'git log --oneline --graph --all', 'git diff', 'git show-branch only'],
          a: 1,
          e: 'git log --oneline --graph --decorate --all visualizes branches and merges.',
        },
        {
          t: 'mcq', l: 2,
          q: 'What does git stash do?',
          o: ['Deletes changes permanently', 'Temporarily shelves uncommitted changes so you can switch context, and re-apply them later with git stash pop', 'Pushes to a hidden remote', 'Creates a new branch'],
          a: 1,
          e: 'git stash list, git stash apply stash@{1}, git stash -u (include untracked files).',
        },
        {
          t: 'mcq', l: 2,
          q: 'What is a detached HEAD?',
          o: ['A corrupted repository', 'HEAD points directly to a commit instead of a branch; new commits are not on any branch unless you create one', 'A deleted remote', 'A merge conflict'],
          a: 1,
          e: 'Happens when checking out a tag or commit hash. Use git switch -c new-branch to keep work.',
        },
      ],
    },
    {
      slug: 'merge-rebase',
      title: 'Merge, Rebase & Conflicts',
      questions: [
        {
          t: 'qa', l: 2,
          q: 'Merge vs rebase: what is the difference and when do you use each?',
          e: `
**Merge** – combines branches with a **merge commit**; preserves the exact history.
- ✅ Non-destructive, safe for shared branches. ❌ History can get noisy.

**Rebase** – replays your commits **on top of** another branch, rewriting their hashes; creates a **linear** history.
- ✅ Clean, linear history; easier bisect/review. ❌ Rewrites history.

**Golden rule:** never rebase commits that others have already pulled (public/shared branches).

Typical flow: \`git pull --rebase\` to update your feature branch locally; merge (or squash-merge) PRs into main.`,
        },
        {
          t: 'mcq', l: 2,
          q: 'Why should you avoid rebasing a branch that teammates are already working on?',
          o: ['Rebase is slower', 'Rebase rewrites commit hashes, so others\' history diverges and they get duplicated commits/conflicts', 'Rebase deletes the branch', 'It is not allowed by Git'],
          a: 1,
          e: 'If you must, coordinate and use git push --force-with-lease (safer than --force).',
        },
        {
          t: 'qa', l: 2,
          q: 'How do you resolve a merge conflict?',
          e: `
1. Git stops and marks conflicted files (\`git status\`).
2. Open each file and resolve the markers:
~~~
<<<<<<< HEAD
your change
=======
incoming change
>>>>>>> feature-branch
~~~
3. Keep the correct code (one side, both, or a combination), remove markers.
4. Run tests, then \`git add <file>\`.
5. Complete with \`git commit\` (merge) or \`git rebase --continue\` (rebase). Abort with \`git merge --abort\` / \`git rebase --abort\`.

Reduce conflicts with small PRs, frequent syncing with main, and clear code ownership.`,
        },
        {
          t: 'mcq', l: 2,
          q: 'What does git cherry-pick <hash> do?',
          o: ['Deletes a commit', 'Applies the changes of a specific commit onto the current branch as a new commit', 'Renames a branch', 'Merges all commits from a branch'],
          a: 1,
          e: 'Useful for porting a hotfix to a release branch.',
        },
        {
          t: 'mcq', l: 3,
          q: 'What does interactive rebase (git rebase -i) allow?',
          o: ['Only changing the remote', 'Reordering, squashing, editing, rewording or dropping commits before sharing them', 'Resolving conflicts automatically', 'Cloning repositories'],
          a: 1,
          e: 'Clean up local history into meaningful commits before opening a PR.',
        },
      ],
    },
    {
      slug: 'undo-workflows',
      title: 'Undoing Changes & Workflows',
      questions: [
        {
          t: 'qa', l: 2,
          q: 'git reset vs git revert vs git restore?',
          e: `
- **git restore <file>:** discard working-directory changes (or \`--staged\` to unstage).
- **git reset:** moves the branch pointer back (rewrites history – local only):
  - \`--soft\`: keep changes staged
  - \`--mixed\` (default): keep changes unstaged
  - \`--hard\`: discard changes completely ⚠️
- **git revert <hash>:** creates a **new commit** that undoes a previous commit – **safe for shared branches**.

Lost something? \`git reflog\` shows where HEAD has been, so you can recover "deleted" commits.`,
        },
        {
          t: 'mcq', l: 2,
          q: 'A bad commit was already pushed to main and pulled by others. How do you undo it safely?',
          o: ['git reset --hard and force push', 'git revert <commit> and push', 'Delete the repository', 'git commit --amend'],
          a: 1,
          e: 'revert adds an inverse commit without rewriting shared history.',
        },
        {
          t: 'mcq', l: 2,
          q: 'Which command helps find the commit that introduced a bug using binary search?',
          o: ['git blame', 'git bisect', 'git log', 'git grep'],
          a: 1,
          e: 'git bisect start; mark good and bad commits; Git checks out midpoints until it finds the culprit. Can be automated with git bisect run <test script>.',
        },
        {
          t: 'qa', l: 2,
          q: 'Compare Git Flow, GitHub Flow and trunk-based development.',
          e: `
**Git Flow:** \`main\`, \`develop\`, \`feature/*\`, \`release/*\`, \`hotfix/*\` branches. Good for scheduled releases/versioned software; heavy for continuous delivery.

**GitHub Flow:** short-lived feature branches off \`main\`, PR + review + CI, merge and deploy. Simple; good for web apps.

**Trunk-based development:** everyone integrates into \`main\` at least daily with very short-lived branches; incomplete features hidden behind **feature flags**. Enables true CI/CD; used by Google and many high-performing teams.`,
        },
        {
          t: 'mcq', l: 1,
          q: 'What is the purpose of a .gitignore file?',
          o: ['To delete files', 'To tell Git which untracked files/folders should not be tracked (node_modules, .env, build output)', 'To ignore merge conflicts', 'To hide commits'],
          a: 1,
          e: 'Already tracked files must be removed from the index with git rm --cached to be ignored.',
        },
        {
          t: 'scenario', l: 2,
          q: 'Scenario: You accidentally committed a .env file with secrets and pushed it. What do you do?',
          e: `
1. **Rotate the secrets immediately** (DB passwords, API keys) – assume they are compromised; removing them from history is not enough.
2. Remove the file from tracking: \`git rm --cached .env\`, add it to \`.gitignore\`, commit.
3. Purge it from history if needed with \`git filter-repo\` (or BFG), then force-push and ask collaborators to re-clone.
4. Enable **secret scanning** (GitHub push protection, gitleaks pre-commit hooks) to prevent recurrence.`,
        },
      ],
    },
  ],
};
