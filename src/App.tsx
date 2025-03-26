import React, { useState } from 'react';
import { Grid, Copy, Sparkles, Trash2, ChevronDown } from 'lucide-react';

interface GridConfig {
  columns: number;
  rows: number;
  columnGap: number;
  rowGap: number;
}

interface GridArea {
  id: string;
  rowStart: number;
  rowEnd: number;
  colStart: number;
  colEnd: number;
  color: string;
}

const AREA_COLORS = [
  'bg-gradient-to-br from-blue-500 to-blue-600',
  'bg-gradient-to-br from-emerald-500 to-emerald-600',
  'bg-gradient-to-br from-amber-500 to-amber-600',
  'bg-gradient-to-br from-rose-500 to-rose-600',
  'bg-gradient-to-br from-violet-500 to-violet-600',
  'bg-gradient-to-br from-pink-500 to-pink-600',
  'bg-gradient-to-br from-teal-500 to-teal-600',
  'bg-gradient-to-br from-orange-500 to-orange-600',
];

const CSS_COLORS = [
  'linear-gradient(135deg, #3B82F6, #2563EB)',
  'linear-gradient(135deg, #10B981, #059669)',
  'linear-gradient(135deg, #F59E0B, #D97706)',
  'linear-gradient(135deg, #F43F5E, #E11D48)',
  'linear-gradient(135deg, #8B5CF6, #7C3AED)',
  'linear-gradient(135deg, #EC4899, #DB2777)',
  'linear-gradient(135deg, #14B8A6, #0D9488)',
  'linear-gradient(135deg, #F97316, #EA580C)',
];

