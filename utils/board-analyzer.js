// Analizador del tablón de Biwenger para seguimiento de presupuestos
// Este módulo procesa los movimientos del tablón y calcula los presupuestos de cada equipo

const INITIAL_BUDGET = 11836080; // Presupuesto inicial por equipo

class BoardAnalyzer {
    constructor() {
        this.teams = new Map();
        this.movements = [];
        this.processedEntries = new Set();
    }

    /**
     * Inicializa los equipos con el presupuesto inicial
     */
    initializeTeams(users) {
        users.forEach(user => {
            this.teams.set(user.id, {
                id: user.id,
                name: user.name,
                position: user.position || 0,
                points: user.points || 0,
                initialBudget: INITIAL_BUDGET,
                currentBudget: user.balance || INITIAL_BUDGET,
                balance: user.balance || INITIAL_BUDGET,
                spent: 0,
                received: 0,
                transactions: [],
                lastUpdate: new Date()
            });
        });
    }

    /**
     * Procesa las entradas del tablón
     */
    processBoard(boardEntries) {
        if (!boardEntries || !Array.isArray(boardEntries)) {
            console.log('[BoardAnalyzer] No board entries to process');
            return;
        }

        console.log(`[BoardAnalyzer] Processing ${boardEntries.length} board entries`);
        
        // Ordenar por fecha (más antiguas primero para procesar cronológicamente)
        const sortedEntries = [...boardEntries].sort((a, b) => a.date - b.date);
        
        sortedEntries.forEach(entry => {
            this.processEntry(entry);
        });

        // Recalcular presupuestos basados en los movimientos
        this.recalculateBudgets();
    }

    /**
     * Procesa una entrada individual del tablón
     */
    processEntry(entry) {
        // Evitar procesar la misma entrada múltiples veces
        const entryId = `${entry.type}_${entry.date}_${JSON.stringify(entry.content).substring(0, 50)}`;
        if (this.processedEntries.has(entryId)) {
            return;
        }
        this.processedEntries.add(entryId);

        console.log(`[BoardAnalyzer] Processing entry type: ${entry.type}`, entry);

        switch (entry.type) {
            case 'playerMovements':
                this.processPlayerMovements(entry);
                break;
            case 'transfer':
                this.processTransferEntries(entry);
                break;
            case 'market':
                this.processMarketEntries(entry);
                break;
            case 'leagueReset':
                this.handleLeagueReset(entry);
                break;
            case 'lineup':
            case 'adminText':
            case 'roundStarted':
                // Estos no afectan al presupuesto
                break;
            default:
                console.log(`[BoardAnalyzer] Unknown entry type: ${entry.type}`);
        }
    }

    /**
     * Procesa movimientos de jugadores (traspasos entre equipos de LaLiga, no de nuestra liga)
     */
    processPlayerMovements(entry) {
        if (!entry.content || !Array.isArray(entry.content)) {
            return;
        }

        // Los playerMovements son traspasos entre equipos reales (Valencia, Athletic, etc.)
        // NO son movimientos de nuestra liga, así que los ignoramos para el cálculo de presupuestos
        console.log('[BoardAnalyzer] Skipping playerMovements (real teams transfers)');
    }

    /**
     * Procesa transferencias (VENTAS de jugadores)
     */
    processTransferEntries(entry) {
        if (!entry.content || !Array.isArray(entry.content)) {
            console.log('[BoardAnalyzer] No content in transfer entry');
            return;
        }

        // En los transfers, el campo "from" es quien VENDE el jugador (recibe dinero)
        entry.content.forEach(transfer => {
            if (transfer.from && transfer.from.id && transfer.amount) {
                const sellerId = transfer.from.id;
                const sellerName = transfer.from.name;
                const amount = transfer.amount;
                const playerId = transfer.player;

                console.log(`[BoardAnalyzer] Transfer: ${sellerName} sells player ${playerId} for €${amount}`);

                // El vendedor recibe dinero
                this.updateTeamBudget(sellerId, sellerName, amount, 'income', `Venta jugador ${playerId}`);

                // Registrar el movimiento
                this.movements.push({
                    date: new Date(entry.date * 1000),
                    type: 'sale',
                    sellerId: sellerId,
                    sellerName: sellerName,
                    playerId: playerId,
                    amount: amount
                });
            }
        });
    }

