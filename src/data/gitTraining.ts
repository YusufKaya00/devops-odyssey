import type { ModuleQuizQuestion, Quest } from './roadmapData';

export const gitDeepDiveQuests: Quest[] = [
  {
    id: "git_init",
    title: "Git 01 - Repository Anatomy and First Snapshot",
    difficulty: "Beginner",
    objective: "Initialize a repository, inspect the working tree, stage a file, commit it, and understand what Git stores.",
    stepsWindows: [
      "Run 'git init' inside devops-sandbox.",
      "Inspect the working tree with 'git status'.",
      "Stage README.md with 'git add README.md'.",
      "Create the first commit with 'git commit -m \"First commit\"'.",
      "Review history with 'git log --oneline --decorate'."
    ],
    stepsLinux: [
      "Run 'git init' inside devops-sandbox.",
      "Inspect the working tree with 'git status'.",
      "Stage README.md with 'git add README.md'.",
      "Create the first commit with 'git commit -m \"First commit\"'.",
      "Review history with 'git log --oneline --decorate'."
    ],
    verificationCommand: "Checks if devops-sandbox/.git exists and has at least one commit.",
    validatorKey: "git_init",
    hint: "Think in three places: working tree, staging area, and repository history.",
    interactiveSteps: [
      {
        title: "Create the .git Database",
        explanation: "A Git repository is a normal project folder plus a hidden .git directory. That directory stores objects, refs, config, hooks, and the index. DevOps teams rely on this because application code, Terraform, Kubernetes manifests, and pipeline YAML all need versioned history.",
        expectedCommand: "git init",
        hint: "Initialize version tracking in the current sandbox directory.",
        mockOutput: "Initialized empty Git repository in /workspace/devops-sandbox/.git/"
      },
      {
        title: "Read the Working Tree State",
        explanation: "git status is your safety dashboard. It tells you which branch HEAD points to, which files are untracked, which changes are staged, and whether the next commit is ready.",
        expectedCommand: "git status",
        hint: "Ask Git what it sees before changing anything.",
        mockOutput: "On branch main\n\nNo commits yet\n\nUntracked files:\n  README.md\n\nnothing added to commit but untracked files present"
      },
      {
        title: "Stage the README Snapshot",
        explanation: "git add copies the current content of a file into the index. The index is not just a list of names; it is the exact snapshot that the next commit will record.",
        expectedCommand: "git add README.md",
        hint: "Stage only README.md so the next commit is deliberate.",
        mockOutput: "Staged README.md in the index."
      },
      {
        title: "Create the Root Commit",
        explanation: "A commit is an immutable snapshot plus metadata: author, message, timestamp, and parent commit references. The first commit has no parent, so Git calls it a root commit.",
        expectedCommand: "git commit -m \"First commit\"",
        hint: "Commit the staged snapshot with a short message.",
        mockOutput: "[main (root-commit) aed1d1a] First commit\n 1 file changed, 2 insertions(+)\n create mode 100644 README.md"
      },
      {
        title: "Read Compact History",
        explanation: "git log is how you audit history. DevOps work often requires finding when a pipeline, deployment manifest, or infrastructure variable changed.",
        expectedCommand: "git log --oneline --decorate",
        hint: "Use a compact log with branch labels.",
        mockOutput: "aed1d1a (HEAD -> main) First commit"
      }
    ]
  },
  {
    id: "git_status_diff",
    title: "Git 02 - Status, Diff, and Selective Staging",
    difficulty: "Beginner",
    objective: "Practice reading unstaged vs staged changes and preparing a clean commit.",
    stepsWindows: [
      "Create app.conf with 'echo \"PORT=8080\" > app.conf'.",
      "Use 'git diff' before staging.",
      "Stage app.conf.",
      "Use 'git diff --staged'.",
      "Commit the config change."
    ],
    stepsLinux: [
      "Create app.conf with 'echo \"PORT=8080\" > app.conf'.",
      "Use 'git diff' before staging.",
      "Stage app.conf.",
      "Use 'git diff --staged'.",
      "Commit the config change."
    ],
    verificationCommand: "Browser simulation validates each step; local validator is not required for this extended lab.",
    validatorKey: "git_status_diff",
    hint: "Unstaged diff answers 'what changed in files'; staged diff answers 'what will be committed'.",
    interactiveSteps: [
      {
        title: "Create a Config File",
        explanation: "Configuration files are a daily DevOps artifact. Before committing them, you should inspect exactly what changed so secrets, local ports, or machine-only values do not slip into history.",
        expectedCommand: "echo \"PORT=8080\" > app.conf",
        hint: "Write a simple key/value config file.",
        mockOutput: "Wrote app.conf with PORT=8080."
      },
      {
        title: "Inspect Unstaged Changes",
        explanation: "git diff compares the working tree to the index. Because app.conf is not staged yet, this diff represents work that exists only in your folder.",
        expectedCommand: "git diff",
        hint: "Check the unstaged file contents.",
        mockOutput: "diff --git a/app.conf b/app.conf\nnew file mode 100644\n+PORT=8080"
      },
      {
        title: "Stage the Config File",
        explanation: "Staging is the point where you decide what belongs in the next commit. Good commits are small, reviewable, and focused on one idea.",
        expectedCommand: "git add app.conf",
        hint: "Move app.conf into the index.",
        mockOutput: "Staged app.conf."
      },
      {
        title: "Inspect the Staged Snapshot",
        explanation: "git diff --staged compares the index to the last commit. This is your final review before committing.",
        expectedCommand: "git diff --staged",
        acceptedCommands: ["git diff --cached"],
        hint: "Use the staged diff form.",
        mockOutput: "diff --git a/app.conf b/app.conf\nnew file mode 100644\n+PORT=8080"
      },
      {
        title: "Commit a Focused Change",
        explanation: "The message should explain why the change exists. In real teams this supports reviews, incident timelines, and rollback decisions.",
        expectedCommand: "git commit -m \"Add app config\"",
        hint: "Commit only the staged config file.",
        mockOutput: "[main b7c44d2] Add app config\n 1 file changed, 1 insertion(+)\n create mode 100644 app.conf"
      }
    ]
  },
  {
    id: "git_ignore",
    title: "Git 03 - Ignore Rules and Secret Hygiene",
    difficulty: "Beginner",
    objective: "Create ignore rules so generated files and local secrets are not committed.",
    stepsWindows: [
      "Create .env with a fake secret.",
      "Create .gitignore that ignores .env and logs.",
      "Check ignored files with 'git status --ignored'.",
      "Stage .gitignore.",
      "Commit the ignore policy."
    ],
    stepsLinux: [
      "Create .env with a fake secret.",
      "Create .gitignore that ignores .env and logs.",
      "Check ignored files with 'git status --ignored'.",
      "Stage .gitignore.",
      "Commit the ignore policy."
    ],
    verificationCommand: "Browser simulation validates each step; local validator is not required for this extended lab.",
    validatorKey: "git_ignore",
    hint: "Never commit real secrets. Ignoring a file does not remove it if it is already tracked.",
    interactiveSteps: [
      {
        title: "Create a Local Secret File",
        explanation: "DevOps repos often have .env files for local development. The file can be useful locally, but it must not be committed because history is durable and frequently replicated.",
        expectedCommand: "echo \"API_TOKEN=local-only\" > .env",
        hint: "Create a fake local-only environment file.",
        mockOutput: "Wrote .env."
      },
      {
        title: "Write an Ignore Policy",
        explanation: ".gitignore tells Git which untracked paths to hide from normal status and add operations. Common entries include .env, logs, dependency folders, build output, and editor files.",
        expectedCommand: "echo \".env\n*.log\ndist/\" > .gitignore",
        hint: "Ignore .env, log files, and dist output.",
        mockOutput: "Wrote .gitignore with 3 rules."
      },
      {
        title: "Audit Ignored Paths",
        explanation: "git status --ignored is useful when a file seems invisible. It confirms whether an ignore rule is working and helps debug broad patterns.",
        expectedCommand: "git status --ignored",
        hint: "List both normal and ignored paths.",
        mockOutput: "Ignored files:\n  .env\n\nUntracked files:\n  .gitignore"
      },
      {
        title: "Stage the Policy, Not the Secret",
        explanation: "The correct commit includes .gitignore but not .env. That distinction is exactly why staging is a separate step.",
        expectedCommand: "git add .gitignore",
        hint: "Only stage the ignore policy.",
        mockOutput: "Staged .gitignore."
      },
      {
        title: "Commit Repository Hygiene",
        explanation: "Security basics belong early in the Git course because secret leaks are one of the most expensive version-control mistakes.",
        expectedCommand: "git commit -m \"Add ignore rules\"",
        hint: "Commit .gitignore.",
        mockOutput: "[main c18f0a9] Add ignore rules\n 1 file changed, 3 insertions(+)\n create mode 100644 .gitignore"
      }
    ]
  },
  {
    id: "git_branch",
    title: "Git 04 - Branching, Fast-Forward Merge, and Graphs",
    difficulty: "Intermediate",
    objective: "Create a feature branch, commit work there, merge it, and read the branch graph.",
    stepsWindows: [
      "Create feature-devops with 'git checkout -b feature-devops'.",
      "Create quest.txt.",
      "Stage and commit quest.txt.",
      "Switch to main.",
      "Merge feature-devops.",
      "View the graph."
    ],
    stepsLinux: [
      "Create feature-devops with 'git checkout -b feature-devops'.",
      "Create quest.txt.",
      "Stage and commit quest.txt.",
      "Switch to main.",
      "Merge feature-devops.",
      "View the graph."
    ],
    verificationCommand: "Checks if branch feature-devops exists in devops-sandbox.",
    validatorKey: "git_branch",
    hint: "A branch is a movable name pointing at a commit.",
    interactiveSteps: [
      {
        title: "Create and Switch to a Feature Branch",
        explanation: "Branching lets you isolate work. In Git, a branch is lightweight because it is just a reference that moves as new commits are created.",
        expectedCommand: "git checkout -b feature-devops",
        acceptedCommands: ["git switch -c feature-devops"],
        hint: "Create feature-devops and move HEAD there.",
        mockOutput: "Switched to a new branch 'feature-devops'"
      },
      {
        title: "Add Feature Work",
        explanation: "Files created on a branch are still normal working-tree files. They become part of the branch history only after staging and committing.",
        expectedCommand: "echo \"DevOps Quest Complete!\" > quest.txt",
        hint: "Create quest.txt on the feature branch.",
        mockOutput: "Wrote quest.txt."
      },
      {
        title: "Stage the Branch File",
        explanation: "Staging records the exact version of quest.txt that will become part of the next feature commit.",
        expectedCommand: "git add quest.txt",
        hint: "Stage quest.txt.",
        mockOutput: "Staged quest.txt."
      },
      {
        title: "Commit on the Branch",
        explanation: "The branch pointer moves forward to the new commit. main still points to the earlier commit until you merge.",
        expectedCommand: "git commit -m \"Add quest file\"",
        hint: "Commit the feature work.",
        mockOutput: "[feature-devops 4ab3e1c] Add quest file\n 1 file changed, 1 insertion(+)\n create mode 100644 quest.txt"
      },
      {
        title: "Return to Main",
        explanation: "Switching branches changes HEAD and updates the working tree to match the target branch when possible.",
        expectedCommand: "git checkout main",
        acceptedCommands: ["git switch main"],
        hint: "Move back to main before merging.",
        mockOutput: "Switched to branch 'main'"
      },
      {
        title: "Fast-Forward Merge",
        explanation: "If main has no new commits since the feature branch split, Git can fast-forward: it simply moves the main pointer to the feature commit.",
        expectedCommand: "git merge feature-devops",
        hint: "Merge the feature branch into main.",
        mockOutput: "Updating aed1d1a..4ab3e1c\nFast-forward\n quest.txt | 1 +\n 1 file changed, 1 insertion(+)"
      },
      {
        title: "Read the History Graph",
        explanation: "The graph view is essential in reviews and incident analysis. It shows branch structure, merge points, tags, and where HEAD is.",
        expectedCommand: "git log --oneline --graph --decorate --all",
        hint: "Show all branches as a compact graph.",
        mockOutput: "* 4ab3e1c (HEAD -> main, feature-devops) Add quest file\n* aed1d1a First commit"
      }
    ]
  },
  {
    id: "git_conflict",
    title: "Git 05 - Merge Conflict Resolution",
    difficulty: "Intermediate",
    objective: "Simulate a conflicting deployment config change and resolve it cleanly.",
    stepsWindows: [
      "Create blue-deploy branch.",
      "Change app.conf on blue-deploy.",
      "Commit blue deployment.",
      "Switch to main and create a conflicting green config.",
      "Merge blue-deploy.",
      "Resolve app.conf and commit."
    ],
    stepsLinux: [
      "Create blue-deploy branch.",
      "Change app.conf on blue-deploy.",
      "Commit blue deployment.",
      "Switch to main and create a conflicting green config.",
      "Merge blue-deploy.",
      "Resolve app.conf and commit."
    ],
    verificationCommand: "Browser simulation validates conflict resolution.",
    validatorKey: "git_conflict",
    hint: "Conflict markers show current branch, separator, and incoming branch.",
    interactiveSteps: [
      {
        title: "Create a Deployment Branch",
        explanation: "Conflicts happen when two branches edit the same lines differently. Deployment configs are a realistic place to practice this safely.",
        expectedCommand: "git checkout -b blue-deploy",
        acceptedCommands: ["git switch -c blue-deploy"],
        hint: "Create blue-deploy.",
        mockOutput: "Switched to a new branch 'blue-deploy'"
      },
      {
        title: "Write Blue Deployment Config",
        explanation: "This branch changes app.conf to point at a blue deployment port. Later main will make a competing edit.",
        expectedCommand: "echo \"PORT=8081\" > app.conf",
        hint: "Set the port to 8081.",
        mockOutput: "Updated app.conf on blue-deploy."
      },
      {
        title: "Commit Blue Change",
        explanation: "Committing the branch change gives Git a clear snapshot to merge later.",
        expectedCommand: "git commit -am \"Use blue deployment port\"",
        hint: "Use -am because app.conf is already tracked in this simulation.",
        mockOutput: "[blue-deploy e56aa10] Use blue deployment port\n 1 file changed, 1 insertion(+), 1 deletion(-)"
      },
      {
        title: "Create a Competing Main Change",
        explanation: "Now main changes the same config line. Git can combine many independent edits automatically, but same-line edits need a human decision.",
        expectedCommand: "git checkout main",
        acceptedCommands: ["git switch main"],
        hint: "Return to main.",
        mockOutput: "Switched to branch 'main'"
      },
      {
        title: "Commit Green Change on Main",
        explanation: "This creates divergent history. Both branches are valid, but they disagree about app.conf.",
        expectedCommand: "echo \"PORT=8082\" > app.conf",
        hint: "Set a different port on main.",
        mockOutput: "Updated app.conf on main."
      },
      {
        title: "Record Green Change",
        explanation: "The next merge will now require conflict resolution because both branches changed the same line.",
        expectedCommand: "git commit -am \"Use green deployment port\"",
        hint: "Commit the main branch edit.",
        mockOutput: "[main a9d71cc] Use green deployment port\n 1 file changed, 1 insertion(+), 1 deletion(-)"
      },
      {
        title: "Attempt the Merge",
        explanation: "Git stops and marks the file as conflicted. This is not failure; it is Git asking for an explicit decision.",
        expectedCommand: "git merge blue-deploy",
        hint: "Merge blue-deploy into main.",
        mockOutput: "Auto-merging app.conf\nCONFLICT (content): Merge conflict in app.conf\nAutomatic merge failed; fix conflicts and then commit the result."
      },
      {
        title: "Resolve the File",
        explanation: "In real life you would edit out conflict markers and choose the correct final value. Here we keep a resolved production port.",
        expectedCommand: "echo \"PORT=8080\" > app.conf",
        hint: "Replace the conflicted file with the resolved value.",
        mockOutput: "Resolved app.conf with PORT=8080."
      },
      {
        title: "Stage the Resolution",
        explanation: "git add tells Git the conflict is resolved for that file. Until then, the merge remains unfinished.",
        expectedCommand: "git add app.conf",
        hint: "Mark app.conf as resolved.",
        mockOutput: "Staged resolved app.conf."
      },
      {
        title: "Commit the Merge Resolution",
        explanation: "The merge commit records both parents and the human-approved final content. This preserves the true integration story.",
        expectedCommand: "git commit -m \"Resolve deployment port conflict\"",
        hint: "Complete the merge with a clear message.",
        mockOutput: "[main d4c92fa] Resolve deployment port conflict"
      }
    ]
  },
  {
    id: "git_remote",
    title: "Git 06 - Remotes, Tracking Branches, Fetch, Pull, Push",
    difficulty: "Intermediate",
    objective: "Practice the collaboration vocabulary used with GitHub/GitLab remotes.",
    stepsWindows: [
      "Add an origin remote.",
      "Inspect remotes.",
      "Fetch remote refs.",
      "Set upstream while pushing.",
      "Pull with rebase."
    ],
    stepsLinux: [
      "Add an origin remote.",
      "Inspect remotes.",
      "Fetch remote refs.",
      "Set upstream while pushing.",
      "Pull with rebase."
    ],
    verificationCommand: "Browser simulation validates remote workflow concepts.",
    validatorKey: "git_remote",
    hint: "fetch updates remote-tracking refs; pull is fetch plus integration.",
    interactiveSteps: [
      {
        title: "Add Origin",
        explanation: "A remote is a named URL for another repository. origin is a convention, not magic, but it is what most hosted Git workflows use.",
        expectedCommand: "git remote add origin https://example.com/devops-sandbox.git",
        hint: "Add origin with the mock repository URL.",
        mockOutput: "Added remote 'origin'."
      },
      {
        title: "Inspect Remote URLs",
        explanation: "git remote -v shows fetch and push URLs. DevOps engineers check this before pushing infra changes to the wrong repository.",
        expectedCommand: "git remote -v",
        hint: "List remotes with URLs.",
        mockOutput: "origin  https://example.com/devops-sandbox.git (fetch)\norigin  https://example.com/devops-sandbox.git (push)"
      },
      {
        title: "Fetch Remote References",
        explanation: "fetch downloads objects and updates origin/* remote-tracking branches. It does not change your current branch.",
        expectedCommand: "git fetch origin",
        hint: "Download remote metadata without integrating.",
        mockOutput: "From https://example.com/devops-sandbox\n * [new branch]      main       -> origin/main"
      },
      {
        title: "Push and Set Upstream",
        explanation: "-u connects your local branch to a remote branch. After that, plain git push and git pull know the default target.",
        expectedCommand: "git push -u origin main",
        hint: "Push main and set upstream tracking.",
        mockOutput: "branch 'main' set up to track 'origin/main'.\nEverything up-to-date"
      },
      {
        title: "Pull with Rebase",
        explanation: "git pull --rebase fetches new remote commits and replays your local commits on top. This can keep feature history linear when used carefully.",
        expectedCommand: "git pull --rebase",
        hint: "Integrate upstream with rebase.",
        mockOutput: "Current branch main is up to date."
      }
    ]
  },
  {
    id: "git_undo",
    title: "Git 07 - Restore, Reset, Revert, and Safe Undo",
    difficulty: "Intermediate",
    objective: "Learn the difference between undoing files, moving branch pointers, and creating inverse commits.",
    stepsWindows: [
      "Create a bad file.",
      "Restore it before staging.",
      "Create and commit a bad config.",
      "Use revert to undo public history safely.",
      "Inspect recent commits."
    ],
    stepsLinux: [
      "Create a bad file.",
      "Restore it before staging.",
      "Create and commit a bad config.",
      "Use revert to undo public history safely.",
      "Inspect recent commits."
    ],
    verificationCommand: "Browser simulation validates undo command choice.",
    validatorKey: "git_undo",
    hint: "restore changes files; reset moves refs/index; revert creates a new commit.",
    interactiveSteps: [
      {
        title: "Make an Unwanted Working-Tree Change",
        explanation: "Not every edit deserves history. If a file has an experimental change that is not staged, restore is the modern command for discarding it.",
        expectedCommand: "echo \"DEBUG=true\" > app.conf",
        hint: "Make a bad local edit.",
        mockOutput: "Changed app.conf to DEBUG=true."
      },
      {
        title: "Discard the Unstaged Change",
        explanation: "git restore app.conf replaces the working-tree copy with the version from the index. This is destructive for that local edit, so inspect before using it.",
        expectedCommand: "git restore app.conf",
        hint: "Restore app.conf from the index.",
        mockOutput: "Restored app.conf from the index."
      },
      {
        title: "Create a Bad Tracked Change",
        explanation: "Now we intentionally commit something bad so we can practice a public-history-safe undo.",
        expectedCommand: "echo \"DEBUG=true\" > bad.conf",
        hint: "Create bad.conf.",
        mockOutput: "Wrote bad.conf."
      },
      {
        title: "Commit the Bad Change",
        explanation: "Once a commit is shared, rewriting it can disrupt teammates. Revert is usually safer for shared branches.",
        expectedCommand: "git add bad.conf",
        hint: "Stage bad.conf.",
        mockOutput: "Staged bad.conf."
      },
      {
        title: "Record the Bad Commit",
        explanation: "This gives us a concrete commit to reverse.",
        expectedCommand: "git commit -m \"Add bad debug config\"",
        hint: "Commit bad.conf.",
        mockOutput: "[main f00dbad] Add bad debug config\n 1 file changed, 1 insertion(+)\n create mode 100644 bad.conf"
      },
      {
        title: "Create an Inverse Commit",
        explanation: "git revert HEAD creates a new commit that reverses the changes introduced by HEAD. History remains honest and collaborative.",
        expectedCommand: "git revert HEAD --no-edit",
        hint: "Revert the latest commit without opening an editor.",
        mockOutput: "[main 77c0ffe] Revert \"Add bad debug config\"\n 1 file changed, 1 deletion(-)\n delete mode 100644 bad.conf"
      },
      {
        title: "Verify the Undo Story",
        explanation: "The log should show both the bad commit and the revert. That is exactly what auditors and teammates need to understand what happened.",
        expectedCommand: "git log --oneline -3",
        hint: "Show the latest three commits.",
        mockOutput: "77c0ffe Revert \"Add bad debug config\"\nf00dbad Add bad debug config\nd4c92fa Resolve deployment port conflict"
      }
    ]
  },
  {
    id: "git_stash",
    title: "Git 08 - Stash, Clean, and Context Switching",
    difficulty: "Intermediate",
    objective: "Pause local work, handle another branch, and return without losing changes.",
    stepsWindows: [
      "Create local work in progress.",
      "Stash it with a message.",
      "List stashes.",
      "Apply the stash.",
      "Clean an untracked build artifact."
    ],
    stepsLinux: [
      "Create local work in progress.",
      "Stash it with a message.",
      "List stashes.",
      "Apply the stash.",
      "Clean an untracked build artifact."
    ],
    verificationCommand: "Browser simulation validates stash and clean workflow.",
    validatorKey: "git_stash",
    hint: "Use stash for temporary tracked work; use clean carefully for untracked files.",
    interactiveSteps: [
      {
        title: "Create Work in Progress",
        explanation: "Interruptions happen: production incidents, review fixes, and urgent deploy patches. Stash lets you put aside unfinished tracked changes.",
        expectedCommand: "echo \"WIP=true\" > app.conf",
        hint: "Make a tracked work-in-progress change.",
        mockOutput: "Changed app.conf."
      },
      {
        title: "Stash with a Useful Message",
        explanation: "A named stash is easier to understand later than a generic WIP entry.",
        expectedCommand: "git stash push -m \"wip app config\"",
        acceptedCommands: ["git stash save \"wip app config\""],
        hint: "Save the WIP change in the stash stack.",
        mockOutput: "Saved working directory and index state On main: wip app config"
      },
      {
        title: "List the Stash Stack",
        explanation: "Stashes are stack entries. You can inspect, apply, pop, or drop them by reference.",
        expectedCommand: "git stash list",
        hint: "Show available stash entries.",
        mockOutput: "stash@{0}: On main: wip app config"
      },
      {
        title: "Reapply the Stash",
        explanation: "apply restores the stash but keeps it in the stack. pop restores and removes it. apply is safer while learning.",
        expectedCommand: "git stash apply stash@{0}",
        hint: "Apply the latest stash entry.",
        mockOutput: "On branch main\nChanges not staged for commit:\n  modified: app.conf"
      },
      {
        title: "Create an Untracked Artifact",
        explanation: "Build output and scratch files can clutter status. git clean removes untracked files, so preview first in real workflows with git clean -n.",
        expectedCommand: "echo \"temporary build\" > build.log",
        hint: "Create an untracked build artifact.",
        mockOutput: "Wrote build.log."
      },
      {
        title: "Clean the Artifact",
        explanation: "git clean -f removes untracked files. It will not remove ignored files unless you add extra flags, which is another reason to be cautious.",
        expectedCommand: "git clean -f",
        hint: "Remove untracked files from the working tree.",
        mockOutput: "Removing build.log"
      }
    ]
  },
  {
    id: "git_rebase",
    title: "Git 09 - Rebase and Cherry-Pick",
    difficulty: "Advanced",
    objective: "Practice replaying commits and copying one commit across branches.",
    stepsWindows: [
      "Create a feature branch.",
      "Commit a feature note.",
      "Return to main and create a hotfix.",
      "Rebase the feature branch onto main.",
      "Cherry-pick the hotfix into another branch."
    ],
    stepsLinux: [
      "Create a feature branch.",
      "Commit a feature note.",
      "Return to main and create a hotfix.",
      "Rebase the feature branch onto main.",
      "Cherry-pick the hotfix into another branch."
    ],
    verificationCommand: "Browser simulation validates advanced history commands.",
    validatorKey: "git_rebase",
    hint: "Rebase rewrites local commit IDs; cherry-pick copies a commit's patch.",
    interactiveSteps: [
      {
        title: "Create a Rebase Practice Branch",
        explanation: "Rebase is most useful for local feature branches before sharing. It rewrites commit parents and therefore commit IDs.",
        expectedCommand: "git checkout -b feature-linear-history",
        acceptedCommands: ["git switch -c feature-linear-history"],
        hint: "Create feature-linear-history.",
        mockOutput: "Switched to a new branch 'feature-linear-history'"
      },
      {
        title: "Add Feature Work",
        explanation: "This commit will later be replayed on top of main.",
        expectedCommand: "echo \"feature flag enabled\" > feature.txt",
        hint: "Create feature.txt.",
        mockOutput: "Wrote feature.txt."
      },
      {
        title: "Commit Feature Work",
        explanation: "The branch now has a unique commit that main does not have.",
        expectedCommand: "git add feature.txt",
        hint: "Stage feature.txt.",
        mockOutput: "Staged feature.txt."
      },
      {
        title: "Record the Feature Commit",
        explanation: "This feature commit will be replayed after main receives a hotfix.",
        expectedCommand: "git commit -m \"Add feature flag note\"",
        hint: "Commit the feature note.",
        mockOutput: "[feature-linear-history 31acafe] Add feature flag note\n 1 file changed, 1 insertion(+)"
      },
      {
        title: "Return to Main for a Hotfix",
        explanation: "Production hotfixes often land on main while feature work is still in progress.",
        expectedCommand: "git checkout main",
        acceptedCommands: ["git switch main"],
        hint: "Switch back to main.",
        mockOutput: "Switched to branch 'main'"
      },
      {
        title: "Create Hotfix Commit",
        explanation: "This commit becomes the new base for the feature branch.",
        expectedCommand: "echo \"hotfix=true\" > hotfix.conf",
        hint: "Create hotfix.conf.",
        mockOutput: "Wrote hotfix.conf."
      },
      {
        title: "Commit the Hotfix",
        explanation: "Main is now ahead of the feature branch.",
        expectedCommand: "git add hotfix.conf",
        hint: "Stage the hotfix.",
        mockOutput: "Staged hotfix.conf."
      },
      {
        title: "Record the Hotfix",
        explanation: "This is the commit that feature work will be replayed on top of.",
        expectedCommand: "git commit -m \"Add production hotfix\"",
        hint: "Commit hotfix.conf.",
        mockOutput: "[main ab12fed] Add production hotfix\n 1 file changed, 1 insertion(+)"
      },
      {
        title: "Rebase Feature on Main",
        explanation: "Rebase checks out the feature commit, changes its parent to the latest main, and creates a new commit ID for the replayed work.",
        expectedCommand: "git checkout feature-linear-history",
        acceptedCommands: ["git switch feature-linear-history"],
        hint: "Move back to the feature branch.",
        mockOutput: "Switched to branch 'feature-linear-history'"
      },
      {
        title: "Replay the Feature Commit",
        explanation: "After this, the graph is linear: main hotfix first, feature commit after it.",
        expectedCommand: "git rebase main",
        hint: "Rebase the feature branch on top of main.",
        mockOutput: "Successfully rebased and updated refs/heads/feature-linear-history."
      },
      {
        title: "Cherry-Pick the Hotfix",
        explanation: "Cherry-pick copies the patch from one existing commit onto the current branch. It is useful for surgical backports.",
        expectedCommand: "git cherry-pick ab12fed",
        hint: "Copy the hotfix commit by SHA.",
        mockOutput: "[feature-linear-history e90babe] Add production hotfix\n Date: Mon May 25 16:00:00 2026 +0300\n 1 file changed, 1 insertion(+)"
      }
    ]
  },
  {
    id: "git_reflog",
    title: "Git 10 - Reflog Disaster Recovery",
    difficulty: "Advanced",
    objective: "Recover a deleted commit by using reflog and a new branch reference.",
    stepsWindows: [
      "Create and commit temp.txt.",
      "Reset HEAD back one commit.",
      "Use git reflog to find the lost commit.",
      "Create recovery-branch at the lost SHA."
    ],
    stepsLinux: [
      "Create and commit temp.txt.",
      "Reset HEAD back one commit.",
      "Use git reflog to find the lost commit.",
      "Create recovery-branch at the lost SHA."
    ],
    verificationCommand: "Verifies if recovery-branch exists in devops-sandbox.",
    validatorKey: "git_reflog",
    hint: "Reflog records where refs and HEAD have been locally.",
    interactiveSteps: [
      {
        title: "Create a Commit to Lose",
        explanation: "Recovery is easier to learn when the accident is controlled. We create a real commit-shaped object first.",
        expectedCommand: "echo \"Oops, deleted!\" > temp.txt",
        hint: "Create temp.txt.",
        mockOutput: "Wrote temp.txt."
      },
      {
        title: "Stage the Temporary File",
        explanation: "The file must be staged before it can be committed.",
        expectedCommand: "git add temp.txt",
        hint: "Stage temp.txt.",
        mockOutput: "Staged temp.txt."
      },
      {
        title: "Commit the Temporary File",
        explanation: "Once committed, Git has an object for the snapshot and a reflog entry for HEAD.",
        expectedCommand: "git commit -m \"Temp commit to delete\"",
        hint: "Commit temp.txt.",
        mockOutput: "[main 9ef4b1a] Temp commit to delete\n 1 file changed, 1 insertion(+)"
      },
      {
        title: "Move the Branch Back",
        explanation: "reset --hard moves the branch and resets the index and working tree. It is powerful and dangerous, so you should know how to recover from it.",
        expectedCommand: "git reset --hard HEAD~1",
        hint: "Simulate an accidental destructive reset.",
        mockOutput: "HEAD is now at 4ab3e1c Add quest file"
      },
      {
        title: "Search the Reflog",
        explanation: "Reflog is local history of ref movements. It can reveal commits that are no longer reachable from a branch.",
        expectedCommand: "git reflog",
        hint: "Find the deleted commit SHA.",
        mockOutput: "4ab3e1c HEAD@{0}: reset: moving to HEAD~1\n9ef4b1a HEAD@{1}: commit: Temp commit to delete"
      },
      {
        title: "Anchor the Lost Commit",
        explanation: "A branch reference makes the commit reachable again, protecting it from eventual garbage collection.",
        expectedCommand: "git branch recovery-branch 9ef4b1a",
        hint: "Create recovery-branch at the lost SHA.",
        mockOutput: "Branch 'recovery-branch' created pointing to 9ef4b1a."
      }
    ]
  },
  {
    id: "git_release",
    title: "Git 11 - Tags, Releases, Hooks, Submodules, and Worktrees",
    difficulty: "Advanced",
    objective: "Practice the Git features that appear in release engineering and larger platform repositories.",
    stepsWindows: [
      "Create an annotated tag.",
      "List tags.",
      "Create a pre-commit hook.",
      "Add a submodule.",
      "Create a worktree for hotfix work."
    ],
    stepsLinux: [
      "Create an annotated tag.",
      "List tags.",
      "Create a pre-commit hook.",
      "Add a submodule.",
      "Create a worktree for hotfix work."
    ],
    verificationCommand: "Browser simulation validates release engineering Git commands.",
    validatorKey: "git_release",
    hint: "Tags mark releases; hooks automate local checks; worktrees give one repo multiple working directories.",
    interactiveSteps: [
      {
        title: "Create an Annotated Release Tag",
        explanation: "Annotated tags store a tag object with message, author, and date. They are preferred for release markers because they carry more metadata than lightweight tags.",
        expectedCommand: "git tag -a v1.0.0 -m \"Release v1.0.0\"",
        hint: "Create an annotated tag for the current commit.",
        mockOutput: "Created annotated tag v1.0.0."
      },
      {
        title: "List Tags",
        explanation: "Release pipelines often trigger from tags, so knowing how to inspect them matters.",
        expectedCommand: "git tag --list",
        acceptedCommands: ["git tag -l"],
        hint: "List repository tags.",
        mockOutput: "v1.0.0"
      },
      {
        title: "Create a Local Pre-Commit Hook",
        explanation: "Hooks are scripts stored under .git/hooks. A pre-commit hook can run formatting, tests, or secret checks before a commit is created.",
        expectedCommand: "echo \"echo running pre-commit checks\" > .git/hooks/pre-commit",
        hint: "Write a simple pre-commit hook script.",
        mockOutput: "Wrote .git/hooks/pre-commit."
      },
      {
        title: "Add a Shared Infrastructure Submodule",
        explanation: "Submodules pin another repository at a specific commit. They are useful but operationally tricky, so you should understand how they appear in history.",
        expectedCommand: "git submodule add https://example.com/platform-modules.git modules/platform",
        hint: "Add a mock platform-modules submodule.",
        mockOutput: "Cloning into 'modules/platform'...\nSubmodule path 'modules/platform' registered for path 'modules/platform'"
      },
      {
        title: "Create a Parallel Worktree",
        explanation: "git worktree lets you check out another branch into another directory without cloning the repository again. It is excellent for urgent hotfixes while keeping local WIP separate.",
        expectedCommand: "git worktree add ../devops-hotfix main",
        hint: "Create a second working tree from main.",
        mockOutput: "Preparing worktree (checking out 'main')\nHEAD is now at 4ab3e1c Add quest file"
      }
    ]
  }
];

