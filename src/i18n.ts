import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

export const SUPPORTED_LANGS = ['en', 'pt', 'es', 'nl'];

const resources = {
  en: {
    translation: {
      "nav": {
        "home": "Welcome",
        "properties": "Properties",
        "gallery": "Gallery",
        "about": "About Us",
        "pricing": "Pricing",
        "team": "Team",
        "covenant": "Rules",
        "portfolio": "Portfolio",
        "decoration": "Decoration",
        "resident_portal": "Resident Login"
      },
      "hero": {
        "rentals": "New Rentals Available",
        "tour": "Virtual Tour"
      },
      "properties": {
        "title": "Available",
        "subtitle": "Properties",
        "view_all": "View All Properties",
        "show_less": "Show Less",
        "no_found": "No properties found",
        "filter_all": "All",
        "filter_land": "Land",
        "filter_furnished": "Furnished",
        "status_all": "All Status",
        "status_available": "Available",
        "status_rented": "Rented",
        "sort_price_low": "Price (Lowest)",
        "sort_price_high": "Price (Highest)",
        "sort_name_az": "Name (A-Z)",
        "sort_name_za": "Name (Z-A)",
        "up_to": "up to",
        "per_week": "/ week",
        "teleport": "Teleport",
        "teleport_now": "Teleport Now",
        "bedrooms": "BEDROOMS",
        "bathrooms": "BATHROOMS",
        "description_label": "Description",
        "contact_agent_btn": "CONTACT AGENT",
        "ready_msg_singular": "Property ready for occupancy",
        "ready_msg_plural": "Properties ready for occupancy"
      },
      "about": {
        "history": "History",
        "title1": "ABOUT",
        "title2": "US",
        "p1": "In 2010, <ymir>Ymir Coronet</ymir>, from the Netherlands, and <marie>Marie Whitfield</marie>, originally from Brazil, joined forces to create exquisitely designed virtual worlds. At that time, the concept of sims with streets reminiscent of real cities was a rarity, granting a distinct charm to their creations.",
        "p2": "As years passed and technology evolved, we expanded our vision, bringing elegance and sophistication to every project.",
        "quote": "Today, we are a benchmark in luxury real estate within Second Life, creating unique experiences for our residents.",
        "p4": "We are unwavering in our dedication to providing the best spaces, always focusing on comfort and beauty."
      },
      "gallery": {
        "atmosphere": "Atmosphere",
        "title1": "LIFE AT",
        "title2": "HOLANBRA",
        "subtitle": "Explore our curated selection of fine living."
      },
      "quote": {
        "philosophy": "Philosophy",
        "main": "\"Redefining the boundaries",
        "italic": "of virtual luxury living",
        "end": "beyond expectation.\"",
        "subtitle": "Exclusive Environments for the Discerning Resident"
      },
      "common": {
        "back_home": "Back to Home",
        "contact_agent": "Contact Agent",
        "teleport": "Teleport Now"
      },
      "covenant": {
        "label": "Resident Terms",
        "print": "Print Document"
      },
      "pricing": {
        "title": "Decoration Packages",
        "subtitle": "Choose the perfect plan for your virtual space. We handle everything from a single room makeover to a complete estate build.",
        "popular": "Most Popular",
        "order": "Order Now",
        "packages": {
          "basic": {
            "name": "Basic Room",
            "features": [
              "1 Room Decoration",
              "Up to 50 prims",
              "Color Palette Selection",
              "Basic Lighting Setup",
              "1 Revision"
            ]
          },
          "standard": {
            "name": "Standard Home",
            "features": [
              "Full House Decoration (Up to 3 rooms)",
              "Up to 150 prims",
              "Custom Furniture Placement",
              "Advanced Lighting",
              "Landscaping Layout",
              "2 Revisions"
            ]
          },
          "premium": {
            "name": "Premium Estate",
            "features": [
              "Unlimited Rooms & Landscaping",
              "Priority Support",
              "Full Custom Sims",
              "Interactive Scripts & Decor",
              "Premium Texture Matching",
              "Unlimited Revisions"
            ]
          }
        }
      },
      "team": {
        "label": "OUR TEAM",
        "title": "OUR TEAM",
        "subtitle": "Meet the creative minds behind Holanbra. Our diverse team of architects and designers is dedicated to crafting extraordinary virtual spaces.",
        "send_message": "Send Message",
        "message_sent": "Message Sent Successfully",
        "speaks": "Speaks",
        "direct_message": "Direct Message",
        "sl_name": "Your Second Life Name",
        "placeholder_name": "Ex: Resident Name",
        "your_message": "Your Message",
        "placeholder_message": "Write your message here...",
        "sending": "SENDING...",
        "btn_send": "SEND MESSAGE"
      },
      "footer": {
        "desc": "Experts in luxury real estate in Second Life.",
        "nav": "Navigation",
        "contact": "Contact",
        "follow": "Follow Us",
        "live_chat": "Live Chat",
        "msg_sent": "Message sent successfully!",
        "fill_fields": "Please fill all fields",
        "send_msg_btn": "Send Message",
        "msg_modal_title": "Send Message",
        "msg_modal_desc": "Send a direct message to administration",
        "your_name_label": "Your Name (SL Resident or Guest)",
        "msg_label": "Message",
        "msg_placeholder": "How can we help you?",
        "all_rights": "All rights reserved."
      },
      "teleport_cta": {
        "title": "Ready to Move?",
        "span": "Your new life begins here",
        "btn": "TELEPORT TO HOLANBRA",
        "req": "REQUIRES SECOND LIFE VIEWER INSTALLED"
      },
      "portfolio": {
        "title": "Decoration Portfolio",
        "subtitle": "Take a look at our past projects and let us inspire your next virtual home makeover.",
        "start": "Start Your Project",
        "loading": "Loading Portfolio...",
        "none": "No projects uploaded yet."
      },
      "grid": {
        "label": "Grid",
        "checking": "Checking Grid...",
        "operational": "Operational"
      },
      "decoration": {
        "label": "EXPERT DECORATION SERVICES",
        "title1": "Level Up Your",
        "title2": "Virtual Abode",
        "p": "Transform your living space with our premium decoration and design services.",
        "creative_realm": "Creative Realm",
        "realm_p": "Our professional designers will bring your vision to life.",
        "contact": "Contact",
        "find_style_title": "Find Your Style",
        "find_style_p": "Select from modern, classic, or industrial themes.",
        "furnishings_title": "Selected Furnishings",
        "furnishings_p": "Every piece is handpicked for quality and aesthetic.",
        "dreams_title": "Your Dreams",
        "dreams_p": "We turn your imagination into reality.",
        "way_title": "Have It Your Way",
        "way_p": "Customization is at the heart of our service.",
        "transform_island": "Transform Your Island",
        "initial_consult": "Free Initial Consultation",
        "view_portfolio": "View Portfolio"
      },
      "resident": {
        "portal_title": "Resident Portal",
        "portal_desc": "Access your properties and support",
        "avatar_name": "Avatar Name",
        "avatar_placeholder": "Your Avatar Name",
        "password": "Access Password",
        "password_placeholder": "••••••••",
        "enter": "Enter Dashboard",
        "authenticating": "Authenticating",
        "welcome": "Welcome back",
        "session": "AUTHENTICATED SESSION",
        "my_rentals": "My Rentals",
        "support": "Support",
        "logout": "LOGOUT",
        "no_rentals": "No rentals found",
        "explore_desc": "Explore our properties and start your new life in Holanbra.",
        "browse": "Browse Properties",
        "status": "Status",
        "expired": "EXPIRED",
        "days": "Days",
        "remaining": "Remaining Time",
        "expires": "Expires",
        "due": "Due Date",
        "price": "Rental Price",
        "visit": "Visit Property",
        "manage_desc": "Manage your extensions directly at the rental box in {{name}}.",
        "new_ticket": "New Ticket",
        "submit_req": "Submit a request to our staff",
        "subject": "Subject",
        "subject_placeholder": "Ex: Rental extension",
        "category": "Category",
        "message": "Message",
        "message_placeholder": "Write your message here...",
        "submit": "SUBMIT",
        "recent": "Recent Tickets",
        "none": "No tickets found",
        "opened_on": "Opened on",
        "open": "OPEN",
        "resolved": "RESOLVED",
        "staff": "Staff Response",
        "billing": "Billing",
        "land": "Land Issue",
        "others": "Others",
        "fill_all": "Please fill all fields",
        "ticket_sent": "Ticket sent successfully",
        "logged_out": "Logged out successfully"
      },
      "admin": {
        "navigation": "Executive Terminal",
        "listings": "Properties",
        "renters": "Residents",
        "portfolio": "Portfolio",
        "pricing": "Pricing",
        "gallery": "Gallery",
        "hero_section": "Banner",
        "team": "Organization",
        "inbox": "Inbox",
        "support": "Support Tickets",
        "edit_property": "Edit Property",
        "add_property": "Add New Property",
        "covenant": "Covenants",
        "settings": "Portal Settings"
      }
    }
  },
  pt: {
    translation: {
      "nav": {
        "home": "Bem-vindo",
        "properties": "Propriedades",
        "gallery": "Galeria",
        "about": "Sobre Nós",
        "pricing": "Preços",
        "team": "Equipe",
        "covenant": "Regras",
        "portfolio": "Portfólio",
        "decoration": "Decoração",
        "resident_portal": "Portal do Residente"
      },
      "hero": {
        "rentals": "Novos Aluguéis Disponíveis",
        "tour": "Tour Virtual"
      },
      "properties": {
        "title": "Disponíveis",
        "subtitle": "Propriedades",
        "view_all": "Ver Todas as Propriedades",
        "show_less": "Ver Menos",
        "no_found": "Nenhuma propriedade encontrada",
        "filter_all": "Todas",
        "filter_land": "Terrenos",
        "filter_furnished": "Mobiliadas",
        "status_all": "Todos os Status",
        "status_available": "Disponível",
        "status_rented": "Alugado",
        "sort_price_low": "Preço (Menor)",
        "sort_price_high": "Preço (Maior)",
        "sort_name_az": "Nome (A-Z)",
        "sort_name_za": "Nome (Z-A)",
        "up_to": "até",
        "per_week": "/ semana",
        "teleport": "Teleportar",
        "teleport_now": "Teleportar Agora",
        "bedrooms": "QUARTOS",
        "bathrooms": "BANHEIROS",
        "description_label": "Descrição",
        "contact_agent_btn": "CONTATAR AGENTE",
        "ready_msg_singular": "Propriedade pronta para morar",
        "ready_msg_plural": "Propriedades prontas para morar"
      },
      "about": {
        "history": "História",
        "title1": "SOBRE",
        "title2": "NÓS",
        "p1": "Em 2010, <ymir>Ymir Coronet</ymir>, da Holanda, e <marie>Marie Whitfield</marie>, originária do Brasil, uniram forças para criar mundos virtuais primorosamente projetados. Naquela época, o conceito de sims com ruas que lembravam cidades reais era uma raridade, conferindo um charme distinto às suas criações.",
        "p2": "À medida que os anos passaram e a tecnologia evoluiu, expandimos nossa visão, trazendo elegância e sofisticação a cada projeto.",
        "quote": "Hoje, somos referência em imóveis de luxo no Second Life, criando experiências únicas para nossos residentes.",
        "p4": "Somos inabaláveis em nossa dedicação em oferecer os melhores espaços, sempre focando no conforto e na beleza."
      },
      "gallery": {
        "atmosphere": "Atmosfera",
        "title1": "VIDA EM",
        "title2": "HOLANBRA",
        "subtitle": "Explore nossa seleção curada de bem-viver."
      },
      "quote": {
        "philosophy": "Filosofia",
        "main": "\"Redefinisando os limites",
        "italic": "do viver de luxo virtual",
        "end": "além das expectativas.\"",
        "subtitle": "Ambientes Exclusivos para Residentes Exigentes"
      },
      "common": {
        "back_home": "Voltar para Início",
        "contact_agent": "Falar com Agente",
        "teleport": "Teleportar Agora"
      },
      "covenant": {
        "label": "Termos do Residente",
        "print": "Imprimir Documento"
      },
      "pricing": {
        "title": "Pacotes de Decoração",
        "subtitle": "Escolha o plano perfeito para seu espaço virtual. Cuidamos de tudo, desde a renovação de um único cômodo até a construção completa de uma propriedade.",
        "popular": "Mais Popular",
        "order": "Peça Agora",
        "packages": {
          "basic": {
            "name": "Cômodo Básico",
            "features": [
              "Decoração de 1 Cômodo",
              "Até 50 prims",
              "Seleção de Paleta de Cores",
              "Iluminação Básica",
              "1 Revisão"
            ]
          },
          "standard": {
            "name": "Casa Padrão",
            "features": [
              "Decoração Completa (Até 3 cômodos)",
              "Até 150 prims",
              "Posicionamento de Móveis Customizados",
              "Iluminação Avançada",
              "Paisagismo",
              "2 Revisões"
            ]
          },
          "premium": {
            "name": "Mansão Premium",
            "features": [
              "Cômodos e Paisagismo Ilimitados",
              "Suporte Prioritário",
              "Sims Completamente Customizadas",
              "Scripts e Decoração Interativos",
              "Combinação de Texturas Premium",
              "Revisões Ilimitadas"
            ]
          }
        }
      },
      "team": {
        "label": "NOSSA EQUIPE",
        "title": "NOSSA EQUIPE",
        "subtitle": "Conheça as mentes criativas por trás da Holanbra. Nossa equipe diversificada de arquitetos e designers se dedica a criar espaços virtuais extraordinários.",
        "send_message": "Enviar Mensagem",
        "message_sent": "Mensagem Enviada com Sucesso",
        "speaks": "Fala",
        "direct_message": "Mensagem Direta",
        "sl_name": "Seu Nome no Second Life",
        "placeholder_name": "Ex: Resident Name",
        "your_message": "Sua Mensagem",
        "placeholder_message": "Escreva sua mensagem aqui...",
        "sending": "ENVIANDO...",
        "btn_send": "ENVIAR MENSAGEM"
      },
      "footer": {
        "desc": "Especialistas em imóveis de luxo no Second Life.",
        "nav": "Navegação",
        "contact": "Contato",
        "follow": "Siga-nos",
        "live_chat": "Chat ao Vivo",
        "msg_sent": "Mensagem enviada com sucesso!",
        "fill_fields": "Por favor, preencha todos os campos",
        "send_msg_btn": "Enviar Mensagem",
        "msg_modal_title": "Enviar Mensagem",
        "msg_modal_desc": "Envie uma mensagem direta para a administração",
        "your_name_label": "Seu Nome (Residente SL ou Convidado)",
        "msg_label": "Mensagem",
        "msg_placeholder": "Como podemos ajudar?",
        "all_rights": "Todos os direitos reservados."
      },
      "teleport_cta": {
        "title": "Pronto para se mudar?",
        "span": "Sua nova vida começa aqui",
        "btn": "TELEPORTAR PARA HOLANBRA",
        "req": "REQUER VIEWER DO SECOND LIFE INSTALADO"
      },
      "portfolio": {
        "title": "Portfólio de Decoração",
        "subtitle": "Dê uma olhada em nossos projetos anteriores e deixe-nos inspirar sua próxima reforma de casa virtual.",
        "start": "Iniciar Seu Projeto",
        "loading": "Carregando Portfólio...",
        "none": "Nenhum projeto postado ainda."
      },
      "grid": {
        "label": "Grid",
        "checking": "Checando Grid...",
        "operational": "Operacional"
      },
      "decoration": {
        "label": "SERVIÇOS DE DECORAÇÃO ESPECIALIZADOS",
        "title1": "Eleve Seu",
        "title2": "Lar Virtual",
        "p": "Transforme seu espaço com nossos serviços premium de decoração e design.",
        "creative_realm": "Reino Criativo",
        "realm_p": "Nossos designers profissionais darão vida à sua visão.",
        "contact": "Contato",
        "find_style_title": "Encontre Seu Estilo",
        "find_style_p": "Escolha entre temas modernos, clássicos ou industriais.",
        "furnishings_title": "Mobiliário Selecionado",
        "furnishings_p": "Cada peça é escolhida a dedo pela qualidade e estética.",
        "dreams_title": "Seus Sonhos",
        "dreams_p": "Transformamos sua imaginação em realidade.",
        "way_title": "Do Seu Jeito",
        "way_p": "A personalização está no coração do nosso serviço.",
        "transform_island": "Transforme Sua Ilha",
        "initial_consult": "Consulta Inicial Gratuita",
        "view_portfolio": "Ver Portfólio"
      },
      "resident": {
        "portal_title": "Portal do Residente",
        "portal_desc": "Acesse suas propriedades e suporte",
        "avatar_name": "Nome do Avatar",
        "avatar_placeholder": "Seu Nome de Avatar",
        "password": "Senha de Acesso",
        "password_placeholder": "••••••••",
        "enter": "Entrar no Painel",
        "authenticating": "Autenticando",
        "welcome": "Bem-vindo de volta",
        "session": "SESSÃO AUTENTICADA",
        "my_rentals": "Minhas Locações",
        "support": "Suporte",
        "logout": "SAIR",
        "no_rentals": "Nenhuma locação encontrada",
        "explore_desc": "Explore nossas propriedades e comece sua nova vida em Holanbra.",
        "browse": "Ver Propriedades",
        "status": "Status",
        "expired": "EXPIRADO",
        "days": "Dias",
        "remaining": "Tempo Restante",
        "expires": "Expira em",
        "due": "Data de Vencimento",
        "price": "Preço do Aluguel",
        "visit": "Visitar Propriedade",
        "manage_desc": "Gerencie suas extensões diretamente na caixa de aluguel em {{name}}.",
        "new_ticket": "Novo Ticket",
        "submit_req": "Envie uma solicitação para nossa equipe",
        "subject": "Assunto",
        "subject_placeholder": "Ex: Extensão de aluguel",
        "category": "Categoria",
        "message": "Mensagem",
        "message_placeholder": "Escreva sua mensagem aqui...",
        "submit": "ENVIAR",
        "recent": "Tickets Recentes",
        "none": "Nenhum ticket encontrado",
        "opened_on": "Aberto em",
        "open": "ABERTO",
        "resolved": "RESOLVIDO",
        "staff": "Resposta da Equipe",
        "billing": "Cobrança",
        "land": "Problemas de Terreno",
        "others": "Outros",
        "fill_all": "Por favor, preencha todos os campos",
        "ticket_sent": "Ticket enviado com sucesso",
        "logged_out": "Sessão encerrada com sucesso"
      },
      "admin": {
        "navigation": "Terminal Executivo",
        "listings": "Imóveis",
        "renters": "Residentes",
        "portfolio": "Portfólio",
        "pricing": "Preços",
        "gallery": "Galeria",
        "hero_section": "Banner",
        "team": "Organização",
        "inbox": "Inbox",
        "support": "Tickets de Suporte",
        "edit_property": "Editar Imóvel",
        "add_property": "Novo Imóvel",
        "covenant": "Regras/Termos",
        "settings": "Configurações"
      }
    }
  },
  es: {
    translation: {
      "nav": {
        "home": "Bienvenido",
        "properties": "Propiedades",
        "gallery": "Galería",
        "about": "Nosotros",
        "pricing": "Precios",
        "team": "Equipo",
        "covenant": "Reglas",
        "portfolio": "Portafolio",
        "decoration": "Decoración",
        "resident_portal": "Portal del Residente"
      },
      "hero": {
        "tour": "Tour Virtual",
        "rentals": "Nuevos Alquileres Disponibles"
      },
      "properties": {
        "title": "Disponibles",
        "subtitle": "Inmuebles",
        "view_all": "Ver Todas las Propiedades",
        "show_less": "Ver Menos",
        "no_found": "No se encontraron propiedades",
        "filter_all": "Todas",
        "filter_land": "Terrenos",
        "filter_furnished": "Amuebladas",
        "status_all": "Todos los Estados",
        "status_available": "Disponible",
        "status_rented": "Alquilado",
        "sort_price_low": "Precio (Menor)",
        "sort_price_high": "Precio (Mayor)",
        "sort_name_az": "Nombre (A-Z)",
        "sort_name_za": "Nombre (Z-A)",
        "up_to": "hasta",
        "per_week": "/ semana",
        "teleport": "Teletransporte",
        "teleport_now": "Teletransportarse Ahora",
        "bedrooms": "HABITACIONES",
        "bathrooms": "BAÑOS",
        "description_label": "Descripción",
        "contact_agent_btn": "CONTACTAR AGENTE",
        "ready_msg_singular": "Propiedad lista para ocupar",
        "ready_msg_plural": "Propiedades listas para ocupar"
      },
      "about": {
        "history": "Historia",
        "title1": "SOBRE",
        "title2": "NOSOTROS",
        "p1": "En 2010, <ymir>Ymir Coronet</ymir>, de los Países Bajos, y <marie>Marie Whitfield</marie>, originaria de Brasil, unieron fuerzas para crear mundos virtuales exquisitamente diseñados. En aquel entonces, el concepto de sims con calles que recordaban a ciudades reales era una rareza, lo que otorgaba un encanto especial a sus creaciones.",
        "p2": "Con el paso de los años y la evolución de la tecnología, ampliamos nuestra visión, aportando elegancia y sofisticación a cada proyecto.",
        "quote": "Hoy en día, somos un referente en el sector inmobiliario de lujo dentro de Second Life, creando experiencias únicas para nuestros residentes.",
        "p4": "No cejamos en nuestra dedicación por ofrecer los mejores espacios, centrándonos siempre en el confort y la belleza."
      },
      "gallery": {
        "atmosphere": "Atmósfera",
        "title1": "VIDA EN",
        "title2": "HOLANBRA",
        "subtitle": "Explore nuestra selección curada de vida refinada."
      },
      "quote": {
        "philosophy": "Filosofía",
        "main": "\"Redefiniendo los límites",
        "italic": "de la vida de lujo virtual",
        "end": "más allá de las expectativas.\"",
        "subtitle": "Ambientes Exclusivos para Residentes Exigentes"
      },
      "common": {
        "back_home": "Volver al Inicio",
        "contact_agent": "Contactar Agente",
        "teleport": "Teletransportarse Ahora"
      },
      "covenant": {
        "label": "Términos del Residente",
        "print": "Imprimir Documento"
      },
      "pricing": {
        "title": "Paquetes de Decoración",
        "subtitle": "Elija el plan perfecto para su espacio virtual. Nos encargamos de todo, desde el cambio de imagen de una sola habitación hasta la construcción de una finca completa.",
        "popular": "Más Popular",
        "order": "Ordenar Ahora",
        "packages": {
          "basic": {
            "name": "Habitación Básica",
            "features": [
              "Decoración de 1 Habitación",
              "Hasta 50 prims",
              "Selección de Paleta de Colores",
              "Iluminación Básica",
              "1 Revisión"
            ]
          },
          "standard": {
            "name": "Hogar Estándar",
            "features": [
              "Decoración de Casa Completa (Hasta 3 habitaciones)",
              "Hasta 150 prims",
              "Colocación de Muebles Personalizados",
              "Iluminación Avanzada",
              "Diseño de Paisajismo",
              "2 Revisiones"
            ]
          },
          "premium": {
            "name": "Finca Premium",
            "features": [
              "Habitaciones y Paisajismo Ilimitados",
              "Soporte Prioritario",
              "Sims Totalmente Personalizados",
              "Scripts y Decoración Interactivos",
              "Combinación de Texturas Premium",
              "Revisiones Ilimitadas"
            ]
          }
        }
      },
      "team": {
        "label": "NUESTRO EQUIPO",
        "title": "NUESTRO EQUIPO",
        "subtitle": "Conozca a las mentes creativas detrás de Holanbra. Nuestro diverso equipo de arquitectos y diseñadores se dedica a crear espacios virtuales extraordinarios.",
        "send_message": "Enviar Mensaje",
        "message_sent": "Mensaje Enviado con Éxito",
        "speaks": "Habla",
        "direct_message": "Mensaje Directo",
        "sl_name": "Su Nombre en Second Life",
        "placeholder_name": "Ej: Resident Name",
        "your_message": "Su Mensaje",
        "placeholder_message": "Escribe tu mensaje aquí...",
        "sending": "ENVIANDO...",
        "btn_send": "ENVIAR MENSAJE"
      },
      "footer": {
        "desc": "Expertos en inmuebles de lujo en Second Life.",
        "nav": "Navegación",
        "contact": "Contacto",
        "follow": "Síguenos",
        "live_chat": "Chat en Vivo",
        "msg_sent": "¡Mensaje enviado con éxito!",
        "fill_fields": "Por favor, complete todos los campos",
        "send_msg_btn": "Enviar Mensaje",
        "msg_modal_title": "Enviar Mensaje",
        "msg_modal_desc": "Envíe un mensaje directo a la administración",
        "your_name_label": "Su Nombre (Residente SL o Invitado)",
        "msg_label": "Mensaje",
        "msg_placeholder": "¿Cómo podemos ayudarle?",
        "all_rights": "Todos los derechos reservados."
      },
      "teleport_cta": {
        "title": "¿Listo para mudarte?",
        "span": "Tu nueva vida comienza aquí",
        "btn": "TELETRANSPORTARSE A HOLANBRA",
        "req": "REQUIERE TENER INSTALADO EL VISOR DE SECOND LIFE"
      },
      "portfolio": {
        "title": "Portafolio de Decoración",
        "subtitle": "Eche un vistazo a nuestros proyectos anteriores y déjenos inspirar su próximo cambio de imagen en su hogar virtual.",
        "start": "Iniciar Su Proyecto",
        "loading": "Cargando Portafolio...",
        "none": "Aún no se han subido proyectos."
      },
      "grid": {
        "label": "Grid",
        "checking": "Comprobando Grid...",
        "operational": "Operativo"
      },
      "decoration": {
        "label": "SERVICIOS DE DECORACIÓN ESPECIALIZADOS",
        "title1": "Mejora Tu",
        "title2": "Hogar Virtual",
        "p": "Transforma tu espacio vital con nuestros servicios de decoración y diseño premium.",
        "creative_realm": "Reino Creativo",
        "realm_p": "Nuestros diseñadores profesionales darão vida a tu visión.",
        "contact": "Contacto",
        "find_style_title": "Encuentra Tu Estilo",
        "find_style_p": "Seleccione entre temas modernos, clásicos o industriales.",
        "furnishings_title": "Muebles Seleccionados",
        "furnishings_p": "Cada pieza es elegida a mano por su calidad y estética.",
        "dreams_title": "Tus Sueños",
        "dreams_p": "Convertimos tu imaginación en realidad.",
        "way_title": "A Tu Manera",
        "way_p": "La personalización es el corazón de nuestro servicio.",
        "transform_island": "Transforma Tu Isla",
        "initial_consult": "Consulta Inicial Gratuita",
        "view_portfolio": "Ver Portafolio"
      },
      "resident": {
        "portal_title": "Portal de Residentes",
        "portal_desc": "Accede a tus propiedades y soporte",
        "avatar_name": "Nombre del Avatar",
        "avatar_placeholder": "Tu Nombre de Avatar",
        "password": "Contraseña de Acceso",
        "password_placeholder": "••••••••",
        "enter": "Entrar al Panel",
        "authenticating": "Authenticating",
        "welcome": "Bienvenido de nuevo",
        "session": "SESIÓN AUTENTICADA",
        "my_rentals": "Mis Alquileres",
        "support": "Soporte",
        "logout": "CERRAR SESIÓN",
        "no_rentals": "No se encontraron alquileres",
        "explore_desc": "Explora nuestras propiedades y comienza tu nueva vida en Holanbra.",
        "browse": "Ver Propiedades",
        "status": "Estado",
        "expired": "EXPIRADO",
        "days": "Días",
        "remaining": "Tiempo Restante",
        "expires": "Expira el",
        "due": "Fecha de Vencimiento",
        "price": "Precio del Alquiler",
        "visit": "Visitar Propiedad",
        "manage_desc": "Gestione sus extensiones directamente en la caja de alquiler en {{name}}.",
        "new_ticket": "Nuevo Ticket",
        "submit_req": "Envía una solicitud a nuestro personal",
        "subject": "Asunto",
        "subject_placeholder": "Ej: Extensión de alquiler",
        "category": "Categoría",
        "message": "Mensaje",
        "message_placeholder": "Escribe tu mensaje aquí...",
        "submit": "ENVIAR",
        "recent": "Tickets Recentes",
        "none": "No se encontraron tickets",
        "opened_on": "Abierto el",
        "open": "ABIERTO",
        "resolved": "RESUELTO",
        "staff": "Respuesta del Personal",
        "billing": "Facturación",
        "land": "Problemas de Terreno",
        "others": "Otros",
        "fill_all": "Por favor, complete todos los campos",
        "ticket_sent": "Ticket enviado con éxito",
        "logged_out": "Sesión cerrada con éxito"
      },
      "admin": {
        "navigation": "Terminal Ejecutiva",
        "listings": "Inmuebles",
        "renters": "Residentes",
        "portfolio": "Portafolio",
        "pricing": "Precios",
        "gallery": "Galería",
        "hero_section": "Banner",
        "team": "Organización",
        "inbox": "Bandeja de Entrada",
        "support": "Tickets de Soporte",
        "edit_property": "Editar Inmueble",
        "add_property": "Nuevo Inmueble",
        "covenant": "Reglas de Residencia",
        "settings": "Configuración"
      }
    }
  },
  nl: {
    translation: {
      "nav": {
        "home": "Welkom",
        "properties": "Woningen",
        "gallery": "Galerij",
        "about": "Over Ons",
        "pricing": "Prijzen",
        "team": "Team",
        "covenant": "Regels",
        "portfolio": "Portfolio",
        "decoration": "Decoratie",
        "resident_portal": "Bewonersportaal"
      },
      "hero": {
        "rentals": "Nieuwe Woningen Beschikbaar",
        "tour": "Virtuele Tour"
      },
      "properties": {
        "title": "Beschikbaar",
        "subtitle": "Woningen",
        "view_all": "Bekijk Alle Woningen",
        "show_less": "Toon Minder",
        "no_found": "Geen woningen gevonden",
        "filter_all": "Alle",
        "filter_land": "Grond",
        "filter_furnished": "Gemeubileerd",
        "status_all": "Alle Status",
        "status_available": "Beschikbaar",
        "status_rented": "Verhuurd",
        "sort_price_low": "Prijs (Laagste)",
        "sort_price_high": "Prijs (Hoogste)",
        "sort_name_az": "Naam (A-Z)",
        "sort_name_za": "Naam (Z-A)",
        "up_to": "tot",
        "per_week": "/ week",
        "teleport": "Teleporteer",
        "teleport_now": "Nu Teleporteren",
        "bedrooms": "SLAAPKAMERS",
        "bathrooms": "BADKAMERS",
        "description_label": "Beschrijving",
        "contact_agent_btn": "CONTACTEER AGENT",
        "ready_msg_singular": "Woning klaar voor bewoning",
        "ready_msg_plural": "Woningen klaar voor bewoning"
      },
      "about": {
        "history": "Geschiedenis",
        "title1": "OVER",
        "title2": "ONS",
        "p1": "In 2010 bundelden <ymir>Ymir Coronet</ymir> uit Nederland en <marie>Marie Whitfield</marie> uit Brazilië hun krachten om prachtig ontworpen virtuele werelden te creëren. In die tijd was het concept van sims met straten die deden denken aan echte steden een zeldzaamheid, wat een unieke charme aan hun creaties gaf.",
        "p2": "Naarmate de jaren verstreken och de technologie evolueerde, breidden we onze visie uit en brachten we elegantie en verfijning in elk project.",
        "quote": "Vandaag de dag zijn we een referentie in luxe vastgoed binnen Second Life och creëren we unieke ervaringen voor onze bewoners.",
        "p4": "We zijn onvermoeibaar in onze toewijding om de beste ruimtes te bieden, waarbij we ons always richten op comfort en schoonheid."
      },
      "gallery": {
        "atmosphere": "Sfeer",
        "title1": "LEVEN BIJ",
        "title2": "HOLANBRA",
        "subtitle": "Verken onze zorgvuldig samengestelde selectie van fijn wonen."
      },
      "quote": {
        "philosophy": "Filosofia",
        "main": "\"Herdefiniëren van de grenzen",
        "italic": "van virtueel luxe wonen",
        "end": "voorbij de verwachtingen.\"",
        "subtitle": "Exclusieve Omgevingen voor de Veeleisende Bewoner"
      },
      "common": {
        "back_home": "Terug naar Home",
        "contact_agent": "Contacteer Agent",
        "teleport": "Teleporteer Nu"
      },
      "covenant": {
        "label": "Voorwaarden Bewoner",
        "print": "Document Printen"
      },
      "pricing": {
        "title": "Decoratiepakketten",
        "subtitle": "Kies het perfecte plan voor uw virtuele ruimte. We regelen alles, van de make-over van een enkele kamer tot een complete landgoedbouw.",
        "popular": "Meest Populair",
        "order": "Nu Bestellen",
        "packages": {
          "basic": {
            "name": "Basis Kamer",
            "features": [
              "1 Kamer Decoratie",
              "Tot 50 prims",
              "Kleurpalet Selectie",
              "Basis Verlichtingsinstelling",
              "1 Revisie"
            ]
          },
          "standard": {
            "name": "Standaard Woning",
            "features": [
              "Volledige Huisdecoratie (Tot 3 kamers)",
              "Tot 150 prims",
              "Aangepaste Meubelplaatsing",
              "Geavanceerde Verlichting",
              "Landschapsontwerp",
              "2 Revisies"
            ]
          },
          "premium": {
            "name": "Premium Landgoed",
            "features": [
              "Onbeperkt Kamers & Landschapsarchitectuur",
              "Priority Support",
              "Volledig Aangepaste Sims",
              "Interactieve Scripts & Decor",
              "Premium Textuur Matching",
              "Onbeperkte Revisies"
            ]
          }
        }
      },
      "team": {
        "label": "ONS TEAM",
        "title": "ONS TEAM",
        "subtitle": "Ontmoet de creatieve geesten achter Holanbra. Ons diverse team van architecten en ontwerpers zet zich in voor het creëren van buitengewone virtuele ruimtes.",
        "send_message": "Bericht Sturen",
        "message_sent": "Bericht Succesvol Verzonden",
        "speaks": "Spreekt",
        "direct_message": "Direct Bericht",
        "sl_name": "Uw Second Life Naam",
        "placeholder_name": "Bijv: Resident Name",
        "your_message": "Uw Bericht",
        "placeholder_message": "Schrijf hier uw bericht...",
        "sending": "VERZENDEN...",
        "btn_send": "BERICHT VERZENDEN"
      },
      "footer": {
        "desc": "Experts in luxe vastgoed in Second Life.",
        "nav": "Navigatie",
        "contact": "Contact",
        "follow": "Volg Ons",
        "live_chat": "Live Chat",
        "msg_sent": "Bericht succesvol verzonden!",
        "fill_fields": "Vul a.u.b. alle velden in",
        "send_msg_btn": "Bericht Verzenden",
        "msg_modal_title": "Bericht Verzenden",
        "msg_modal_desc": "Stuur een direct bericht naar de administratie",
        "your_name_label": "Uw Naam (SL Bewoner of Gast)",
        "msg_label": "Bericht",
        "msg_placeholder": "Hoe kunnen we u helpen?",
        "all_rights": "Alle rechten voorbehouden."
      },
      "teleport_cta": {
        "title": "Klaar om te verhuizen?",
        "span": "Uw nieuwe leven begint hier",
        "btn": "TELEPORTEER NAAR HOLANBRA",
        "req": "VEREIST TWEEDE LIFE VIEWER GEINSTALLEERD"
      },
      "portfolio": {
        "title": "Decoratie Portfolio",
        "subtitle": "Bekijk onze eerdere projecten and laat ons uw volgende virtuele huismake-over inspireren.",
        "start": "Start Uw Project",
        "loading": "Portfolio laden...",
        "none": "Nog geen projecten gepost."
      },
      "grid": {
        "label": "Grid",
        "checking": "Grid Controleren...",
        "operational": "Operationeel"
      },
      "decoration": {
        "label": "EXPERT DECORATIE SERVICES",
        "title1": "Verbeter Uw",
        "title2": "Virtuele Woning",
        "p": "Transformeer uw leefruimte met onze premium decoratie- en ontwerpservices.",
        "creative_realm": "Creatief Rijk",
        "realm_p": "Onze professionele ontwerpers brengen uw visie tot leven.",
        "contact": "Contact",
        "find_style_title": "Vind Uw Stijl",
        "find_style_p": "Kies uit moderne, klassieke of industriële thema's.",
        "furnishings_title": "Geselecteerde Inrichting",
        "furnishings_p": "Elk stuk is met de hand uitgekozen voor kwaliteit en esthetiek.",
        "dreams_title": "Uw Dromen",
        "dreams_p": "We veranderen uw verbeelding in realiteit.",
        "way_title": "Op Uw Manier",
        "way_p": "Maatwerk staat centraal in onze service.",
        "transform_island": "Transformeer Uw Eiland",
        "initial_consult": "Gratis Eerste Consult",
        "view_portfolio": "Bekijk Portfolio"
      },
      "resident": {
        "portal_title": "Bewonersportaal",
        "portal_desc": "Toegang tot uw eigendommen en ondersteuning",
        "avatar_name": "Avatar Naam",
        "avatar_placeholder": "Uw Avatar Naam",
        "password": "Toegangswachtwoord",
        "password_placeholder": "••••••••",
        "enter": "Dashboard Binnengaan",
        "authenticating": "Authenticeren",
        "welcome": "Welkom terug",
        "session": "GEAUTHENTICEERDE SESSIE",
        "my_rentals": "Mijn Verhuur",
        "support": "Ondersteuning",
        "logout": "UITLOGGEN",
        "no_rentals": "Geen huurwoningen gevonden",
        "explore_desc": "Verken onze woningen en begin uw nieuwe leven in Holanbra.",
        "browse": "Blader door Woningen",
        "status": "Status",
        "expired": "VERLOPEN",
        "days": "Dagen",
        "remaining": "Resterende Tijd",
        "expires": "Verloopt op",
        "due": "Vervaldatum",
        "price": "Huurprijs",
        "visit": "Eigendom Bezoeken",
        "manage_desc": "Beheer uw verlengingen direct bij de huurbox in {{name}}.",
        "new_ticket": "Nieuw Ticket",
        "submit_req": "Dien een verzoek in bij ons personeel",
        "subject": "Onderwerp",
        "subject_placeholder": "Bijv: Huurverlenging",
        "category": "Categorie",
        "message": "Bericht",
        "message_placeholder": "Schrijf hier uw bericht...",
        "submit": "INDIENEN",
        "recent": "Recente Tickets",
        "none": "Geen tickets gevonden",
        "opened_on": "Geopend op",
        "open": "OPEN",
        "resolved": "OPGELOST",
        "staff": "Reactie van Personeel",
        "billing": "Facturering",
        "land": "Terreinproblemen",
        "others": "Overige",
        "fill_all": "Vul a.u.b. alle velden in",
        "ticket_sent": "Ticket succesvol verzonden",
        "logged_out": "Succesvol uitgelogd"
      },
      "admin": {
        "navigation": "Beheersterminal",
        "listings": "Eigendommen",
        "renters": "Bewoners",
        "portfolio": "Portfolio",
        "pricing": "Prijzen",
        "gallery": "Galerij",
        "hero_section": "Banner",
        "team": "Organisatie",
        "inbox": "Inbox",
        "support": "Ondersteuningstickets",
        "edit_property": "Woning Bewerken",
        "add_property": "Nieuwe Woning Toevoegen",
        "covenant": "Voorschriften",
        "settings": "Instellingen"
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('i18nextLng') || 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