function App() {
  const [gridConfig, setGridConfig] = useState<GridConfig>({
    columns: 4,
    rows: 3,
    columnGap: 4,
    rowGap: 4,
  });

  const [gridAreas, setGridAreas] = useState<GridArea[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [startCell, setStartCell] = useState<{ row: number; col: number } | null>(null);
  const [currentCell, setCurrentCell] = useState<{ row: number; col: number } | null>(null);
  const [showTailwind, setShowTailwind] = useState(true);

  const generateTailwindCode = () => {
    const parentClasses = [
      'grid',
      `grid-cols-${gridConfig.columns}`,
      `grid-rows-${gridConfig.rows}`,
      `gap-${gridConfig.columnGap}`,
    ].join(' ');

    const gridItems = gridAreas.map((area: GridArea) => {
      const classes = [
        `row-start-${area.rowStart}`,
        `row-span-${area.rowEnd - area.rowStart}`,
        `col-start-${area.colStart}`,
        `col-span-${area.colEnd - area.colStart}`,
        area.color,
        'rounded-xl shadow-lg',
      ].join(' ');
      return `  <div class="${classes}"></div>`;
    });

    return `<div class="${parentClasses}">\n${gridItems.join('\n')}\n</div>`;
  };

  const generateCSSCode = () => {
    const parentStyles = [
      'display: grid;',
      `grid-template-columns: repeat(${gridConfig.columns}, 1fr);`,
      `grid-template-rows: repeat(${gridConfig.rows}, 1fr);`,
      `gap: ${gridConfig.rowGap * 0.25}rem;`,
    ];

    const cssRules = gridAreas.map((area: GridArea, index: number) => `
.grid-area-${index + 1} {
  grid-row: ${area.rowStart} / ${area.rowEnd};
  grid-column: ${area.colStart} / ${area.colEnd};
  background: ${CSS_COLORS[index % CSS_COLORS.length]};
  border-radius: 0.75rem;
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
}`).join('\n');

    const htmlCode = gridAreas.map((_: GridArea, index: number) => 
      `  <div class="grid-area-${index + 1}"></div>`
    ).join('\n');

    return {
      css: `.grid-container {\n  ${parentStyles.join('\n  ')}\n}\n${cssRules}`,
      html: `<div class="grid-container">\n${htmlCode}\n</div>`,
    };
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleMouseDown = (row: number, col: number) => {
    setIsDragging(true);
    setStartCell({ row, col });
    setCurrentCell({ row, col });
  };

  const handleMouseEnter = (row: number, col: number) => {
    if (isDragging) {
      setCurrentCell({ row, col });
    }
  };

  const handleMouseUp = () => {
    if (isDragging && startCell && currentCell) {
      const rowStart = Math.min(startCell.row, currentCell.row);
      const rowEnd = Math.max(startCell.row, currentCell.row) + 1;
      const colStart = Math.min(startCell.col, currentCell.col);
      const colEnd = Math.max(startCell.col, currentCell.col) + 1;

      setGridAreas([
        ...gridAreas,
        {
          id: `area-${Date.now()}`,
          rowStart,
          rowEnd,
          colStart,
          colEnd,
          color: AREA_COLORS[gridAreas.length % AREA_COLORS.length],
        },
      ]);
    }
    setIsDragging(false);
    setStartCell(null);
    setCurrentCell(null);
  };

  const isInSelection = (row: number, col: number) => {
    if (!isDragging || !startCell || !currentCell) return false;

    const rowStart = Math.min(startCell.row, currentCell.row);
    const rowEnd = Math.max(startCell.row, currentCell.row);
    const colStart = Math.min(startCell.col, currentCell.col);
    const colEnd = Math.max(startCell.col, currentCell.col);

    return row >= rowStart && row <= rowEnd && col >= colStart && col <= colEnd;
  };

  const getGridAreaColor = (row: number, col: number) => {
    const area = gridAreas.find(
      (area: GridArea) =>
        row >= area.rowStart &&
        row < area.rowEnd &&
        col >= area.colStart &&
        col < area.colEnd
    );
    return area?.color || '';
  };

  const renderGrid = () => {
    const cells = [];
    for (let row = 1; row <= gridConfig.rows; row++) {
      for (let col = 1; col <= gridConfig.columns; col++) {
        const inSelection = isInSelection(row, col);
        const areaColor = getGridAreaColor(row, col);
        cells.push(
          <div
            key={`${row}-${col}`}
            className={`
              grid-cell
              border border-purple-500/20
              rounded-lg
              cursor-pointer
              ${inSelection ? 'shadow-lg bg-purple-500/30 shadow-purple-500/20' : ''}
              ${areaColor || 'bg-gray-800/50 hover:bg-gray-800/80'}
            `}
            onMouseDown={() => handleMouseDown(row, col)}
            onMouseEnter={() => handleMouseEnter(row, col)}
          />
        );
      }
    }
    return cells;
  };

  const renderCode = () => {
    if (showTailwind) {
      return (
        <pre className="overflow-x-auto p-6 rounded-2xl border backdrop-blur-xl bg-gray-900/50 border-purple-500/20">
          <code className="text-sm text-purple-300">{generateTailwindCode()}</code>
        </pre>
      );
    }

    const { css, html } = generateCSSCode();
    return (
      <div className="space-y-6">
        <div>
          <h3 className="mb-2 text-sm font-medium text-purple-300">CSS</h3>
          <pre className="overflow-x-auto p-6 rounded-2xl border backdrop-blur-xl bg-gray-900/50 border-purple-500/20">
            <code className="text-sm text-purple-300">{css}</code>
          </pre>
        </div>
        <div>
          <h3 className="mb-2 text-sm font-medium text-purple-300">HTML</h3>
          <pre className="overflow-x-auto p-6 rounded-2xl border backdrop-blur-xl bg-gray-900/50 border-purple-500/20">
            <code className="text-sm text-purple-300">{html}</code>
          </pre>
        </div>
      </div>
    );
  };

  return (
    <div 
      className="p-8 min-h-screen font-sans"
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="mx-auto max-w-7xl">
        <div className="flex gap-4 items-center mb-12">
          <div className="p-3 rounded-2xl bg-purple-500/20">
            <Grid className="w-8 h-8 text-purple-400" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              Grid Generator
            </h1>
            <p className="mt-1 text-gray-400">Create beautiful grid layouts with Tailwind CSS</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="space-y-8">
            <div className="p-6 rounded-2xl border backdrop-blur-xl bg-gray-900/50 border-purple-500/20">
              <div className="flex gap-2 items-center mb-6">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <h2 className="text-xl font-semibold">Grid Configuration</h2>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2 text-sm text-gray-400">Columns</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={gridConfig.columns}
                    onChange={(e) =>
                      setGridConfig({ ...gridConfig, columns: parseInt(e.target.value) || 1 })
                    }
                    className="px-4 py-3 w-full text-white rounded-xl border transition-colors bg-gray-800/50 border-purple-500/20 focus:outline-none focus:border-purple-500/50"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm text-gray-400">Rows</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={gridConfig.rows}
                    onChange={(e) =>
                      setGridConfig({ ...gridConfig, rows: parseInt(e.target.value) || 1 })
                    }
                    className="px-4 py-3 w-full text-white rounded-xl border transition-colors bg-gray-800/50 border-purple-500/20 focus:outline-none focus:border-purple-500/50"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm text-gray-400">Column Gap</label>
                  <input
                    type="number"
                    min="0"
                    max="16"
                    value={gridConfig.columnGap}
                    onChange={(e) =>
                      setGridConfig({ ...gridConfig, columnGap: parseInt(e.target.value) || 0 })
                    }
                    className="px-4 py-3 w-full text-white rounded-xl border transition-colors bg-gray-800/50 border-purple-500/20 focus:outline-none focus:border-purple-500/50"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm text-gray-400">Row Gap</label>
                  <input
                    type="number"
                    min="0"
                    max="16"
                    value={gridConfig.rowGap}
                    onChange={(e) =>
                      setGridConfig({ ...gridConfig, rowGap: parseInt(e.target.value) || 0 })
                    }
                    className="px-4 py-3 w-full text-white rounded-xl border transition-colors bg-gray-800/50 border-purple-500/20 focus:outline-none focus:border-purple-500/50"
                  />
                </div>
              </div>
            </div>

            <p className="block text-gray-400 md:hidden">The grid is not mobile friendly as it involves drag-and-drop or dragging a touch screen device.</p>

            <div
              className="grid p-6 rounded-2xl border backdrop-blur-xl bg-gray-900/50 grid-preview border-purple-500/20"
              style={{
                gridTemplateColumns: `repeat(${gridConfig.columns}, 1fr)`,
                gridTemplateRows: `repeat(${gridConfig.rows}, 1fr)`,
                gap: `${gridConfig.rowGap * 0.25}rem`,
                aspectRatio: '1/1',
              }}
            >
              {renderGrid()}
            </div>
          </div>

          <div className="space-y-8">

            <div className="flex justify-end lg:justify-start">
              <button
                onClick={() => setGridAreas([])}
                className="flex gap-2 items-center px-6 py-3 text-red-500 rounded-xl border transition-colors bg-red-500/10 hover:bg-red-500/20 border-red-500/20"
              >
                <Trash2 className="w-4 h-4" />
                Reset Grid Areas
              </button>
            </div>

            <div className="p-6 rounded-2xl border backdrop-blur-xl bg-gray-900/50 border-purple-500/20">
              <div className="flex flex-wrap justify-between items-center mb-6 sm:flex-nowrap">
                <div className="flex gap-2 items-center mb-2 w-100 sm:w-auto">
                  <Copy className="w-5 h-5 text-purple-400" />
                  <h2 className="text-xl font-semibold">Generated Code</h2>
                </div>
                <div className="flex flex-wrap gap-4 items-center sm:flex-nowrap">
                  <div className="flex gap-2 items-center">
                    <select
                      value={showTailwind ? 'tailwind' : 'css'}
                      onChange={(e) => setShowTailwind(e.target.value === 'tailwind')}
                      className="py-2 pr-10 pl-4 text-sm text-white rounded-xl border transition-colors appearance-none bg-gray-800/50 border-purple-500/20 focus:outline-none focus:border-purple-500/50"
                    >
                      <option value="tailwind">Tailwind CSS</option>
                      <option value="css">CSS/HTML</option>
                    </select>
                    <ChevronDown className="-ml-8 w-4 h-4 text-purple-400 pointer-events-none" />
                  </div>
                  <button
                    onClick={() => copyToClipboard(showTailwind ? generateTailwindCode() : `${generateCSSCode().css}\n\n${generateCSSCode().html}`)}
                    className="flex gap-2 items-center px-6 py-2 text-purple-400 rounded-xl border transition-colors bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/20"
                  >
                    <Copy className="w-4 h-4" />
                    Copy
                  </button>
                </div>
              </div>
              {renderCode()}
            </div>

            <div className="p-6 rounded-2xl border backdrop-blur-xl bg-gray-900/50 border-purple-500/20">
              <h2 className="mb-4 text-xl font-semibold">Instructions</h2>
              <ul className="space-y-3 text-gray-400">
                <li className="flex gap-2 items-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  Click and drag to create grid areas
                </li>
                <li className="flex gap-2 items-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  Create multiple areas by clicking and dragging again
                </li>
                <li className="flex gap-2 items-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  Each area will have a unique gradient color
                </li>
                <li className="flex gap-2 items-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  Use the reset button to clear all grid areas
                </li>
                <li className="flex gap-2 items-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  Switch between Tailwind and CSS/HTML output using the dropdown
                </li>
                <li className="flex gap-2 items-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  Click the copy button to copy the code to your clipboard
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;