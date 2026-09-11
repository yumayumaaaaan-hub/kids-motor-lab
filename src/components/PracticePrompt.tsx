import './PracticePrompt.css';

type PracticePromptProps = {
  character: string;
  mode: 'build' | 'free';
};

/** いま書く文字を大きく表示 */
export function PracticePrompt({ character, mode }: PracticePromptProps) {
  return (
    <section className="practice-prompt" aria-live="polite">
      <p className="practice-prompt-label">
        {mode === 'build' ? 'いま かく もじ' : 'いまの もじ'}
      </p>
      <p className="practice-prompt-character">{character}</p>
    </section>
  );
}
