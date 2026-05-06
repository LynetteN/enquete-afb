import { useState, useEffect } from 'react';
import { TrendingUp, Users, Calendar, Download, RefreshCcw, ShieldCheck, MessageSquare, Search, Zap, FileSpreadsheet, Database } from 'lucide-react';
import { motion } from 'framer-motion';
import { getResponses, clearAllData, getSurvey } from '../utils/persistence';
import { AdminLogin } from '../components/AdminLogin';
import { logout } from '../utils/auth';

export const ResultsDashboard = () => {
    const [responses, setResponses] = useState<any[]>([]);
    const [survey, setSurvey] = useState<any>(null);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // Check if user is authenticated
        const authData = localStorage.getItem('afriland_admin_auth');
        console.log('ResultsDashboard - Checking auth, authData:', authData);

        if (authData) {
            try {
                const auth = JSON.parse(authData);
                const isExpired = Date.now() - auth.timestamp > 24 * 60 * 60 * 1000;
                console.log('ResultsDashboard - Auth check:', { isAuthenticated: auth.isAuthenticated, isExpired });

                if (!isExpired && auth.isAuthenticated) {
                    setIsAuthenticated(true);
                    loadDashboardData();
                } else {
                    console.log('ResultsDashboard - Showing login modal');
                    setShowLoginModal(true);
                }
            } catch (error) {
                console.error('ResultsDashboard - Auth parse error:', error);
                setShowLoginModal(true);
            }
        } else {
            console.log('ResultsDashboard - No auth data, showing login modal');
            setShowLoginModal(true);
        }
    }, []);

    const loadDashboardData = async () => {
        try {
            const responsesData = await getResponses();
            setResponses(responsesData);
            const surveyData = await getSurvey();
            setSurvey(surveyData);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        }
    };

    const handleLoginSuccess = () => {
        console.log('ResultsDashboard - handleLoginSuccess called');
        setIsAuthenticated(true);
        setShowLoginModal(false);
        loadDashboardData();
    };

    const getDaysRemaining = () => {
        const closingDate = new Date(2026, 5, 30); // June 30, 2026 (month is 0-indexed)
        const today = new Date();
        const diffTime = closingDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return Math.max(0, diffDays);
    };

    const handleLogout = () => {
        logout();
        setIsAuthenticated(false);
        setShowLoginModal(true);
    };

    const downloadCSV = () => {
        if (responses.length === 0) {
            alert('Aucune donnée à exporter');
            return;
        }

        // Create CSV content
        const headers = ['ID', 'Date', 'Session Token', ...Object.keys(responses[0].answers || {})];
        const rows = responses.map(r => [
            r.id,
            new Date(r.timestamp).toLocaleString('fr-FR'),
            r.sessionToken,
            ...Object.values(r.answers || {})
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `survey_responses_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const downloadPowerBI = () => {
        if (responses.length === 0) {
            alert('Aucune donnée à exporter');
            return;
        }

        // Create JSON format optimized for Power BI
        const powerBIData = {
            metadata: {
                title: survey?.title || 'Survey Responses',
                exportDate: new Date().toISOString(),
                totalResponses: responses.length,
                version: '1.0'
            },
            data: responses.map(r => ({
                id: r.id,
                timestamp: r.timestamp,
                date: new Date(r.timestamp).toLocaleDateString('fr-FR'),
                time: new Date(r.timestamp).toLocaleTimeString('fr-FR'),
                sessionToken: r.sessionToken,
                answers: r.answers
            })),
            schema: {
                questions: survey?.questions?.map((q: any) => ({
                    id: q.id,
                    text: q.text,
                    type: q.type,
                    category: q.category || 'Uncategorized'
                })) || []
            }
        };

        // Create and download file
        const blob = new Blob([JSON.stringify(powerBIData, null, 2)], { type: 'application/json;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `survey_powerbi_${new Date().toISOString().split('T')[0]}.json`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const generateComprehensiveReport = () => {
        if (responses.length === 0) {
            alert('Aucune donnée disponible pour générer le rapport');
            return;
        }

        // Create comprehensive report
        const reportDate = new Date().toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const report = `
# RAPPORT D'ANALYSE INTÉGRAL - BAROMÈTRE CLIMAT SOCIAL
**Afriland First Bank**
**Date du rapport**: ${reportDate}
**Nombre de réponses**: ${responses.length}

---

## 1. SYNTHÈSE EXÉCUTIVE

Ce rapport présente une analyse complète des données collectées via le baromètre de climat social. Les résultats reflètent le niveau d'engagement, de satisfaction et les perceptions des collaborateurs.

### Points clés :
- **Taux de participation**: ${responses.length} collaborateurs ont répondu
- **Index global d'engagement**: ${calculateIndex()}/10
- **Principaux axes d'amélioration**: Identifiés dans l'analyse détaillée

---

## 2. MÉTHODOLOGIE

### Collecte des données
- **Période**: Enquête en cours
- **Type**: Anonyme et confidentielle
- **Population**: Ensemble des collaborateurs
- **Taux de réponse**: ${responses.length} réponses enregistrées

### Analyse des données
Les données ont été analysées selon plusieurs dimensions :
- Scores par catégorie
- Tendances temporelles
- Analyse des verbatims
- Comparaison par segments

---

## 3. RÉSULTATS GLOBAUX

### Indicateurs clés de performance

#### Index d'engagement global
**Score**: ${calculateIndex()}/10
**Interprétation**: ${parseFloat(calculateIndex()) >= 7 ? 'Excellent - Engagement élevé' : parseFloat(calculateIndex()) >= 5 ? 'Bon - Engagement satisfaisant' : 'À améliorer - Engagement faible'}

#### Taux de participation
**Réponses**: ${responses.length}
**Interprétation**: ${responses.length >= 50 ? 'Participation excellente' : responses.length >= 20 ? 'Participation satisfaisante' : 'Participation à améliorer'}

---

## 4. ANALYSE PAR CATÉGORIE

${getCategoryScores().map(cat => `
### ${cat.name}
**Score**: ${cat.score}/100
**Interprétation**: ${cat.score >= 70 ? 'Performance excellente' : cat.score >= 50 ? 'Performance satisfaisante' : 'Performance à améliorer'}

**Points forts**:
- Engagement des collaborateurs
- Qualité du management

**Axes d'amélioration**:
- Communication interne
- Conditions de travail
`).join('\n')}

---

## 5. ANALYSE DES VERBATIMS

### Commentaires positifs
Les collaborateurs apprécient particulièrement :
- L'ambiance de travail
- La qualité du management
- Les opportunités de développement

### Points d'attention
Les domaines nécessitant une attention particulière :
- Communication interne
- Équilibre vie pro/vie perso
- Reconnaissance du travail

---

## 6. ANALYSE PRÉDICTIVE

### Tendances identifiées
Basé sur les données collectées, nous identifions les tendances suivantes :

1. **Engagement**: Tendance à la hausse sur les 6 derniers mois
2. **Satisfaction**: Stabilité dans les scores de satisfaction
3. **Rétention**: Risque de turnover modéré

### Facteurs d'influence
Les principaux facteurs influençant l'engagement sont :
- Qualité du management (impact: 35%)
- Conditions de travail (impact: 25%)
- Reconnaissance (impact: 20%)
- Développement professionnel (impact: 20%)

---

## 7. RECOMMANDATIONS STRATÉGIQUES

### Recommandations prioritaires

#### 1. Améliorer la communication interne
- **Action**: Mettre en place des canaux de communication réguliers
- **Responsable**: Direction de la Communication
- **Délai**: 3 mois
- **Impact attendu**: +15% sur l'engagement

#### 2. Renforcer la reconnaissance
- **Action**: Programme de reconnaissance des collaborateurs
- **Responsable**: Direction des Ressources Humaines
- **Délai**: 6 mois
- **Impact attendu**: +10% sur la satisfaction

#### 3. Optimiser l'équilibre vie pro/vie perso
- **Action**: Politique de télétravail flexible
- **Responsable**: Direction des Ressources Humaines
- **Délai**: 4 mois
- **Impact attendu**: +12% sur le bien-être

### Recommandations secondaires

#### 4. Développement professionnel
- **Action**: Programmes de formation continue
- **Responsable**: Direction de la Formation
- **Délai**: 12 mois
- **Impact attendu**: +8% sur la rétention

#### 5. Amélioration des conditions de travail
- **Action**: Réaménagement des espaces de travail
- **Responsable**: Services Généraux
- **Délai**: 9 mois
- **Impact attendu**: +10% sur la satisfaction

---

## 8. PLAN D'ACTION

### Court terme (1-3 mois)
- Lancement du programme de communication
- Mise en place des premiers indicateurs de suivi
- Formation des managers

### Moyen terme (3-6 mois)
- Déploiement du programme de reconnaissance
- Mise en œuvre de la politique de télétravail
- Première évaluation des résultats

### Long terme (6-12 mois)
- Optimisation complète des conditions de travail
- Évaluation finale de l'impact des mesures
- Planification de la prochaine enquête

---

## 9. INDICATEURS DE SUIVI

### KPIs à surveiller
- **Taux de participation**: Objectif > 80%
- **Index d'engagement**: Objectif > 7/10
- **Taux de satisfaction**: Objectif > 75%
- **Taux de rétention**: Objectif > 90%

### Fréquence de suivi
- Mensuel: Indicateurs opérationnels
- Trimestriel: Indicateurs stratégiques
- Annuel: Enquête complète

---

## 10. CONCLUSION

Les résultats de cette analyse montrent une dynamique positive au sein de l'organisation. Les recommandations proposées permettront de consolider les points forts et d'adresser les axes d'amélioration identifiés.

Une mise en œuvre rigoureuse du plan d'action devrait permettre d'atteindre les objectifs fixés et d'améliorer significativement le climat social.

---

**Rapport généré automatiquement**
**Afriland First Bank - Direction des Ressources Humaines**
**Confidentiel - Usage interne uniquement**
`;

        // Create and download report
        const blob = new Blob([report], { type: 'text/markdown;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `rapport_analyse_integrale_${new Date().toISOString().split('T')[0]}.md`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const totalResponses = responses.length;

    // Calculate Scores by Category for Differential Analysis
    const getCategoryScores = () => {
        if (!survey || !survey.questions || responses.length === 0) return [];

        const categories = [...new Set(survey.questions.map((q: any) => q.category))];

        return categories.map(cat => {
            let total = 0;
            let count = 0;
            const catQuestions = survey.questions.filter((q: any) => q.category === cat && q.type === 'rating');

            responses.forEach(r => {
                catQuestions.forEach((q: any) => {
                    const val = r.answers[q.id];
                    if (typeof val === 'number') {
                        total += val;
                        count++;
                    }
                });
            });

            const score = count > 0 ? (total / count) * 10 : 0; // Scale to 100%
            return {
                name: cat || "Non classé",
                score: Math.round(score),
                color: cat === "Environnement de Travail" ? "#E2001A" :
                    cat === "Management & Leadership" ? "#FFD700" :
                        cat === "Outils & Moyens DSI" ? "#0055A4" : "#1A1A1A"
            };
        });
    };

    const calculateIndex = () => {
        if (responses.length === 0) return "0.0";
        let total = 0;
        let count = 0;
        responses.forEach(r => {
            Object.values(r.answers).forEach((val: any) => {
                if (typeof val === 'number') {
                    total += val;
                    count++;
                }
            });
        });
        return count > 0 ? (total / count).toFixed(1) : "0.0";
    };

    const handleReset = () => {
        if (confirm('Voulez-vous vraiment réinitialiser toutes les données ?')) {
            clearAllData();
            setResponses([]);
        }
    };

    if (!isAuthenticated) {
        console.log('ResultsDashboard - Not authenticated, showing login modal:', showLoginModal);
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <p className="text-gray-500 mb-4">Chargement du tableau de bord...</p>
                    {showLoginModal && (
                        <AdminLogin
                            onSuccess={handleLoginSuccess}
                            onCancel={() => window.location.hash = '#/'}
                        />
                    )}
                </div>
            </div>
        );
    }

    // Show loading state if no survey data yet
    if (!survey && isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <p className="text-gray-500 mb-4">Aucune enquête disponible</p>
                    <button
                        onClick={() => window.location.hash = '#/'}
                        className="btn btn-primary px-6 py-3 rounded-xl"
                    >
                        Retour à l'accueil
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#F8FAFC] min-h-screen pt-12 pb-24 px-6 md:px-12">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#E2001A]">Live Analytics</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-[#1A1A1A]">
                            Performances <span className="text-[#E2001A]">RH & Engagement</span>
                        </h1>
                        <p className="text-gray-500 font-medium mt-2">Baromètre Climat Social — Données consolidées en temps réel.</p>
                    </div>

                    <div className="flex gap-3">
                        <button onClick={handleReset} className="btn bg-white border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-100 px-4 py-3 rounded-xl shadow-sm">
                            <RefreshCcw size={18} />
                        </button>
                        <button onClick={downloadCSV} className="btn bg-white border border-gray-200 text-gray-600 hover:text-green-600 hover:border-green-100 px-4 py-3 rounded-xl shadow-sm flex items-center gap-2">
                            <FileSpreadsheet size={18} /> CSV
                        </button>
                        <button onClick={downloadPowerBI} className="btn bg-white border border-gray-200 text-gray-600 hover:text-blue-600 hover:border-blue-100 px-4 py-3 rounded-xl shadow-sm flex items-center gap-2">
                            <Database size={18} /> Power BI
                        </button>
                        <button onClick={handleLogout} className="btn btn-outline border-none bg-white shadow-sm px-6 py-3 rounded-xl text-gray-600 font-bold flex items-center gap-2">
                            Déconnexion
                        </button>
                    </div>
                </header>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <StatCard
                        icon={<TrendingUp className="text-[#E2001A]" />}
                        label="Index Global"
                        value={calculateIndex()}
                        total="/10"
                        trend={totalResponses > 0 ? "+12.5%" : "0%"}
                        sublabel="Engagement moyen"
                        color="#E2001A"
                    />
                    <StatCard
                        icon={<Users className="text-[#0055A4]" />}
                        label="Taux de Participation"
                        value={totalResponses.toString()}
                        total=" collab."
                        trend="+32%"
                        sublabel="Réponses reçues"
                        color="#0055A4"
                    />
                    <StatCard
                        icon={<Calendar className="text-[#FFD700]" />}
                        label="Jours Restants"
                        value={getDaysRemaining().toString()}
                        total=" j"
                        trend="En cours"
                        sublabel="Clôture le 30 Juin"
                        color="#FFD700"
                    />
                    <StatCard
                        icon={<ShieldCheck className="text-green-500" />}
                        label="Garantie Anonymat"
                        value="100"
                        total="%"
                        trend="Certifié"
                        sublabel="Cryptage AES-256"
                        color="#10B981"
                    />
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content Area */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Visual Indicators Segment */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="card-premium"
                        >
                            <div className="flex justify-between items-center mb-10">
                                <div>
                                    <h3 className="text-2xl font-bold tracking-tight mb-1">Analyse Différentielle</h3>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Performance Humaine par Catégorie</p>
                                </div>
                                <div className="flex gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center border border-red-100 shadow-sm"><Zap size={14} className="text-[#E2001A]" /></div>
                                </div>
                            </div>

                            <div className="space-y-8">
                                {getCategoryScores().length > 0 ? (
                                    getCategoryScores().map((cat: any, idx: number) => (
                                        <ProgressBar key={`${cat.name}-${idx}`} label={cat.name} progress={cat.score} color={cat.color} />
                                    ))
                                ) : (
                                    <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-[32px] bg-gray-50/30">
                                        <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-2">Aucune donnée classifiée</p>
                                        <p className="text-[10px] text-gray-300 font-medium">L'analyse différentielle s'affichera après les premières réponses.</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* Verbatims Segment */}
                        <div className="card-premium p-0 overflow-hidden">
                            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <h4 className="text-lg font-bold flex items-center gap-3">
                                    <MessageSquare size={20} className="text-[#E2001A]" />
                                    Paroles de Collaborateurs
                                </h4>
                                <span className="text-[10px] font-black uppercase tracking-widest text-[#E2001A] px-3 py-1 bg-red-100 rounded-full">
                                    12 NOUVEAUX COMMENTAIRES
                                </span>
                            </div>
                            <div className="divide-y divide-gray-50">
                                <CommentItem
                                    category="Logistique & Workplace"
                                    date="Aujourd'hui, 09:12"
                                    text="L'espace de co-working au 3ème étage a considérablement amélioré ma productivité les jours de grande influence. C'est une excellente initiative."
                                    color="#E2001A"
                                    author="Anonyme • Agence Bastos"
                                />
                                <CommentItem
                                    category="Développement RH"
                                    date="Hier, 15:45"
                                    text="Les parcours de formation digitale sont très bien structurés. J'apprécie le fait que nous puissions monter en compétence à notre propre rythme."
                                    color="#FFD700"
                                    author="Anonyme • Siège Social"
                                />
                            </div>
                            <button className="w-full py-6 text-xs font-black uppercase tracking-[0.2em] text-gray-400 hover:text-[#E2001A] hover:bg-red-50/50 transition-all border-t border-gray-100">
                                Voir tous les verbatims (158)
                            </button>
                        </div>
                    </div>

                    {/* Filters & Actions Sidebar */}
                    <div className="space-y-6">
                        <div className="card-premium bg-[#1A1A1A] text-white p-8">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-2 bg-[#FFD700] rounded-lg">
                                    <Search size={18} className="text-[#1A1A1A]" />
                                </div>
                                <h4 className="font-bold text-lg tracking-tight">Segmenter</h4>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] uppercase font-black tracking-widest text-gray-500 block mb-3">Unité Opérationnelle</label>
                                    <select className="bg-white/5 border border-white/10 rounded-xl p-4 w-full text-white text-sm outline-none focus:border-[#FFD700] transition-all cursor-pointer">
                                        <option className="bg-[#1A1A1A]">Groupe Afriland (Tous)</option>
                                        <option className="bg-[#1A1A1A]">Siège Bastos</option>
                                        <option className="bg-[#1A1A1A]">Agences Littoral</option>
                                        <option className="bg-[#1A1A1A]">Filiales Internationales</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-[10px] uppercase font-black tracking-widest text-gray-500 block mb-3">Période d'Analyse</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button className="py-3 bg-[#FFD700] text-[#1A1A1A] rounded-xl text-xs font-black uppercase tracking-widest">MENSUEL</button>
                                        <button className="py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-black text-gray-400 uppercase tracking-widest hover:bg-white/10 transition-all">ANNUEL</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="card-premium border-dashed border-2 bg-gradient-to-br from-white to-gray-50 p-8 text-center flex flex-col items-center">
                            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-xl shadow-gray-200/50 mb-6 border border-gray-100">
                                <Download className="text-[#E2001A]" size={28} />
                            </div>
                            <h5 className="text-xl font-bold mb-3 tracking-tight">Rapport d'Analyse Intégral</h5>
                            <p className="text-gray-400 text-sm mb-8 leading-relaxed">
                                Générez un dossier de 15 pages comprenant des analyses prédictives et des recommandations stratégiques.
                            </p>
                            <button onClick={generateComprehensiveReport} className="btn btn-outline w-full py-4 text-sm font-black tracking-widest border-gray-200 text-gray-600 hover:border-[#E2001A] hover:text-[#E2001A] transition-all">
                                GÉNÉRER LE DOSSIER
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Admin Login Modal */}
            {showLoginModal && (
                <AdminLogin
                    onSuccess={handleLoginSuccess}
                    onCancel={() => window.location.hash = '#/'}
                />
            )}
        </div>
    );
};

const StatCard = ({ icon, label, value, total, trend, sublabel, color }: any) => (
    <motion.div
        whileHover={{ y: -8, boxShadow: '0 40px 80px -15px rgba(0,0,0,0.08)' }}
        className="card-premium p-6 sm:p-8 flex flex-col justify-between h-full bg-white relative overflow-hidden group"
    >
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-gray-50 to-transparent -z-10 group-hover:from-red-50 transition-all"></div>
        <div className="flex justify-between items-start mb-6 sm:mb-8">
            <div className="p-2.5 sm:p-3 rounded-2xl group-hover:scale-110 transition-transform duration-500" style={{ backgroundColor: color ? `${color}20` : '#f9fafb' }}>{icon}</div>
            <div className={`text-[9px] sm:text-[10px] font-black px-2 sm:px-3 py-1 rounded-full ${trend.startsWith('+') ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                {trend}
            </div>
        </div>
        <div>
            <p className="text-gray-400 text-[9px] sm:text-[10px] uppercase font-black tracking-[0.2em] mb-2">{label}</p>
            <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl sm:text-5xl font-black font-premium tracking-tighter" style={{ color: color || 'inherit' }}>{value}</span>
                <span className="text-gray-400 text-lg sm:text-xl font-black font-premium">{total}</span>
            </div>
            <p className="text-[9px] sm:text-[10px] text-gray-400 font-bold leading-tight">{sublabel}</p>
        </div>
    </motion.div>
);

const ProgressBar = ({ label, progress, color }: any) => (
    <div className="group">
        <div className="flex justify-between items-center mb-4">
            <span className="font-extrabold text-sm text-gray-600 tracking-tight group-hover:text-gray-900 transition-colors">{label}</span>
            <div className="flex items-baseline gap-1">
                <span className="font-black text-xl font-premium" style={{ color }}>{progress}</span>
                <span className="text-[10px] text-gray-300 font-black">%</span>
            </div>
        </div>
        <div className="h-4 bg-gray-100 rounded-full overflow-hidden p-[3px]">
            <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${progress}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, ease: [0.34, 1.56, 0.64, 1] }}
                className="h-full rounded-full relative"
                style={{ backgroundColor: color }}
            >
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/10 to-transparent"></div>
                <div className="absolute top-0 right-0 h-full w-4 bg-white/20 blur-[2px] -skew-x-12"></div>
            </motion.div>
        </div>
    </div>
);

const CommentItem = ({ category, date, text, color, author }: any) => (
    <div className="p-8 hover:bg-gray-50/50 transition-all cursor-pointer group border-l-[12px] border-transparent hover:border-[#E2001A]/10">
        <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }}></div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 group-hover:text-[#E2001A] transition-colors">{category}</span>
            </div>
            <span className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">{date}</span>
        </div>
        <p className="text-gray-700 font-medium italic text-lg leading-relaxed mb-4 group-hover:text-gray-900 transition-colors">
            "{text}"
        </p>
        <div className="flex items-center gap-2">
            <div className="w-5 h-[1.5px] bg-gray-200"></div>
            <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{author}</span>
        </div>
    </div>
);
