const navToggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.site-nav');

if (navToggle && nav) {
  navToggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });
}

const revealItems = document.querySelectorAll('.reveal');
if (revealItems.length) {
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }
}

const yearTag = document.querySelector('[data-year]');
if (yearTag) {
  yearTag.textContent = new Date().getFullYear();
}

const scrollToHash = () => {
  if (!window.location.hash) return;
  const target = document.querySelector(window.location.hash);
  if (!target) return;
  setTimeout(() => {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 120);
};

window.addEventListener('hashchange', scrollToHash);
window.addEventListener('load', scrollToHash);

const slider = document.querySelector('[data-slider]');
if (slider) {
  const track = slider.querySelector('[data-slider-track]');
  const imagesAttr = slider.getAttribute('data-slider-images') || '';
  const captionsEnAttr = slider.getAttribute('data-slider-captions-en') || '';
  const captionsSwAttr = slider.getAttribute('data-slider-captions-sw') || '';
  const images = imagesAttr
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (track && images.length) {
    const shuffled = [...images].sort(() => Math.random() - 0.5);
    const slides = shuffled.map((filename, index) => {
      const img = new Image();
      const src = filename.includes('/') ? filename : `assets/sliders/${filename}`;
      img.src = src;
      img.alt = 'PangaLeo rental preview';
      img.loading = 'lazy';
      img.className = `slider-image${index === 0 ? ' is-active' : ''}`;
      track.appendChild(img);
      return img;
    });

    const makeCaptions = (lang) => {
      const raw = lang === 'sw' ? captionsSwAttr : captionsEnAttr;
      return raw
        .split('|')
        .map((value) => value.trim())
        .filter(Boolean);
    };

    let captions = makeCaptions('sw');
    if (!captions.length) captions = makeCaptions('en');
    if (!captions.length) captions = shuffled.map(() => 'PangaLeo rental highlight');

    const captionElements = captions.map((text, index) => {
      const caption = document.createElement('div');
      caption.className = `slider-caption${index === 0 ? ' is-active' : ''}`;
      caption.textContent = text;
      track.appendChild(caption);
      return caption;
    });

    if (!prefersReducedMotion && slides.length > 1) {
      let current = 0;
      setInterval(() => {
        slides[current].classList.remove('is-active');
        if (captionElements[current]) captionElements[current].classList.remove('is-active');
        current = (current + 1) % slides.length;
        slides[current].classList.add('is-active');
        if (captionElements[current]) captionElements[current].classList.add('is-active');
      }, 4500);
    }

    slider.sliderCaptions = captionElements;
    slider.sliderMakeCaptions = makeCaptions;
    slider.sliderSlides = slides;
  }

  const sliderLink = slider.getAttribute('data-slider-link');
  if (sliderLink) {
    slider.addEventListener('click', () => {
      window.open(sliderLink, '_blank', 'noopener');
    });
    slider.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        window.open(sliderLink, '_blank', 'noopener');
      }
    });
  }
}

const navButtons = document.querySelectorAll('button[data-link]');
if (navButtons.length) {
  navButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const url = button.getAttribute('data-link');
      if (!url) return;
      window.open(url, '_blank', 'noopener');
    });
  });
}

const appLinkAnchors = document.querySelectorAll('[data-app-link]');
if (appLinkAnchors.length) {
  appLinkAnchors.forEach((anchor) => {
    anchor.addEventListener('click', (event) => {
      const appLink = anchor.getAttribute('data-app-link');
      const fallback = anchor.getAttribute('href');
      if (!appLink || !fallback) return;

      const isAndroid = /Android/i.test(navigator.userAgent);
      if (!isAndroid) return;

      event.preventDefault();
      let fallbackTimer = null;
      const clearFallback = () => {
        if (fallbackTimer) {
          clearTimeout(fallbackTimer);
          fallbackTimer = null;
        }
      };

      fallbackTimer = setTimeout(() => {
        window.location.href = fallback;
      }, 900);

      window.addEventListener('pagehide', clearFallback, { once: true });
      window.location.href = appLink;
    });
  });
}

