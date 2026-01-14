import React, { createContext, useState, useContext, ReactNode, useCallback, useMemo } from 'react';

// All translations will be managed here for simplicity.
const translations = {
  pt: {
    // General
    'loading': 'Carregando...',
    'error': 'Ocorreu um erro',
    'success': 'Sucesso',
    'back': 'Voltar',
    'save': 'Salvar',
    'close': 'Fechar',
    'submit': 'Enviar',
    'actions': 'Ações',
    'manage': 'Gerenciar',
    'edit': 'Editar',
    'delete': 'Excluir',
    'confirm': 'Confirmar',
    'cancel': 'Cancelar',
    
    // Header & Navigation
    'header.courses': 'Cursos',
    'header.about': 'Sobre Nós',
    'header.login': 'Entrar',
    'header.register': 'Registrar',
    'header.adminDashboard': 'Painel Admin',
    'header.myDashboard': 'Meu Painel',
    'header.myProfile': 'Meu Perfil',
    'header.logout': 'Sair',
    'header.openMenu': 'Abrir menu',
    'logo.academy': 'Academy',

    // Footer
    'footer.navigation': 'Navegação',
    'footer.support': 'Suporte',
    'footer.mozupWebsite': 'Website Mozup',
    'footer.account': 'Conta',
    'footer.studentLogin': 'Login Aluno',
    'footer.adminLogin': 'Acesso Admin',
    'footer.maputo': 'Maputo',
    'footer.pemba': 'Pemba',
    'footer.slogan': 'Capacitação profissional para o futuro, hoje.',
    'footer.copyright': 'Todos os direitos reservados.',

    // Home Page
    'home.hero.title': 'Capacitação Profissional para o Futuro',
    'home.hero.title.highlight': 'o Futuro',
    'home.hero.subtitle': 'Nossa missão é fornecer conhecimento acessível e de alta qualidade sobre setores vitais da economia, impulsionando sua carreira para o próximo nível.',
    'home.hero.button': 'Explorar Cursos',
    'home.courses.title': 'Nossos Cursos',
    'home.courses.enrolled': 'Inscrito',
    'home.courses.continue': 'Continuar Curso',
    'home.courses.enroll': 'Inscrever-se',
    'home.courses.noCourses': 'Nenhum curso disponível no momento.',
    'home.courses.new': 'Novo',
    'home.whyUs.title': 'Por que escolher a MozupAcademy?',
    'home.whyUs.card1.title': 'Conteúdo Especializado',
    'home.whyUs.card1.text': 'Cursos desenvolvidos por especialistas da indústria para garantir conhecimento prático e atualizado.',
    'home.whyUs.card2.title': 'Aprendizagem Flexível',
    'home.whyUs.card2.text': 'Aprenda no seu próprio ritmo, de qualquer lugar, com acesso vitalício aos materiais do curso.',
    'home.whyUs.card3.title': 'Crescimento de Carreira',
    'home.whyUs.card3.text': 'Adquira as habilidades necessárias para se destacar e avançar no seu campo profissional.',

    // Auth Page
    'auth.loginTitle': 'Acesse sua conta',
    'auth.registerTitle': 'Crie uma nova conta',
    'auth.fullNamePlaceholder': 'Nome Completo',
    'auth.emailPlaceholder': 'Endereço de e-mail',
    'auth.passwordPlaceholder': 'Senha',
    'auth.confirmPasswordPlaceholder': 'Confirmar senha',
    'auth.terms.agree': 'Li e aceito os',
    'auth.terms.link': 'Termos de Serviço',
    'auth.passwordMinLengthError': 'A senha deve ter no mínimo 8 caracteres.',
    'auth.passwordsMismatchError': 'As senhas não coincidem.',
    'auth.acceptTermsError': 'Você deve aceitar os Termos de Serviço para se registrar.',
    'auth.adminCredentialsError': 'Credenciais de administrador. Por favor, use o portal de Acesso Admin.',
    'auth.emailExistsError': 'Este e-mail já está registrado. Por favor, faça login.',
    'auth.unexpectedError': 'Ocorreu um erro inesperado durante o registro. Por favor, tente novamente.',
    'auth.loginButton': 'Entrar',
    'auth.registerButton': 'Registrar',
    'auth.toggleToRegister': 'Não tem uma conta? Registre-se',
    'auth.toggleToLogin': 'Já tem uma conta? Faça login',
    'auth.emailConfirmation.title': 'Verifique seu E-mail',
    'auth.emailConfirmation.messageNew': 'Um e-mail de confirmação foi enviado para {email}. Por favor, verifique sua caixa de entrada (e a pasta de spam) para ativar sua conta.',
    'auth.emailConfirmation.messageExisting': 'Este e-mail já foi registrado, mas não confirmado. Enviamos um novo e-mail de confirmação para {email}. Por favor, verifique sua caixa de entrada.',
    'auth.emailConfirmation.resendButton': 'Reenviar email de confirmação',
    'auth.emailConfirmation.resending': 'Reenviando...',
    'auth.emailConfirmation.resendSuccess': 'Email de confirmação reenviado com sucesso!',
    'auth.emailConfirmation.resendError': 'Erro ao reenviar: {message}',
    'auth.emailConfirmation.backToLoginButton': 'Voltar para Login',
    'auth.showPassword': 'Mostrar senha',
    'auth.hidePassword': 'Ocultar senha',

    // User Dashboard
    'user.dashboard.title': 'Meu Painel',
    'user.dashboard.welcome': 'Bem-vindo(a) de volta, {name}!',
    'user.dashboard.myCourses': 'Meus Cursos',
    'user.dashboard.noCourses.title': 'Nenhum curso inscrito',
    'user.dashboard.noCourses.subtitle': 'Você ainda não se inscreveu em nenhum curso.',
    'user.dashboard.noCourses.button': 'Explorar Cursos',
    'user.dashboard.course.start': 'Iniciar Curso',
    'user.dashboard.course.continue': 'Continuar Curso',
    'user.dashboard.course.modulesCompleted': '{completed} de {total} módulos completos',

    // Complete Profile Modal
    'profile.modal.title': 'Complete seu Perfil',
    'profile.modal.subtitle': 'Para continuar, precisamos que você preencha as informações abaixo.',
    'profile.modal.companyName': 'Nome da Empresa',
    'profile.modal.phone': 'Telefone',
    'profile.modal.gender': 'Sexo',
    'profile.modal.gender.select': 'Selecione...',
    'profile.modal.gender.male': 'Masculino',
    'profile.modal.gender.female': 'Feminino',
    'profile.modal.button': 'Salvar e Continuar',
    'profile.modal.saving': 'Salvando...',
    'profile.modal.error.allFields': 'Por favor, preencha todos os campos obrigatórios.',
    'profile.modal.error.update': 'Erro ao atualizar o perfil: {message}',

    // Profile Page
    'profile.page.title': 'Meu Perfil',
    'profile.page.subtitle': 'Atualize suas informações pessoais e de segurança.',
    'profile.page.personalInfo': 'Informações Pessoais',
    'profile.page.email': 'Email',
    'profile.page.fullName': 'Nome Completo',
    'profile.page.saveChanges': 'Salvar Alterações',
    'profile.page.saving': 'Salvando...',
    'profile.page.updateSuccess': 'Perfil atualizado com sucesso!',
    'profile.page.updateError': 'Erro ao atualizar o perfil: {message}',
    'profile.page.changePassword': 'Alterar Senha',
    'profile.page.newPassword': 'Nova Senha',
    'profile.page.passwordMinLength': 'A senha deve ter no mínimo 8 caracteres.',
    'profile.page.confirmNewPassword': 'Confirmar Nova Senha',
    'profile.page.changePasswordButton': 'Alterar Senha',
    'profile.page.changingPassword': 'Alterando...',
    'profile.page.passwordUpdateSuccess': 'Senha alterada com sucesso!',
    'profile.page.passwordUpdateError': 'Erro ao alterar a senha: {message}',
    
    // Admin
    'admin.sidebar.dashboard': 'Dashboard',
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
    'about.p2': 'Através de cursos online desenvolvidos por especialistas, focados em setores estratégicos como o de GNL, capacitamos profissionais e PMEs para que possam competir em oportunidades de negócios locais e internacionais. A MozupAcademy oferece a flexibilidade necessária para que você aprenda no seu ritmo, preparando-o para os desafios do mercado atual.',

    // Support Page
    'support.title': 'Suporte e Contactos',
    'support.subtitle': 'Estamos aqui para ajudar. Encontre respostas ou entre em contacto connosco.',
    'support.contacts.title': 'Nossos Contactos',
    'support.contacts.email': 'Email',
    'support.contacts.email.desc': 'Para dúvidas gerais e suporte técnico.',
    'support.contacts.phone': 'Telefone',
    'support.contacts.address': 'Endereços',
    'support.faq.title': 'Perguntas Frequentes',
    'support.faq.q1': 'Como altero a minha senha?',
    'support.faq.a1': 'Você pode redefinir sua senha na página de login, clicando na opção \'Esqueceu a senha?\'. Um link para redefinição será enviado para o seu e-mail.',
    'support.faq.q2': 'O acesso aos cursos expira?',
    'support.faq.a2': 'Não, o seu acesso aos materiais do curso é vitalício. Uma vez inscrito, você pode aprender no seu próprio ritmo, sem prazos.',
    'support.faq.q3': 'Como obtenho o meu certificado?',
    'support.faq.a3': 'Após completar 100% dos módulos do curso e ser aprovado no quiz final, a opção para \'Solicitar Certificado\' ficará disponível na página do curso.',
    'support.faq.q4': 'Não consigo visualizar os vídeos. O que faço?',
    'support.faq.a4': 'Certifique-se de que sua conexão com a internet está estável. Tente limpar o cache do seu navegador ou usar um navegador diferente. Se o problema persistir, entre em contato conosco.',
    
    // Error Boundary
    'error.boundary.title': 'Ocorreu um erro inesperado.',
    'error.boundary.subtitle': 'Nossa equipe foi notificada. Por favor, tente recarregar a página.',
    'error.boundary.button': 'Recarregar Página',
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
    'footer.slogan': 'Professional training for the future, today.',
    'footer.copyright': 'All rights reserved.',

    // Home Page
    'home.hero.title': 'Professional Training for the Future',
    'home.hero.title.highlight': 'the Future',
    'home.hero.subtitle': 'Our mission is to provide accessible, high-quality knowledge about vital economic sectors, boosting your career to the next level.',
    'home.hero.button': 'Explore Courses',
    'home.courses.title': 'Our Courses',
    'home.courses.enrolled': 'Enrolled',
    'home.courses.continue': 'Continue Course',
    'home.courses.enroll': 'Enroll',
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

    // Support Page
    'support.title': 'Support and Contacts',
    'support.subtitle': 'We are here to help. Find answers or get in touch with us.',
    'support.contacts.title': 'Our Contacts',
    'support.contacts.email': 'Email',
    'support.contacts.email.desc': 'For general inquiries and technical support.',
    'support.contacts.phone': 'Phone',
    'support.contacts.address': 'Addresses',
    'support.faq.title': 'Frequently Asked Questions',
    'support.faq.q1': 'How do I change my password?',
    'support.faq.a1': 'You can reset your password on the login page by clicking the \'Forgot password?\' option. A reset link will be sent to your email.',
    'support.faq.q2': 'Does course access expire?',
    'support.faq.a2': 'No, your access to course materials is for life. Once enrolled, you can learn at your own pace, with no deadlines.',
    'support.faq.q3': 'How do I get my certificate?',
    'support.faq.a3': 'After completing 100% of the course modules and passing the final quiz, the option to \'Request Certificate\' will become available on the course page.',
    'support.faq.q4': 'I can\'t watch the videos. What should I do?',
    'support.faq.a4': 'Make sure your internet connection is stable. Try clearing your browser\'s cache or using a different browser. If the problem persists, please contact us.',
    
    // Error Boundary
    'error.boundary.title': 'An unexpected error occurred.',
    'error.boundary.subtitle': 'Our team has been notified. Please try reloading the page.',
    'error.boundary.button': 'Reload Page',
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
