


import React, { createContext, useState, useContext, ReactNode, useCallback, useMemo } from 'react';

// All translations will be managed here for simplicity.
const translations = {
  pt: {
    // General
    'loading': 'A carregar...',
    'error': 'Ocorreu um erro',
    'success': 'Sucesso',
    'back': 'Voltar',
    'save': 'Guardar',
    'close': 'Fechar',
    'submit': 'Submeter',
    'actions': 'Acções',
    'manage': 'Gerir',
    'edit': 'Editar',
    'delete': 'Eliminar',
    'confirm': 'Confirmar',
    'cancel': 'Cancelar',
    
    // Header & Navigation
    'header.courses': 'Cursos',
    'header.about': 'Sobre Nós',
    'header.login': 'Entrar',
    'header.register': 'Registar',
    'header.adminDashboard': 'Painel de Admin',
    'header.myDashboard': 'O Meu Painel',
    'header.myProfile': 'O Meu Perfil',
    'header.logout': 'Sair',
    'header.openMenu': 'Abrir menu',
    'logo.academy': 'Academy',

    // Footer
    'footer.navigation': 'Navegação',
    'footer.support': 'Apoio',
    'footer.mozupWebsite': 'Website Mozup',
    'footer.account': 'Conta',
    'footer.studentLogin': 'Login de Aluno',
    'footer.adminLogin': 'Acesso de Admin',
    'footer.maputo': 'Maputo',
    'footer.pemba': 'Pemba',
    'footer.slogan': 'Vamos trabalhar juntos',
    'footer.copyright': 'Todos os direitos reservados.',

    // Home Page
    'home.hero.title': 'Capacitação Profissional para',
    'home.hero.title.highlight': 'o Futuro',
    'home.hero.subtitle': 'A nossa missão é fornecer conhecimento acessível e de alta qualidade sobre sectores vitais da economia, impulsionando a sua carreira para o próximo nível.',
    'home.hero.button': 'Explorar Cursos',
    'home.courses.title': 'Os Nossos Cursos',
    'home.courses.enrolled': 'Inscrito',
    'home.courses.continue': 'Continuar Curso',
    'home.courses.enroll': 'Inscrever-se',
    'home.courses.manage': 'Gerir Curso',
    'home.courses.noCourses': 'Nenhum curso disponível de momento.',
    'home.courses.new': 'Novo',
    'home.whyUs.title': 'Por que escolher a MozupAcademy?',
    'home.whyUs.card1.title': 'Conteúdo Especializado',
    'home.whyUs.card1.text': 'Cursos desenvolvidos por especialistas da indústria para garantir conhecimento prático e actualizado.',
    'home.whyUs.card2.title': 'Aprendizagem Flexível',
    'home.whyUs.card2.text': 'Aprenda ao seu próprio ritmo, de qualquer lugar, com acesso vitalício aos materiais do curso.',
    'home.whyUs.card3.title': 'Crescimento de Carreira',
    'home.whyUs.card3.text': 'Adquira as competências necessárias para se destacar e avançar no seu campo profissional.',

    // Auth Page
    'auth.loginTitle': 'Aceda à sua conta',
    'auth.registerTitle': 'Crie uma nova conta',
    'auth.fullNamePlaceholder': 'Nome Completo',
    'auth.emailPlaceholder': 'Endereço de e-mail',
    'auth.passwordPlaceholder': 'Palavra-passe',
    'auth.confirmPasswordPlaceholder': 'Confirmar palavra-passe',
    'auth.rememberMe': 'Lembrar-me',
    'auth.terms.agree': 'Li e aceito os',
    'auth.terms.link': 'Termos de Serviço',
    'auth.passwordMinLengthError': 'A palavra-passe deve ter no mínimo 8 caracteres.',
    'auth.passwordsMismatchError': 'As palavras-passe não coincidem.',
    'auth.acceptTermsError': 'Deve aceitar os Termos de Serviço para se registar.',
    'auth.adminCredentialsError': 'Credenciais de administrador. Por favor, use o portal de Acesso de Admin.',
    'auth.emailExistsError': 'Este e-mail já está registado. Por favor, inicie sessão.',
    'auth.unexpectedError': 'Ocorreu um erro inesperado durante o registo. Por favor, tente novamente.',
    'auth.loginButton': 'Entrar',
    'auth.registerButton': 'Registar',
    'auth.toggleToRegister': 'Não tem uma conta? Registe-se',
    'auth.toggleToLogin': 'Já tem uma conta? Inicie sessão',
    'auth.emailConfirmation.title': 'Verifique o seu E-mail',
    'auth.emailConfirmation.messageNew': 'Um e-mail de confirmação foi enviado para {email}. Por favor, verifique a sua caixa de entrada (e a pasta de spam) para activar a sua conta.',
    'auth.emailConfirmation.messageExisting': 'Este e-mail já foi registado, mas não confirmado. Enviámos um novo e-mail de confirmação para {email}. Por favor, verifique a sua caixa de entrada.',
    'auth.emailConfirmation.resendButton': 'Reenviar email de confirmação',
    'auth.emailConfirmation.resending': 'A reenviar...',
    'auth.emailConfirmation.resendSuccess': 'Email de confirmação reenviado com sucesso!',
    'auth.emailConfirmation.resendError': 'Erro ao reenviar: {message}',
    'auth.emailConfirmation.backToLoginButton': 'Voltar para o Login',
    'auth.showPassword': 'Mostrar palavra-passe',
    'auth.hidePassword': 'Ocultar palavra-passe',

    // User Dashboard
    'user.dashboard.title': 'O Meu Painel',
    'user.dashboard.welcome': 'Bem-vindo(a) de volta, {name}!',
    'user.dashboard.myCourses': 'Os Meus Cursos',
    'user.dashboard.noCourses.title': 'Nenhum curso inscrito',
    'user.dashboard.noCourses.subtitle': 'Ainda não se inscreveu em nenhum curso.',
    'user.dashboard.noCourses.button': 'Explorar Cursos',
    'user.dashboard.course.start': 'Iniciar Curso',
    'user.dashboard.course.continue': 'Continuar Curso',
    'user.dashboard.course.modulesCompleted': '{completed} de {total} módulos concluídos',

    // Course player
    'course.player.backToDashboard': 'Voltar ao Meu Painel',
    'course.player.course': 'CURSO',
    'course.player.progress': 'Progresso',
    'course.player.modulesCompleted': '{completed} de {total} módulos concluídos',
    'course.player.modules': 'Módulos',
    'course.player.finalQuiz': 'Quiz Final',
    'course.player.backToLastModule': 'Voltar para o último módulo',
    'course.player.congratulations': 'Parabéns!',
    'course.player.courseComplete': 'Concluiu o curso "{title}" e passou no quiz!',
    'course.player.certificateRequested': 'O seu pedido de certificado foi recebido e será processado em breve.',
    'course.player.requestCertificate': 'Solicitar Certificado',
    'course.player.requestSuccess': 'Pedido de certificado enviado com sucesso!',
    'course.player.requestError': 'Erro ao pedir certificado. Já pode ter solicitado.',
    'course.player.videoNotSupported': 'O seu navegador não suporta o vídeo.',
    'course.player.videoLoadError': 'Não foi possível carregar o vídeo. Tente novamente mais tarde.',
    'course.player.videoSupportContact': 'Se o problema persistir, por favor contacte o apoio.',
    'course.player.loadingVideo': 'A carregar vídeo seguro...',
    'course.player.dataLoadError': 'Não foi possível carregar os dados do curso. Isto pode ser um problema temporário de conexão ou permissão. Por favor, tente recarregar a página.',
    'course.player.retry': 'Tentar Novamente',
    'course.player.errorTitle': 'Ocorreu um Erro',
    
    // Quiz Component
    'quiz.resultsTitle': 'Resultados do Quiz',
    'quiz.yourFinalScore': 'A sua pontuação final:',
    'quiz.passedMessage': 'Parabéns, passou! Pode solicitar o seu certificado.',
    'quiz.failedMessage': 'Não atingiu a pontuação mínima de 70%.',
    'quiz.questionLabel': 'PERGUNTA {current} DE {total}',
    'quiz.previous': 'Anterior',
    'quiz.next': 'Próximo',
    'quiz.finish': 'Finalizar Quiz',
    'quiz.loading': 'A carregar quiz...',

    // Complete Profile Modal
    'profile.modal.title': 'Complete o seu Perfil',
    'profile.modal.subtitle': 'Para continuar, precisamos que preencha as informações abaixo.',
    'profile.modal.companyName': 'Nome da Empresa',
    'profile.modal.phone': 'Telefone',
    'profile.modal.gender': 'Sexo',
    'profile.modal.gender.select': 'Seleccione...',
    'profile.modal.gender.male': 'Masculino',
    'profile.modal.gender.female': 'Feminino',
    'profile.modal.button': 'Guardar e Continuar',
    'profile.modal.saving': 'A guardar...',
    'profile.modal.error.allFields': 'Por favor, preencha todos os campos obrigatórios.',
    'profile.modal.error.update': 'Erro ao actualizar o perfil: {message}',

    // Profile Page
    'profile.page.title': 'O Meu Perfil',
    'profile.page.subtitle': 'Actualize as suas informações pessoais e de segurança.',
    'profile.page.personalInfo': 'Informações Pessoais',
    'profile.page.email': 'Email',
    'profile.page.fullName': 'Nome Completo',
    'profile.page.saveChanges': 'Guardar Alterações',
    'profile.page.saving': 'A guardar...',
    'profile.page.updateSuccess': 'Perfil actualizado com sucesso!',
    'profile.page.updateError': 'Erro ao actualizar o perfil: {message}',
    'profile.page.changePassword': 'Alterar Palavra-passe',
    'profile.page.newPassword': 'Nova Palavra-passe',
    'profile.page.passwordMinLength': 'A palavra-passe deve ter no mínimo 8 caracteres.',
    'profile.page.confirmNewPassword': 'Confirmar Nova Palavra-passe',
    'profile.page.changePasswordButton': 'Alterar Palavra-passe',
    'profile.page.changingPassword': 'A alterar...',
    'profile.page.passwordUpdateSuccess': 'Palavra-passe alterada com sucesso!',
    'profile.page.passwordUpdateError': 'Erro ao alterar a palavra-passe: {message}',
    
    // Admin
    'admin.sidebar.dashboard': 'Painel',
    'admin.sidebar.analytics': 'Análise',
    'admin.sidebar.courses': 'Cursos',
    'admin.sidebar.certificates': 'Certificados',
    'admin.sidebar.progress': 'Progresso',
    'admin.header.hello': 'Olá, {name}',
    'admin.header.viewSite': 'Ver Site Público',
    'admin.header.logout': 'Sair',

    // About Page
    'about.title': 'Sobre a MozupAcademy',
    'about.mission': 'A Nossa Missão',
    'about.subtitle': 'Capacitação Digital para o Crescimento Empresarial',
    'about.p1': 'A MozupAcademy é a plataforma de e-learning do MozUp, o centro de excelência dedicado a tornar as empresas moçambicanas mais competitivas. A nossa academia é uma extensão digital da missão do MozUp: transferir competências e conhecimentos essenciais para apoiar o desenvolvimento económico local.',
    'about.p2': 'Através de cursos online desenvolvidos por especialistas, focados em sectores estratégicos como o de GNL, capacitamos profissionais e PMEs para que possam competir em oportunidades de negócios locais e internacionais. A MozupAcademy oferece a flexibilidade necessária para que aprenda ao seu ritmo, preparando-o para os desafios do mercado actual.',

    // Support Page (User)
    'user.support.title': 'Apoio e Contactos',
    'user.support.subtitle': 'Estamos aqui para ajudar. Encontre respostas ou entre em contacto connosco.',
    'user.support.contacts.title': 'Os Nossos Contactos',
    'user.support.contacts.email.title': 'Email',
    'user.support.contacts.email.desc': 'Para dúvidas gerais e apoio técnico.',
    'user.support.contacts.phone.title': 'Telefone',
    'user.support.contacts.address.title': 'Moradas',
    'user.support.faq.title': 'Perguntas Frequentes',
    'user.support.faq.q1': 'Como altero a minha palavra-passe?',
    'user.support.faq.a1': 'Pode alterar a sua palavra-passe a qualquer momento na sua página de perfil. Navegue até "O Meu Perfil" e procure pela secção "Alterar Palavra-passe".',
    'user.support.faq.q2': 'O acesso aos cursos expira?',
    'user.support.faq.a2': 'Não, o acesso aos cursos é vitalício. Uma vez que se inscreve num curso, ele fica disponível na sua conta para sempre, permitindo que aprenda ao seu próprio ritmo.',
    'user.support.faq.q3': 'Como obtenho o meu certificado?',
    'user.support.faq.a3': 'Após concluir todos os módulos do curso e ser aprovado no quiz final com uma pontuação de 70% ou mais, a opção para solicitar o seu certificado aparecerá na página do curso.',
    'user.support.faq.q4': 'Não consigo visualizar os vídeos. O que faço?',
    'user.support.faq.a4': 'Primeiro, verifique a sua ligação à internet. Se estiver estável, tente limpar a cache do seu navegador ou usar um navegador diferente (recomendamos Chrome ou Firefox). Se o problema persistir, por favor, entre em contacto com o nosso apoio técnico.',

    // Error Boundary
    'error.boundary.title': 'Ocorreu um erro inesperado.',
    'error.boundary.subtitle': 'A nossa equipa foi notificada. Por favor, tente recarregar a página.',
    'error.boundary.button': 'Recarregar Página',

    // Terms Modal
    'terms.title': 'Termo de Compromisso e Utilização',
    'terms.p1': 'A MozupAcademy é a plataforma oficial de e-learning do MozUp, centro de excelência dedicado a fortalecer a competitividade das empresas moçambicanas por meio da capacitação profissional e transferência de conhecimentos.',
    'terms.p2': 'Ao aceder, registar-se ou utilizar a plataforma, a EMPRESA ou PROFISSIONAL UTILIZADOR declara que leu, compreendeu e aceita integralmente os termos abaixo.',
    'terms.h1': '1. Objecto',
    'terms.p1_1': 'Este Termo regula o acesso e utilização da plataforma MozupAcademy, que disponibiliza cursos digitais pré-gravados e conteúdos educacionais destinados exclusivamente à formação e capacitação profissional.',
    'terms.h2': '2. Perfil de Utilização',
    'terms.p2_1': 'A plataforma é destinada a empresas, organizações e profissionais; O acesso pode ser individual ou corporativo, conforme o plano contratado; A utilização é exclusivamente educacional e interna.',
    'terms.h3': '3. Direitos da Plataforma',
    'terms.p3_1': 'A MozupAcademy reserva-se o direito de: Actualizar, modificar ou remover conteúdos a qualquer momento; Suspender ou cancelar contas que violem este Termo; Monitorizar a utilização da plataforma para fins de segurança, qualidade e conformidade legal.',
    'terms.h4': '4. Propriedade Intelectual',
    'terms.p4_1': 'Todos os cursos, vídeos, textos, materiais, metodologias, marcas e sistemas são propriedade exclusiva do MozUp / MozupAcademy. É expressamente proibido: Copiar, gravar, descarregar, partilhar ou redistribuir conteúdos; Revender ou utilizar os cursos para formação externa; Disponibilizar acessos a terceiros não autorizados. Qualquer violação constitui infração legal e poderá resultar em sanções civis e criminais.',
    'terms.h5': '5. Responsabilidades do Utilizador',
    'terms.p5_1': 'O utilizador compromete-se a: Utilizar a plataforma de forma ética e legal; Não tentar violar sistemas de segurança, pagamento ou acesso; Não utilizar os conteúdos para fins comerciais não autorizados; Garantir que apenas pessoas autorizadas da empresa utilizem o acesso.',
    'terms.h6': '6. Utilização Indevida e Penalidades',
    'terms.p6_1': 'Em caso de utilização indevida, a MozupAcademy poderá: Bloquear imediatamente o acesso; Cancelar planos activos sem reembolso; Tomar medidas legais cabíveis para reparação de danos.',
    'terms.h7': '7. Pagamentos e Planos',
    'terms.p7_1': 'O acesso à plataforma pode estar sujeito a pagamento; Valores, prazos e benefícios variam conforme o plano contratado; A falta de pagamento pode resultar na suspensão automática do acesso.',
    'terms.h8': '8. Limitação de Responsabilidade',
    'terms.p8_1': 'A MozupAcademy: Não garante resultados profissionais, financeiros ou comerciais; Não se responsabiliza por decisões tomadas com base nos conteúdos; Oferece os cursos como ferramenta de capacitação, não como consultoria personalizada.',
    'terms.h9': '9. Protecção de Dados',
    'terms.p9_1': 'Os dados fornecidos serão utilizados apenas para: Gestão de contas; Comunicação institucional; Melhoria da experiência da plataforma. Nunca serão vendidos ou partilhados sem consentimento legal.',
    'terms.h10': '10. Rescisão',
    'terms.p10_1': 'O utilizador pode encerrar a utilização da plataforma a qualquer momento. A MozupAcademy pode rescindir o acesso em caso de violação deste Termo.',
    'terms.h11': '11. Legislação Aplicável',
    'terms.p11_1': 'Este Termo rege-se pelas leis da República de Moçambique, sendo competente o foro local para resolução de quaisquer litígios.',
    'terms.final': 'Ao utilizar a MozupAcademy, o utilizador declara concordar integralmente com este Termo.',
    'terms.acceptButton': 'Aceito',
  },
  en: {
    // General
    'loading': 'Loading...',
    'error': 'An error occurred',
    'success': 'Success',
    'back': 'Back',
    'save': 'Save',
    'close': 'Close',
    'submit': 'Submit',
    'actions': 'Actions',
    'manage': 'Manage',
    'edit': 'Edit',
    'delete': 'Delete',
    'confirm': 'Confirm',
    'cancel': 'Cancel',

    // Header & Navigation
    'header.courses': 'Courses',
    'header.about': 'About Us',
    'header.login': 'Login',
    'header.register': 'Register',
    'header.adminDashboard': 'Admin Panel',
    'header.myDashboard': 'My Dashboard',
    'header.myProfile': 'My Profile',
    'header.logout': 'Logout',
    'header.openMenu': 'Open menu',
    'logo.academy': 'Academy',
    
    // Footer
    'footer.navigation': 'Navigation',
    'footer.support': 'Support',
    'footer.mozupWebsite': 'Mozup Website',
    'footer.account': 'Account',
    'footer.studentLogin': 'Student Login',
    'footer.adminLogin': 'Admin Access',
    'footer.maputo': 'Maputo',
    'footer.pemba': 'Pemba',
    'footer.slogan': "Let's work together",
    'footer.copyright': 'All rights reserved.',

    // Home Page
    'home.hero.title': 'Professional Training for',
    'home.hero.title.highlight': 'the Future',
    'home.hero.subtitle': 'Our mission is to provide accessible, high-quality knowledge about vital economic sectors, boosting your career to the next level.',
    'home.hero.button': 'Explore Courses',
    'home.courses.title': 'Our Courses',
    'home.courses.enrolled': 'Enrolled',
    'home.courses.continue': 'Continue Course',
    'home.courses.enroll': 'Enroll',
    'home.courses.manage': 'Manage Course',
    'home.courses.noCourses': 'No courses available at the moment.',
    'home.courses.new': 'New',
    'home.whyUs.title': 'Why choose MozupAcademy?',
    'home.whyUs.card1.title': 'Specialized Content',
    'home.whyUs.card1.text': 'Courses developed by industry experts to ensure practical and up-to-date knowledge.',
    'home.whyUs.card2.title': 'Flexible Learning',
    'home.whyUs.card2.text': 'Learn at your own pace, from anywhere, with lifetime access to course materials.',
    'home.whyUs.card3.title': 'Career Growth',
    'home.whyUs.card3.text': 'Acquire the necessary skills to stand out and advance in your professional field.',

    // Auth Page
    'auth.loginTitle': 'Access your account',
    'auth.registerTitle': 'Create a new account',
    'auth.fullNamePlaceholder': 'Full Name',
    'auth.emailPlaceholder': 'Email address',
    'auth.passwordPlaceholder': 'Password',
    'auth.confirmPasswordPlaceholder': 'Confirm password',
    'auth.rememberMe': 'Remember me',
    'auth.terms.agree': 'I have read and accept the',
    'auth.terms.link': 'Terms of Service',
    'auth.passwordMinLengthError': 'Password must be at least 8 characters long.',
    'auth.passwordsMismatchError': 'Passwords do not match.',
    'auth.acceptTermsError': 'You must accept the Terms of Service to register.',
    'auth.adminCredentialsError': 'Administrator credentials. Please use the Admin Access portal.',
    'auth.emailExistsError': 'This email is already registered. Please log in.',
    'auth.unexpectedError': 'An unexpected error occurred during registration. Please try again.',
    'auth.loginButton': 'Login',
    'auth.registerButton': 'Register',
    'auth.toggleToRegister': "Don't have an account? Register",
    'auth.toggleToLogin': 'Already have an account? Log in',
    'auth.emailConfirmation.title': 'Check your Email',
    'auth.emailConfirmation.messageNew': 'A confirmation email has been sent to {email}. Please check your inbox (and spam folder) to activate your account.',
    'auth.emailConfirmation.messageExisting': 'This email has already been registered but not confirmed. We have sent a new confirmation email to {email}. Please check your inbox.',
    'auth.emailConfirmation.resendButton': 'Resend confirmation email',
    'auth.emailConfirmation.resending': 'Resending...',
    'auth.emailConfirmation.resendSuccess': 'Confirmation email resent successfully!',
    'auth.emailConfirmation.resendError': 'Error resending: {message}',
    'auth.emailConfirmation.backToLoginButton': 'Back to Login',
    'auth.showPassword': 'Show password',
    'auth.hidePassword': 'Hide password',

    // User Dashboard
    'user.dashboard.title': 'My Dashboard',
    'user.dashboard.welcome': 'Welcome back, {name}!',
    'user.dashboard.myCourses': 'My Courses',
    'user.dashboard.noCourses.title': 'No courses enrolled',
    'user.dashboard.noCourses.subtitle': 'You have not enrolled in any courses yet.',
    'user.dashboard.noCourses.button': 'Explore Courses',
    'user.dashboard.course.start': 'Start Course',
    'user.dashboard.course.continue': 'Continue Course',
    'user.dashboard.course.modulesCompleted': '{completed} of {total} modules completed',

    // Course player
    'course.player.backToDashboard': 'Back to My Dashboard',
    'course.player.course': 'COURSE',
    'course.player.progress': 'Progress',
    'course.player.modulesCompleted': '{completed} of {total} modules completed',
    'course.player.modules': 'Modules',
    'course.player.finalQuiz': 'Final Quiz',
    'course.player.backToLastModule': 'Back to the last module',
    'course.player.congratulations': 'Congratulations!',
    'course.player.courseComplete': 'You have completed the course "{title}" and passed the quiz!',
    'course.player.certificateRequested': 'Your certificate request has been received and will be processed shortly.',
    'course.player.requestCertificate': 'Request Certificate',
    'course.player.requestSuccess': 'Certificate request sent successfully!',
    'course.player.requestError': 'Error requesting certificate. You may have already requested it.',
    'course.player.videoNotSupported': 'Your browser does not support the video.',
    'course.player.videoLoadError': 'Could not load the video. Please try again later.',
    'course.player.videoSupportContact': 'If the problem persists, please contact support.',
    'course.player.loadingVideo': 'Loading secure video...',
    'course.player.dataLoadError': 'Could not load course data. This may be a temporary connection or permission issue. Please try reloading the page.',
    'course.player.retry': 'Try Again',
    'course.player.errorTitle': 'An Error Occurred',
    
    // Quiz Component
    'quiz.resultsTitle': 'Quiz Results',
    'quiz.yourFinalScore': 'Your final score:',
    'quiz.passedMessage': 'Congratulations, you passed! You can now request your certificate.',
    'quiz.failedMessage': 'You did not reach the minimum score of 70%.',
    'quiz.questionLabel': 'QUESTION {current} OF {total}',
    'quiz.previous': 'Previous',
    'quiz.next': 'Next',
    'quiz.finish': 'Finish Quiz',
    'quiz.loading': 'Loading quiz...',

    // Complete Profile Modal
    'profile.modal.title': 'Complete your Profile',
    'profile.modal.subtitle': 'To continue, we need you to fill in the information below.',
    'profile.modal.companyName': 'Company Name',
    'profile.modal.phone': 'Phone Number',
    'profile.modal.gender': 'Gender',
    'profile.modal.gender.select': 'Select...',
    'profile.modal.gender.male': 'Male',
    'profile.modal.gender.female': 'Female',
    'profile.modal.button': 'Save and Continue',
    'profile.modal.saving': 'Saving...',
    'profile.modal.error.allFields': 'Please fill in all required fields.',
    'profile.modal.error.update': 'Error updating profile: {message}',

    // Profile Page
    'profile.page.title': 'My Profile',
    'profile.page.subtitle': 'Update your personal and security information.',
    'profile.page.personalInfo': 'Personal Information',
    'profile.page.email': 'Email',
    'profile.page.fullName': 'Full Name',
    'profile.page.saveChanges': 'Save Changes',
    'profile.page.saving': 'Saving...',
    'profile.page.updateSuccess': 'Profile updated successfully!',
    'profile.page.updateError': 'Error updating profile: {message}',
    'profile.page.changePassword': 'Change Password',
    'profile.page.newPassword': 'New Password',
    'profile.page.passwordMinLength': 'Password must be at least 8 characters.',
    'profile.page.confirmNewPassword': 'Confirm New Password',
    'profile.page.changePasswordButton': 'Change Password',
    'profile.page.changingPassword': 'Changing...',
    'profile.page.passwordUpdateSuccess': 'Password changed successfully!',
    'profile.page.passwordUpdateError': 'Error changing password: {message}',
    
    // Admin
    'admin.sidebar.dashboard': 'Dashboard',
    'admin.sidebar.analytics': 'Analytics',
    'admin.sidebar.courses': 'Courses',
    'admin.sidebar.certificates': 'Certificates',
    'admin.sidebar.progress': 'Progress',
    'admin.header.hello': 'Hello, {name}',
    'admin.header.viewSite': 'View Public Site',
    'admin.header.logout': 'Logout',

    // About Page
    'about.title': 'About MozupAcademy',
    'about.mission': 'Our Mission',
    'about.subtitle': 'Digital Empowerment for Business Growth',
    'about.p1': 'MozupAcademy is the official e-learning platform of MozUp, the center of excellence dedicated to making Mozambican companies more competitive. Our academy is a digital extension of MozUp\'s mission: to transfer essential skills and knowledge to support local economic development.',
    'about.p2': 'Through online courses developed by experts, focused on strategic sectors such as LNG, we empower professionals and SMEs to compete for local and international business opportunities. MozupAcademy offers the flexibility you need to learn at your own pace, preparing you for the challenges of today\'s market.',

    // Support Page (User)
    'user.support.title': 'Support and Contacts',
    'user.support.subtitle': 'We\'re here to help. Find answers or get in touch with us.',
    'user.support.contacts.title': 'Our Contacts',
    'user.support.contacts.email.title': 'Email',
    'user.support.contacts.email.desc': 'For general inquiries and technical support.',
    'user.support.contacts.phone.title': 'Phone',
    'user.support.contacts.address.title': 'Addresses',
    'user.support.faq.title': 'Frequently Asked Questions',
    'user.support.faq.q1': 'How do I change my password?',
    'user.support.faq.a1': 'You can change your password at any time on your profile page. Navigate to "My Profile" and look for the "Change Password" section.',
    'user.support.faq.q2': 'Does course access expire?',
    'user.support.faq.a2': 'No, access to courses is for life. Once you enroll in a course, it will be available in your account forever, allowing you to learn at your own pace.',
    'user.support.faq.q3': 'How do I get my certificate?',
    'user.support.faq.a3': 'After completing all course modules and passing the final quiz with a score of 70% or higher, the option to request your certificate will appear on the course page.',
    'user.support.faq.q4': 'I can\'t watch the videos. What should I do?',
    'user.support.faq.a4': 'First, check your internet connection. If it\'s stable, try clearing your browser\'s cache or using a different browser (we recommend Chrome or Firefox). If the problem persists, please contact our technical support.',

    // Error Boundary
    'error.boundary.title': 'An unexpected error occurred.',
    'error.boundary.subtitle': 'Our team has been notified. Please try reloading the page.',
    'error.boundary.button': 'Reload Page',

    // Terms Modal
    'terms.title': 'Commitment and Use Agreement',
    'terms.p1': 'MozupAcademy is the official e-learning platform of MozUp, a center of excellence dedicated to strengthening the competitiveness of Mozambican companies through professional training and knowledge transfer.',
    'terms.p2': 'By accessing, registering, or using the platform, the COMPANY or PROFESSIONAL USER declares that they have read, understood, and fully accept the terms below.',
    'terms.h1': '1. Object',
    'terms.p1_1': 'This Agreement regulates the access and use of the MozupAcademy platform, which provides pre-recorded digital courses and educational content intended exclusively for professional training and capacitation.',
    'terms.h2': '2. User Profile',
    'terms.p2_1': 'The platform is intended for companies, organizations, and professionals; Access can be individual or corporate, depending on the contracted plan; Use is exclusively educational and internal.',
    'terms.h3': '3. Platform Rights',
    'terms.p3_1': 'MozupAcademy reserves the right to: Update, modify, or remove content at any time; Suspend or cancel accounts that violate this Agreement; Monitor platform usage for security, quality, and legal compliance purposes.',
    'terms.h4': '4. Intellectual Property',
    'terms.p4_1': 'All courses, videos, texts, materials, methodologies, brands, and systems are the exclusive property of MozUp / MozupAcademy. It is expressly forbidden to: Copy, record, download, share, or redistribute content; Resell or use the courses for external training; Provide access to unauthorized third parties. Any violation constitutes a legal infraction and may result in civil and criminal penalties.',
    'terms.h5': '5. User Responsibilities',
    'terms.p5_1': 'The user agrees to: Use the platform ethically and legally; Not attempt to violate security, payment, or access systems; Not use the content for unauthorized commercial purposes; Ensure that only authorized company personnel use the access.',
    'terms.h6': '6. Misuse and Penalties',
    'terms.p6_1': 'In case of misuse, MozupAcademy may: Immediately block access; Cancel active plans without a refund; Take appropriate legal action to seek compensation for damages.',
    'terms.h7': '7. Payments and Plans',
    'terms.p7_1': 'Access to the platform may be subject to payment; Prices, terms, and benefits vary according to the contracted plan; Non-payment may result in the automatic suspension of access.',
    'terms.h8': '8. Limitation of Liability',
    'terms.p8_1': 'MozupAcademy: Does not guarantee professional, financial, or commercial results; Is not responsible for decisions made based on the content; Offers the courses as a training tool, not as personalized consulting.',
    'terms.h9': '9. Data Protection',
    'terms.p9_1': 'The data provided will only be used for: Account management; Institutional communication; Improving the platform experience. It will never be sold or shared without legal consent.',
    'terms.h10': '10. Termination',
    'terms.p10_1': 'The user may terminate their use of the platform at any time. MozupAcademy may terminate access in case of violation of this Agreement.',
    'terms.h11': '11. Applicable Law',
    'terms.p11_1': 'This Agreement is governed by the laws of the Republic of Mozambique, with the local jurisdiction being competent to resolve any disputes.',
    'terms.final': 'By using MozupAcademy, the user declares to fully agree with this Agreement.',
    'terms.acceptButton': 'I Accept',
  }
};


type Language = 'pt' | 'en';

interface I18nContextType {
  language: Language;
  changeLanguage: (lang: Language) => void;
  t: (key: string, options?: { [key: string]: string | number }) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('pt');

  const changeLanguage = useCallback((lang: Language) => {
    setLanguage(lang);
  }, []);

  const t = useCallback((key: string, options?: { [key: string]: string | number }): string => {
    let translation = translations[language][key as keyof typeof translations[Language]] || key;
    if (options) {
        Object.keys(options).forEach(optKey => {
            translation = translation.replace(`{${optKey}}`, String(options[optKey]));
        });
    }
    return translation;
  }, [language]);

  const value = useMemo(() => ({ language, changeLanguage, t }), [language, changeLanguage, t]);

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};