    /**
     * Procesa entradas de mercado (COMPRAS con pujas)
     */
    processMarketEntries(entry) {
        if (!entry.content || !Array.isArray(entry.content)) {
            console.log('[BoardAnalyzer] No content in market entry');
            return;
        }

        // En market, "to" es quien COMPRA el jugador (gasta dinero)
        entry.content.forEach(purchase => {
            if (purchase.to && purchase.to.id && purchase.amount) {
                const buyerId = purchase.to.id;
                const buyerName = purchase.to.name;
                const amount = purchase.amount;
                const playerId = purchase.player;

                console.log(`[BoardAnalyzer] Market: ${buyerName} buys player ${playerId} for €${amount}`);

                // El comprador gasta dinero
                this.updateTeamBudget(buyerId, buyerName, amount, 'expense', `Compra jugador ${playerId}`);

                // Registrar el movimiento
                this.movements.push({
                    date: new Date(entry.date * 1000),
                    type: 'purchase',
                    buyerId: buyerId,
                    buyerName: buyerName,
                    playerId: playerId,
                    amount: amount,
                    bids: purchase.bids || []
                });

                // Procesar las pujas perdedoras (opcional - para estadísticas)
                if (purchase.bids) {
                    purchase.bids.forEach(bid => {
                        if (bid.user && bid.user.id !== buyerId) {
                            console.log(`[BoardAnalyzer] Failed bid: ${bid.user.name} bid €${bid.amount} for player ${playerId}`);
                        }
                    });
                }
            }
        });
    }

    /**
     * Actualiza el presupuesto de un equipo
     */
    updateTeamBudget(teamId, teamName, amount, type, description) {
        if (!teamId || !amount) {
            console.log('[BoardAnalyzer] Missing teamId or amount');
            return;
        }

        // Buscar o crear el equipo
        let team = this.teams.get(teamId);
        
        if (!team) {
            // Si el equipo no existe, lo creamos
            console.log(`[BoardAnalyzer] Creating new team: ${teamName} (${teamId})`);
            team = {
                id: teamId,
                name: teamName || `Team ${teamId}`,
                position: 0,
                points: 0,
                initialBudget: INITIAL_BUDGET,
                currentBudget: INITIAL_BUDGET,
                balance: INITIAL_BUDGET,
                spent: 0,
                received: 0,
                transactions: [],
                lastUpdate: new Date()
            };
            this.teams.set(teamId, team);
        }

        // Actualizar el presupuesto
        if (type === 'income') {
            team.currentBudget += amount;
            team.received += amount;
            team.transactions.push({
                date: new Date(),
                type: 'income',
                amount: amount,
                description: description || `Ingreso: +€${this.formatMoney(amount)}`
            });
            console.log(`[BoardAnalyzer] ${team.name} receives €${amount}. New budget: €${team.currentBudget}`);
        } else if (type === 'expense') {
            team.currentBudget -= amount;
            team.spent += amount;
            team.transactions.push({
                date: new Date(),
                type: 'expense',
                amount: amount,
                description: description || `Gasto: -€${this.formatMoney(amount)}`
            });
            console.log(`[BoardAnalyzer] ${team.name} spends €${amount}. New budget: €${team.currentBudget}`);
        }

        team.lastUpdate = new Date();
    }

