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
                currentBudget: INITIAL_BUDGET,
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

        console.log(`[BoardAnalyzer] Processing entry type: ${entry.type}`);

        switch (entry.type) {
            case 'playerMovements':
                this.processPlayerMovements(entry);
                break;
            case 'transfer':
                this.processTransfer(entry);
                break;
            case 'market':
                this.processMarketEntry(entry);
                break;
            case 'lineup':
                // Las alineaciones no afectan al presupuesto
                break;
            case 'adminText':
            case 'leagueReset':
                // Mensajes administrativos
                if (entry.type === 'leagueReset') {
                    this.handleLeagueReset(entry);
                }
                break;
            default:
                console.log(`[BoardAnalyzer] Unknown entry type: ${entry.type}`);
        }
    }

    /**
     * Procesa movimientos de jugadores (traspasos entre equipos)
     */
    processPlayerMovements(entry) {
        if (!entry.content || !Array.isArray(entry.content)) {
            return;
        }

        entry.content.forEach(movement => {
            if (movement.type === 'transfer' || movement.type === 'sale') {
                const transaction = {
                    date: new Date(entry.date * 1000),
                    type: 'transfer',
                    player: movement.player || {},
                    from: movement.from || {},
                    to: movement.to || {},
                    amount: movement.amount || movement.price || 0,
                    bonus: movement.bonus || 0
                };

                // Registrar el movimiento
                this.movements.push(transaction);

                // Actualizar presupuestos de los equipos involucrados
                this.updateTeamBudget(movement.from, transaction.amount, 'income');
                this.updateTeamBudget(movement.to, transaction.amount, 'expense');
            } else if (movement.type === 'market' || movement.type === 'purchase') {
                const transaction = {
                    date: new Date(entry.date * 1000),
                    type: 'market',
                    player: movement.player || {},
                    team: movement.user || movement.team || {},
                    amount: movement.amount || movement.price || 0,
                    action: movement.action || 'buy'
                };

                this.movements.push(transaction);

                if (transaction.action === 'buy') {
                    this.updateTeamBudget(movement.user || movement.team, transaction.amount, 'expense');
                } else if (transaction.action === 'sell') {
                    this.updateTeamBudget(movement.user || movement.team, transaction.amount, 'income');
                }
            }
        });
    }

    /**
     * Procesa una transferencia directa
     */
    processTransfer(entry) {
        if (!entry.content) return;

        const content = entry.content;
        const transaction = {
            date: new Date(entry.date * 1000),
            type: 'transfer',
            player: content.player || {},
            from: content.from || {},
            to: content.to || {},
            amount: content.amount || content.price || 0
        };

        this.movements.push(transaction);

        // Actualizar presupuestos
        if (content.from) {
            this.updateTeamBudget(content.from, transaction.amount, 'income');
        }
        if (content.to) {
            this.updateTeamBudget(content.to, transaction.amount, 'expense');
        }
    }

    /**
     * Procesa una entrada de mercado
     */
    processMarketEntry(entry) {
        if (!entry.content) return;

        const content = entry.content;
        const transaction = {
            date: new Date(entry.date * 1000),
            type: 'market',
            player: content.player || {},
            team: content.user || content.team || {},
            amount: content.amount || content.price || 0,
            action: content.action || 'buy'
        };

        this.movements.push(transaction);

        const teamData = content.user || content.team;
        if (transaction.action === 'buy' || transaction.action === 'purchase') {
            this.updateTeamBudget(teamData, transaction.amount, 'expense');
        } else if (transaction.action === 'sell' || transaction.action === 'sale') {
            this.updateTeamBudget(teamData, transaction.amount, 'income');
        }
    }

    /**
     * Actualiza el presupuesto de un equipo
     */
    updateTeamBudget(teamData, amount, type) {
        if (!teamData || !amount) return;

        // Buscar el equipo por ID o nombre
        let team = null;
        if (teamData.id) {
            team = this.teams.get(teamData.id);
        } else if (teamData.name) {
            // Buscar por nombre si no hay ID
            for (const [id, t] of this.teams) {
                if (t.name === teamData.name) {
                    team = t;
                    break;
                }
            }
        }

        if (!team) {
            console.log(`[BoardAnalyzer] Team not found:`, teamData);
            return;
        }

        // Actualizar el presupuesto
        if (type === 'income') {
            team.currentBudget += amount;
            team.received += amount;
            team.transactions.push({
                date: new Date(),
                type: 'income',
                amount: amount,
                description: `Venta/Ingreso: +€${this.formatMoney(amount)}`
            });
        } else if (type === 'expense') {
            team.currentBudget -= amount;
            team.spent += amount;
            team.transactions.push({
                date: new Date(),
                type: 'expense',
                amount: amount,
                description: `Compra/Gasto: -€${this.formatMoney(amount)}`
            });
        }

        team.lastUpdate = new Date();
        console.log(`[BoardAnalyzer] Updated budget for ${team.name}: €${this.formatMoney(team.currentBudget)}`);
    }

    /**
     * Maneja el reset de la liga
     */
    handleLeagueReset(entry) {
        console.log('[BoardAnalyzer] League reset detected');
        // Reiniciar todos los presupuestos
        this.teams.forEach(team => {
            team.currentBudget = INITIAL_BUDGET;
            team.spent = 0;
            team.received = 0;
            team.transactions = [];
            team.lastUpdate = new Date(entry.date * 1000);
        });
        
        // Limpiar movimientos anteriores
        this.movements = [];
    }

    /**
     * Recalcula los presupuestos basándose en el balance actual de la API
     */
    recalculateBudgets() {
        // Si tenemos información del balance real de la API, úsala como referencia
        this.teams.forEach(team => {
            if (team.balance && team.balance !== team.currentBudget) {
                const difference = team.balance - team.currentBudget;
                console.log(`[BoardAnalyzer] Adjusting budget for ${team.name}: API balance=${team.balance}, calculated=${team.currentBudget}, diff=${difference}`);
                
                // Ajustar el presupuesto calculado para que coincida con el real
                // Esto puede ocurrir si nos perdimos algunos movimientos
                if (Math.abs(difference) > 1000) { // Solo si la diferencia es significativa
                    team.currentBudget = team.balance;
                    team.transactions.push({
                        date: new Date(),
                        type: 'adjustment',
                        amount: difference,
                        description: `Ajuste automático: ${difference > 0 ? '+' : ''}€${this.formatMoney(Math.abs(difference))}`
                    });
                }
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
            })),
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
        const averageBudget = teams.reduce((sum, team) => sum + team.currentBudget, 0) / teams.length;
        
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