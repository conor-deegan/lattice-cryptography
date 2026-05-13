import React from "react";

type Vec2 = [number, number];

type LabeledVector = {
  v: Vec2;
  color?: string;
  label?: string;
};

const BASIS_COLORS = ["#3b82f6", "#8b5cf6"] as const;
const DEFAULT_VECTOR_COLOR = "#dc2626";

type LatticeProps = {
  basis: [Vec2, Vec2];
  vectors?: LabeledVector[];
  range?: number;
  size?: number;
  showBasis?: boolean;
  showFundamentalDomain?: boolean;
  tileFundamentalDomain?: boolean;
  showAxes?: boolean;
  showStats?: boolean;
  basisLabels?: [string, string];
  caption?: string;
};

export function Lattice({
  basis,
  vectors = [],
  range = 5,
  size = 360,
  showBasis = true,
  showFundamentalDomain = false,
  tileFundamentalDomain = false,
  showAxes = true,
  showStats = false,
  basisLabels = ["b₁", "b₂"],
  caption,
}: LatticeProps) {
  const uid = React.useId().replace(/:/g, "");
  const [b1, b2] = basis;
  const scale = size / (range * 2);
  const cx = size / 2;
  const cy = size / 2;

  const toSvg = (x: number, y: number) => ({
    x: cx + x * scale,
    y: cy - y * scale,
  });

  const det = b1[0] * b2[1] - b1[1] * b2[0];
  if (Math.abs(det) < 1e-9) {
    throw new Error("Lattice basis is singular");
  }
  const inv = [
    [b2[1] / det, -b2[0] / det],
    [-b1[1] / det, b1[0] / det],
  ];

  let maxI = 0;
  let maxJ = 0;
  const corners: Vec2[] = [
    [-range, -range],
    [range, -range],
    [-range, range],
    [range, range],
  ];
  for (const [x, y] of corners) {
    maxI = Math.max(maxI, Math.abs(inv[0][0] * x + inv[0][1] * y));
    maxJ = Math.max(maxJ, Math.abs(inv[1][0] * x + inv[1][1] * y));
  }
  const boundI = Math.ceil(maxI) + 1;
  const boundJ = Math.ceil(maxJ) + 1;

  const points: Vec2[] = [];
  for (let i = -boundI; i <= boundI; i++) {
    for (let j = -boundJ; j <= boundJ; j++) {
      const x = i * b1[0] + j * b2[0];
      const y = i * b1[1] + j * b2[1];
      if (Math.abs(x) <= range + 0.01 && Math.abs(y) <= range + 0.01) {
        points.push([x, y]);
      }
    }
  }

  const tileOrigins: Vec2[] = [];
  if (tileFundamentalDomain) {
    for (let i = -boundI; i <= boundI; i++) {
      for (let j = -boundJ; j <= boundJ; j++) {
        tileOrigins.push([
          i * b1[0] + j * b2[0],
          i * b1[1] + j * b2[1],
        ]);
      }
    }
  }

  const b1Len = Math.hypot(b1[0], b1[1]);
  const b2Len = Math.hypot(b2[0], b2[1]);
  const theta1 = Math.atan2(b1[1], b1[0]);
  const theta2 = Math.atan2(b2[1], b2[0]);
  let dTheta = theta2 - theta1;
  while (dTheta > Math.PI) dTheta -= 2 * Math.PI;
  while (dTheta < -Math.PI) dTheta += 2 * Math.PI;
  const angleDeg = Math.abs((dTheta * 180) / Math.PI);

  const arcRadiusUnits = Math.min(b1Len, b2Len) * 0.3;
  const arcStart = toSvg(
    arcRadiusUnits * Math.cos(theta1),
    arcRadiusUnits * Math.sin(theta1),
  );
  const arcEnd = toSvg(
    arcRadiusUnits * Math.cos(theta1 + dTheta),
    arcRadiusUnits * Math.sin(theta1 + dTheta),
  );
  const arcRadiusPx = arcRadiusUnits * scale;
  // SVG y is flipped vs. math y, so a math-CCW sweep is SVG-CW.
  const sweepFlag = dTheta > 0 ? 0 : 1;
  const largeArcFlag = Math.abs(dTheta) > Math.PI ? 1 : 0;
  const arcPath = `M ${arcStart.x} ${arcStart.y} A ${arcRadiusPx} ${arcRadiusPx} 0 ${largeArcFlag} ${sweepFlag} ${arcEnd.x} ${arcEnd.y}`;
  const arcMidAngle = theta1 + dTheta / 2;
  const arcLabelPos = toSvg(
    arcRadiusUnits * 1.7 * Math.cos(arcMidAngle),
    arcRadiusUnits * 1.7 * Math.sin(arcMidAngle),
  );

  const colorSet = new Set<string>();
  if (showBasis) for (const c of BASIS_COLORS) colorSet.add(c);
  for (const v of vectors) colorSet.add(v.color ?? DEFAULT_VECTOR_COLOR);

  const markerId = (color: string) =>
    `arrow-${uid}-${color.replace("#", "")}`;

  const arrow = (
    from: Vec2,
    to: Vec2,
    color: string,
    label: string | undefined,
    key: string | number,
  ) => {
    const a = toSvg(from[0], from[1]);
    const b = toSvg(to[0], to[1]);
    const dx = to[0] - from[0];
    const dy = to[1] - from[1];
    const len = Math.hypot(dx, dy) || 1;
    const lbl = toSvg(
      to[0] + (dx / len) * 0.45,
      to[1] + (dy / len) * 0.45,
    );
    return (
      <g key={key}>
        <line
          x1={a.x}
          y1={a.y}
          x2={b.x}
          y2={b.y}
          stroke={color}
          strokeWidth={2}
          markerEnd={`url(#${markerId(color)})`}
        />
        {label && (
          <text
            x={lbl.x}
            y={lbl.y}
            fill={color}
            fontSize={14}
            fontStyle="italic"
            fontFamily="var(--font-serif)"
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {label}
          </text>
        )}
      </g>
    );
  };

  const tileCorners = (ox: number, oy: number): string =>
    [
      [ox, oy],
      [ox + b1[0], oy + b1[1]],
      [ox + b1[0] + b2[0], oy + b1[1] + b2[1]],
      [ox + b2[0], oy + b2[1]],
    ]
      .map(([x, y]) => {
        const p = toSvg(x, y);
        return `${p.x},${p.y}`;
      })
      .join(" ");

  return (
    <figure className="my-6 flex flex-col items-center">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        width={size}
        height={size}
        role="img"
        aria-label={caption ?? "Lattice diagram"}
        className="rounded-lg overflow-hidden"
      >
        <defs>
          <clipPath id={`clip-${uid}`}>
            <rect width={size} height={size} />
          </clipPath>
          {[...colorSet].map((color) => (
            <marker
              key={color}
              id={markerId(color)}
              markerWidth={9}
              markerHeight={9}
              refX={7}
              refY={4.5}
              orient="auto-start-reverse"
            >
              <path d="M0,0 L0,9 L9,4.5 z" fill={color} />
            </marker>
          ))}
        </defs>

        <rect
          width={size}
          height={size}
          fill="hsl(var(--code-background))"
        />

        <g clipPath={`url(#clip-${uid})`}>
          {showAxes && (
            <g stroke="hsl(var(--border))" strokeWidth={1}>
              <line x1={0} y1={cy} x2={size} y2={cy} />
              <line x1={cx} y1={0} x2={cx} y2={size} />
            </g>
          )}

          {tileFundamentalDomain &&
            tileOrigins.map(([ox, oy], i) => (
              <polygon
                key={i}
                points={tileCorners(ox, oy)}
                fill="hsl(var(--accent) / 0.06)"
                stroke="hsl(var(--accent) / 0.25)"
                strokeWidth={0.75}
              />
            ))}

          {showFundamentalDomain && (
            <polygon
              points={tileCorners(0, 0)}
              fill="hsl(var(--accent) / 0.18)"
              stroke="hsl(var(--accent) / 0.55)"
              strokeWidth={1.25}
            />
          )}

          {points.map(([x, y], i) => {
            const p = toSvg(x, y);
            return (
              <circle
                key={i}
                cx={p.x}
                cy={p.y}
                r={2.5}
                fill="hsl(var(--foreground))"
                fillOpacity={0.85}
              />
            );
          })}

          {showStats && showBasis && (
            <g>
              <path
                d={arcPath}
                fill="none"
                stroke="hsl(var(--foreground))"
                strokeOpacity={0.55}
                strokeWidth={1.25}
              />
              <text
                x={arcLabelPos.x}
                y={arcLabelPos.y}
                fontSize={11}
                fontFamily="var(--font-mono)"
                fill="hsl(var(--foreground))"
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {angleDeg.toFixed(0)}°
              </text>
            </g>
          )}

          {showBasis &&
            arrow([0, 0], b1, BASIS_COLORS[0], basisLabels[0], "b1")}
          {showBasis &&
            arrow([0, 0], b2, BASIS_COLORS[1], basisLabels[1], "b2")}

          {vectors.map((v, i) =>
            arrow(
              [0, 0],
              v.v,
              v.color ?? DEFAULT_VECTOR_COLOR,
              v.label,
              `v${i}`,
            ),
          )}
        </g>

        {showStats && (
          <g>
            <rect
              x={8}
              y={size - 62}
              width={132}
              height={54}
              rx={4}
              fill="hsl(var(--background))"
              fillOpacity={0.9}
              stroke="hsl(var(--border))"
              strokeWidth={1}
            />
            <text
              x={16}
              y={size - 45}
              fontSize={11}
              fontFamily="var(--font-mono)"
              fill="hsl(var(--foreground))"
            >
              ‖{basisLabels[0]}‖ = {b1Len.toFixed(2)}
            </text>
            <text
              x={16}
              y={size - 30}
              fontSize={11}
              fontFamily="var(--font-mono)"
              fill="hsl(var(--foreground))"
            >
              ‖{basisLabels[1]}‖ = {b2Len.toFixed(2)}
            </text>
            <text
              x={16}
              y={size - 15}
              fontSize={11}
              fontFamily="var(--font-mono)"
              fill="hsl(var(--foreground))"
            >
              ∠ = {angleDeg.toFixed(1)}°
            </text>
          </g>
        )}
      </svg>
      {caption && (
        <figcaption className="text-muted text-sm mt-2 italic text-center max-w-md">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