const screens = document.querySelector('.screens');
if (screens) {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const screenQuery = window.matchMedia('(max-width: 720px)');
  let isAutoScrolling = false;
  let rafId = null;
  let userInteracting = false;
  let userScrollTimeout = null;
  let autoScrollResumeTimeout = null;

  const stepAutoScroll = () => {
    if (!isAutoScrolling) return;
    const maxScroll = screens.scrollWidth - screens.clientWidth;
    if (maxScroll > 0 && !userInteracting) {
      screens.scrollLeft += 0.45;
      if (screens.scrollLeft >= maxScroll - 1) {
        screens.scrollLeft = 0;
      }
    }
    rafId = requestAnimationFrame(stepAutoScroll);
  };

  const startAutoScroll = () => {
    if (isAutoScrolling || prefersReducedMotion || !screenQuery.matches) return;
    isAutoScrolling = true;
    rafId = requestAnimationFrame(stepAutoScroll);
  };

  const stopAutoScroll = () => {
    isAutoScrolling = false;
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  };

  const updateAutoScroll = () => {
    if (prefersReducedMotion || !screenQuery.matches) {
      stopAutoScroll();
    } else {
      startAutoScroll();
    }
  };

  const pauseAutoScroll = (resumeDelay = 1800) => {
    userInteracting = true;
    if (autoScrollResumeTimeout) clearTimeout(autoScrollResumeTimeout);
    autoScrollResumeTimeout = setTimeout(() => {
      userInteracting = false;
    }, resumeDelay);
  };

  const handleUserScroll = () => {
    pauseAutoScroll(2200);
    if (userScrollTimeout) clearTimeout(userScrollTimeout);
    userScrollTimeout = setTimeout(() => {
      userInteracting = false;
    }, 2200);
  };

  screens.addEventListener('mouseenter', () => {
    pauseAutoScroll();
  });
  screens.addEventListener('mouseleave', () => {
    userInteracting = false;
  });
  screens.addEventListener('touchstart', () => {
    pauseAutoScroll(2600);
  }, { passive: true });
  screens.addEventListener('touchend', () => {
    userInteracting = false;
  });
  screens.addEventListener('touchcancel', () => {
    userInteracting = false;
  });
  screens.addEventListener('scroll', handleUserScroll, { passive: true });

  updateAutoScroll();
  screenQuery.addEventListener('change', updateAutoScroll);
}

const sideForm = document.querySelector('[data-side-form]');
const openFormButtons = document.querySelectorAll('[data-open-form]');
const closeFormButtons = sideForm ? sideForm.querySelectorAll('[data-side-form-close]') : [];

const openSideForm = (event) => {
  if (!sideForm) return;
  if (event) event.preventDefault();
  sideForm.classList.add('is-open');
  sideForm.setAttribute('aria-hidden', 'false');
  document.body.classList.add('side-form-open');
  const firstInput = sideForm.querySelector('input, textarea, button');
  if (firstInput) firstInput.focus();
};

const closeSideForm = () => {
  if (!sideForm) return;
  sideForm.classList.remove('is-open');
  sideForm.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('side-form-open');
};

openFormButtons.forEach((button) => {
  button.addEventListener('click', openSideForm);
});

closeFormButtons.forEach((button) => {
  button.addEventListener('click', closeSideForm);
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && sideForm && sideForm.classList.contains('is-open')) {
    closeSideForm();
  }
});

const emailForms = document.querySelectorAll('[data-email-form]');
let emailjsInitialized = false;

const setFormStatus = (form, key, state) => {
  const status = form.querySelector('[data-form-status]');
  if (!status) return;
  status.dataset.statusKey = key;
  status.textContent = getTranslation(key);
  status.classList.remove('is-success', 'is-error');
  if (state === 'success') status.classList.add('is-success');
  if (state === 'error') status.classList.add('is-error');
};

emailForms.forEach((form) => {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const serviceId = form.dataset.emailjsService;
    const templateId = form.dataset.emailjsTemplate;
    const publicKey = form.dataset.emailjsPublic;

    if (!window.emailjs || !serviceId || !templateId || !publicKey) {
      setFormStatus(form, 'form.status.missing', 'error');
      return;
    }

    if (!emailjsInitialized) {
      window.emailjs.init(publicKey);
      emailjsInitialized = true;
    }

    setFormStatus(form, 'form.status.sending');

    try {
      await window.emailjs.sendForm(serviceId, templateId, form);
      setFormStatus(form, 'form.status.success', 'success');
      form.reset();
    } catch (error) {
      setFormStatus(form, 'form.status.fail', 'error');
    }
  });
});

