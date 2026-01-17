
import React, { useState } from 'react';

const quizData = {
  title: 'TESTE FINAL DO MÓDULO II',
  instructions: 'Selecione a resposta correta para cada pergunta. Você precisa de 3 de 5 acertos para passar.',
  questions: [
    {
      question: '1. Qual é a principal razão para arrefecer o gás natural até –162 °C?',
      options: [
        'A) Reduzir o conteúdo energético do gás',
        'B) Facilitar a combustão em turbinas',
        'C) Diminuir drasticamente o seu volume para facilitar transporte',
        'D) Aumentar a sua densidade calorífica',
      ],
      correctAnswerIndex: 2,
    },
    {
      question: '2. Qual é a sequência correta da cadeia de valor do GNL?',
      options: [
        'A) Transporte → Produção → Liquefação → Utilização',
        'B) Liquefação → Produção → Utilização → Regaseificação',
        'C) Produção → Liquefação → Transporte → Regaseificação → Utilização',
        'D) Produção → Transporte → Liquefação → Utilização',
      ],
      correctAnswerIndex: 2,
    },
    {
      question: '3. O GNL pode estimular novas indústrias, particularmente nos sectores de:',
      options: [
        'A) Agro pecuária',
        'B) Geração elétrica, petroquímica e fertilizantes',
        'C) Têxtil e vestuário',
        'D) Indústria cinematográfica',
      ],
      correctAnswerIndex: 1,
    },
    {
      question: '4. FLNG e plantas onshore são consideradas complementares principalmente porque:',
      options: [
        'A) Competem diretamente pelos mesmos nichos',
        'B) Cada uma é mais adequada para condições técnicas e económicas diferentes',
        'C) Ambas exigem exatamente o mesmo tipo de investimento',
        'D) Uma substitui completamente a outra',
      ],
      correctAnswerIndex: 1,
    },
    {
      question: '5. Como se converte o GNL novamente para gás?',
      options: [
        'A) Congelação',
        'B) Evaporação e compressão',
        'C) Aquecimento controlado',
        'D) Filtração térmica',
      ],
      correctAnswerIndex: 2,
    },
  ],
};

const PASSING_SCORE = 3; // Need to get at least 3 out of 5 correct

interface Module2FinalQuizProps {
    onComplete: () => void;
}

