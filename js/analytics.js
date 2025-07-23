/**
 * Motor Analítico Avanzado para Biwenger Intelligence Panel
 * Implementa las métricas VAPM, FDR y análisis de rivales
 */

class BiwengerAnalytics {
    constructor() {
        // Rating de Dificultad de Partido (FDR) - LaLiga 2024/25
        this.teamDifficulty = {
            // Equipos top (más difíciles)
            'real-madrid': { home: 5, away: 5 },
            'barcelona': { home: 5, away: 5 },
            'atletico-madrid': { home: 4, away: 5 },
            'real-sociedad': { home: 4, away: 4 },
            'athletic-bilbao': { home: 4, away: 4 },
            'villarreal': { home: 3, away: 4 },
            'real-betis': { home: 3, away: 4 },
            'valencia': { home: 3, away: 3 },
            'sevilla': { home: 3, away: 3 },
            'celta-vigo': { home: 3, away: 3 },
            
            // Equipos medios
            'getafe': { home: 3, away: 3 },
            'osasuna': { home: 3, away: 3 },
            'girona': { home: 2, away: 3 },
            'rayo-vallecano': { home: 2, away: 3 },
            'mallorca': { home: 2, away: 3 },
            'alaves': { home: 2, away: 2 },
            
            // Equipos más accesibles
            'las-palmas': { home: 2, away: 2 },
            'valladolid': { home: 1, away: 2 },
            'espanyol': { home: 1, away: 2 },
            'leganes': { home: 1, away: 1 }
        };
    }

    /**
     * Calcula Puntos por Millón (PPM)
     * @param {number} points - Puntos totales del jugador
     * @param {number} price - Precio del jugador en €
     * @returns {number} PPM
     */
    calculatePPM(points, price) {
        if (!price || price === 0) return 0;
        const priceInMillions = price / 1000000;
        return (points / priceInMillions).toFixed(2);
    }

    /**
     * Calcula Valor Añadido por Millón (VAPM)
     * La métrica clave que filtra los puntos por participación
     * @param {number} points - Puntos totales del jugador
     * @param {number} matches - Partidos jugados
     * @param {number} price - Precio del jugador en €
     * @returns {number} VAPM
     */
    calculateVAPM(points, matches, price) {
        if (!price || price === 0) return 0;
        const priceInMillions = price / 1000000;
        const valueAddedPoints = Math.max(0, points - (matches * 2));
        return (valueAddedPoints / priceInMillions).toFixed(2);
    }

    /**
     * Obtiene el rating de dificultad para un equipo
     * @param {string} teamSlug - Slug del equipo
     * @param {boolean} isHome - Si es partido en casa
     * @returns {number} Rating de dificultad (1-5)
     */
    getTeamDifficulty(teamSlug, isHome = true) {
        const team = this.teamDifficulty[teamSlug];
        if (!team) return 3; // Default medio
        return isHome ? team.home : team.away;
    }

    /**
     * Genera un color para el FDR
     * @param {number} difficulty - Rating de dificultad (1-5)
     * @returns {string} Color hexadecimal
     */
    getFDRColor(difficulty) {
        const colors = {
            1: '#4CAF50', // Verde brillante - Muy fácil
            2: '#8BC34A', // Verde claro - Fácil
            3: '#FFC107', // Amarillo - Medio
            4: '#FF9800', // Naranja - Difícil
            5: '#F44336'  // Rojo - Muy difícil
        };
        return colors[difficulty] || colors[3];
    }

    /**
     * Analiza la eficiencia de un jugador
     * @param {Object} player - Datos del jugador
     * @returns {Object} Análisis completo
     */
    analyzePlayer(player) {
        const points = player.points || 0;
        const matches = player.matchesPlayed || Math.floor(points / 3); // Estimación si no hay datos
        const price = player.price || 0;

        const ppm = this.calculatePPM(points, price);
        const vapm = this.calculateVAPM(points, matches, price);

        // Clasificación de eficiencia
        let efficiency = 'Baja';
        if (vapm > 15) efficiency = 'Excelente';
        else if (vapm > 10) efficiency = 'Muy Buena';
        else if (vapm > 5) efficiency = 'Buena';
        else if (vapm > 2) efficiency = 'Media';

        return {
            player: player,
            metrics: {
                ppm: parseFloat(ppm),
                vapm: parseFloat(vapm),
                efficiency: efficiency,
                pointsPerMatch: matches > 0 ? (points / matches).toFixed(1) : 0
            },
            recommendation: this.getPlayerRecommendation(vapm, ppm, price)
        };
    }