const translations = {
  en: {
    'nav.menu': 'Menu',
    'nav.about': 'About',
    'nav.how': 'How It Works',
    'nav.screens': 'Tenant Journey',
    'nav.contact': 'Contact',
    'nav.privacy': 'Privacy Policy',
    'nav.demo': 'Download now',
    'hero.eyebrow': 'Rental search, solved',
    'hero.title': 'Find the right rental faster, without the usual stress.',
    'hero.body':
      'PangaLeo removes the friction of house hunting. Verified listings, clear photos, real-time pricing, and availability, plus direct contact with owners and agents — all in one place.',
    'hero.cta_primary': 'Download now',
    'hero.cta_secondary': 'See how it works',
    'stat.one.title': 'Client-ready listings',
    'stat.one.desc': 'Details that answer questions fast.',
    'stat.two.title': 'Owner control',
    'stat.two.desc': 'Availability updates in real time.',
    'stat.three.title': 'Shared context',
    'stat.three.desc': 'Notes that keep everyone aligned.',
    'hero.card': 'Modern by design, trusted by owners, and friendly for clients.',
    'preview.eyebrow': 'Property previews',
    'preview.title': 'Showcase homes with a premium look.',
    'preview.body': 'High-quality imagery and clear details help clients move with confidence.',
    'preview.card.one.tag': 'New listing',
    'preview.card.one.title': 'Sunlit 3BR family home',
    'preview.card.one.meta': 'Dar es Salaam (Kinondoni) • From TZS 850k/mo',
    'preview.card.two.tag': 'Popular',
    'preview.card.two.title': 'Modern 2BR city apartment',
    'preview.card.two.meta': 'Arusha (Njiro) • From TZS 1.2M/mo',
    'preview.card.three.tag': 'Seaside',
    'preview.card.three.title': 'Ocean-view villa retreat',
    'preview.card.three.meta': 'Zanzibar (Stone Town) • From TZS 2.5M/mo',
    'why.eyebrow': 'Why PangaLeo',
    'why.title': 'Clarity for owners. Confidence for clients.',
    'why.body':
      'Every screen keeps property facts, media, and availability aligned so both sides feel informed.',
    'feature.one.title': 'Client-ready listings',
    'feature.one.desc': 'A clean presentation of price, amenities, and media for quick comparisons.',
    'feature.two.title': 'Owner control panel',
    'feature.two.desc': 'Update pricing and occupancy instantly without scattered tools.',
    'feature.three.title': 'Trusted collaboration',
    'feature.three.desc':
      'Comments and notes stay with each property so owners, agents, and teams stay aligned.',
    'feature.four.title': 'Location clarity',
    'feature.four.desc': 'Regions, districts, and ward details are structured for fast discovery.',
    'feature.five.title': 'Media that builds trust',
    'feature.five.desc': 'Image galleries and video previews keep clients confident in what they see.',
    'feature.six.title': 'Mobile-first performance',
    'feature.six.desc': 'Designed with Flutter for smooth, responsive experiences on the go.',
    'workflow.eyebrow': 'Workflow',
    'workflow.title': 'From owner upload to client decision.',
    'workflow.body': 'A simple flow that supports owners, teams, and clients in the same workspace.',
    'step.one.title': 'Owners publish',
    'step.one.desc': 'Capture pricing, category, amenities, and location details with clarity.',
    'step.two.title': 'Clients explore',
    'step.two.desc': 'Portrait-first screens make listings easy to scan and compare.',
    'step.three.title': 'Teams close',
    'step.three.desc': 'Live status and notes keep owners and clients aligned through the lease.',
    'screens.eyebrow': 'Tenant journey',
    'screens.title': 'A welcome journey for tenants to find their home.',
    'screens.body':
      'Tenants can browse, compare, and move forward with confidence through a clean portrait-first experience.',
    'screens.card.one': 'Home discovery',
    'screens.card.two': 'Client browse',
    'screens.card.three': 'Listing detail',
    'screens.card.four': 'Register & connect',
    'trust.eyebrow': 'Trust and privacy',
    'trust.title': 'Designed for confidence and accountability.',
    'trust.body':
      'PangaLeo respects your data. Listings stay organized, access is controlled, and privacy protects both owners and clients.',
    'trust.one.title': 'Purposeful data',
    'trust.one.desc': 'We collect only what keeps properties accurate and current.',
    'trust.two.title': 'Transparent updates',
    'trust.two.desc': 'Every property status change is intentional and visible.',
    'trust.three.title': 'Privacy-first mindset',
    'trust.three.desc': 'Policies are clear and easy to read, with no surprises.',
    'cta.title': 'Download PangaLeo and start exploring homes today.',
    'cta.body': 'The app is live on Google Play with curated listings and live updates.',
    'cta.button': 'Download now',
    'footer.tagline': 'A modern property platform built for owners, clients, and confident decisions.',
    'footer.company': 'Company',
    'footer.explore': 'Explore',
    'footer.contact': 'Contact',
    'footer.email': 'Email us',
    'footer.whatsapp': 'WhatsApp',
    'footer.phone': 'Call us',
    'footer.download': 'Download now',
    'whatsapp.message': 'Hello PangaLeo team, I need help finding a rental.',
    'sideform.title': 'Send a message',
    'form.status.sending': 'Sending...',
    'form.status.success': 'Message sent. We will reply soon.',
    'form.status.fail': 'Message failed. Please try again.',
    'form.status.missing': 'Email service not configured yet.',
    'footer.copy_prefix': '©',
    'footer.copy_suffix': 'PangaLeo. All rights reserved.',
    'about.eyebrow': 'About PangaLeo',
    'about.title': 'Built for owners and the clients they serve.',
    'about.body': 'PangaLeo keeps listings, occupancy, and collaboration in one calm workspace.',
    'about.focus.title': 'Our focus',
    'about.focus.body':
      'PangaLeo makes property operations feel lightweight and intuitive. Owners get live control, clients get clarity, and teams stay aligned without jumping between tools.',
    'about.believe.title': 'What we believe',
    'about.believe.one': 'Owners deserve instant control over pricing and availability.',
    'about.believe.two': 'Clients deserve listings that answer questions fast.',
    'about.believe.three': 'Transparency builds trust throughout the leasing process.',
    'about.believe.four': 'Mobile-first experiences should still feel premium and calm.',
    'about.delivers.title': 'What PangaLeo delivers',
    'about.delivers.body':
      'From listing creation to occupancy tracking, PangaLeo covers the full lifecycle of a property. Media galleries, structured location details, and status updates help owners act quickly while clients stay confident in their choices.',
    'about.modern.title': 'Built with modern foundations',
    'about.modern.body':
      'The app is crafted with Flutter for fast, responsive performance. That means a consistent experience across devices and a design system that stays clean as the platform scales.',
    'contact.eyebrow': 'Contact',
    'contact.title': 'Let us know about your properties and clients.',
    'contact.body': 'PangaLeo supports owners and clients with a clear, modern property experience.',
    'contact.reach.title': 'Reach us directly',
    'contact.reach.body': 'Share your portfolio size, your team structure, and the client experience you want to deliver.',
    'contact.email.label': 'Email:',
    'contact.phone.label': 'Phone:',
    'contact.availability.label': 'Availability:',
    'contact.availability.value': 'Monday to Friday, 9:00 - 17:00',
    'contact.form.title': 'Send a message',
    'contact.form.name': 'Your name',
    'contact.form.email': 'Email address',
    'contact.form.company': 'Company or portfolio',
    'contact.form.message': 'Tell us what you need',
    'contact.form.button': 'Send message',
    'privacy.eyebrow': 'Privacy Policy',
    'privacy.title': 'Privacy that is clear, calm, and transparent.',
    'privacy.updated': 'Last updated: February 17, 2026.',
    'privacy.overview.title': 'Overview',
    'privacy.overview.body':
      'PangaLeo values privacy and handles information with care. This policy explains what we collect, how we use it, and the choices available to you when using our platform.',
    'privacy.collect.title': 'Information we collect',
    'privacy.collect.body': 'We collect data you provide and data needed for core features, including:',
    'privacy.collect.one': 'Account details such as name, phone number, email address, and username.',
    'privacy.collect.two': 'Login credentials (password) used to access your account.',
    'privacy.collect.three': 'Photos and property listing details you upload.',
    'privacy.collect.four': 'Precise location (GPS) used to support property discovery and map features.',
    'privacy.use.title': 'How we use information',
    'privacy.use.body': 'We use collected information to:',
    'privacy.use.one': 'Provide and maintain the PangaLeo service.',
    'privacy.use.two': 'Keep property data accurate and accessible to your team.',
    'privacy.use.three': 'Improve performance, reliability, and user experience.',
    'privacy.share.title': 'Sharing and disclosure',
    'privacy.share.body':
      'We do not sell your data. We use service providers such as Supabase for storage and Google Maps for map features. They process data to deliver the service, and we only share data as needed or when required by law.',
    'privacy.retention.title': 'Data retention',
    'privacy.retention.body':
      'We retain information only as long as needed to provide the service and meet legal obligations.',
    'privacy.deletion.title': 'Data Deletion and Account Removal',
    'privacy.deletion.intro':
      'We provide a transparent way for users to delete their accounts and all associated personal data.',
    'privacy.deletion.inapp':
      'In-App Deletion: Users can delete their account at any time by navigating to Settings > Profile > Delete Account within the PangaLeo app.',
    'privacy.deletion.web':
      'Web Request: If you cannot access the app, you may request account and data deletion by emailing us at',
    'privacy.deletion.timing':
      'Upon request, all personal data (name, email, and profile details) will be permanently removed from our active databases within 30 days, except where retention is required by law.',
    'privacy.children.title': "Children's Privacy",
    'privacy.children.body':
      'PangaLeo is not intended for use by children under the age of 13. We do not knowingly collect personal information from children. If we become aware that a child under 13 has provided us with personal information, we will take immediate steps to delete such data.',
    'privacy.choices.title': 'Your choices',
    'privacy.choices.body':
      'You can review or update account information at any time. Contact us if you want to access, correct, or delete data.',
    'privacy.changes.title': 'Changes to this policy',
    'privacy.changes.body':
      'We may update this policy to reflect changes in our practices. When we do, the updated date at the top will change.',
    'privacy.contact.title': 'Contact',
    'privacy.contact.body': 'If you have questions about privacy or data handling, reach out at'
  },
  sw: {
    'nav.menu': 'Menyu',
    'nav.about': 'Kuhusu',
    'nav.how': 'Jinsi Inavyofanya Kazi',
    'nav.screens': 'Safari ya mpangaji',
    'nav.contact': 'Wasiliana',
    'nav.privacy': 'Sera ya Faragha',
    'nav.demo': 'Pakua sasa',
    'hero.eyebrow': 'Matatizo ya kutafuta nyumba basi',
    'hero.title': 'Tafuta nyumba ya kupanga haraka, bila usumbufu wa kawaida.',
    'hero.body':
      'PangaLeo inaondoa changamoto za kutafuta nyumba. Orodha zilizothibitishwa, picha wazi, bei na upatikanaji wa muda halisi, pamoja na mawasiliano ya moja kwa moja na wamiliki au mawakala — vyote sehemu moja.',
    'hero.cta_primary': 'Pakua sasa',
    'hero.cta_secondary': 'Ona inavyofanya kazi',
    'stat.one.title': 'Orodha zilizo tayari kwa wateja',
    'stat.one.desc': 'Maelezo kamili yanajibu maswali muhimu mapema.',
    'stat.two.title': 'Udhibiti wa mmiliki',
    'stat.two.desc': 'Sasisha bei, upatikanaji, na hali kwa haraka.',
    'stat.three.title': 'Muktadha wa pamoja',
    'stat.three.desc': 'Maoni na taarifa za mali hubaki pamoja.',
    'hero.card': 'Muonekano wa kisasa, unaoaminika na wamiliki, na rafiki kwa wateja.',
    'preview.eyebrow': 'Muonekano wa nyumba',
    'preview.title': 'Onyesha nyumba kwa mwonekano wa kisasa.',
    'preview.body': 'Picha bora, maelezo mafupi, na viwango vya bei hutoa uamuzi wa haraka.',
    'preview.card.one.tag': 'Mpya',
    'preview.card.one.title': 'Nyumba ya familia vyumba 3 yenye mwanga mwingi',
    'preview.card.one.meta': 'Dar es Salaam (Kinondoni) ? Kuanzia TZS 850k/mo',
    'preview.card.two.tag': 'Maarufu',
    'preview.card.two.title': 'Fleti ya kisasa vyumba 2 mjini',
    'preview.card.two.meta': 'Arusha (Njiro) ? Kuanzia TZS 1.2M/mo',
    'preview.card.three.tag': 'Pwani',
    'preview.card.three.title': 'Villa yenye mwonekano wa bahari',
    'preview.card.three.meta': 'Zanzibar (Stone Town) ? Kuanzia TZS 2.5M/mo',
    'why.eyebrow': 'Kwa nini PangaLeo',
    'why.title': 'Uwazi kwa wamiliki. Ujasiri kwa wateja.',
    'why.body':
      'Kila skrini huweka taarifa za mali, picha, na upatikanaji katika mstari mmoja ili pande zote ziwe na maamuzi sahihi.',
    'feature.one.title': 'Orodha zilizo tayari kwa wateja',
    'feature.one.desc': 'Bei, huduma, na picha huwasilishwa kwa mpangilio unaorahisisha kulinganisha.',
    'feature.two.title': 'Dashibodi ya mmiliki',
    'feature.two.desc': 'Sasisha bei, upatikanaji, na maelezo bila kutumia zana nyingi.',
    'feature.three.title': 'Ushirikiano wa kuaminika',
    'feature.three.desc':
      'Maoni, hatua, na historia ya mali hubaki sehemu moja kwa timu.',
    'feature.four.title': 'Uwazi wa eneo',
    'feature.four.desc': 'Mikoa, wilaya, na kata huonyesha eneo halisi kwa utafutaji wa haraka.',
    'feature.five.title': 'Picha zinazoleta imani',
    'feature.five.desc': 'Makundi ya picha na video huongeza uaminifu kabla ya ziara.',
    'feature.six.title': 'Utendaji wa kwanza kwa simu',
    'feature.six.desc': 'Imeboreshwa kwa simu kwa kasi, uthabiti, na matumizi mepesi.',
    'workflow.eyebrow': 'Mtiririko',
    'workflow.title': 'Kutoka kupakia kwa mmiliki hadi uamuzi wa mteja.',
    'workflow.body': 'Mtiririko rahisi unaowaunganisha wamiliki, timu, na wateja kwenye taarifa moja.',
    'step.one.title': 'Wamiliki huchapisha',
    'step.one.desc': 'Weka bei, aina, huduma, na maelezo ya eneo kwa uwazi wa juu.',
    'step.two.title': 'Wateja huchunguza',
    'step.two.desc': 'Skrini zilizo wima huwezesha kuchuja, kulinganisha, na kuona picha kwa urahisi.',
    'step.three.title': 'Timu hufunga',
    'step.three.desc':
      'Hali ya moja kwa moja na maoni huweka mawasiliano wazi hadi kukamilika.',
    'screens.eyebrow': 'Safari ya mpangaji',
    'screens.title': 'Safari ya kukaribisha wapangaji kupata makazi yao.',
    'screens.body':
      'Wapangaji wanaweza kuvinjari, kulinganisha, na kuwasiliana kwa ujasiri kupitia skrini zilizo wazi na za haraka.',
    'screens.card.one': 'Ugunduzi wa nyumbani',
    'screens.card.two': 'Uvinjari wa mteja',
    'screens.card.three': 'Maelezo ya orodha',
    'screens.card.four': 'Sajili na ungana',
    'trust.eyebrow': 'Uaminifu na faragha',
    'trust.title': 'Imeundwa kwa ujasiri na uwajibikaji.',
    'trust.body':
      'PangaLeo inaheshimu data. Orodha zinabaki zimepangwa, ufikiaji unadhibitiwa, na faragha inalinda wamiliki na wateja.',
    'trust.one.title': 'Data yenye kusudi',
    'trust.one.desc': 'Tunakusanya tu taarifa zinazohitajika kuweka mali sahihi na ya sasa.',
    'trust.two.title': 'Sasisho wazi',
    'trust.two.desc': 'Kila mabadiliko ya hali ya mali huonekana kwa uwazi.',
    'trust.three.title': 'Fikira ya faragha',
    'trust.three.desc': 'Sera ziko wazi, rahisi kusoma, na bila mshangao.',
    'cta.title': 'Pakua PangaLeo na uanze kutafuta nyumba leo.',
    'cta.body': 'Programu ipo Google Play ikiwa na orodha zilizoratibiwa na sasisho za moja kwa moja.',
    'cta.button': 'Pakua sasa',
    'footer.tagline': 'Jukwaa la kisasa la mali lililojengwa kwa wamiliki, wateja, na maamuzi yenye ujasiri.',
    'footer.company': 'Kampuni',
    'footer.explore': 'Gundua',
    'footer.contact': 'Wasiliana',
    'footer.email': 'Tuma barua pepe',
    'footer.whatsapp': 'WhatsApp',
    'footer.phone': 'Piga simu',
    'footer.download': 'Pakua sasa',
    'whatsapp.message': 'Habari timu ya PangaLeo, naomba msaada wa kupata nyumba ya kupanga.',
    'sideform.title': 'Tuma ujumbe',
    'form.status.sending': 'Inatumwa...',
    'form.status.success': 'Ujumbe umetumwa. Tutakujibu hivi karibuni.',
    'form.status.fail': 'Ujumbe haukutumwa. Tafadhali jaribu tena.',
    'form.status.missing': 'Huduma ya barua pepe haijawekwa bado.',
    'footer.copy_prefix': '©',
    'footer.copy_suffix': 'PangaLeo. Haki zote zimehifadhiwa.',
    'about.eyebrow': 'Kuhusu PangaLeo',
    'about.title': 'Imejengwa kwa wamiliki na wateja wanaowahudumia.',
    'about.body': 'PangaLeo inaweka orodha, upatikanaji, na ushirikiano kwenye nafasi moja tulivu.',
    'about.focus.title': 'Mwelekeo wetu',
    'about.focus.body':
      'Tunarahisisha uendeshaji wa mali: udhibiti wa haraka kwa wamiliki, uwazi kwa wateja, na ushirikiano wa timu bila kurukaruka kati ya zana.',
    'about.believe.title': 'Tunaamini',
    'about.believe.one': 'Wamiliki wanastahili udhibiti wa papo kwa bei na upatikanaji.',
    'about.believe.two': 'Wateja wanastahili orodha zinazojibu maswali haraka.',
    'about.believe.three': 'Uwazi hujenga imani katika mchakato wa ukodishaji.',
    'about.believe.four': 'Uzoefu wa kwanza kwa simu unapaswa kubaki premium na tulivu.',
    'about.delivers.title': 'PangaLeo inaleta nini',
    'about.delivers.body':
      'Kuanzia uundaji wa orodha hadi kufuatilia upatikanaji, PangaLeo hufunika mzunguko mzima wa mali. Makundi ya picha, maelezo ya eneo yaliyojengwa, na sasisho la hali husaidia wamiliki kuchukua hatua haraka huku wateja wakibaki na ujasiri.',
    'about.modern.title': 'Imejengwa kwa misingi ya kisasa',
    'about.modern.body':
      'Programu imeundwa kwa Flutter kwa utendaji wa haraka na unaojibu. Hii huleta uzoefu unaofanana kwenye vifaa na mfumo wa muundo unaobaki safi kadiri jukwaa linavyokua.',
    'contact.eyebrow': 'Wasiliana',
    'contact.title': 'Tuambie kuhusu mali zako na wateja wako.',
    'contact.body': 'PangaLeo inaunga mkono wamiliki na wateja kwa uzoefu wazi na wa kisasa wa mali.',
    'contact.reach.title': 'Wasiliana nasi moja kwa moja',
    'contact.reach.body': 'Shiriki ukubwa wa portfolio yako, muundo wa timu, na uzoefu wa wateja unaotaka kutoa.',
    'contact.email.label': 'Barua pepe:',
    'contact.phone.label': 'Simu:',
    'contact.availability.label': 'Upatikanaji:',
    'contact.availability.value': 'Jumatatu hadi Ijumaa, 9:00 - 17:00',
    'contact.form.title': 'Tuma ujumbe',
    'contact.form.name': 'Jina lako',
    'contact.form.email': 'Anwani ya barua pepe',
    'contact.form.company': 'Kampuni au portfolio',
    'contact.form.message': 'Tuambie unachohitaji',
    'contact.form.button': 'Tuma ujumbe',
    'privacy.eyebrow': 'Sera ya Faragha',
    'privacy.title': 'Faragha iliyo wazi, tulivu, na yenye uwazi.',
    'privacy.updated': 'Imesasishwa mwisho: Februari 17, 2026.',
    'privacy.overview.title': 'Muhtasari',
    'privacy.overview.body':
      'PangaLeo inathamini faragha na hushughulikia taarifa kwa uangalifu. Sera hii inaeleza tunachokusanya, tunavyotumia, na chaguo ulizo nazo unapotumia jukwaa.',
    'privacy.collect.title': 'Taarifa tunazokusanya',
    'privacy.collect.body': 'Tunakusanya taarifa unazotoa na zinazohitajika kwa vipengele vya msingi, ikiwemo:',
    'privacy.collect.one': 'Maelezo ya akaunti kama jina, namba ya simu, barua pepe, na jina la mtumiaji.',
    'privacy.collect.two': 'Taarifa za kuingia (nenosiri) zinazotumika kufikia akaunti.',
    'privacy.collect.three': 'Picha na maelezo ya orodha ya mali unayopakia.',
    'privacy.collect.four': 'Eneo sahihi (GPS) linalotumika kusaidia ugunduzi wa mali na huduma za ramani.',
    'privacy.use.title': 'Jinsi tunavyotumia taarifa',
    'privacy.use.body': 'Tunatumia taarifa zilizokusanywa ili:',
    'privacy.use.one': 'Kutoa na kuendeleza huduma ya PangaLeo.',
    'privacy.use.two': 'Kuweka data ya mali ikiwa sahihi na inayopatikana kwa timu.',
    'privacy.use.three': 'Kuboresha utendaji, uthabiti, na uzoefu wa mtumiaji.',
    'privacy.share.title': 'Kushirikisha na kufichua',
    'privacy.share.body':
      'Hatuuzi data yako. Tunatumia watoa huduma kama Supabase kwa uhifadhi na Google Maps kwa huduma za ramani. Watoa huduma hao hushughulikia data ili kutoa huduma, na tunashiriki taarifa pale tu inapohitajika au inapolazimika kisheria.',
    'privacy.retention.title': 'Uhifadhi wa data',
    'privacy.retention.body':
      'Tunatunza taarifa kwa muda unaohitajika kutoa huduma na kutimiza wajibu wa kisheria.',
    'privacy.deletion.title': 'Uondoaji wa akaunti na data',
    'privacy.deletion.intro':
      'Tunatoa njia wazi kwa watumiaji kufuta akaunti zao na data zote zinazohusiana.',
    'privacy.deletion.inapp':
      'Uondoaji ndani ya programu: Watumiaji wanaweza kufuta akaunti yao wakati wowote kwa kwenda kwenye Mipangilio > Wasifu > Futa Akaunti ndani ya programu ya PangaLeo.',
    'privacy.deletion.web':
      'Ombi la tovuti: Ikiwa huwezi kufikia programu, unaweza kuomba kufuta akaunti na data kwa kutuma barua pepe kupitia',
    'privacy.deletion.timing':
      'Kwa ombi, data yote binafsi (jina, barua pepe, na maelezo ya wasifu) itafutwa kabisa kutoka hifadhidata zetu hai ndani ya siku 30, isipokuwa pale sheria zinapotaka ihifadhiwe.',
    'privacy.children.title': 'Faragha ya watoto',
    'privacy.children.body':
      'PangaLeo haijakusudiwa kutumiwa na watoto walio chini ya umri wa miaka 13. Hatukusanyi kwa makusudi taarifa binafsi kutoka kwa watoto. Ikitokea tunagundua mtoto chini ya miaka 13 ametupa taarifa binafsi, tutachukua hatua za haraka kufuta data hiyo.',
    'privacy.choices.title': 'Chaguo zako',
    'privacy.choices.body':
      'Unaweza kukagua au kusasisha taarifa za akaunti wakati wowote. Wasiliana nasi kama unataka kufikia, kurekebisha, au kufuta data.',
    'privacy.changes.title': 'Mabadiliko ya sera',
    'privacy.changes.body':
      'Tunaweza kusasisha sera hii kulingana na mabadiliko ya utendaji. Tarehe ya juu itabadilika kila tunapoboresha.',
    'privacy.contact.title': 'Wasiliana',
    'privacy.contact.body': 'Kwa maswali kuhusu faragha au matumizi ya data, wasiliana kupitia'
  }
};

