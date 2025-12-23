import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Module, UserProgress, Course, QuizQuestion, QuizAttempt } from '../types';

const LockIcon = () => (
    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
);
const CheckCircleIcon = () => (
    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
);

const QuizComponent: React.FC<{ courseId: string; onQuizComplete: (passed: boolean) => void }> = ({ courseId, onQuizComplete }) => {
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<(number|null)[]>([]);
    const [showResults, setShowResults] = useState(false);
    const [score, setScore] = useState(0);
    const { user } = useAuth();
  
    useEffect(() => {
      const fetchQuestions = async () => {
        const { data, error } = await supabase
          .from('quiz_questions')
          .select('*')
          .eq('course_id', courseId);
        if (data) {
          setQuestions(data);
          setAnswers(new Array(data.length).fill(null));
        }
      };
      fetchQuestions();
    }, [courseId]);
  
    const handleAnswer = (optionIndex: number) => {
      const newAnswers = [...answers];
      newAnswers[currentQuestionIndex] = optionIndex;
      setAnswers(newAnswers);
    };
  
    const handleSubmit = async () => {
        if (!user) return;
        let correctAnswers = 0;
        questions.forEach((q, index) => {
            if (answers[index] === q.correct_option_index) {
                correctAnswers++;
            }
        });
        const finalScore = (correctAnswers / questions.length) * 100;
        setScore(finalScore);
        setShowResults(true);

        const passed = finalScore >= 70;

        await supabase.from('quiz_attempts').insert({
            user_id: user.id,
            course_id: courseId,
            score: finalScore,
            passed: passed,
        });

        onQuizComplete(passed);
    };
  
    if (showResults) {
      return (
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <h3 className="text-2xl font-bold mb-4">Resultados do Quiz</h3>
          <p className="text-xl mb-4">Sua pontuação: <span className="font-bold text-orange-500">{score.toFixed(2)}%</span></p>
          {score >= 70 ? (
            <p className="text-green-600 font-semibold">Parabéns, você passou!</p>
          ) : (
            <p className="text-red-600 font-semibold">Você não atingiu a pontuação mínima de 70%. Tente novamente.</p>
          )}
        </div>
      );
    }
  
    const currentQuestion = questions[currentQuestionIndex];
  
    return currentQuestion ? (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h3 className="text-xl font-bold mb-4">{currentQuestion.question_text}</h3>
        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => (
            <label key={index} className="flex items-center p-3 rounded-lg border hover:bg-gray-100 cursor-pointer">
              <input
                type="radio"
                name={`question-${currentQuestion.id}`}
                checked={answers[currentQuestionIndex] === index}
                onChange={() => handleAnswer(index)}
                className="form-radio h-5 w-5 text-orange-600"
              />
              <span className="ml-3 text-gray-700">{option}</span>
            </label>
          ))}
        </div>
        <div className="mt-6 flex justify-between">
          <button 
            onClick={() => setCurrentQuestionIndex(i => Math.max(0, i - 1))} 
            disabled={currentQuestionIndex === 0}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md disabled:opacity-50"
          >
            Anterior
          </button>
          {currentQuestionIndex < questions.length - 1 ? (
            <button 
              onClick={() => setCurrentQuestionIndex(i => Math.min(questions.length - 1, i + 1))}
              className="px-4 py-2 bg-orange-500 text-white rounded-md"
            >
              Próximo
            </button>
          ) : (
            <button 
              onClick={handleSubmit}
              className="px-4 py-2 bg-green-500 text-white rounded-md"
            >
              Finalizar
            </button>
          )}
        </div>
      </div>
    ) : <div>Carregando quiz...</div>;
};

