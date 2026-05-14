let config = { isActive: false, whitelist: [] };

function loadSettings() {
    chrome.storage.local.get(['isActive', 'whitelist'], (data) => {
        config.isActive = data.isActive || false;
        config.whitelist = (data.whitelist || []).map(id => id.toLowerCase().trim().replace('@', ''));
        applyBlur();
    });
}

function applyBlur() {
    const tweets = document.querySelectorAll('article[data-testid="tweet"]');

    tweets.forEach(tweet => {
        const userNameDiv = tweet.querySelector('[data-testid="User-Name"]');
        if (!userNameDiv) return;

        const spans = userNameDiv.querySelectorAll('span');
        let handle = "";
        for (const span of spans) {
            if (span.innerText.startsWith('@')) {
                handle = span.innerText.replace('@', '').trim().toLowerCase();
                break;
            }
        }

        if (!handle) return;

        const isSafe = config.whitelist.includes(handle);
        const targetElements = [];

        const avatarTestId = tweet.querySelector('[data-testid="UserAvatar-Container-unknown"], [data-testid="UserAvatar-Container-roaming"]');
        if (avatarTestId) {
            targetElements.push(avatarTestId);
        }
        const profileImgBySrc = tweet.querySelector('img[src*="/profile_images/"]');
        if (profileImgBySrc) {
            const avatarWrapper = profileImgBySrc.closest('a[role="link"]') || profileImgBySrc.closest('div[style*="border-radius"]');
            if (avatarWrapper && !targetElements.includes(avatarWrapper)) {
                targetElements.push(avatarWrapper);
            } else if (!avatarTestId) {
                targetElements.push(profileImgBySrc);
            }
        }
        if (userNameDiv) targetElements.push(userNameDiv);

        // 찾은 모든 이미지 후보에 블러 효과 적용해보기 (fall-back용)
        targetElements.forEach(el => {
            if (config.isActive && !isSafe) {
                el.classList.add('custom-blur-effect');
            } else {
                el.classList.remove('custom-blur-effect');
            }
        });
    });
}

// 팝업에서 보내는 메시지 수신
chrome.runtime.onMessage.addListener((request) => {
    if (request.action === "updateSettings") loadSettings();
});

// 무한 스크롤 및 동적 콘텐츠 대응
const observer = new MutationObserver(applyBlur);
observer.observe(document.body, { childList: true, subtree: true });

loadSettings();