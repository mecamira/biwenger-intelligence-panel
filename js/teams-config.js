/**
 * Configuración de equipos de LaLiga para Biwenger Intelligence Panel
 * Incluye FDR, estadísticas y datos para análisis avanzado
 */

const LaLigaTeams = {
    // Real Madrid
    'real-madrid': {
        id: 1,
        name: 'Real Madrid',
        shortName: 'RMA',
        city: 'Madrid',
        colors: {
            primary: '#FFFFFF',
            secondary: '#000080'
        },
        fdr: { home: 5, away: 5 },
        stats: {
            defensiveStrength: 95,
            offensiveStrength: 98,
            homeAdvantage: 0.85,
            consistency: 0.90
        },
        stadium: 'Santiago Bernabéu',
        capacity: 81044
    },

    // FC Barcelona
    'barcelona': {
        id: 2,
        name: 'FC Barcelona',
        shortName: 'BAR',
        city: 'Barcelona',
        colors: {
            primary: '#A50044',
            secondary: '#004D98'
        },
        fdr: { home: 5, away: 5 },
        stats: {
            defensiveStrength: 88,
            offensiveStrength: 95,
            homeAdvantage: 0.82,
            consistency: 0.85
        },
        stadium: 'Camp Nou',
        capacity: 99354
    },

    // Atlético Madrid
    'atletico-madrid': {
        id: 3,
        name: 'Atlético de Madrid',
        shortName: 'ATM',
        city: 'Madrid',
        colors: {
            primary: '#CE1126',
            secondary: '#FFFFFF'
        },
        fdr: { home: 4, away: 5 },
        stats: {
            defensiveStrength: 92,
            offensiveStrength: 82,
            homeAdvantage: 0.88,
            consistency: 0.88
        },
        stadium: 'Cívitas Metropolitano',
        capacity: 68456
    },

    // Real Sociedad
    'real-sociedad': {
        id: 4,
        name: 'Real Sociedad',
        shortName: 'RSO',
        city: 'San Sebastián',
        colors: {
            primary: '#003399',
            secondary: '#FFFFFF'
        },
        fdr: { home: 4, away: 4 },
        stats: {
            defensiveStrength: 78,
            offensiveStrength: 80,
            homeAdvantage: 0.80,
            consistency: 0.75
        },
        stadium: 'Reale Arena',
        capacity: 39500
    },

    // Athletic Bilbao
    'athletic-bilbao': {
        id: 5,
        name: 'Athletic Club',
        shortName: 'ATH',
        city: 'Bilbao',
        colors: {
            primary: '#EE2524',
            secondary: '#FFFFFF'
        },
        fdr: { home: 4, away: 4 },
        stats: {
            defensiveStrength: 82,
            offensiveStrength: 75,
            homeAdvantage: 0.85,
            consistency: 0.78
        },
        stadium: 'San Mamés',
        capacity: 53289
    },

    // Villarreal
    'villarreal': {
        id: 6,
        name: 'Villarreal CF',
        shortName: 'VIL',
        city: 'Villarreal',
        colors: {
            primary: '#FFFF00',
            secondary: '#000080'
        },
        fdr: { home: 3, away: 4 },
        stats: {
            defensiveStrength: 75,
            offensiveStrength: 82,
            homeAdvantage: 0.75,
            consistency: 0.72
        },
        stadium: 'Estadio de la Cerámica',
        capacity: 23008
    },

    // Real Betis
    'real-betis': {
        id: 7,
        name: 'Real Betis',
        shortName: 'BET',
        city: 'Sevilla',
        colors: {
            primary: '#00A000',
            secondary: '#FFFFFF'
        },
        fdr: { home: 3, away: 4 },
        stats: {
            defensiveStrength: 70,
            offensiveStrength: 78,
            homeAdvantage: 0.78,
            consistency: 0.65
        },
        stadium: 'Benito Villamarín',
        capacity: 60721
    },

    // Valencia
    'valencia': {
        id: 8,
        name: 'Valencia CF',
        shortName: 'VAL',
        city: 'Valencia',
        colors: {
            primary: '#FF6600',
            secondary: '#000000'
        },
        fdr: { home: 3, away: 3 },
        stats: {
            defensiveStrength: 72,
            offensiveStrength: 70,
            homeAdvantage: 0.72,
            consistency: 0.68
        },
        stadium: 'Mestalla',
        capacity: 49430
    },

    // Sevilla
    'sevilla': {
        id: 9,
        name: 'Sevilla FC',
        shortName: 'SEV',
        city: 'Sevilla',
        colors: {
            primary: '#FFFFFF',
            secondary: '#D2001F'
        },
        fdr: { home: 3, away: 3 },
        stats: {
            defensiveStrength: 75,
            offensiveStrength: 72,
            homeAdvantage: 0.75,
            consistency: 0.70
        },
        stadium: 'Ramón Sánchez-Pizjuán',
        capacity: 43883
    },

    // Celta de Vigo
    'celta-vigo': {
        id: 10,
        name: 'RC Celta',
        shortName: 'CEL',
        city: 'Vigo',
        colors: {
            primary: '#87CEEB',
            secondary: '#FFFFFF'
        },
        fdr: { home: 3, away: 3 },
        stats: {
            defensiveStrength: 68,
            offensiveStrength: 72,
            homeAdvantage: 0.70,
            consistency: 0.62
        },
        stadium: 'Balaídos',
        capacity: 29000
    },

    // Getafe
    'getafe': {
        id: 11,
        name: 'Getafe CF',
        shortName: 'GET',
        city: 'Getafe',
        colors: {
            primary: '#005AFF',
            secondary: '#FFFFFF'
        },
        fdr: { home: 3, away: 3 },
        stats: {
            defensiveStrength: 78,
            offensiveStrength: 60,
            homeAdvantage: 0.75,
            consistency: 0.70
        },
        stadium: 'Coliseum Alfonso Pérez',
        capacity: 17393
    },

    // Osasuna
    'osasuna': {
        id: 12,
        name: 'CA Osasuna',
        shortName: 'OSA',
        city: 'Pamplona',
        colors: {
            primary: '#D2001F',
            secondary: '#000080'
        },
        fdr: { home: 3, away: 3 },
        stats: {
            defensiveStrength: 72,
            offensiveStrength: 65,
            homeAdvantage: 0.82,
            consistency: 0.68
        },
        stadium: 'El Sadar',
        capacity: 23576
    },

    // Girona
    'girona': {
        id: 13,
        name: 'Girona FC',
        shortName: 'GIR',
        city: 'Girona',
        colors: {
            primary: '#E4002B',
            secondary: '#FFFFFF'
        },
        fdr: { home: 2, away: 3 },
        stats: {
            defensiveStrength: 70,
            offensiveStrength: 75,
            homeAdvantage: 0.72,
            consistency: 0.65
        },
        stadium: 'Estadi Montilivi',
        capacity: 14624
    },

    // Rayo Vallecano
    'rayo-vallecano': {
        id: 14,
        name: 'Rayo Vallecano',
        shortName: 'RAY',
        city: 'Madrid',
        colors: {
            primary: '#FFFFFF',
            secondary: '#E4002B'
        },
        fdr: { home: 2, away: 3 },
        stats: {
            defensiveStrength: 65,
            offensiveStrength: 70,
            homeAdvantage: 0.75,
            consistency: 0.60
        },
        stadium: 'Campo de Fútbol de Vallecas',
        capacity: 14708
    },

    // RCD Mallorca
    'mallorca': {
        id: 15,
        name: 'RCD Mallorca',
        shortName: 'MLL',
        city: 'Palma',
        colors: {
            primary: '#E4002B',
            secondary: '#000000'
        },
        fdr: { home: 2, away: 3 },
        stats: {
            defensiveStrength: 68,
            offensiveStrength: 62,
            homeAdvantage: 0.70,
            consistency: 0.62
        },
        stadium: 'Son Moix',
        capacity: 23142
    },

    // Deportivo Alavés
    'alaves': {
        id: 16,
        name: 'Deportivo Alavés',
        shortName: 'ALA',
        city: 'Vitoria-Gasteiz',
        colors: {
            primary: '#005AFF',
            secondary: '#FFFFFF'
        },
        fdr: { home: 2, away: 2 },
        stats: {
            defensiveStrength: 65,
            offensiveStrength: 58,
            homeAdvantage: 0.68,
            consistency: 0.58
        },
        stadium: 'Mendizorrotza',
        capacity: 19840
    },

    // UD Las Palmas
    'las-palmas': {
        id: 17,
        name: 'UD Las Palmas',
        shortName: 'LPA',
        city: 'Las Palmas',
        colors: {
            primary: '#FFFF00',
            secondary: '#005AFF'
        },
        fdr: { home: 2, away: 2 },
        stats: {
            defensiveStrength: 60,
            offensiveStrength: 65,
            homeAdvantage: 0.68,
            consistency: 0.55
        },
        stadium: 'Estadio Gran Canaria',
        capacity: 32400
    },

    // Real Valladolid
    'valladolid': {
        id: 18,
        name: 'Real Valladolid',
        shortName: 'VLL',
        city: 'Valladolid',
        colors: {
            primary: '#FFFFFF',
            secondary: '#800080'
        },
        fdr: { home: 1, away: 2 },
        stats: {
            defensiveStrength: 58,
            offensiveStrength: 55,
            homeAdvantage: 0.65,
            consistency: 0.52
        },
        stadium: 'José Zorrilla',
        capacity: 26512
    },

    // RCD Espanyol
    'espanyol': {
        id: 19,
        name: 'RCD Espanyol',
        shortName: 'ESP',
        city: 'Barcelona',
        colors: {
            primary: '#005AFF',
            secondary: '#FFFFFF'
        },
        fdr: { home: 1, away: 2 },
        stats: {
            defensiveStrength: 62,
            offensiveStrength: 58,
            homeAdvantage: 0.68,
            consistency: 0.55
        },
        stadium: 'RCDE Stadium',
        capacity: 40500
    },

    // CD Leganés
    'leganes': {
        id: 20,
        name: 'CD Leganés',
        shortName: 'LEG',
        city: 'Leganés',
        colors: {
            primary: '#005AFF',
            secondary: '#FFFFFF'
        },
        fdr: { home: 1, away: 1 },
        stats: {
            defensiveStrength: 55,
            offensiveStrength: 52,
            homeAdvantage: 0.62,
            consistency: 0.50
        },
        stadium: 'Estadio Municipal de Butarque',
        capacity: 12454
    }
};