const Module2FinalQuiz: React.FC<Module2FinalQuizProps> = ({ onComplete }) => {
    const [answers, setAnswers] = useState<(number | null)[]>(Array(quizData.questions.length).fill(null));
    const [attempts, setAttempts] = useState(0);
    const [showResults, setShowResults] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    
    const handleAnswerChange = (qIndex: number, oIndex: number) => {
        const newAnswers = [...answers];
        newAnswers[qIndex] = oIndex;
        setAnswers(newAnswers);
    };

    const handleSubmit = () => {
        setAttempts(prev => prev + 1);
        setShowResults(true);
    };
    
    const allAnswered = answers.every(answer => answer !== null);
    
    const goToNext = () => setCurrentQuestionIndex(i => Math.min(quizData.questions.length - 1, i + 1));
    const goToPrev = () => setCurrentQuestionIndex(i => Math.max(0, i - 1));

    if (showResults) {
        let correctCount = 0;
        quizData.questions.forEach((q, index) => {
            if (answers[index] === q.correctAnswerIndex) {
                correctCount++;
            }
        });
        const passed = correctCount >= PASSING_SCORE;
        const canContinue = passed || attempts >= 2;

        return (
            <div className="max-w-3xl w-full text-left bg-white/10 backdrop-blur-lg p-8 rounded-3xl shadow-2xl border-4 border-white/30 text-white animate-fadeInUp max-h-[90vh] flex flex-col">
                <h2 className="text-3xl font-bold mb-4 text-center">Resultados da Avaliação</h2>
                <p className="text-center text-xl mb-6">Você acertou {correctCount} de {quizData.questions.length} perguntas.</p>
                
                {passed ? (
                    <div className="text-center p-4 bg-green-500/50 rounded-lg">
                        <h3 className="font-bold text-lg">Parabéns, você passou!</h3>
                    </div>
                ) : (
                    <div className="text-center p-4 bg-red-500/50 rounded-lg">
                        <h3 className="font-bold text-lg">{attempts < 2 ? 'Não foi desta.' : 'Tentativas esgotadas.'}</h3>
                    </div>
                )}
                
                {(attempts >= 2 && !passed) && (
                     <div className="mt-6 space-y-4 flex-grow overflow-y-auto pr-2">
                        <p className="font-bold text-center mb-2">Respostas Corretas:</p>
                        {quizData.questions.map((q, qIndex) => (
                             <div key={qIndex} className={`p-3 rounded-lg ${answers[qIndex] === q.correctAnswerIndex ? 'bg-green-500/30' : 'bg-red-500/30'}`}>
                                <p className="font-semibold">{q.question}</p>
                                <p className="text-sm mt-1">Sua resposta: {answers[qIndex] !== null ? q.options[answers[qIndex] as number] : 'Não respondida'}</p>
                                {answers[qIndex] !== q.correctAnswerIndex && (
                                    <p className="text-sm font-bold mt-1">Resposta Correta: {q.options[q.correctAnswerIndex]}</p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
                
                <div className="mt-8 text-center flex-shrink-0">
                    {canContinue ? (
                         <button onClick={onComplete} className="bg-white text-brand-moz font-black py-3 px-8 rounded-full hover:bg-gray-100 transition-all shadow-xl active:scale-95 text-lg">
                            Continuar Vídeo
                        </button>
                    ) : (
                        <button onClick={() => { setShowResults(false); setAnswers(Array(quizData.questions.length).fill(null)); setCurrentQuestionIndex(0); }} className="bg-white text-brand-moz font-black py-3 px-8 rounded-full hover:bg-gray-100 transition-all shadow-xl active:scale-95 text-lg">
                            Tentar Novamente ({2 - attempts} tentativa restante)
                        </button>
                    )}
                </div>
            </div>
        );
    }

    const currentQuestion = quizData.questions[currentQuestionIndex];
    const progressPercentage = ((currentQuestionIndex + 1) / quizData.questions.length) * 100;

    return (
        <div className="max-w-4xl w-full text-left bg-brand-moz p-8 rounded-3xl shadow-2xl border-4 border-white/30 text-white animate-fadeInUp max-h-[90vh] flex flex-col">
            <h2 className="text-2xl sm:text-3xl font-black border-b-2 border-white/30 pb-4 uppercase tracking-widest text-white text-center">{quizData.title}</h2>
            
            <div className="my-4 space-y-2">
                <p className="text-center text-sm sm:text-base">{quizData.instructions}</p>
                <div className="w-full bg-white/20 rounded-full h-2.5">
                    <div className="bg-white h-2.5 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
                </div>
            </div>


            <div className="bg-white/10 p-4 sm:p-6 rounded-lg flex-grow flex flex-col justify-center">
                <p className="font-bold text-lg sm:text-xl mb-4 text-center">{currentQuestion.question}</p>
                <div className="space-y-3">
                    {currentQuestion.options.map((option, oIndex) => (
                        <label key={oIndex} className={`flex items-center p-3 rounded-md cursor-pointer transition-all ${answers[currentQuestionIndex] === oIndex ? 'bg-white text-brand-up scale-105 shadow-lg' : 'hover:bg-white/20'}`}>
                            <input
                                type="radio"
                                name={`question-${currentQuestionIndex}`}
                                checked={answers[currentQuestionIndex] === oIndex}
                                onChange={() => handleAnswerChange(currentQuestionIndex, oIndex)}
                                className="h-5 w-5 shrink-0 text-brand-up focus:ring-brand-moz border-gray-300"
                                style={{ accentColor: '#d95829' }}
                            />
                            <span className="ml-4 font-semibold text-base sm:text-lg">{option}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="mt-6 sm:mt-8 flex justify-between items-center flex-shrink-0">
                 <button 
                    onClick={goToPrev} 
                    disabled={currentQuestionIndex === 0} 
                    className="bg-white/20 text-white font-bold py-3 px-6 rounded-full hover:bg-white/40 transition-all shadow-md disabled:opacity-50"
                >
                    Anterior
                </button>
                
                <div className="font-bold">
                    {currentQuestionIndex + 1} / {quizData.questions.length}
                </div>

                {currentQuestionIndex < quizData.questions.length - 1 ? (
                    <button 
                        onClick={goToNext} 
                        className="bg-white text-brand-moz font-bold py-3 px-6 rounded-full hover:bg-gray-100 transition-all shadow-md active:scale-95"
                    >
                        Próximo
                    </button>
                ) : (
                    <button 
                        onClick={handleSubmit} 
                        disabled={!allAnswered} 
                        className="bg-white text-brand-moz font-black py-3 px-6 rounded-full hover:bg-gray-100 transition-all shadow-xl active:scale-95 disabled:opacity-50 text-base"
                    >
                        Submeter Teste
                    </button>
                )}
            </div>
        </div>
    );
};

export default Module2FinalQuiz;
