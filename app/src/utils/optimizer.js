/**
 * Optimizer Logic
 * 
 * Logic to find the best scrap for a given set of ordered pieces.
 * Algorithm: Best Fit Heuristic (simplified for the prompt's requirements)
 * 
 * Inputs:
 * - stock: Array of { id, width, height, quantity }
 * - orders: Array of { width, height, quantity }
 * 
 * Returns:
 * - result: { bestScrap, usageDetails } or null
 */

export const calculateBestOption = (stock, orders) => {
    // 1. Helper function: Normaliza inputs (Inglés/Español) y valida ceros
    const getVal = (obj, keys) => {
        for (const key of keys) {
            if (obj[key] !== undefined && obj[key] !== null && obj[key] !== '') {
                const val = Number(obj[key]);
                if (!isNaN(val) && val > 0) return val;
            }
        }
        return 0; // Invalid
    };

    // Flatten orders into individual pieces
    let pieces = [];
    orders.forEach(order => {
        const width = getVal(order, ['width', 'ancho']);
        const height = getVal(order, ['height', 'alto']);
        const quantity = getVal(order, ['quantity', 'cantidad']);

        if (width <= 0 || height <= 0 || quantity <= 0) return;

        for (let i = 0; i < quantity; i++) {
            pieces.push({
                width: width,
                height: height,
                originalIndex: i
            });
        }
    });

    if (pieces.length === 0) return null;

    // Sort pieces by area (largest first) to try to fit big ones first
    pieces.sort((a, b) => (b.width * b.height) - (a.width * a.height));

    let bestOption = null;
    let minWaste = Infinity;
    let maxPiecesFit = -1;

    // Evaluate each scrap
    stock.forEach(item => {
        // Normalize scrap dimensions
        const width = getVal(item, ['width', 'ancho']);
        const height = getVal(item, ['height', 'alto']);
        const quantity = getVal(item, ['quantity', 'cantidad']);

        if (width <= 0 || height <= 0 || quantity <= 0) return;

        const scrap = { ...item, width, height, quantity };

        // Try to fit pieces into this scrap
        // We need a 2D packing simulation. 
        // For this "Best Candidate" feature, we will use a simplified Shelf Packing or Guillotine packer logic.
        // We will simulate placing pieces one by one.

        const simulation = simpleGuillotinePack(scrap.width, scrap.height, pieces);

        // Calculate metrics
        const scrapArea = scrap.width * scrap.height;
        const usedArea = simulation.placedPieces.reduce((sum, p) => sum + (p.width * p.height), 0);

        // If no pieces fit, ignore
        if (simulation.placedPieces.length === 0) return;

        // "Priorizar el retazo que genere el menor desperdicio y donde quepan la mayor cantidad de piezas"
        // We prioritize Max Pieces first, then Min Waste.
        // Or weighted score.

        // Let's define the criteria:
        // 1. Max pieces count
        // 2. If tie, min waste (which is equivalent to smaller scrap area for same used area)

        // Note: The prompt says "Priorizar el retazo que genere el menor desperdicio ... y donde quepan la mayor cantidad de piezas".
        // Usually, fitting ALL pieces is the goal. 

        const waste = scrapArea - usedArea;
        const wastePercent = (waste / scrapArea) * 100;

        const candidate = {
            scrapId: scrap.id,
            totalPieces: pieces.length,
            fittedPieces: simulation.placedPieces.length,
            wastePercent: wastePercent,
            layout: simulation.placements, // coordinates
            scrapDims: { width: scrap.width, height: scrap.height },
            scrapName: scrap.name || `Retazo #${scrap.id}`
        };

        // Comparison Logic
        let isBetter = false;

        if (!bestOption) {
            isBetter = true;
        } else {
            if (candidate.fittedPieces > bestOption.fittedPieces) {
                isBetter = true;
            } else if (candidate.fittedPieces === bestOption.fittedPieces) {
                if (candidate.wastePercent < bestOption.wastePercent) {
                    isBetter = true;
                }
            }
        }

        if (isBetter) {
            bestOption = candidate;
        }
    });

    return bestOption;
};

/**
 * Best Fit Guillotine Packer
 * 
 * Logic:
 * 1. Best Fit: Checks all free rectangles to find the one where the piece fits "best" (Minimizing waste).
 * 2. Split Heuristic: "Maximize Larger Side Remainder" (Minimizing Remainder).
 *   - Chooses the split axis that leaves the largest area or most useful shape.
 */