/**
 * Utilidades para trabajar con equipos
 */
class TeamsManager {
    constructor() {
        this.teams = LaLigaTeams;
    }

    /**
     * Obtiene información de un equipo por su slug
     * @param {string} slug - Slug del equipo
     * @returns {Object|null} Información del equipo
     */
    getTeam(slug) {
        return this.teams[slug] || null;
    }

    /**
     * Obtiene todos los equipos
     * @returns {Object} Todos los equipos
     */
    getAllTeams() {
        return this.teams;
    }

    /**
     * Obtiene equipos ordenados por FDR
     * @param {boolean} isHome - Si es partido en casa
     * @returns {Array} Equipos ordenados por dificultad
     */
    getTeamsByDifficulty(isHome = true) {
        return Object.entries(this.teams)
            .map(([slug, team]) => ({
                slug,
                ...team,
                currentFDR: isHome ? team.fdr.home : team.fdr.away
            }))
            .sort((a, b) => b.currentFDR - a.currentFDR);
    }

    /**
     * Obtiene el FDR de un equipo
     * @param {string} slug - Slug del equipo
     * @param {boolean} isHome - Si es partido en casa
     * @returns {number} Rating de dificultad
     */
    getFDR(slug, isHome = true) {
        const team = this.getTeam(slug);
        if (!team) return 3; // Default medio
        return isHome ? team.fdr.home : team.fdr.away;
    }

