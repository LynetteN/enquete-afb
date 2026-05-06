import { useState, useEffect } from 'react';
import {
    Plus, Trash2, Copy, Send, ChevronDown, Eye, Settings,
    GripVertical, Info, ShieldCheck, RefreshCcw,
    Type, Star, CheckSquare, AlignLeft, List
} from 'lucide-react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { getSurvey, saveSurvey } from '../utils/persistence';
import { AdminLogin } from '../components/AdminLogin';
import { logout } from '../utils/auth';
import logoAfb from '../assets/logo afb.png';

type QuestionType = 'rating' | 'text' | 'choice';

interface Question {
    id: number;
    text: string;
    type: QuestionType;
    required: boolean;
    category: string;
    options?: string[];
}

const DEFAULT_CATEGORIES = [
    "Environnement de Travail",
    "Management & Leadership",
    "Outils & Moyens DSI",
    "Équilibre Vie Pro/Perso",
    "Rémunération & Avantages",
    "Développement & Carrière"
];

export const SurveyEditor = () => {
    const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
    const [questions, setQuestions] = useState<Question[]>([
        { id: 1, text: "Comment évaluez-vous votre environnement de travail actuel ?", type: 'rating', required: true, category: DEFAULT_CATEGORIES[0] },
        { id: 2, text: "Les outils mis à votre disposition sont-ils performants ?", type: 'choice', required: false, category: DEFAULT_CATEGORIES[2], options: ["Oui", "Non", "En partie"] }
    ]);
    const [activeId, setActiveId] = useState<number | null>(1);
    const [isPublishing, setIsPublishing] = useState(false);
    const [surveyTitle, setSurveyTitle] = useState("Baromètre Climat Social");
    const [surveyDesc, setSurveyDesc] = useState("Chez Afriland First Bank, votre avis est le moteur de notre excellence.");
    const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
    const [openCategoryDropdownId, setOpenCategoryDropdownId] = useState<number | null>(null);
    const [newCatInput, setNewCatInput] = useState("");
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // Check if user is authenticated
        const authData = localStorage.getItem('afriland_admin_auth');
        console.log('SurveyEditor - Checking auth, authData:', authData);

        if (authData) {
            try {
                const auth = JSON.parse(authData);
                const isExpired = Date.now() - auth.timestamp > 24 * 60 * 60 * 1000;
                console.log('SurveyEditor - Auth check:', { isAuthenticated: auth.isAuthenticated, isExpired });

                if (!isExpired && auth.isAuthenticated) {
                    setIsAuthenticated(true);
                    loadSurveyData();
                } else {
                    console.log('SurveyEditor - Showing login modal');
                    setShowLoginModal(true);
                }
            } catch (error) {
                console.error('SurveyEditor - Auth parse error:', error);
                setShowLoginModal(true);
            }
        } else {
            console.log('SurveyEditor - No auth data, showing login modal');
            setShowLoginModal(true);
        }
    }, []);

    const loadSurveyData = () => {
        const existing = getSurvey();
        if (existing) {
            if (existing.categories) setCategories(existing.categories);
            if (existing.questions) setQuestions(existing.questions);
            if (existing.title) setSurveyTitle(existing.title);
            if (existing.description) setSurveyDesc(existing.description);
            if (existing.questions?.length > 0) setActiveId(existing.questions[0].id);
        }
    };

    const handleLoginSuccess = () => {
        console.log('SurveyEditor - handleLoginSuccess called');
        setIsAuthenticated(true);
        setShowLoginModal(false);
        loadSurveyData();
    };

    const handleLogout = () => {
        logout();
        setIsAuthenticated(false);
        setShowLoginModal(true);
    };

    const addQuestion = (type: QuestionType = 'rating') => {
        const newId = Date.now();
        const newQuestion: Question = {
            id: newId,
            text: "",
            type: type,
            required: false,
            category: categories[0] || "Général",
            options: type === 'choice' ? ["Option 1", "Option 2"] : undefined
        };
        setQuestions([...questions, newQuestion]);
        setActiveId(newId);
    };

    const deleteQuestion = (id: number) => {
        setQuestions(questions.filter(q => q.id !== id));
        if (activeId === id) setActiveId(null);
    };

    const updateQuestionType = (id: number, type: QuestionType) => {
        setQuestions(questions.map(q => {
            if (q.id === id) {
                return {
                    ...q,
                    type,
                    options: type === 'choice' ? (q.options || ["Option 1", "Option 2"]) : undefined
                };
            }
            return q;
        }));
    };

    const updateQuestionCategory = (id: number, category: string) => {
        setQuestions(questions.map(q => q.id === id ? { ...q, category } : q));
    };

    const updateQuestionText = (id: number, text: string) => {
        setQuestions(questions.map(q => q.id === id ? { ...q, text } : q));
    };

    const handlePublish = () => {
        setIsPublishing(true);
        const surveyData = {
            title: surveyTitle,
            description: surveyDesc,
            questions: questions,
            categories: categories,
            publishedAt: new Date().toISOString()
        };

        saveSurvey(surveyData);
        setTimeout(() => {
            setIsPublishing(false);
            alert('Enquête publiée avec succès !');
        }, 1000);
    };

    if (!isAuthenticated) {
        console.log('SurveyEditor - Not authenticated, showing login modal:', showLoginModal);
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <p className="text-gray-500 mb-4">Chargement de la page d'administration...</p>
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

    return (
        <div className="forms-workspace bg-[#F0F2F5] min-h-screen pb-40">
            <div className="max-w-4xl mx-auto px-4 pt-10">

                {/* Fixed Top Status Bar */}
                <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] w-full max-w-4xl px-4 sm:px-6">
                    <div className="bg-white/80 backdrop-blur-xl border border-white shadow-2xl rounded-2xl p-3 sm:p-4 flex justify-between items-center">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="bg-[#E2001A] p-1.5 sm:p-2 rounded-lg text-white shrink-0">
                                <ShieldCheck size={18} className="sm:w-5 sm:h-5" />
                            </div>
                            <div className="hidden xs:block">
                                <h4 className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-gray-900 leading-tight">Console DRH</h4>
                                <p className="text-[8px] sm:text-[10px] text-gray-400 font-bold leading-none">Analyse active</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2">
                            <button onClick={handleLogout} className="p-2 sm:p-2.5 text-gray-500 hover:text-red-600 transition-colors rounded-xl hover:bg-red-50" title="Déconnexion">
                                <RefreshCcw size={18} className="sm:w-5 sm:h-5" />
                            </button>
                            <button className="p-2 sm:p-2.5 text-gray-500 hover:text-gray-900 transition-colors rounded-xl hover:bg-gray-100">
                                <Eye size={18} className="sm:w-5 sm:h-5" />
                            </button>
                            <button
                                id="publish-survey"
                                onClick={handlePublish}
                                disabled={isPublishing}
                                className="bg-[#E2001A] text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-lg shadow-red-500/20 hover:bg-[#b30015] transition-all flex items-center gap-2 disabled:opacity-50"
                            >
                                {isPublishing ? <RefreshCcw className="animate-spin" size={14} /> : <Send size={14} />}
                                <span>{isPublishing ? '...' : 'Publier'}</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-24">
                    {/* Header Card */}
                    <motion.div className="bg-white rounded-xl shadow-sm border-t-[12px] border-[#E2001A] p-6 sm:p-10 mb-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 sm:p-6 opacity-20">
                            <img src={logoAfb} alt="" className="w-24 sm:w-32" />
                        </div>
                        <input
                            className="text-2xl sm:text-4xl font-bold w-full outline-none border-b-2 border-transparent focus:border-gray-100 pb-2 mb-4 tracking-tighter bg-transparent relative z-10"
                            value={surveyTitle}
                            onChange={(e) => setSurveyTitle(e.target.value)}
                            placeholder="Titre de l'enquête"
                        />
                        <textarea
                            className="text-gray-500 text-sm sm:text-base w-full outline-none border-none resize-none bg-transparent relative z-10"
                            value={surveyDesc}
                            onChange={(e) => setSurveyDesc(e.target.value)}
                            placeholder="Description (facultatif)"
                            rows={1}
                        />
                    </motion.div>

                    {/* Questions List */}
                    <Reorder.Group axis="y" values={questions} onReorder={setQuestions} className="space-y-4">
                        <AnimatePresence>
                            {questions.map((q, index) => (
                                <Reorder.Item key={q.id} value={q} className="question-card">
                                    <motion.div
                                        className={`bg-white rounded-xl shadow-sm border-l-4 transition-all ${activeId === q.id ? 'border-[#E2001A] p-8' : 'border-transparent p-6 hover:bg-gray-50'}`}
                                        onClick={() => setActiveId(q.id)}
                                    >
                                        <div className="flex gap-4">
                                            <div className="mt-1 text-gray-300 cursor-grab active:cursor-grabbing">
                                                <GripVertical size={20} />
                                            </div>
                                            <div className="flex-1">
                                                {/* Category Badge */}
                                                <div className="mb-4">
                                                    {activeId === q.id ? (
                                                        <div className="relative inline-block">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setOpenCategoryDropdownId(openCategoryDropdownId === q.id ? null : q.id);
                                                                }}
                                                                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#E2001A] bg-red-50 px-3 py-1.5 rounded-full border border-red-100 hover:bg-red-100 transition-colors"
                                                            >
                                                                Catégorie : {q.category || "Non classé"}
                                                                <ChevronDown size={12} />
                                                            </button>
                                                            <AnimatePresence>
                                                                {openCategoryDropdownId === q.id && (
                                                                    <motion.div
                                                                        initial={{ opacity: 0, y: 5 }}
                                                                        animate={{ opacity: 1, y: 0 }}
                                                                        exit={{ opacity: 0, y: 5 }}
                                                                        className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-[60] w-72 overflow-hidden"
                                                                    >
                                                                        <div className="max-h-60 overflow-y-auto">
                                                                            {categories.map(cat => (
                                                                                <button
                                                                                    key={cat}
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        updateQuestionCategory(q.id, cat);
                                                                                        setOpenCategoryDropdownId(null);
                                                                                    }}
                                                                                    className={`w-full text-left px-4 py-2.5 text-xs font-bold hover:bg-gray-50 transition-colors ${q.category === cat ? 'text-[#E2001A]' : 'text-gray-600'}`}
                                                                                >
                                                                                    {cat}
                                                                                </button>
                                                                            ))}
                                                                        </div>

                                                                        <div className="border-t border-gray-100 p-3 bg-gray-50/50">
                                                                            <div className="flex gap-2">
                                                                                <input
                                                                                    type="text"
                                                                                    placeholder="Nouvelle catégorie..."
                                                                                    value={newCatInput}
                                                                                    onClick={(e) => e.stopPropagation()}
                                                                                    onChange={(e) => setNewCatInput(e.target.value)}
                                                                                    className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs outline-none focus:border-[#E2001A]"
                                                                                />
                                                                                <button
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        if (newCatInput.trim()) {
                                                                                            const newCat = newCatInput.trim();
                                                                                            if (!categories.includes(newCat)) {
                                                                                                setCategories([...categories, newCat]);
                                                                                            }
                                                                                            updateQuestionCategory(q.id, newCat);
                                                                                            setNewCatInput("");
                                                                                            setOpenCategoryDropdownId(null);
                                                                                        }
                                                                                    }}
                                                                                    className="p-2 bg-[#E2001A] text-white rounded-lg hover:bg-[#b30015] transition-colors"
                                                                                >
                                                                                    <Plus size={16} />
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    </motion.div>
                                                                )}
                                                            </AnimatePresence>
                                                        </div>
                                                    ) : (
                                                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 bg-gray-50 px-2 py-1 rounded">
                                                            {q.category || "Sans Catégorie"}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex gap-4 mb-6">
                                                    <input
                                                        className={`flex-1 text-xl font-bold outline-none bg-transparent ${activeId === q.id ? 'border-b-2 border-gray-100 pb-2' : ''}`}
                                                        value={q.text}
                                                        onChange={(e) => updateQuestionText(q.id, e.target.value)}
                                                        placeholder={`Question ${index + 1}`}
                                                    />
                                                    {activeId === q.id && (
                                                        <div className="relative">
                                                            <div
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setOpenDropdownId(openDropdownId === q.id ? null : q.id);
                                                                }}
                                                                className="flex items-center gap-2 bg-gray-50 px-4 py-3 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                                                            >
                                                                {q.type === 'rating' && <Star size={18} className="text-[#E2001A]" />}
                                                                {q.type === 'text' && <AlignLeft size={18} className="text-blue-500" />}
                                                                {q.type === 'choice' && <CheckSquare size={18} className="text-green-500" />}
                                                                <span className="text-xs font-bold capitalize">{q.type === 'rating' ? 'Échelle' : q.type === 'choice' ? 'Choix' : 'Texte'}</span>
                                                                <ChevronDown size={14} className={`transition-transform duration-300 ${openDropdownId === q.id ? 'rotate-180' : ''}`} />
                                                            </div>

                                                            <AnimatePresence>
                                                                {openDropdownId === q.id && (
                                                                    <motion.div
                                                                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                                                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                                                        className="absolute top-full right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 py-3 z-[100] w-56 overflow-hidden"
                                                                    >
                                                                        <button onClick={() => { updateQuestionType(q.id, 'rating'); setOpenDropdownId(null); }} className="w-full text-left px-5 py-4 hover:bg-red-50 flex items-center gap-4 text-sm font-bold text-gray-700 transition-colors">
                                                                            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-[#E2001A]"><Star size={18} /></div>
                                                                            Échelle (1-10)
                                                                        </button>
                                                                        <button onClick={() => { updateQuestionType(q.id, 'choice'); setOpenDropdownId(null); }} className="w-full text-left px-5 py-4 hover:bg-green-50 flex items-center gap-4 text-sm font-bold text-gray-700 transition-colors">
                                                                            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-600"><List size={18} /></div>
                                                                            Choix Multiple
                                                                        </button>
                                                                        <button onClick={() => { updateQuestionType(q.id, 'text'); setOpenDropdownId(null); }} className="w-full text-left px-5 py-4 hover:bg-blue-50 flex items-center gap-4 text-sm font-bold text-gray-700 transition-colors">
                                                                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500"><AlignLeft size={18} /></div>
                                                                            Texte Libre
                                                                        </button>
                                                                    </motion.div>
                                                                )}
                                                            </AnimatePresence>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Choice options editor */}
                                                {q.type === 'choice' && activeId === q.id && (
                                                    <div className="space-y-3 mb-8">
                                                        {q.options?.map((opt, i) => (
                                                            <div key={i} className="flex items-center gap-3 group/option px-2">
                                                                <div className="w-4 h-4 rounded-full border-2 border-gray-300 flex-shrink-0"></div>
                                                                <input
                                                                    className="text-sm font-medium outline-none border-b border-transparent focus:border-gray-200 flex-1 py-1"
                                                                    value={opt}
                                                                    onChange={(e) => {
                                                                        const newOpts = [...(q.options || [])];
                                                                        newOpts[i] = e.target.value;
                                                                        setQuestions(questions.map(item => item.id === q.id ? { ...item, options: newOpts } : item));
                                                                    }}
                                                                />
                                                                {(q.options?.length || 0) > 2 && (
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            const newOpts = q.options?.filter((_, index) => index !== i);
                                                                            setQuestions(questions.map(item => item.id === q.id ? { ...item, options: newOpts } : item));
                                                                        }}
                                                                        className="p-1.5 text-gray-400 hover:text-[#E2001A] hover:bg-red-50 rounded-lg opacity-0 group-hover/option:opacity-100 transition-all"
                                                                        title="Supprimer l'option"
                                                                    >
                                                                        <Trash2 size={14} />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        ))}
                                                        <button
                                                            onClick={() => {
                                                                const newOpts = [...(q.options || []), `Option ${(q.options?.length || 0) + 1}`];
                                                                setQuestions(questions.map(item => item.id === q.id ? { ...item, options: newOpts } : item));
                                                            }}
                                                            className="text-[#E2001A] text-xs font-bold flex items-center gap-1 hover:underline ml-9"
                                                        >
                                                            <Plus size={14} /> Ajouter une option
                                                        </button>
                                                    </div>
                                                )}

                                                {activeId === q.id && (
                                                    <div className="flex justify-between items-center pt-6 border-t border-gray-50 mt-8">
                                                        <div className="flex items-center gap-6">
                                                            <div className="flex items-center gap-2">
                                                                <label className="text-[10px] font-black uppercase text-gray-400">Obligatoire</label>
                                                                <div
                                                                    onClick={() => setQuestions(questions.map(item => item.id === q.id ? { ...item, required: !item.required } : item))}
                                                                    className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${q.required ? 'bg-[#E2001A]' : 'bg-gray-200'}`}
                                                                >
                                                                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${q.required ? 'left-6' : 'left-1'}`}></div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <button className="text-gray-400 hover:text-gray-900" title="Dupliquer"><Copy size={18} /></button>
                                                            <button onClick={() => deleteQuestion(q.id)} className="text-gray-400 hover:text-[#E2001A]" title="Supprimer"><Trash2 size={18} /></button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                </Reorder.Item>
                            ))}
                        </AnimatePresence>
                    </Reorder.Group>

                    {/* Bottom Add Bar */}
                    <div className="flex justify-center mt-12">
                        <div className="bg-white rounded-2xl shadow-xl flex p-2 gap-2 border border-gray-100">
                            <button onClick={() => addQuestion('rating')} className="p-4 hover:bg-red-50 text-[#E2001A] rounded-xl flex flex-col items-center gap-2 group">
                                <Star size={24} />
                                <span className="text-[10px] font-black uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">Échelle</span>
                            </button>
                            <button onClick={() => addQuestion('choice')} className="p-4 hover:bg-green-50 text-green-600 rounded-xl flex flex-col items-center gap-2 group">
                                <List size={24} />
                                <span className="text-[10px] font-black uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">Choix</span>
                            </button>
                            <button onClick={() => addQuestion('text')} className="p-4 hover:bg-blue-50 text-blue-500 rounded-xl flex flex-col items-center gap-2 group">
                                <AlignLeft size={24} />
                                <span className="text-[10px] font-black uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">Texte</span>
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