    /**
     * Genera recomendación de compra/venta
     * @param {number} vapm - Valor VAPM
     * @param {number} ppm - Valor PPM
     * @param {number} price - Precio del jugador
     * @returns {Object} Recomendación
     */
    getPlayerRecommendation(vapm, ppm, price) {
        if (vapm > 15) {
            return {
                action: 'COMPRAR',
                reason: 'Eficiencia excepcional, genera valor real',
                priority: 'Alta',
                color: '#4CAF50'
            };
        } else if (vapm > 10) {
            return {
                action: 'CONSIDERAR',
                reason: 'Buena eficiencia, analizar contexto',
                priority: 'Media',
                color: '#FF9800'
            };
        } else if (vapm < 2 && price > 5000000) {
            return {
                action: 'VENDER',
                reason: 'Baja eficiencia para su precio',
                priority: 'Alta',
                color: '#F44336'
            };
        } else {
            return {
                action: 'MANTENER',
                reason: 'Rendimiento estándar',
                priority: 'Baja',
                color: '#9E9E9E'
            };
        }
    }

    /**
     * Analiza la plantilla completa de un equipo
     * @param {Array} players - Array de jugadores
     * @returns {Object} Análisis de plantilla
     */
    analyzeTeam(players) {
        const analyses = players.map(player => this.analyzePlayer(player));
        
        // Métricas del equipo
        const totalValue = players.reduce((sum, p) => sum + (p.price || 0), 0);
        const totalPoints = players.reduce((sum, p) => sum + (p.points || 0), 0);
        const avgVAPM = analyses.reduce((sum, a) => sum + a.metrics.vapm, 0) / analyses.length;

        // Distribución por posición
        const positionDistribution = this.analyzePositionDistribution(players);
        
        // Mejores y peores jugadores
        const sortedByVAPM = analyses.sort((a, b) => b.metrics.vapm - a.metrics.vapm);
        const topPerformers = sortedByVAPM.slice(0, 3);
        const underperformers = sortedByVAPM.slice(-3).reverse();

        // Recomendaciones de mejora
        const improvements = this.generateTeamImprovements(analyses, positionDistribution);

        return {
            summary: {
                totalValue: totalValue,
                totalPoints: totalPoints,
                avgVAPM: avgVAPM.toFixed(2),
                efficiency: avgVAPM > 8 ? 'Alta' : avgVAPM > 5 ? 'Media' : 'Baja'
            },
            positionDistribution,
            topPerformers,
            underperformers,
            improvements,
            fullAnalysis: analyses
        };
    }

    /**
     * Analiza la distribución por posiciones
     * @param {Array} players - Array de jugadores
     * @returns {Object} Distribución por posiciones
     */
    analyzePositionDistribution(players) {
        const positions = { 1: [], 2: [], 3: [], 4: [] }; // POR, DEF, MED, DEL
        const positionNames = { 1: 'Porteros', 2: 'Defensas', 3: 'Medios', 4: 'Delanteros' };

        players.forEach(player => {
            const pos = player.position || 0;
            if (positions[pos]) {
                positions[pos].push(player);
            }
        });

        const distribution = {};
        Object.keys(positions).forEach(pos => {
            const posPlayers = positions[pos];
            const totalValue = posPlayers.reduce((sum, p) => sum + (p.price || 0), 0);
            const avgPrice = posPlayers.length > 0 ? totalValue / posPlayers.length : 0;
            
            distribution[pos] = {
                name: positionNames[pos],
                count: posPlayers.length,
                totalValue: totalValue,
                avgPrice: avgPrice,
                percentage: ((totalValue / players.reduce((sum, p) => sum + (p.price || 0), 0)) * 100).toFixed(1)
            };
        });

        return distribution;
    }