    /**
     * Obtiene el color para un FDR específico
     * @param {number} fdr - Rating de dificultad
     * @returns {string} Color hexadecimal
     */
    getFDRColor(fdr) {
        const colors = {
            1: '#4CAF50', // Verde - Muy fácil
            2: '#8BC34A', // Verde claro - Fácil
            3: '#FFC107', // Amarillo - Medio
            4: '#FF9800', // Naranja - Difícil
            5: '#F44336'  // Rojo - Muy difícil
        };
        return colors[fdr] || colors[3];
    }

    /**
     * Obtiene equipos por rango de FDR
     * @param {number} minFDR - FDR mínimo
     * @param {number} maxFDR - FDR máximo
     * @param {boolean} isHome - Si es partido en casa
     * @returns {Array} Equipos en el rango
     */
    getTeamsByFDRRange(minFDR, maxFDR, isHome = true) {
        return Object.entries(this.teams)
            .filter(([slug, team]) => {
                const fdr = isHome ? team.fdr.home : team.fdr.away;
                return fdr >= minFDR && fdr <= maxFDR;
            })
            .map(([slug, team]) => ({ slug, ...team }));
    }

    /**
     * Calcula el FDR promedio de una lista de partidos
     * @param {Array} fixtures - Lista de partidos [{opponent: string, isHome: boolean}]
     * @returns {number} FDR promedio
     */
    calculateAverageFDR(fixtures) {
        if (!fixtures || fixtures.length === 0) return 3;
        
        const totalFDR = fixtures.reduce((sum, fixture) => {
            return sum + this.getFDR(fixture.opponent, fixture.isHome);
        }, 0);
        
        return (totalFDR / fixtures.length).toFixed(1);
    }

