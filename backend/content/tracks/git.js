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
          o: ['There is no difference; both download and merge remote changes', 'fetch downloads remote changes without merging; pull = fetch + merge (or rebase)', 'fetch deletes local branches that no longer exist on the remote', 'pull only downloads changes; fetch downloads them and merges them into your current branch'],
          a: 1,
          e: 'fetch is safe to run anytime; it updates remote-tracking branches like origin/main.',
        },
        {
          t: 'mcq', l: 1,
          q: 'Which command shows a compact history with branches as a graph?',
          o: ['git diff --stat --cached', 'git log --oneline --graph --all', 'git status --short --branch --all', 'git show-branch --current'],
          a: 1,
          e: 'git log --oneline --graph --decorate --all visualizes branches and merges.',
        },
        {
          t: 'mcq', l: 2,
          q: 'What does git stash do?',
          o: ['Temporarily shelves uncommitted changes so you can re-apply them later with git stash pop', 'Deletes all uncommitted changes permanently so the working tree is clean', 'Pushes your uncommitted changes to a hidden remote branch for backup', 'Creates a new branch from your uncommitted changes, commits them there and switches to it'],
          a: 0,
          e: 'git stash list, git stash apply stash@{1}, git stash -u (include untracked files).',
        },
        {
          t: 'mcq', l: 2,
          q: 'What is a detached HEAD?',
          o: ['The remote branch HEAD was tracking has been deleted from the server', 'HEAD is stuck in the middle of a merge conflict that has not been resolved or aborted yet', 'HEAD points directly to a commit instead of a branch; new commits belong to no branch', 'The repository is corrupted and HEAD no longer points to any commit'],
          a: 2,
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
- **Pro:** Non-destructive, safe for shared branches. **Con:** History can get noisy.

**Rebase** – replays your commits **on top of** another branch, rewriting their hashes; creates a **linear** history.
- **Pro:** Clean, linear history; easier bisect/review. **Con:** Rewrites history.

**Golden rule:** never rebase commits that others have already pulled (public/shared branches).

Typical flow: \`git pull --rebase\` to update your feature branch locally; merge (or squash-merge) PRs into main.`,
        },
        {
          t: 'mcq', l: 2,
          q: 'Why should you avoid rebasing a branch that teammates are already working on?',
          o: ['Git does not allow rebasing a branch that has already been pushed', 'Rebase rewrites commit hashes, so others\' history diverges and causes duplicates', 'Rebase is much slower than merge on branches with many commits', 'Rebase deletes the original branch on the remote, so teammates lose their local copies of it'],
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
          o: ['Merges every commit from the given commit\'s branch into the current one, up to and including it', 'Deletes a specific commit from the history of the current branch', 'Renames the branch that contains the given commit to a new name', 'Applies the changes of a specific commit onto the current branch as a new commit'],
          a: 3,
          e: 'Useful for porting a hotfix to a release branch.',
        },
        {
          t: 'mcq', l: 3,
          q: 'What does interactive rebase (git rebase -i) allow?',
          o: ['Reordering, squashing, editing, rewording or dropping commits', 'Cloning a repository and selecting which commits to download', 'Resolving all merge conflicts automatically during the rebase', 'Only changing the remote URL that the branch pushes to'],
          a: 0,
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
  - \`--hard\`: discard changes completely (dangerous)
- **git revert <hash>:** creates a **new commit** that undoes a previous commit – **safe for shared branches**.

Lost something? \`git reflog\` shows where HEAD has been, so you can recover "deleted" commits.`,
        },
        {
          t: 'mcq', l: 2,
          q: 'A bad commit was already pushed to main and pulled by others. How do you undo it safely?',
          o: ['git revert <commit> and push', 'Delete the repository', 'git reset --hard and force push', 'git commit --amend'],
          a: 0,
          e: 'revert adds an inverse commit without rewriting shared history.',
        },
        {
          t: 'mcq', l: 2,
          q: 'Which command helps find the commit that introduced a bug using binary search?',
          o: ['git grep', 'git log', 'git blame', 'git bisect'],
          a: 3,
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
          o: ['To delete the listed files from the repository and the working tree', 'To hide the listed commits from git log and other history commands', 'To tell Git which untracked files should not be tracked (node_modules, .env)', 'To make Git ignore merge conflicts in the listed files and always keep your local version'],
          a: 2,
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