    /**
     * Genera recomendaciones de mejora para el equipo
     * @param {Array} analyses - Análisis de jugadores
     * @param {Object} distribution - Distribución por posiciones
     * @returns {Array} Array de mejoras recomendadas
     */
    generateTeamImprovements(analyses, distribution) {
        const improvements = [];

        // Detectar jugadores con muy bajo VAPM
        const lowVAPM = analyses.filter(a => a.metrics.vapm < 2 && a.player.price > 3000000);
        if (lowVAPM.length > 0) {
            improvements.push({
                type: 'VENDER',
                title: 'Jugadores de baja eficiencia',
                description: `${lowVAPM.length} jugadores con VAPM < 2. Considera venderlos.`,
                players: lowVAPM.map(a => a.player.name),
                priority: 'Alta'
            });
        }

        // Detectar posiciones con pocos jugadores
        Object.values(distribution).forEach(pos => {
            const minPlayers = pos.name === 'Porteros' ? 1 : pos.name === 'Delanteros' ? 2 : 3;
            if (pos.count < minPlayers) {
                improvements.push({
                    type: 'REFORZAR',
                    title: `Reforzar ${pos.name}`,
                    description: `Solo tienes ${pos.count} ${pos.name.toLowerCase()}. Mínimo recomendado: ${minPlayers}.`,
                    priority: 'Media'
                });
            }
        });

        // Detectar sobreinversión en una posición
        Object.values(distribution).forEach(pos => {
            if (parseFloat(pos.percentage) > 50) {
                improvements.push({
                    type: 'EQUILIBRAR',
                    title: `Sobreinversión en ${pos.name}`,
                    description: `${pos.percentage}% del presupuesto en ${pos.name.toLowerCase()}. Considera redistribuir.`,
                    priority: 'Baja'
                });
            }
        });

        return improvements;
    }

    /**
     * Compara dos jugadores de la misma posición
     * @param {Object} player1 - Primer jugador
     * @param {Object} player2 - Segundo jugador
     * @returns {Object} Comparación detallada
     */
    comparePlayersSamePosition(player1, player2) {
        const analysis1 = this.analyzePlayer(player1);
        const analysis2 = this.analyzePlayer(player2);

        const comparison = {
            player1: analysis1,
            player2: analysis2,
            winner: {
                vapm: analysis1.metrics.vapm > analysis2.metrics.vapm ? player1.name : player2.name,
                ppm: analysis1.metrics.ppm > analysis2.metrics.ppm ? player1.name : player2.name,
                value: player1.price < player2.price ? player1.name : player2.name,
                points: (player1.points || 0) > (player2.points || 0) ? player1.name : player2.name
            }
        };

        // Recomendación final
        if (analysis1.metrics.vapm > analysis2.metrics.vapm) {
            comparison.recommendation = `${player1.name} es más eficiente (VAPM: ${analysis1.metrics.vapm} vs ${analysis2.metrics.vapm})`;
        } else if (analysis2.metrics.vapm > analysis1.metrics.vapm) {
            comparison.recommendation = `${player2.name} es más eficiente (VAPM: ${analysis2.metrics.vapm} vs ${analysis1.metrics.vapm})`;
        } else {
            comparison.recommendation = 'Ambos jugadores tienen eficiencia similar';
        }

        return comparison;
    }

    /**
     * Encuentra las mejores oportunidades en el mercado
     * @param {Array} marketPlayers - Jugadores en el mercado
     * @param {number} budget - Presupuesto disponible
     * @returns {Array} Mejores oportunidades ordenadas por VAPM
     */
    findMarketOpportunities(marketPlayers, budget = Infinity) {
        return marketPlayers
            .filter(player => (player.price || 0) <= budget)
            .map(player => this.analyzePlayer(player))
            .sort((a, b) => b.metrics.vapm - a.metrics.vapm)
            .slice(0, 10); // Top 10 oportunidades
    }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.BiwengerAnalytics = BiwengerAnalytics;
}

// Para uso en Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BiwengerAnalytics;
}