const languageButtons = document.querySelectorAll('[data-lang]');

const storedLang = localStorage.getItem('pangaleo-lang');
const browserLang = navigator.language ? navigator.language.slice(0, 2) : 'en';
const initialLang = translations[storedLang] ? storedLang : 'sw';
let currentLang = initialLang;

const getTranslation = (key) => {
  const fromCurrent = translations[currentLang] && translations[currentLang][key];
  if (fromCurrent) return fromCurrent;
  const fallback = translations.en && translations.en[key];
  return fallback || '';
};

const updateWhatsAppLinks = () => {
  const message = getTranslation('whatsapp.message');
  const encoded = message ? `?text=${encodeURIComponent(message)}` : '';
  document.querySelectorAll('[data-whatsapp]').forEach((link) => {
    const raw = link.getAttribute('data-whatsapp') || '';
    const number = raw.replace(/[^\d]/g, '');
    if (!number) return;
    link.href = `https://wa.me/${number}${encoded}`;
  });
};

const applyTranslations = (lang) => {
  const dictionary = translations[lang] || translations.en;
  document.documentElement.lang = lang;
  currentLang = lang;

  document.querySelectorAll('[data-i18n]').forEach((element) => {
    const key = element.getAttribute('data-i18n');
    if (key && dictionary[key]) {
      element.textContent = dictionary[key];
    }
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach((element) => {
    const key = element.getAttribute('data-i18n-placeholder');
    if (key && dictionary[key]) {
      element.setAttribute('placeholder', dictionary[key]);
    }
  });

  document.querySelectorAll('[data-i18n-value]').forEach((element) => {
    const key = element.getAttribute('data-i18n-value');
    if (key && dictionary[key]) {
      element.setAttribute('value', dictionary[key]);
    }
  });

  if (slider && slider.sliderCaptions && slider.sliderMakeCaptions) {
    const updatedCaptions = slider.sliderMakeCaptions(lang);
    if (updatedCaptions.length) {
      slider.sliderCaptions.forEach((caption, index) => {
        caption.textContent = updatedCaptions[index % updatedCaptions.length];
      });
    }
  }

  document.querySelectorAll('[data-form-status]').forEach((status) => {
    const key = status.dataset.statusKey;
    if (key) {
      status.textContent = getTranslation(key);
    }
  });

  updateWhatsAppLinks();
};

const setActiveLangButton = (lang) => {
  languageButtons.forEach((button) => {
    button.classList.toggle('is-active', button.dataset.lang === lang);
  });
};

applyTranslations(initialLang);
setActiveLangButton(initialLang);

languageButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const lang = button.dataset.lang;
    if (!lang) return;
    localStorage.setItem('pangaleo-lang', lang);
    applyTranslations(lang);
    setActiveLangButton(lang);
  });
});
