const getVal = (obj, keys) => {
    for (const key of keys) {
        if (obj[key] !== undefined && obj[key] !== null && obj[key] !== '') {
            const val = Number(obj[key]);
            if (!isNaN(val) && val > 0) return val;
        }
    }
    return 0;
};

const findBestScrap = (availableStock, piecesToPack) => {
    let bestOption = null;

    availableStock.forEach(item => {
        if (item.quantity <= 0) return;

        const scrapW = getVal(item, ['width', 'ancho']);
        const scrapH = getVal(item, ['height', 'alto']);

        if (scrapW <= 0 || scrapH <= 0) return;

        const simulation = advancedGuillotinePack(scrapW, scrapH, piecesToPack);

        if (simulation.placedPieces.length === 0) return;

        const scrapArea = scrapW * scrapH;
        const usedArea = simulation.placedPieces.reduce((sum, p) => sum + (p.width * p.height), 0);
        const waste = scrapArea - usedArea;
        const wastePercent = (waste / scrapArea) * 100;

        const candidate = {
            scrapId: item.id,
            totalPieces: piecesToPack.length,
            fittedPieces: simulation.placedPieces.length,
            wastePercent: wastePercent,
            layout: simulation.placements,
            remainingPiecesRef: piecesToPack.filter(p => !simulation.placedPieces.includes(p)),
            placedPiecesRef: simulation.placedPieces,
            scrapDims: { width: scrapW, height: scrapH },
            scrapName: item.name || `Retazo #${item.id}`,
            originalItem: item
        };

        let isBetter = false;
        if (!bestOption) {
            isBetter = true;
        } else {
            if (candidate.fittedPieces > bestOption.fittedPieces) {
                isBetter = true;
            }
            else if (candidate.fittedPieces === bestOption.fittedPieces) {
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

export const calculateAllCuts = (stock, orders) => {
    let tempStock = stock.map(item => ({
        ...item,
        quantity: getVal(item, ['quantity', 'cantidad'])
    })).filter(i => i.quantity > 0);

    let allPieces = [];
    orders.forEach(order => {
        const qty = getVal(order, ['quantity', 'cantidad', 'qty']);
        const w = getVal(order, ['width', 'ancho']);
        const h = getVal(order, ['height', 'alto']);
        if (w <= 0 || h <= 0) return;
        for (let i = 0; i < qty; i++) {
            allPieces.push({
                width: w,
                height: h,
                originalIndex: i
            });
        }
    });

    allPieces.sort((a, b) => (b.width * b.height) - (a.width * a.height));

    const usedScraps = [];
    let pendingPieces = [...allPieces];
    let safetyCounter = 0;

    while (pendingPieces.length > 0 && safetyCounter < 100) {
        safetyCounter++;

        const solution = findBestScrap(tempStock, pendingPieces);

        if (!solution) {
            break;
        }

        const cutList = solution.placedPiecesRef.map((p, idx) =>
            `• ${p.width} x ${p.height} (Pieza)`
        );

        usedScraps.push({
            ...solution,
            cutList: cutList,
            cutId: `cut-${usedScraps.length + 1}`
        });

        const placedSet = new Set(solution.placedPiecesRef);
        pendingPieces = pendingPieces.filter(p => !placedSet.has(p));

        const stockItem = tempStock.find(i => i.id === solution.scrapId);
        if (stockItem) {
            stockItem.quantity -= 1;
        }
    }

    return {
        usedScraps: usedScraps,
        pendingOrders: pendingPieces
    };
};

export const calculateBestOption = (stock, orders) => {
    const res = calculateAllCuts(stock, orders);
    if (!res.usedScraps || res.usedScraps.length === 0) return null;
    return res.usedScraps[0];
};

const advancedGuillotinePack = (containerWidth, containerHeight, piecesToPack) => {
    let placedPieces = [];
    let placements = [];
    let freeRects = [{ x: 0, y: 0, w: Number(containerWidth), h: Number(containerHeight) }];

    piecesToPack.forEach(piece => {
        let bestScore = Infinity;
        let bestRectIndex = -1;
        let bestRotated = false;

        for (let i = 0; i < freeRects.length; i++) {
            const rect = freeRects[i];

            if (rect.w >= piece.width && rect.h >= piece.height) {
                const score = (rect.w * rect.h) - (piece.width * piece.height);
                if (score < bestScore) {
                    bestScore = score;
                    bestRectIndex = i;
                    bestRotated = false;
                }
            }

            if (piece.width !== piece.height) {
                if (rect.w >= piece.height && rect.h >= piece.width) {
                    const score = (rect.w * rect.h) - (piece.height * piece.width);
                    if (score < bestScore) {
                        bestScore = score;
                        bestRectIndex = i;
                        bestRotated = true;
                    }
                }
            }
        }

        if (bestRectIndex !== -1) {
            const rect = freeRects[bestRectIndex];
            const pW = bestRotated ? piece.height : piece.width;
            const pH = bestRotated ? piece.width : piece.height;

            placements.push({
                x: rect.x,
                y: rect.y,
                width: pW,
                height: pH,
                id: piece.originalIndex
            });
            placedPieces.push(piece);

            const wRem = rect.w - pW;
            const hRem = rect.h - pH;

            let splitHorizontal = true;

            if (wRem * rect.h > rect.w * hRem) {
                splitHorizontal = false;
            } else {
                splitHorizontal = true;
            }

            let newRects = [];
            if (splitHorizontal) {
                if (hRem > 0) newRects.push({ x: rect.x, y: rect.y + pH, w: rect.w, h: hRem });
                if (wRem > 0) newRects.push({ x: rect.x + pW, y: rect.y, w: wRem, h: pH });
            } else {
                if (wRem > 0) newRects.push({ x: rect.x + pW, y: rect.y, w: wRem, h: rect.h });
                if (hRem > 0) newRects.push({ x: rect.x, y: rect.y + pH, w: pW, h: hRem });
            }

            freeRects.splice(bestRectIndex, 1);
            freeRects.push(...newRects);
        }
    });

    return { placedPieces, placements };
};
