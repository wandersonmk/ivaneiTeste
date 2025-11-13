// Scroll suave para a galeria
function scrollToGallery() {
    document.getElementById('gallery').scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });
}

// Filtro de categorias
const filterButtons = document.querySelectorAll('.filter-btn');
const drinkCards = document.querySelectorAll('.drink-card');

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Remover active de todos os botões
        filterButtons.forEach(btn => btn.classList.remove('active'));
        
        // Adicionar active ao botão clicado
        button.classList.add('active');
        
        const category = button.getAttribute('data-category');
        
        // Filtrar cards
        drinkCards.forEach(card => {
            const cardCategory = card.getAttribute('data-category');
            
            if (category === 'all' || cardCategory === category) {
                card.style.display = 'block';
                // Animar entrada
                card.style.animation = 'none';
                setTimeout(() => {
                    card.style.animation = 'fadeIn 0.6s ease';
                }, 10);
            } else {
                card.style.display = 'none';
            }
        });
    });
});

// Efeito de parallax no hero
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    
    if (hero) {
        hero.style.transform = `translateY(${scrolled * 0.5}px)`;
        hero.style.opacity = 1 - scrolled / 700;
    }
});

// Animação de entrada dos cards ao scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'fadeIn 0.6s ease';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

drinkCards.forEach(card => {
    observer.observe(card);
});
