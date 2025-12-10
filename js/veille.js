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

async function loadRSSFeed(url, containerId, limit = 3) {
    const container = document.getElementById(containerId);
    if (!container) return;

    try {
        // Utiliser RSS2JSON comme proxy CORS
        const rss2jsonUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`;
        const response = await fetch(rss2jsonUrl);
        const data = await response.json();

        if (data.status === 'ok' && data.items && data.items.length > 0) {
            const articles = data.items.slice(0, limit);
            container.innerHTML = articles.map(item => {
                const pubDate = new Date(item.pubDate);
                const timeAgo = getTimeAgo(pubDate);

                return `
                    <a href="${item.link}" target="_blank" class="article-item">
                        <div class="article-title">${truncate(item.title, 80)}</div>
                        <div class="article-meta">
                            <span class="article-date">${timeAgo}</span>
                        </div>
                    </a>
                `;
            }).join('');
        } else {
            container.innerHTML = '<p class="feed-note">📌 Visitez directement leur site pour les dernières actualités</p>';
        }
    } catch (error) {
        console.error(`Erreur lors du chargement du flux ${url}:`, error);
        container.innerHTML = '<p class="feed-note">📌 Consultez leur blog pour les articles récents</p>';
    }
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

    // Charger les flux en parallèle
    await Promise.all([
        // Flux développeurs
        loadRSSFeed('https://github.blog/feed/', 'feed-github'),
        loadRSSFeed('https://www.infoq.com/feed/', 'feed-infoq'),
        loadRSSFeed('https://stackoverflow.blog/feed/', 'feed-stackoverflow'),
        // Flux IA - avec URLs RSS testées
        loadRSSFeed('https://techcrunch.com/category/artificial-intelligence/feed/', 'feed-techcrunch-ai'),
        loadRSSFeed('https://www.technologyreview.com/feed/', 'feed-mit'),
        loadRSSFeed('https://venturebeat.com/category/ai/feed/', 'feed-venturebeat')
    ]);

    // Cacher le loader et afficher les feeds
    setTimeout(() => {
        loadingState.style.display = 'none';
        feedsContainer.style.display = 'block';
    }, 500);

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