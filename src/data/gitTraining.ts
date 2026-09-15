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
    conceptSummary: "A Git repository is a hidden .git directory that stores the complete history of your project as a series of snapshots. Unlike older version control systems that track file differences, Git stores complete snapshots of your project state at each commit point.\n\nWhen you run `git init`, Git creates the .git directory containing the object database, refs, HEAD pointer, and configuration. Every subsequent Git command reads from or writes to this directory. Understanding this foundation helps you reason about what Git is actually doing behind every command.",
    learningObjectives: ["Initialize a new Git repository from scratch","Inspect the .git directory structure","Stage files and create your first commit","Read the commit log to verify your work"],
    realWorldScenario: "You have just joined a startup and your first task is to set up version control for a new microservice project. The team lead asks you to initialize the Git repository, add the initial README, and make the first commit so the CI/CD pipeline can detect the repo.",
    hint: "Think in three places: working tree, staging area, and repository history.",
    interactiveSteps: [
      {
        title: "Create the .git Database",
        explanation: "A Git repository is a normal project folder plus a hidden .git directory. That directory stores objects, refs, config, hooks, and the index. DevOps teams rely on this because application code, Terraform, Kubernetes manifests, and pipeline YAML all need versioned history.",
        expectedCommand: "git init",
        commandFlags: [],
        bestPractices: ["Initialize Git before writing any code to track all changes from the start"],
        realWorldContext: "Every codebase starts here. CI/CD systems often clone and run git init internally during job setup.",
        hint: "Initialize version tracking in the current sandbox directory.",
        mockOutput: "Initialized empty Git repository in /workspace/devops-sandbox/.git/"
      },
      {
        title: "Read the Working Tree State",
        explanation: "git status is your safety dashboard. It tells you which branch HEAD points to, which files are untracked, which changes are staged, and whether the next commit is ready.",
        expectedCommand: "git status",
        commandFlags: [],
        bestPractices: ["Run git status frequently to verify you are on the right branch and staging the right files"],
        realWorldContext: "Before pushing any deployment code, engineers always check status to avoid accidental commits.",
        hint: "Ask Git what it sees before changing anything.",
        mockOutput: "On branch main\n\nNo commits yet\n\nUntracked files:\n  README.md\n\nnothing added to commit but untracked files present"
      },
      {
        title: "Stage the README Snapshot",
        explanation: "git add copies the current content of a file into the index. The index is not just a list of names; it is the exact snapshot that the next commit will record.",
        expectedCommand: "git add README.md",
        commandFlags: [],
        bestPractices: ["Stage files individually instead of using git add . to maintain atomic commits"],
        realWorldContext: "In DevOps, carefully selecting which configuration files to stage prevents committing local test values.",
        hint: "Stage only README.md so the next commit is deliberate.",
        mockOutput: "Staged README.md in the index."
      },
      {
        title: "Create the Root Commit",
        explanation: "A commit is an immutable snapshot plus metadata: author, message, timestamp, and parent commit references. The first commit has no parent, so Git calls it a root commit.",
        expectedCommand: "git commit -m \"First commit\"",
        commandFlags: [{ flag: "-m", description: "Pass the commit message directly via command line" }],
        bestPractices: ["Use the imperative mood for commit messages, e.g., 'Add feature' not 'Added feature'"],
        realWorldContext: "Commit logs are parsed by release automation tools to generate changelogs and determine semantic version bumps.",
        hint: "Commit the staged snapshot with a short message.",
        mockOutput: "[main (root-commit) aed1d1a] First commit\n 1 file changed, 2 insertions(+)\n create mode 100644 README.md"
      },
      {
        title: "Read Compact History",
        explanation: "git log is how you audit history. DevOps work often requires finding when a pipeline, deployment manifest, or infrastructure variable changed.",
        expectedCommand: "git log --oneline --decorate",
        commandFlags: [{ flag: "--oneline", description: "Compact output showing only SHA and message" }, { flag: "--decorate", description: "Shows branch and tag labels next to commits" }],
        bestPractices: ["Use compact logs to quickly understand the sequence of recent deployments or fixes"],
        realWorldContext: "During incident response, a quick log scan helps identify which recent commit might have introduced the bug.",
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
    conceptSummary: "Git's status and diff commands are your diagnostic tools. `git status` shows you the high-level state of your working tree — which files are untracked, modified, or staged. `git diff` goes deeper, showing the exact line-by-line changes.\n\nUnderstanding the difference between unstaged changes (`git diff`) and staged changes (`git diff --staged`) is crucial. The staging area (index) acts as a buffer between your working directory and the repository, giving you precise control over what goes into each commit.",
    learningObjectives: ["Use git status to identify file states","Compare unstaged changes with git diff","Compare staged changes with git diff --staged","Create focused, single-purpose commits"],
    realWorldScenario: "You are working on two bug fixes simultaneously. Before committing, you need to review exactly which changes belong to which fix. Using status and diff, you separate the changes into clean, reviewable commits that your team lead can approve independently.",
    hint: "Unstaged diff answers 'what changed in files'; staged diff answers 'what will be committed'.",
    interactiveSteps: [
      {
        title: "Create a Config File",
        explanation: "Configuration files are a daily DevOps artifact. Before committing them, you should inspect exactly what changed so secrets, local ports, or machine-only values do not slip into history.",
        expectedCommand: "echo \"PORT=8080\" > app.conf",
        commandFlags: [],
        bestPractices: ["Use environment variables instead of hardcoded values for configuration"],
        realWorldContext: "Configuration files are often generated dynamically in CI/CD pipelines.",
        hint: "Write a simple key/value config file.",
        mockOutput: "Wrote app.conf with PORT=8080."
      },
      {
        title: "Inspect Unstaged Changes",
        explanation: "git diff compares tracked working-tree content to the index. A new, untracked app.conf is absent from the index, so this command produces no output yet. Use git status to see the untracked file, then stage it and inspect git diff --staged.",
        expectedCommand: "git diff",
        commandFlags: [],
        bestPractices: ["Always review diffs before staging to catch debugging code or typos"],
        realWorldContext: "Reviewing unstaged changes ensures passwords or AWS keys aren't accidentally saved in config files.",
        hint: "An empty diff is expected for an untracked file; git status still lists it.",
        mockOutput: ""
      },
      {
        title: "Stage the Config File",
        explanation: "Staging is the point where you decide what belongs in the next commit. Good commits are small, reviewable, and focused on one idea.",
        expectedCommand: "git add app.conf",
        commandFlags: [],
        bestPractices: ["Group related file changes together in the staging area"],
        realWorldContext: "Staging acts as a safety buffer, allowing you to prepare the perfect commit before finalizing it.",
        hint: "Move app.conf into the index.",
        mockOutput: "Staged app.conf."
      },
      {
        title: "Inspect the Staged Snapshot",
        explanation: "git diff --staged compares the index to the last commit. This is your final review before committing.",
        expectedCommand: "git diff --staged",
        commandFlags: [{ flag: "--staged", description: "Compares the staging area against the last commit" }],
        bestPractices: ["Make a habit of running git diff --staged as the final step before git commit"],
        realWorldContext: "This is the exact payload that will be reviewed in the Pull Request.",
        acceptedCommands: ["git diff --cached"],
        hint: "Use the staged diff form.",
        mockOutput: "diff --git a/app.conf b/app.conf\nnew file mode 100644\n+PORT=8080"
      },
      {
        title: "Commit a Focused Change",
        explanation: "The message should explain why the change exists. In real teams this supports reviews, incident timelines, and rollback decisions.",
        expectedCommand: "git commit -m \"Add app config\"",
        commandFlags: [{ flag: "-m", description: "Inline commit message" }],
        bestPractices: ["Commit messages should focus on WHY the change was made, not just WHAT changed"],
        realWorldContext: "Clear commit messages are vital for compliance audits in heavily regulated industries.",
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
    conceptSummary: "The .gitignore file tells Git which files and directories to exclude from version control. This is essential for keeping secrets, build artifacts, and environment-specific files out of your repository.\n\nPatterns in .gitignore use glob syntax: `*.log` ignores all log files, `node_modules/` ignores the entire directory, and `!important.log` negates a previous ignore rule. The .gitignore file itself should be committed so all team members share the same ignore rules.",
    learningObjectives: ["Create a .gitignore file with glob patterns","Prevent secrets and environment files from being tracked","Audit ignored files with git status --ignored","Understand the security implications of tracked secrets"],
    realWorldScenario: "A junior developer accidentally committed an .env file containing database credentials to the shared repository. Your team lead asks you to set up proper .gitignore rules to prevent this from happening again, and to audit what files are currently being ignored.",
    hint: "Never commit real secrets. Ignoring a file does not remove it if it is already tracked.",
    interactiveSteps: [
      {
        title: "Create a Local Secret File",
        explanation: "DevOps repos often have .env files for local development. The file can be useful locally, but it must not be committed because history is durable and frequently replicated.",
        expectedCommand: "echo \"API_TOKEN=local-only\" > .env",
        commandFlags: [],
        bestPractices: ["Never store real secrets in a .env file that might be tracked"],
        realWorldContext: "Leaked API tokens in Git repositories are constantly scanned by malicious actors on GitHub.",
        hint: "Create a fake local-only environment file.",
        mockOutput: "Wrote .env."
      },
      {
        title: "Write an Ignore Policy",
        explanation: ".gitignore tells Git which untracked paths to hide from normal status and add operations. Common entries include .env, logs, dependency folders, build output, and editor files.",
        expectedCommand: "printf '%s\\n' .env '*.log' dist/ > .gitignore",
        commandFlags: [],
        bestPractices: ["Set up a global .gitignore for OS files (.DS_Store) and a project .gitignore for code artifacts"],
        realWorldContext: "Ignoring build directories keeps the repository small, ensuring fast CI pipeline clones.",
        hint: "Ignore .env, log files, and dist output.",
        mockOutput: "Wrote .gitignore with 3 rules."
      },
      {
        title: "Audit Ignored Paths",
        explanation: "git status --ignored is useful when a file seems invisible. It confirms whether an ignore rule is working and helps debug broad patterns.",
        expectedCommand: "git status --ignored",
        commandFlags: [{ flag: "--ignored", description: "Show ignored files in the status output" }],
        bestPractices: ["Use this to verify your ignore patterns are working as expected without tracking the files"],
        realWorldContext: "Auditing ignored files helps verify that sensitive logs aren't accidentally bypassing rules.",
        hint: "List both normal and ignored paths.",
        mockOutput: "Ignored files:\n  .env\n\nUntracked files:\n  .gitignore"
      },
      {
        title: "Stage the Policy, Not the Secret",
        explanation: "The correct commit includes .gitignore but not .env. That distinction is exactly why staging is a separate step.",
        expectedCommand: "git add .gitignore",
        commandFlags: [],
        bestPractices: ["Commit ignore rules early before anyone has a chance to commit a secret"],
        realWorldContext: "The ignore file is shared infrastructure; keeping it updated prevents the entire team from making mistakes.",
        hint: "Only stage the ignore policy.",
        mockOutput: "Staged .gitignore."
      },
      {
        title: "Commit Repository Hygiene",
        explanation: "Security basics belong early in the Git course because secret leaks are one of the most expensive version-control mistakes.",
        expectedCommand: "git commit -m \"Add ignore rules\"",
        commandFlags: [{ flag: "-m", description: "Inline commit message" }],
        bestPractices: ["Document any unusual ignore rules in the commit message"],
        realWorldContext: "A solid ignore policy is the first line of defense in DevSecOps.",
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
    conceptSummary: "Branches in Git are lightweight pointers to commits. Creating a branch is nearly instantaneous because Git only creates a 41-byte file containing the commit SHA. This makes Git's branching model extremely powerful compared to older VCS systems that copied entire directory trees.\n\nThe typical workflow is: create a feature branch from main, make your changes there, then merge back. This isolates work-in-progress from the stable codebase. When a branch is merged with a fast-forward, Git simply moves the main pointer forward — no merge commit is needed.",
    learningObjectives: ["Create feature branches with git checkout -b","Switch between branches safely","Merge branches using fast-forward strategy","Visualize branch history with git log --graph --all"],
    realWorldScenario: "Your team follows the GitHub Flow branching strategy. You need to implement a new user authentication feature without disrupting the main branch. You create a feature branch, develop the feature, then merge it back with a clean fast-forward merge.",
    hint: "A branch is a movable name pointing at a commit.",
    interactiveSteps: [
      {
        title: "Create and Switch to a Feature Branch",
        explanation: "Branching lets you isolate work. In Git, a branch is lightweight because it is just a reference that moves as new commits are created.",
        expectedCommand: "git checkout -b feature-devops",
        commandFlags: [{ flag: "-b", description: "Create the branch and switch to it in one step" }],
        bestPractices: ["Use a naming convention like feat/..., fix/..., or bug/... for branches"],
        realWorldContext: "Branching isolates risky infrastructure changes from the stable production deployment branch.",
        acceptedCommands: ["git switch -c feature-devops"],
        hint: "Create feature-devops and move HEAD there.",
        mockOutput: "Switched to a new branch 'feature-devops'"
      },
      {
        title: "Add Feature Work",
        explanation: "Files created on a branch are still normal working-tree files. They become part of the branch history only after staging and committing.",
        expectedCommand: "echo \"DevOps Quest Complete!\" > quest.txt",
        commandFlags: [],
        bestPractices: ["Keep feature branches focused on a single task or Jira ticket"],
        realWorldContext: "Small, focused branches lead to faster code reviews and safer deployments.",
        hint: "Create quest.txt on the feature branch.",
        mockOutput: "Wrote quest.txt."
      },
      {
        title: "Stage the Branch File",
        explanation: "Staging records the exact version of quest.txt that will become part of the next feature commit.",
        expectedCommand: "git add quest.txt",
        commandFlags: [],
        bestPractices: ["Ensure tests pass locally before staging the final changes"],
        realWorldContext: "Pre-commit hooks will often run on these staged files to verify formatting and linting.",
        hint: "Stage quest.txt.",
        mockOutput: "Staged quest.txt."
      },
      {
        title: "Commit on the Branch",
        explanation: "The branch pointer moves forward to the new commit. main still points to the earlier commit until you merge.",
        expectedCommand: "git commit -m \"Add quest file\"",
        commandFlags: [{ flag: "-m", description: "Inline commit message" }],
        bestPractices: ["Include the ticket number (e.g., JIRA-123) in the commit message to link to project tracking"],
        realWorldContext: "Linking commits to change requests helps reviewers and auditors follow why a deployment changed.",
        hint: "Commit the feature work.",
        mockOutput: "[feature-devops 4ab3e1c] Add quest file\n 1 file changed, 1 insertion(+)\n create mode 100644 quest.txt"
      },
      {
        title: "Return to Main",
        explanation: "Switching branches changes HEAD and updates the working tree to match the target branch when possible.",
        expectedCommand: "git checkout main",
        commandFlags: [],
        bestPractices: ["Always ensure your working directory is clean before switching branches to avoid conflicts"],
        realWorldContext: "In production, the main branch is protected and triggers automated deployments when updated.",
        acceptedCommands: ["git switch main"],
        hint: "Move back to main before merging.",
        mockOutput: "Switched to branch 'main'"
      },
      {
        title: "Fast-Forward Merge",
        explanation: "If main has no new commits since the feature branch split, Git can fast-forward: it simply moves the main pointer to the feature commit.",
        expectedCommand: "git merge feature-devops",
        commandFlags: [],
        bestPractices: ["Prefer fast-forward merges for small local branches to keep history linear"],
        realWorldContext: "Merge commits provide context in team environments, but fast-forwards are cleaner for simple updates.",
        hint: "Merge the feature branch into main.",
        mockOutput: "Updating aed1d1a..4ab3e1c\nFast-forward\n quest.txt | 1 +\n 1 file changed, 1 insertion(+)"
      },
      {
        title: "Read the History Graph",
        explanation: "The graph view is essential in reviews and incident analysis. It shows branch structure, merge points, tags, and where HEAD is.",
        expectedCommand: "git log --oneline --graph --decorate --all",
        commandFlags: [{ flag: "--graph", description: "Draw a text-based graphical representation of the commit history" }, { flag: "--all", description: "Show all branches, not just the current one" }],
        bestPractices: ["Use aliases like 'git config --global alias.dog \"log --all --decorate --oneline --graph\"' for quick access"],
        realWorldContext: "Visualizing the commit graph helps diagnose why a specific bug reappeared after a complex merge.",
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
    conceptSummary: "Merge conflicts occur when two branches modify the same lines of the same file. Git cannot automatically determine which version is correct, so it marks the conflicting sections with conflict markers (<<<<<<, ======, >>>>>>) and asks you to resolve them manually.\n\nConflicts are a normal part of collaborative development, not errors. The key is understanding the three versions involved: the common ancestor (base), your version (ours), and the incoming version (theirs). Resolution means choosing the correct final state and removing the conflict markers.",
    learningObjectives: ["Understand why merge conflicts occur","Read and interpret conflict markers","Resolve conflicts by choosing the correct final state","Complete a merge after conflict resolution","Verify the merge result in the commit log"],
    realWorldScenario: "Two developers on your team have both modified the server configuration file — one changed the port to 8081 for testing, the other changed it to 8082 for staging. You need to merge both branches and resolve the conflict by setting the correct production port (8080).",
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
    conceptSummary: "Remote repositories are copies of your project hosted on a server (GitHub, GitLab, Bitbucket). The `git remote` command manages these bookmarks. `origin` is the conventional name for your primary remote.\n\nThe push/pull workflow synchronizes your local repository with the remote. `git fetch` downloads new commits without modifying your working tree. `git pull` fetches and merges (or rebases). `git push` uploads your local commits. The `-u` flag sets upstream tracking so future push/pull commands know which remote branch to target.",
    learningObjectives: ["Add and inspect remote repository connections","Understand the difference between fetch, pull, and push","Set upstream tracking with the -u flag","Use pull --rebase for clean linear history"],
    realWorldScenario: "You have been developing a tool locally and now need to share it with your team by pushing it to the company's GitHub organization. You add the remote, push your work, and set up tracking so daily pulls keep everyone synchronized.",
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
    conceptSummary: "Git provides multiple undo mechanisms, each suited to different situations. `git restore` discards unstaged changes (destructive — changes are lost). `git restore --staged` unstages files without losing changes. `git revert` creates a new commit that undoes a previous commit (safe for shared branches).\n\n`git reset` moves the branch pointer backward. `--soft` keeps changes staged, `--mixed` (default) unstages them, and `--hard` discards everything. The golden rule: use `revert` on public branches (preserves history), use `reset` only on local/private branches.",
    learningObjectives: ["Discard unstaged changes safely with git restore","Understand the difference between restore, revert, and reset","Create a revert commit to undo published changes","Apply the golden rule of undoing: revert public, reset private"],
    realWorldScenario: "A deployment broke production because of a bad commit pushed 2 hours ago. You need to quickly revert the problematic commit without losing the 5 good commits that came after it. Using git revert, you create a clean undo commit that can be safely pushed.",
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
    conceptSummary: "Git stash temporarily shelves your uncommitted changes so you can switch context without committing half-done work. The stash is a stack — you can push multiple stashes and pop them later.\n\n`git stash push -m 'description'` saves your work with a label. `git stash list` shows all stashed entries. `git stash apply` reapplies without removing from the stack. `git stash pop` applies and removes. `git clean` removes untracked files — use with caution as this is irreversible.",
    learningObjectives: ["Stash work-in-progress with descriptive messages","Manage the stash stack (list, apply, pop, drop)","Clean untracked files from the working directory","Switch context safely without losing work"],
    realWorldScenario: "You are halfway through implementing a feature when an urgent hotfix request comes in. You cannot commit your half-done feature code, so you stash it, switch to the hotfix branch, apply the fix, then return to your feature branch and restore your stashed work.",
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
    conceptSummary: "Rebase replays your branch's commits on top of another branch's latest commit, creating a clean linear history. Unlike merge (which creates a merge commit), rebase rewrites commit SHAs — the commits are new objects with different parents.\n\nCherry-pick copies a single specific commit from one branch to another. This is useful when you need just one fix from a feature branch without merging everything. Warning: never rebase commits that have been pushed to a shared remote — this rewrites history that others may have based their work on.",
    learningObjectives: ["Rebase a feature branch onto an updated main branch","Understand how rebase rewrites commit history","Cherry-pick individual commits across branches","Know when to rebase vs merge (private vs shared branches)"],
    realWorldScenario: "Your feature branch has fallen behind main by 15 commits. Your team requires a clean linear history for code review. You rebase your feature branch onto main, resolving any conflicts along the way, then cherry-pick a critical security fix from another team's branch.",
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
    conceptSummary: "The reflog (reference log) is Git's safety net. It records every movement of HEAD — commits, checkouts, rebases, resets, merges. Even after a destructive `git reset --hard`, the 'lost' commits still exist in the object database and can be found via reflog.\n\nReflog entries expire after 90 days by default (30 days for unreachable commits). This makes reflog your emergency recovery tool: find the SHA of the lost state, then create a branch pointing to it. As long as you haven't run `git gc` and the reflog hasn't expired, you can recover almost anything.",
    learningObjectives: ["Understand reflog as Git's safety net for HEAD movements","Recover 'lost' commits after a destructive reset","Create recovery branches from reflog entries","Know the reflog expiry policy (90 days reachable, 30 days unreachable)"],
    realWorldScenario: "A team member accidentally ran `git reset --hard HEAD~3` on a shared branch, seemingly destroying three days of work. Using the reflog, you find the SHA of the commit before the reset and create a recovery branch, saving the lost work.",
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
    conceptSummary: "Tags mark specific commits as release points. Annotated tags (`git tag -a v1.0.0 -m 'message'`) store tagger info, date, and message — use these for releases. Lightweight tags are just pointers — use for temporary markers.\n\nPre-commit hooks run scripts before each commit, enforcing code quality (linting, tests). Submodules embed external repositories inside your project. Worktrees let you check out multiple branches simultaneously in separate directories — useful for reviewing PRs while continuing your work.",
    learningObjectives: ["Create annotated release tags following semver conventions","Set up pre-commit hooks for automated code quality checks","Add Git submodules for external dependencies","Use worktrees to work on multiple branches simultaneously"],
    realWorldScenario: "Your team is preparing the v1.0.0 release. You need to tag the release commit, set up a pre-commit hook to run linters before every commit, add a shared utility library as a submodule, and create a worktree to start v1.1.0 development while the release branch is being finalized.",
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