const simpleGuillotinePack = (containerWidth, containerHeight, piecesToPack) => {
    let placedPieces = [];
    let placements = [];
    let freeRectangles = [{ x: 0, y: 0, w: Number(containerWidth), h: Number(containerHeight) }];

    // Heuristic: Selection of Free Rect
    // BAF: Best Area Fit (Smallest Area that fits)
    const scoreRect = (rect, pW, pH) => {
        const areaFit = rect.w * rect.h - pW * pH;
        // const shortSideFit = Math.min(rect.w - pW, rect.h - pH);
        return areaFit;
    };

    // Helper: Split a free rect into two new free rects after placement
    const splitRect = (rect, pW, pH) => {
        // We have two split strategies:
        // 1. Split Horizontally (Cut along X-axis visual? No, Cut Horizontal Line):
        //    Result H-Split:
        //      Right: x + pW, y, w - pW, pH
        //      Bottom: x, y + pH, w, h - pH (Bottom is full width)
        //
        // 2. Split Vertically:
        //    Result V-Split:
        //      Right: x + pW, y, w - pW, h (Right is full height)
        //      Bottom: x, y + pH, pW, h - pH

        const wRem = rect.w - pW;
        const hRem = rect.h - pH;

        // Strategy: Maximize the area (or min dimension) of the LARGER remaining rectangle.
        // Or simply "Split along shorter axis" (Minimize cut length).

        // If w < h (Tall rect): Cut length W is shorter -> Cut Horizontal.
        // H-Split creates Box (w * hRem) as the major piece.
        // If w >= h (Wide rect): Cut length H is shorter -> Cut Vertical.
        // V-Split creates Box (wRem * h) as the major piece.

        const splitHorizontally = rect.w < rect.h;

        const newRects = [];
        if (splitHorizontally) {
            // Horizontal Split (Bottom is big)
            if (hRem > 0) newRects.push({ x: rect.x, y: rect.y + pH, w: rect.w, h: hRem });
            if (wRem > 0) newRects.push({ x: rect.x + pW, y: rect.y, w: wRem, h: pH });
        } else {
            // Vertical Split (Right is big)
            if (wRem > 0) newRects.push({ x: rect.x + pW, y: rect.y, w: wRem, h: rect.h });
            if (hRem > 0) newRects.push({ x: rect.x, y: rect.y + pH, w: pW, h: hRem });
        }
        return newRects;
    };

    for (let i = 0; i < piecesToPack.length; i++) {
        const piece = piecesToPack[i];
        let bestScore = Infinity;
        let bestRectIndex = -1;
        let bestRotated = false;

        // Step 1: Find Best Fit
        // Iterate ALL free rectangles
        for (let j = 0; j < freeRectangles.length; j++) {
            const rect = freeRectangles[j];

            // Try Normal
            if (rect.w >= piece.width && rect.h >= piece.height) {
                const score = scoreRect(rect, piece.width, piece.height);
                if (score < bestScore) {
                    bestScore = score;
                    bestRectIndex = j;
                    bestRotated = false;
                }
            }
            // Try Rotated
            // Optimization: If square, don't check twice?
            if (piece.width !== piece.height) {
                if (rect.w >= piece.height && rect.h >= piece.width) {
                    const score = scoreRect(rect, piece.height, piece.width);
                    if (score < bestScore) {
                        bestScore = score;
                        bestRectIndex = j;
                        bestRotated = true;
                    }
                }
            }
        }

        // Step 2: Place and Split
        if (bestRectIndex !== -1) {
            const rect = freeRectangles[bestRectIndex];
            const pW = bestRotated ? piece.height : piece.width;
            const pH = bestRotated ? piece.width : piece.height;

            // Record Placement
            placements.push({
                x: rect.x,
                y: rect.y,
                width: pW,
                height: pH,
                id: piece.originalIndex
            });
            placedPieces.push(piece);

            // Split
            const newRects = splitRect(rect, pW, pH);

            // Update Free Rects
            freeRectangles.splice(bestRectIndex, 1);
            freeRectangles.push(...newRects);
        }
    }

    return { placedPieces, placements };
};
