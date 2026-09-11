/** 画面上の1点（0〜1の正規化座標） */
export type Point = {
  x: number;
  y: number;
};

/** 指を離すまでの1本の線 */
export type Stroke = Point[];

/** お手本1画分のパス情報 */
export type ReferenceStroke = {
  /** 1画を構成するパスごとの点列（パス間はつながない） */
  segments: Point[][];
  /** 採点用の全点（パス間はつながない） */
  points: Point[];
  start: Point;
  end: Point;
  /** 書き順番号を置く位置（始点がずれる文字対策） */
  labelPoint: Point;
  /** 始点から終点への方向ベクトル（正規化済み） */
  direction: Point;
};

/** お手本文字データ */
export type ReferenceCharacter = {
  viewBoxWidth: number;
  viewBoxHeight: number;
  strokes: ReferenceStroke[];
};
