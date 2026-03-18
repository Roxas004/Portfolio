const openMenu = () => {
    const menu = document.querySelector('.header-menu');
    menu.classList.toggle("active");

    if (menu.classList.contains("active")) {
        document.querySelector("header .material-symbols-outlined").innerHTML = "close";
    } else {
        document.querySelector("header .material-symbols-outlined").innerHTML = "menu";
    }
}

document.querySelectorAll('.header-menu a').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        if (this.getAttribute('href').startsWith('#')) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            const offset = -80;
            const elementPosition = targetElement.getBoundingClientRect().top + window.scrollY;
            const offsetPosition = elementPosition + offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Fetch avec timeout pour éviter que Promise.all reste bloqué indéfiniment
function fetchWithTimeout(url, timeoutMs = 8000) {
    return Promise.race([
        fetch(url),
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout')), timeoutMs)
        )
    ]);
}

// Tente rss2json en premier, puis AllOrigins en fallback
async function loadRSSFeed(url, containerId, limit = 3) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // --- Tentative 1 : rss2json ---
    try {
        const rss2jsonUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`;
        const response = await fetchWithTimeout(rss2jsonUrl, 6000);
        const data = await response.json();

        if (data.status === 'ok' && data.items && data.items.length > 0) {
            renderArticles(container, data.items.slice(0, limit));
            return;
        }
    } catch (_) {
        // rss2json a échoué, on continue vers le fallback
    }

    // --- Tentative 2 : AllOrigins (parse le XML RSS manuellement) ---
    try {
        const allOriginsUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
        const response = await fetchWithTimeout(allOriginsUrl, 8000);
        const data = await response.json();

        if (data.contents) {
            const parser = new DOMParser();
            const xml = parser.parseFromString(data.contents, 'text/xml');
            const items = Array.from(xml.querySelectorAll('item')).slice(0, limit);

            if (items.length > 0) {
                const articles = items.map(item => ({
                    title: item.querySelector('title')?.textContent || 'Sans titre',
                    link: item.querySelector('link')?.textContent || '#',
                    pubDate: item.querySelector('pubDate')?.textContent || ''
                }));
                renderArticles(container, articles);
                return;
            }
        }
    } catch (_) {
        // AllOrigins a aussi échoué
    }

    // --- Fallback final : message neutre ---
    container.innerHTML = '<p class="feed-note">📌 Visitez directement leur site pour les dernières actualités</p>';
}

function renderArticles(container, articles) {
    container.innerHTML = articles.map(item => {
        const pubDate = item.pubDate ? new Date(item.pubDate) : null;
        const timeAgo = pubDate && !isNaN(pubDate) ? getTimeAgo(pubDate) : '';

        return `
            <a href="${item.link}" target="_blank" rel="noopener" class="article-item">
                <div class="article-title">${truncate(item.title, 80)}</div>
                ${timeAgo ? `<div class="article-meta"><span class="article-date">${timeAgo}</span></div>` : ''}
            </a>
        `;
    }).join('');
}

function truncate(str, length) {
    return str.length > length ? str.substring(0, length) + '...' : str;
}

function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    const intervals = {
        'an': 31536000,
        'mois': 2592000,
        'jour': 86400,
        'heure': 3600,
        'minute': 60
    };

    for (let [name, secondsInInterval] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / secondsInInterval);
        if (interval >= 1) {
            return `Il y a ${interval} ${name}${interval > 1 && name !== 'mois' ? 's' : ''}`;
        }
    }
    return 'À l\'instant';
}

// Charger tous les flux au chargement de la page
document.addEventListener('DOMContentLoaded', async () => {
    const loadingState = document.getElementById('loading-state');
    const feedsContainer = document.getElementById('feeds-container');

    // Promise.allSettled au lieu de Promise.all :
    // même si certains flux échouent, on affiche quand même les autres
    await Promise.allSettled([
        // Flux développeurs
        loadRSSFeed('https://github.blog/feed/', 'feed-github'),
        loadRSSFeed('https://www.infoq.com/feed/', 'feed-infoq'),
        loadRSSFeed('https://stackoverflow.blog/feed/', 'feed-stackoverflow'),
        // Flux IA
        loadRSSFeed('https://techcrunch.com/category/artificial-intelligence/feed/', 'feed-techcrunch-ai'),
        loadRSSFeed('https://www.technologyreview.com/feed/', 'feed-mit'),
        loadRSSFeed('https://venturebeat.com/category/ai/feed/', 'feed-venturebeat')
    ]);

    // Cacher le loader et afficher les feeds
    loadingState.style.display = 'none';
    feedsContainer.style.display = 'block';

    // Filtres de catégories
    const filterButtons = document.querySelectorAll('.category-filter');
    const categories = document.querySelectorAll('.feed-category');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const category = button.dataset.category;

            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            categories.forEach(cat => {
                if (category === 'all' || cat.dataset.category === category) {
                    cat.style.display = 'block';
                } else {
                    cat.style.display = 'none';
                }
            });
        });
    });
});