    /**
     * Obtiene estadísticas defensivas y ofensivas para análisis
     * @param {string} slug - Slug del equipo
     * @returns {Object} Estadísticas del equipo
     */
    getTeamStats(slug) {
        const team = this.getTeam(slug);
        if (!team) return null;
        
        return {
            name: team.name,
            shortName: team.shortName,
            defensiveStrength: team.stats.defensiveStrength,
            offensiveStrength: team.stats.offensiveStrength,
            homeAdvantage: team.stats.homeAdvantage,
            consistency: team.stats.consistency,
            cleanSheetProbability: this.calculateCleanSheetProbability(team.stats.defensiveStrength),
            goalsProbability: this.calculateGoalsProbability(team.stats.offensiveStrength)
        };
    }

    /**
     * Calcula la probabilidad de portería a cero
     * @param {number} defensiveStrength - Fortaleza defensiva (0-100)
     * @returns {number} Probabilidad de clean sheet
     */
    calculateCleanSheetProbability(defensiveStrength) {
        // Fórmula basada en fortaleza defensiva
        return Math.min(0.8, (defensiveStrength / 100) * 0.6);
    }

    /**
     * Calcula la probabilidad de marcar goles
     * @param {number} offensiveStrength - Fortaleza ofensiva (0-100)
     * @returns {number} Probabilidad de marcar
     */
    calculateGoalsProbability(offensiveStrength) {
        // Fórmula basada en fortaleza ofensiva
        return Math.min(0.9, (offensiveStrength / 100) * 0.8);
    }

    /**
     * Encuentra los mejores equipos para jugadores defensivos
     * @returns {Array} Equipos ordenados por fortaleza defensiva
     */
    getBestDefensiveTeams() {
        return Object.entries(this.teams)
            .map(([slug, team]) => ({
                slug,
                name: team.name,
                shortName: team.shortName,
                defensiveStrength: team.stats.defensiveStrength,
                cleanSheetProb: this.calculateCleanSheetProbability(team.stats.defensiveStrength)
            }))
            .sort((a, b) => b.defensiveStrength - a.defensiveStrength)
            .slice(0, 10);
    }

    /**
     * Encuentra los mejores equipos para jugadores ofensivos
     * @returns {Array} Equipos ordenados por fortaleza ofensiva
     */
    getBestOffensiveTeams() {
        return Object.entries(this.teams)
            .map(([slug, team]) => ({
                slug,
                name: team.name,
                shortName: team.shortName,
                offensiveStrength: team.stats.offensiveStrength,
                goalsProb: this.calculateGoalsProbability(team.stats.offensiveStrength)
            }))
            .sort((a, b) => b.offensiveStrength - a.offensiveStrength)
            .slice(0, 10);
    }

    /**
     * Obtiene recomendaciones de equipos según posición del jugador
     * @param {number} position - Posición del jugador (1-4)
     * @returns {Array} Equipos recomendados
     */
    getRecommendedTeams(position) {
        switch (position) {
            case 1: // Porteros
            case 2: // Defensas
                return this.getBestDefensiveTeams().slice(0, 5);
            case 3: // Centrocampistas
                return Object.entries(this.teams)
                    .map(([slug, team]) => ({
                        slug,
                        name: team.name,
                        shortName: team.shortName,
                        combinedStrength: (team.stats.defensiveStrength + team.stats.offensiveStrength) / 2,
                        consistency: team.stats.consistency
                    }))
                    .sort((a, b) => (b.combinedStrength * b.consistency) - (a.combinedStrength * a.consistency))
                    .slice(0, 5);
            case 4: // Delanteros
                return this.getBestOffensiveTeams().slice(0, 5);
            default:
                return [];
        }
    }

    /**
     * Busca equipos por nombre o ciudad
     * @param {string} query - Término de búsqueda
     * @returns {Array} Equipos que coinciden
     */
    searchTeams(query) {
        if (!query) return [];
        
        const searchTerm = query.toLowerCase();
        return Object.entries(this.teams)
            .filter(([slug, team]) => 
                team.name.toLowerCase().includes(searchTerm) ||
                team.shortName.toLowerCase().includes(searchTerm) ||
                team.city.toLowerCase().includes(searchTerm) ||
                slug.includes(searchTerm)
            )
            .map(([slug, team]) => ({ slug, ...team }));
    }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.LaLigaTeams = LaLigaTeams;
    window.TeamsManager = TeamsManager;
}

// Para uso en Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { LaLigaTeams, TeamsManager };
}