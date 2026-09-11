import type { CarDisplayStatus } from '../types/gameProgress';
import {
  emptyDebugUiPreview,
  type DebugUiPreview,
} from '../types/debugUiPreview';
import './DebugUiPreviewPanel.css';

type DebugUiPreviewPanelProps = {
  preview: DebugUiPreview;
  onChange: (preview: DebugUiPreview) => void;
};

const blueprintOptions = [
  { label: '実際', value: null },
  { label: '0枚', value: 0 },
  { label: '1枚', value: 1 },
  { label: '2枚', value: 2 },
  { label: '3枚', value: 3 },
] as const;

const evaluationOptions = [
  { label: 'なし', value: null },
  { label: 'はなまる', value: 'excellent' },
  { label: 'できた', value: 'passed' },
  { label: 'もうすこし', value: 'retry' },
  { label: '設計図', value: 'blueprint' },
  { label: '車完成', value: 'unlock' },
] as const;

const imageOptions = [
  { label: '通常', value: null },
  { label: '読込中', value: 'loading' },
  { label: 'エラー', value: 'error' },
] as const;

const garageOptions = [
  { label: 'なし', value: null },
  { label: 'completed', value: 'completed' },
  { label: 'active', value: 'active' },
  { label: 'locked', value: 'locked' },
] as const;

const tutorialOptions = [
  { label: 'なし', value: null },
  { label: '1', value: 1 },
  { label: '2', value: 2 },
  { label: '3', value: 3 },
] as const;

const strokeStateOptions = [
  { label: '実際', value: null },
  { label: '未描画', value: 'empty' },
  { label: '描画あり', value: 'has' },
] as const;

const triStateOptions = [
  { label: '実際', value: null },
  { label: 'ON', value: 'on' },
  { label: 'OFF', value: 'off' },
] as const;

/** debug=1：UI表示確認（進捗は変更しない） */
export function DebugUiPreviewPanel({
  preview,
  onChange,
}: DebugUiPreviewPanelProps) {
  const set = <K extends keyof DebugUiPreview>(key: K, value: DebugUiPreview[K]) => {
    onChange({ ...preview, [key]: value });
  };

  return (
    <div className="debug-ui-preview" aria-label="UIプレビュー">
      <p className="debug-ui-preview-title">UIプレビュー（保存しない）</p>

      <label className="debug-ui-preview-row">
        設計図枚数
        <select
          value={preview.blueprintCount ?? ''}
          onChange={(event) => {
            const raw = event.target.value;
            set('blueprintCount', raw === '' ? null : Number(raw));
          }}
        >
          {blueprintOptions.map((option) => (
            <option key={String(option.value)} value={option.value ?? ''}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className="debug-ui-preview-row">
        結果画面
        <select
          value={preview.evaluationPreview ?? ''}
          onChange={(event) => {
            const raw = event.target.value;
            set(
              'evaluationPreview',
              raw === '' ? null : (raw as DebugUiPreview['evaluationPreview']),
            );
          }}
        >
          {evaluationOptions.map((option) => (
            <option key={String(option.value)} value={option.value ?? ''}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className="debug-ui-preview-row">
        車画像
        <select
          value={preview.carImagePreview ?? ''}
          onChange={(event) => {
            const raw = event.target.value;
            set(
              'carImagePreview',
              raw === '' ? null : (raw as DebugUiPreview['carImagePreview']),
            );
          }}
        >
          {imageOptions.map((option) => (
            <option key={String(option.value)} value={option.value ?? ''}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className="debug-ui-preview-row">
        ガレージカード
        <select
          value={preview.garageCardPreview ?? ''}
          onChange={(event) => {
            const raw = event.target.value;
            set(
              'garageCardPreview',
              raw === '' ? null : (raw as CarDisplayStatus),
            );
          }}
        >
          {garageOptions.map((option) => (
            <option key={String(option.value)} value={option.value ?? ''}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className="debug-ui-preview-row">
        チュートリアル
        <select
          value={preview.tutorialStep ?? ''}
          onChange={(event) => {
            const raw = event.target.value;
            set(
              'tutorialStep',
              raw === '' ? null : (Number(raw) as 1 | 2 | 3),
            );
          }}
        >
          {tutorialOptions.map((option) => (
            <option key={String(option.value)} value={option.value ?? ''}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <p className="debug-ui-preview-subtitle">プレイ画面</p>

      <label className="debug-ui-preview-row">
        描画状態
        <select
          value={
            preview.forceHasStrokes === true
              ? 'has'
              : preview.forceHasStrokes === false
                ? 'empty'
                : ''
          }
          onChange={(event) => {
            const raw = event.target.value;
            set(
              'forceHasStrokes',
              raw === '' ? null : raw === 'has',
            );
          }}
        >
          {strokeStateOptions.map((option) => (
            <option key={String(option.value)} value={option.value ?? ''}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className="debug-ui-preview-row">
        お手本
        <select
          value={
            preview.forceGuideOn === true
              ? 'on'
              : preview.forceGuideOn === false
                ? 'off'
                : ''
          }
          onChange={(event) => {
            const raw = event.target.value;
            set(
              'forceGuideOn',
              raw === '' ? null : raw === 'on',
            );
          }}
        >
          {triStateOptions.map((option) => (
            <option key={String(option.value)} value={option.value ?? ''}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className="debug-ui-preview-row">
        おたすけ
        <select
          value={
            preview.forceHelpMode === true
              ? 'on'
              : preview.forceHelpMode === false
                ? 'off'
                : ''
          }
          onChange={(event) => {
            const raw = event.target.value;
            set(
              'forceHelpMode',
              raw === '' ? null : raw === 'on',
            );
          }}
        >
          {triStateOptions.map((option) => (
            <option key={String(option.value)} value={option.value ?? ''}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className="debug-ui-preview-row">
        採点中
        <select
          value={
            preview.forceEvaluating === true
              ? 'on'
              : preview.forceEvaluating === false
                ? 'off'
                : ''
          }
          onChange={(event) => {
            const raw = event.target.value;
            set(
              'forceEvaluating',
              raw === '' ? null : raw === 'on',
            );
          }}
        >
          {triStateOptions.map((option) => (
            <option key={String(option.value)} value={option.value ?? ''}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <p className="debug-ui-preview-note">
        320px確認：ブラウザ幅を 320px に縮めてください
      </p>

      <label className="debug-ui-preview-check">
        <input
          type="checkbox"
          checked={preview.reducedMotion ?? false}
          onChange={(event) => set('reducedMotion', event.target.checked)}
        />
        reduced-motion 相当
      </label>

      <button
        type="button"
        className="debug-ui-preview-reset"
        onClick={() => onChange({ ...emptyDebugUiPreview })}
      >
        プレビューをリセット
      </button>
    </div>
  );
}
