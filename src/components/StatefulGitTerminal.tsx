import { useEffect, useRef, useState } from 'react';
import { Play, RotateCcw } from 'lucide-react';
import type { TerminalSimulatorProps } from './TerminalSimulator';
import { getGitLab } from '../simulation/gitEngine';
import type { GitLab, RepositorySnapshot } from '../simulation/gitEngine';
import { gitGoals } from '../simulation/gitGoals';
import './statefulGitTerminal.css';

interface LogLine { type: 'input' | 'output' | 'error' | 'success'; text: string }

export default function StatefulGitTerminal({ validatorKey, interactiveSteps, completedSteps, onStepComplete, activeStepIndexOverride, onStepChange, isReviewMode = false }: TerminalSimulatorProps) {
  const [lab, setLab] = useState<GitLab | null>(null);
  const [snapshot, setSnapshot] = useState<RepositorySnapshot | null>(null);
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);
  const history = useRef<string[]>([]);
  const historyIndex = useRef(-1);
  const executing = useRef(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const firstIncomplete = interactiveSteps.findIndex((_, index) => !completedSteps.includes(`${validatorKey}:${index}`));
  const stepIndex = activeStepIndexOverride ?? (firstIncomplete === -1 ? interactiveSteps.length - 1 : firstIncomplete);

  useEffect(() => {
    let active = true;
    getGitLab(validatorKey).then(async instance => {
      const state = await instance.snapshot();
      if (active) { setLab(instance); setSnapshot(state); }
    }).catch(reason => { if (active) setError(`Cannot open saved repository: ${String(reason)}`); });
    return () => { active = false; };
  }, [validatorKey]);

  useEffect(() => {
    if (outputRef.current) outputRef.current.scrollTop = outputRef.current.scrollHeight;
  }, [logs]);

  const append = (...lines: LogLine[]) => setLogs(previous => [...previous, ...lines].slice(-250));

  const submit = async () => {
    if (!lab || executing.current || !input.trim()) return;
    const command = input.trim();
    executing.current = true;
    setBusy(true);
    setInput('');
    history.current.push(command);
    historyIndex.current = -1;
    append({ type: 'input', text: `$ ${command}` });
    try {
      if (command === 'clear') { setLogs([]); return; }
      const result = await lab.run(command);
      if (result.output) append({ type: result.exitCode ? 'error' : 'output', text: result.output });
      const goal = gitGoals[validatorKey][stepIndex];
      if (goal && await lab.satisfies(goal, result)) {
        append({ type: 'success', text: `Verified: ${interactiveSteps[stepIndex].title}` });
        if (!isReviewMode && !completedSteps.includes(`${validatorKey}:${stepIndex}`)) onStepComplete(stepIndex);
        if (stepIndex < interactiveSteps.length - 1) onStepChange?.(stepIndex + 1);
      } else if (result.exitCode === 0 && command !== 'help' && !isReviewMode && !completedSteps.includes(`${validatorKey}:${stepIndex}`)) {
        append({ type: 'output', text: 'Command finished. The selected step is still open.' });
      }
      setSnapshot(await lab.snapshot());
    } catch (reason) {
      append({ type: 'error', text: `Repository operation failed: ${String(reason)}` });
    } finally {
      executing.current = false;
      setBusy(false);
      inputRef.current?.focus();
    }
  };

  const reset = async () => {
    if (!lab || executing.current) return;
    executing.current = true;
    setBusy(true);
    try {
      await lab.reset();
      setSnapshot(await lab.snapshot());
      setLogs([{ type: 'output', text: 'Repository reset. Your lesson progress and notes are unchanged.' }]);
      setConfirmReset(false);
      onStepChange?.(0);
    } catch (reason) { append({ type: 'error', text: String(reason) }); }
    finally { executing.current = false; setBusy(false); }
  };

  return <section className="git-lab-terminal" aria-label="Git laboratory">
    <header className="git-lab-header">
      <div><strong>Git repository</strong><span>{snapshot?.branch || 'Opening...'}{snapshot?.head ? ` / ${snapshot.head.slice(0, 7)}` : ''}</span></div>
      <button className="git-lab-icon" type="button" title="Reset lab repository" aria-label="Reset lab repository" disabled={busy || !lab} onClick={() => setConfirmReset(true)}><RotateCcw size={16} /></button>
    </header>
    {confirmReset && <div className="git-lab-reset" role="alertdialog" aria-label="Reset repository">
      <p>Reset this lab's files and Git history? Completed steps and notes are kept.</p>
      <button type="button" disabled={busy} onClick={() => void reset()}>Reset repository</button>
      <button type="button" disabled={busy} onClick={() => setConfirmReset(false)}>Cancel</button>
    </div>}
    {error && <p role="alert">{error}</p>}
    {snapshot && <details className="git-lab-state" open>
      <summary>Working Tree &amp; Index <span>{snapshot.files.length} files / {snapshot.commits.length}{snapshot.commits.length === 12 ? '+' : ''} recent commits</span></summary>
      <div className="git-lab-files">
        <table aria-label="Repository files"><tbody>{snapshot.files.map(file => <tr key={file.path}><td>{file.path}</td><td data-status={file.status}>{file.status}</td></tr>)}</tbody></table>
        {snapshot.merge && <p role="status">Merge in progress: {snapshot.merge.unresolved.length ? snapshot.merge.unresolved.join(', ') : 'resolution staged'}</p>}
      </div>
    </details>}
    <div className="git-lab-output" role="log" aria-label="Terminal output" ref={outputRef}>
      {logs.length === 0 && <div className="log-output">/devops-sandbox{snapshot?.head ? ` / HEAD ${snapshot.head.slice(0, 7)}` : ''}</div>}
      {logs.map((line, index) => <div key={index} className={`terminal-log-line log-${line.type}`}>{line.text}</div>)}
    </div>
    <form className="git-lab-input" onSubmit={event => { event.preventDefault(); void submit(); }}>
      <span aria-hidden="true">$</span>
      <textarea ref={inputRef} aria-label="Terminal command" rows={2} value={input} disabled={!lab || busy} autoCapitalize="off" autoCorrect="off" autoComplete="off" spellCheck={false}
        onChange={event => setInput(event.target.value)}
        onKeyDown={event => {
          if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); void submit(); }
          else if ((event.key === 'ArrowUp' || event.key === 'ArrowDown') && !input.includes('\n')) {
            event.preventDefault();
            const next = event.key === 'ArrowUp' ? (historyIndex.current === -1 ? history.current.length - 1 : Math.max(0, historyIndex.current - 1)) : historyIndex.current + 1;
            historyIndex.current = next >= history.current.length ? -1 : next;
            setInput(history.current[historyIndex.current] || '');
          }
        }} />
      <button className="git-lab-icon" type="submit" title="Run command" aria-label="Run command" disabled={!lab || busy || !input.trim()}><Play size={16} /></button>
    </form>
    <div className="git-lab-footer" role="status">{busy ? 'Running...' : lab ? 'Saved on this browser' : 'Opening repository...'}</div>
  </section>;
}