const CoursePlayerPage: React.FC = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [course, setCourse] = useState<Course | null>(null);
    const [modules, setModules] = useState<Module[]>([]);
    const [completedModules, setCompletedModules] = useState<string[]>([]);
    const [activeModule, setActiveModule] = useState<Module | null>(null);
    const [signedVideoUrl, setSignedVideoUrl] = useState<string | null>(null);
    const [videoError, setVideoError] = useState<string | null>(null);
    const [view, setView] = useState<'video' | 'quiz' | 'certificate'>('video');
    const [quizPassed, setQuizPassed] = useState(false);
    const [certificateRequested, setCertificateRequested] = useState(false);
    const [loading, setLoading] = useState(true);

    const logActivity = useCallback(async (moduleId: string) => {
        if (!user || !courseId) return;
        await supabase.from('activity_log').insert({
            user_id: user.id,
            course_id: courseId,
            module_id: moduleId,
            activity_type: 'MODULE_VIEWED',
        });
    }, [user, courseId]);

    useEffect(() => {
      const generateSignedUrl = async () => {
        if (activeModule && activeModule.video_url) {
          setSignedVideoUrl(null); // Clear previous URL while loading the new one
          setVideoError(null); // Clear previous error
          
          let videoPath = activeModule.video_url;
          // For backward compatibility, parse path from old public URLs
          if (videoPath.startsWith('http')) {
            try {
              const url = new URL(videoPath);
              videoPath = url.pathname.split('/course_videos/')[1];
            } catch (e) {
              console.error("Invalid video URL format:", videoPath);
              setVideoError("Formato de URL do vídeo inválido.");
              return;
            }
          }
          
          const { data, error } = await supabase.storage
            .from('course_videos')
            .createSignedUrl(videoPath, 3600); // URL is valid for 1 hour

          if (error) {
            console.error("Error creating signed URL:", error);
            setVideoError("Não foi possível carregar o vídeo. Tente novamente mais tarde.");
          } else {
            setSignedVideoUrl(data.signedUrl);
          }
        }
      };
      generateSignedUrl();
    }, [activeModule]);

    const fetchCourseData = useCallback(async () => {
      if (!user || !courseId) return;
      setLoading(true);

      const { data: courseData } = await supabase.from('courses').select('*').eq('id', courseId).single();
      setCourse(courseData);

      const { data: modulesData } = await supabase.from('modules').select('*').eq('course_id', courseId).order('order');
      if (modulesData) setModules(modulesData);

      const { data: progressData } = await supabase.from('user_progress').select('module_id').eq('user_id', user.id);
      const completedIds = progressData ? progressData.map(p => p.module_id) : [];
      setCompletedModules(completedIds);
      
      const { data: attemptData } = await supabase
        .from('quiz_attempts')
        .select('passed')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .order('completed_at', { ascending: false })
        .limit(1)
        .single();
    
      if (attemptData?.passed) {
        setQuizPassed(true);
        setView('certificate');
        const {data: certReq} = await supabase.from('certificate_requests').select('*').eq('user_id', user.id).eq('course_id', courseId).single();
        if(certReq) setCertificateRequested(true);
      } else {
        const firstUncompletedModule = modulesData?.find(m => !completedIds.includes(m.id));
        const initialModule = firstUncompletedModule || modulesData?.[0] || null;
        if (initialModule) {
          setActiveModule(initialModule);
          logActivity(initialModule.id);
        }
      }
      
      setLoading(false);
    // FIX: Removed `activeModule` from dependency array to prevent infinite loop.
    }, [user, courseId, logActivity]);

    useEffect(() => {
        fetchCourseData();
    }, [fetchCourseData]);

    const handleSelectModule = (module: Module) => {
        setActiveModule(module);
        setView('video');
        logActivity(module.id);
    };

    const handleModuleComplete = async (moduleId: string) => {
        if (!user || completedModules.includes(moduleId)) return;
    
        await supabase.from('user_progress').insert({ user_id: user.id, module_id: moduleId });
        const newCompleted = [...completedModules, moduleId];
        setCompletedModules(newCompleted);
    
        const nextModuleIndex = modules.findIndex(m => m.id === moduleId) + 1;
        if (nextModuleIndex < modules.length) {
          const nextModule = modules[nextModuleIndex];
          setActiveModule(nextModule);
          logActivity(nextModule.id);
        } else {
          setView('quiz');
        }
    };
    
    const handleQuizComplete = (passed: boolean) => {
        if(passed) {
            setQuizPassed(true);
            setView('certificate');
        }
    };

    const handleRequestCertificate = async () => {
        if (!user || !courseId) return;
        const { error } = await supabase.from('certificate_requests').insert({user_id: user.id, course_id: courseId});
        if(!error) {
            setCertificateRequested(true);
            alert("Pedido de certificado enviado com sucesso!");
        } else {
            alert("Erro ao pedir certificado. Você já pode ter solicitado.");
        }
    };

    if (loading) return <div className="text-center">Carregando curso...</div>;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-2">{course?.title}</h1>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="md:col-span-3">
                    {view === 'video' && activeModule && (
                        <div className="bg-white p-4 rounded-lg shadow-md">
                            <h2 className="text-2xl font-semibold mb-4">{activeModule.title}</h2>
                            <div className="aspect-w-16 aspect-h-9 bg-black flex justify-center items-center rounded-lg">
                                {signedVideoUrl ? (
                                    <video key={signedVideoUrl} controls autoPlay className="w-full h-full rounded-lg" onEnded={() => handleModuleComplete(activeModule.id)}>
                                        <source src={signedVideoUrl} type="video/mp4" />
                                        Seu navegador não suporta o vídeo.
                                    </video>
                                ) : videoError ? (
                                    <div className="text-red-400 p-4 text-center">
                                        <p className="font-semibold">{videoError}</p>
                                        <p className="text-sm text-gray-400 mt-2">Se o problema persistir, por favor contacte o suporte.</p>
                                    </div>
                                ) : (
                                    <div className="text-white">Carregando vídeo seguro...</div>
                                )}
                            </div>
                        </div>
                    )}
                    {view === 'quiz' && courseId && <QuizComponent courseId={courseId} onQuizComplete={handleQuizComplete} />}
                    {view === 'certificate' && quizPassed && (
                        <div className="bg-white p-8 rounded-lg shadow-md text-center">
                            <h2 className="text-3xl font-bold text-green-600 mb-4">Parabéns!</h2>
                            <p className="text-lg mb-6">Você concluiu o curso "{course?.title}" e passou no quiz!</p>
                            {certificateRequested ? (
                                <p className="text-blue-600 font-semibold">Seu pedido de certificado foi recebido. Ele será processado em breve.</p>
                            ) : (
                                <button onClick={handleRequestCertificate} className="bg-orange-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-orange-600 transition">
                                    Solicitar Certificado
                                </button>
                            )}
                        </div>
                    )}
                </div>
                <aside className="md:col-span-1 bg-white p-4 rounded-lg shadow-md">
                    <h3 className="text-lg font-bold mb-4">Módulos do Curso</h3>
                    <ul className="space-y-2">
                    {modules.map((module, index) => {
                        const isCompleted = completedModules.includes(module.id);
                        const isLocked = index > 0 && !completedModules.includes(modules[index - 1].id);
                        const isActive = activeModule?.id === module.id;

                        return (
                        <li key={module.id}>
                            <button
                            onClick={() => !isLocked && handleSelectModule(module)}
                            disabled={isLocked}
                            className={`w-full text-left p-3 rounded-md flex items-center justify-between transition ${
                                isLocked ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'hover:bg-orange-100'
                            } ${isActive ? 'bg-orange-200 font-semibold' : ''}`}
                            >
                            <span className="truncate">{index + 1}. {module.title}</span>
                            {isCompleted ? <CheckCircleIcon /> : (isLocked && <LockIcon />)}
                            </button>
                        </li>
                        );
                    })}
                    <li className="mt-4">
                        <button 
                            disabled={completedModules.length !== modules.length}
                            onClick={() => setView('quiz')}
                            className="w-full text-left p-3 rounded-md flex items-center justify-between transition bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed font-semibold"
                        >
                            Quiz Final
                            {completedModules.length !== modules.length && <LockIcon />}
                        </button>
                    </li>
                    </ul>
                </aside>
            </div>
        </div>
    );
};

export default CoursePlayerPage;