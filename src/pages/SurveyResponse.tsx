import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, CheckCircle2, ArrowRight, ArrowLeft, AlertCircle, Phone } from 'lucide-react';
import { getSurvey, saveResponse } from '../utils/persistence';
import { hasRespondedInSession, isAdminSession, getSessionToken, getAdminSessionToken } from '../utils/auth';
import logoAfb from '../assets/logo afb.png';

export const SurveyResponse = () => {
    const navigate = useNavigate();
    const [survey, setSurvey] = useState<any>(null);
    const [step, setStep] = useState(0);
    const [submitted, setSubmitted] = useState(false);
    const [alreadyResponded, setAlreadyResponded] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [answers, setAnswers] = useState<any>({});

    const [textAnswer, setTextAnswer] = useState('');

    useEffect(() => {
        const loadSurvey = async () => {
            try {
                const loadedSurvey = await getSurvey();
                if (loadedSurvey) {
                    setSurvey(loadedSurvey);
                    // Check if user is admin
                    const adminCheck = isAdminSession();
                    setIsAdmin(adminCheck);

                    // Only check if already responded for non-admin users
                    if (!adminCheck) {
                        if (hasRespondedInSession(loadedSurvey.title)) {
                            setAlreadyResponded(true);
                        }
                    }
                } else {
                    // Set default survey if none exists
                    setSurvey({
                        title: "Baromètre Engagement Collaborateur",
                        description: "Votre avis est essentiel pour façonner l'excellence chez Afriland First Bank.",
                        questions: [
                            { id: 1, text: "Comment évaluez-vous votre équilibre vie pro / vie perso chez Afriland ?", type: 'rating' },
                            { id: 2, text: "Les objectifs fixés par votre management sont-ils clairs et atteignables ?", type: 'choice', options: ["Tout à fait", "Plutôt oui", "Plutôt non", "Pas du tout"] },
                            { id: 3, text: "Si vous deviez changer une seule chose pour améliorer votre quotidien, laquelle serait-elle ?", type: 'text' }
                        ]
                    });
                }
            } catch (error) {
                console.error('Error loading survey:', error);
                // Set default survey on error
                setSurvey({
                    title: "Baromètre Engagement Collaborateur",
                    description: "Votre avis est essentiel pour façonner l'excellence chez Afriland First Bank.",
                    questions: [
                        { id: 1, text: "Comment évaluez-vous votre équilibre vie pro / vie perso chez Afriland ?", type: 'rating' },
                        { id: 2, text: "Les objectifs fixés par votre management sont-ils clairs et atteignables ?", type: 'choice', options: ["Tout à fait", "Plutôt oui", "Plutôt non", "Pas du tout"] },
                        { id: 3, text: "Si vous deviez changer une seule chose pour améliorer votre quotidien, laquelle serait-elle ?", type: 'text' }
                    ]
                });
            }
        };

        loadSurvey();
    }, []);

    const questions = survey?.questions || [];

    const handleAnswer = (value: any) => {
        const currentQuestion = questions[step];
        setAnswers({ ...answers, [currentQuestion.id]: value });
        setTextAnswer('');
        nextStep();
    };

    const nextStep = () => {
        if (step < questions.length - 1) setStep(step + 1);
        else handleSubmit();
    };

    const handleSubmit = () => {
        // Use admin session token if admin, otherwise use regular session token
        const sessionToken = isAdmin ? getAdminSessionToken() : getSessionToken();

        saveResponse({
            surveyId: survey.title,
            timestamp: new Date().toISOString(),
            answers: answers,
            sessionToken: sessionToken,
            isAdmin: isAdmin
        });
        setSubmitted(true);
    };

    const prevStep = () => {
        if (step > 0) setStep(step - 1);
    };

    if (!survey) return <div className="min-h-screen flex items-center justify-center font-bold">Chargement...</div>;

    if (alreadyResponded) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white p-12 rounded-[40px] shadow-2xl shadow-yellow-500/10 border border-gray-100 text-center max-w-lg"
                >
                    <div className="w-24 h-24 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-white shadow-xl">
                        <AlertCircle size={48} className="text-yellow-500" />
                    </div>
                    <h2 className="text-4xl font-black mb-4 tracking-tighter">Déjà <span className="text-[#FFD700]">répondu</span></h2>
                    <p className="text-gray-500 mb-8 font-medium">Vous avez déjà participé à cette enquête lors de cette session. Une seule réponse par session est autorisée.</p>
                    <button onClick={() => navigate('/')} className="btn btn-primary px-8 py-3 rounded-2xl w-full">Retour à l'accueil</button>
                </motion.div>
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white p-12 rounded-[40px] shadow-2xl shadow-green-500/10 border border-gray-100 text-center max-w-lg"
                >
                    <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-white shadow-xl">
                        <CheckCircle2 size={48} className="text-green-500" />
                    </div>
                    <h2 className="text-4xl font-black mb-4 tracking-tighter">Merci pour <span className="text-[#E2001A]">votre voix.</span></h2>
                    <p className="text-gray-500 mb-8 font-medium">Votre feedback a été transmis anonymement. Il sera analysé par la DRH pour construire l'avenir d'Afriland First Bank.</p>
                    <button onClick={() => navigate('/')} className="btn btn-primary px-8 py-3 rounded-2xl w-full">Retour à l'accueil</button>

                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FDFDFD] py-20 px-4">
            <div className="max-w-3xl mx-auto">
                <div className="mb-12">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#E2001A]">SESSION ANONYME AF-2026</span>
                        <span className="text-[10px] font-black text-gray-400">Question {step + 1} sur {questions.length}</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-[#E2001A]"
                            initial={{ width: 0 }}
                            animate={{ width: `${((step + 1) / questions.length) * 100}%` }}
                        />
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="bg-white p-10 md:p-16 rounded-[40px] shadow-2xl shadow-gray-200/50 border border-gray-100 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-20">
                            <img
                                src={logoAfb}
                                alt=""
                                className="w-48 object-contain"
                            />
                        </div>

                        <h3 className="text-2xl md:text-4xl font-black mb-8 md:mb-12 tracking-tighter leading-tight relative z-10">
                            {questions[step].text}
                        </h3>

                        <div className="space-y-6">
                            {questions[step].type === 'rating' && (
                                <div className="grid grid-cols-5 sm:flex sm:flex-wrap gap-2 md:gap-3">
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                                        <button
                                            key={n}
                                            onClick={() => handleAnswer(n)}
                                            className="aspect-square sm:w-14 sm:h-14 rounded-xl md:rounded-2xl border-2 border-gray-100 flex items-center justify-center font-black text-sm md:text-base text-gray-400 hover:border-[#E2001A] hover:bg-red-50 hover:text-[#E2001A] transition-all hover:scale-105"
                                        >
                                            {n}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {questions[step].type === 'choice' && (
                                <div className="grid grid-cols-1 gap-4">
                                    {(questions[step].options || ["Oui", "Non"]).map((opt: string, i: number) => (
                                        <button
                                            key={i}
                                            onClick={() => handleAnswer(opt)}
                                            className="p-6 rounded-3xl border-2 border-gray-100 text-left hover:border-[#E2001A] hover:bg-red-50 group transition-all"
                                        >
                                            <span className="block font-bold text-gray-900 group-hover:text-[#E2001A] transition-colors">{opt}</span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {questions[step].type === 'text' && (
                                <div className="space-y-6">
                                    <textarea
                                        value={textAnswer}
                                        onChange={(e) => setTextAnswer(e.target.value)}
                                        className="w-full h-40 p-6 rounded-3xl border-2 border-gray-100 outline-none focus:border-[#E2001A] transition-colors font-medium text-lg shadow-inner"
                                        placeholder="Votre réponse ici..."
                                    />
                                    <button
                                        onClick={() => handleAnswer(textAnswer)}
                                        disabled={!textAnswer.trim()}
                                        className="btn btn-primary w-full py-5 rounded-2xl disabled:opacity-50"
                                    >
                                        Transmettre ma réponse
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="mt-16 flex justify-between items-center">
                            <button
                                onClick={prevStep}
                                disabled={step === 0}
                                className={`flex items-center gap-2 font-bold text-sm ${step === 0 ? 'opacity-0 disabled' : 'text-gray-400 hover:text-gray-900 cursor-pointer transition-colors'}`}
                            >
                                <ArrowLeft size={18} /> Retour
                            </button>
                            <button onClick={nextStep} className="text-[#E2001A] font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:translate-x-1 transition-transform">
                                Passer <ArrowRight size={16} />
                            </button>
                        </div>
                    </motion.div>
                </AnimatePresence>

                <div className="mt-12 flex items-center justify-center gap-3 py-6 px-8 bg-gray-50/50 rounded-full border border-gray-100">
                    <Shield size={20} className="text-gray-400" />
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                        Données Chiffrées • Anonymat certifié Afriland First Bank
                    </p>
                </div>

                {/* Support Client Section */}
                <div className="mt-8 max-w-2xl mx-auto">
                    <div className="bg-gradient-to-br from-[#E2001A]/5 to-[#FFD700]/5 rounded-3xl border border-gray-100 p-6 sm:p-8 text-center">
                        <div className="flex items-center justify-center gap-2 mb-3">
                            <Phone size={18} className="text-[#E2001A]" />
                            <h3 className="text-base sm:text-lg font-black text-gray-900">Support Client</h3>
                        </div>
                        <p className="text-sm sm:text-base font-bold text-gray-700 mb-4">
                            Une question sur le baromètre de satisfaction ?
                        </p>
                        <div className="inline-flex items-center gap-2 sm:gap-3 bg-white px-4 sm:px-6 py-3 sm:py-4 rounded-2xl shadow-lg border border-gray-100">
                            <span className="text-xs sm:text-sm font-medium text-gray-600">Contacter la DRH :</span>
                            <span className="text-base sm:text-lg font-black text-[#E2001A]">Cisco 01411</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