export const gitModuleQuiz: ModuleQuizQuestion[] = [
  {
    question: "Which area does git add update?",
    options: ["Working tree", "Staging area / index", "Remote repository", "Reflog expiration policy"],
    answerIndex: 1,
    explanation: "git add records the selected file snapshot in the index, which becomes the next commit's content."
  },
  {
    question: "What is the safest common way to undo a commit that was already pushed to a shared branch?",
    options: ["git reset --hard HEAD~1", "Delete the branch", "git revert <commit>", "Edit .git/refs manually"],
    answerIndex: 2,
    explanation: "git revert creates a new inverse commit, preserving shared history for teammates and automation."
  },
  {
    question: "What does git fetch origin do?",
    options: ["Downloads remote objects and updates origin/* refs", "Always merges origin/main into main", "Deletes local branches", "Stages remote changes"],
    answerIndex: 0,
    explanation: "fetch updates remote-tracking references without integrating them into your current branch."
  },
  {
    question: "Why can rebase be risky on commits other people already pulled?",
    options: ["It deletes the .git folder", "It rewrites commit identities by replaying commits", "It disables merge conflicts", "It pushes automatically"],
    answerIndex: 1,
    explanation: "Rebase creates new commits with new parents and new IDs, which can confuse collaborators if the old IDs were already shared."
  },
  {
    question: "What does reflog help recover?",
    options: ["Only remote pull requests", "Local ref movements such as commits lost after reset", "Docker images", "Untracked files deleted by git clean"],
    answerIndex: 1,
    explanation: "Reflog records where HEAD and refs pointed locally, so it can reveal commits no longer reachable from branches."
  },
  {
    question: "Which statement about .gitignore is correct?",
    options: ["It removes already tracked secrets from history", "It only affects untracked paths unless files are untracked first", "It encrypts ignored files", "It applies only to GitHub"],
    answerIndex: 1,
    explanation: ".gitignore prevents untracked matching files from being added normally; already tracked files need git rm --cached or history cleanup."
  },
  {
    question: "What is a fast-forward merge?",
    options: ["A merge where Git moves the branch pointer forward because no divergent commits exist", "A merge that always creates a merge commit", "A push with --force", "A stash apply operation"],
    answerIndex: 0,
    explanation: "If the target branch has not diverged, Git can simply advance the branch reference."
  },
  {
    question: "Why use git worktree?",
    options: ["To check out multiple branches into separate directories from one repository", "To compress old commits", "To create a remote", "To replace tags"],
    answerIndex: 0,
    explanation: "Worktrees let you keep separate working directories for different branches without separate full clones."
  }
];