    /**
     * Maneja el reset de la liga
     */
    handleLeagueReset(entry) {
        console.log('[BoardAnalyzer] League reset detected - all teams return to initial budget');
        
        // Reiniciar todos los presupuestos
        this.teams.forEach(team => {
            team.currentBudget = INITIAL_BUDGET;
            team.spent = 0;
            team.received = 0;
            team.transactions = [{
                date: new Date(entry.date * 1000),
                type: 'reset',
                amount: INITIAL_BUDGET,
                description: 'Liga reiniciada - Presupuesto inicial restaurado'
            }];
            team.lastUpdate = new Date(entry.date * 1000);
        });
        
        // Limpiar movimientos anteriores
        this.movements = [];
        console.log('[BoardAnalyzer] All teams reset to €' + this.formatMoney(INITIAL_BUDGET));
    }

    /**
     * Recalcula los presupuestos basándose en el balance actual de la API
     */
    recalculateBudgets() {
        // Si tenemos información del balance real de la API, úsala como referencia
        this.teams.forEach(team => {
            // Solo para teams que ya estaban en la API original
            if (team.balance && team.balance !== INITIAL_BUDGET) {
                // El balance de la API ya tiene los cambios aplicados
                console.log(`[BoardAnalyzer] Team ${team.name}: API balance=${team.balance}, calculated=${team.currentBudget}`);
            }
        });
    }

    /**
     * Obtiene el resumen de presupuestos
     */
    getBudgetSummary() {
        const summary = {
            teams: Array.from(this.teams.values()).map(team => ({
                ...team,
                budgetPercentage: ((team.currentBudget / INITIAL_BUDGET) * 100).toFixed(1),
                netFlow: team.received - team.spent
            })).sort((a, b) => b.currentBudget - a.currentBudget),
            movements: this.movements.sort((a, b) => b.date - a.date),
            statistics: this.calculateStatistics()
        };

        return summary;
    }

    /**
     * Calcula estadísticas generales
     */
    calculateStatistics() {
        const teams = Array.from(this.teams.values());
        const totalTransactions = this.movements.length;
        const totalVolume = this.movements.reduce((sum, m) => sum + (m.amount || 0), 0);
        
        // Encontrar el mayor gastador
        const biggestSpender = teams.reduce((max, team) => 
            team.spent > (max?.spent || 0) ? team : max, null);
        
        // Encontrar el que más ha ingresado
        const biggestEarner = teams.reduce((max, team) => 
            team.received > (max?.received || 0) ? team : max, null);
        
        // Equipo más activo
        const mostActive = teams.reduce((max, team) => 
            team.transactions.length > (max?.transactions.length || 0) ? team : max, null);
        
        // Presupuesto promedio
        const averageBudget = teams.length > 0 ? 
            teams.reduce((sum, team) => sum + team.currentBudget, 0) / teams.length : 
            INITIAL_BUDGET;
        
        return {
            totalTransactions,
            totalVolume,
            averageBudget,
            biggestSpender: biggestSpender ? {
                name: biggestSpender.name,
                amount: biggestSpender.spent
            } : null,
            biggestEarner: biggestEarner ? {
                name: biggestEarner.name,
                amount: biggestEarner.received
            } : null,
            mostActive: mostActive ? {
                name: mostActive.name,
                transactions: mostActive.transactions.length
            } : null,
            lastUpdate: new Date()
        };
    }

    /**
     * Formatea cantidades de dinero
     */
    formatMoney(amount) {
        if (!amount) return '0';
        
        const absAmount = Math.abs(amount);
        if (absAmount >= 1000000) {
            return `${(amount / 1000000).toFixed(1)}M`;
        } else if (absAmount >= 1000) {
            return `${(amount / 1000).toFixed(0)}K`;
        } else {
            return amount.toString();
        }
    }

    /**
     * Exporta los datos para visualización
     */
    exportData() {
        return {
            teams: Array.from(this.teams.values()),
            movements: this.movements,
            statistics: this.calculateStatistics(),
            initialBudget: INITIAL_BUDGET,
            timestamp: new Date()
        };
    }
}

module.exports = BoardAnalyzer;