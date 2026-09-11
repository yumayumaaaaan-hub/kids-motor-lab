/** アニメーション・演出時間の共通設定（ms） */
export const animationConfig = {
  /** ボタン押下 */
  buttonPress: 120,
  /** 画面・カードのフェード */
  cardShow: 350,
  /** 結果カード表示後の効果音遅延 */
  soundDelay: 150,
  /** 設計図スタンプ表示 */
  blueprintStamp: 400,
  /** スタンプ後の停止 */
  blueprintHold: 350,
  /** 設計図が車へ移動 */
  blueprintFly: 600,
  /** 設計図サマリー表示（スタンプ+停止+移動） */
  blueprintSummary: 1800,
  /** 車完成：設計図移動開始 */
  unlockFlyStart: 750,
  /** 車完成：完成画面表示 */
  unlockSummary: 2200,
  /** 車完成：ガレージ登録画面 */
  unlockGarage: 3200,
  /** 車完成：ボタン表示（3秒以内） */
  unlockButtons: 2600,
  /** 車完成音 */
  carComplete: 1600,
  /** ガレージ登録演出 */
  garageRegister: 350,
  /** バッジ解除 */
  badgeUnlock: 1500,
  /** トースト非表示 */
  toastHide: 3000,
  /** セッション目標 */
  sessionGoal: 1800,
  /** 画像フェードイン */
  imageFadeIn: 220,
  /** 描画集中モードの復帰待ち */
  drawingFocusRestore: 400,
  /** 画面切り替えフェード */
  screenTransition: 200,
} as const;
