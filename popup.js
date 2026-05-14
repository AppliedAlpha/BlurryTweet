document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('toggleBlur');
    const whitelistArea = document.getElementById('whitelist');
    const saveBtn = document.getElementById('saveBtn');

    // 설정 로드
    chrome.storage.local.get(['isActive', 'whitelist'], (data) => {
        toggle.checked = data.isActive || false;
        whitelistArea.value = (data.whitelist || []).join('\n');
    });

    const saveAndApply = () => {
        const isActive = toggle.checked;
        const whitelist = whitelistArea.value.split('\n')
            .map(id => id.trim().replace('@', '').toLowerCase())
            .filter(id => id.length > 0);

        chrome.storage.local.set({ isActive, whitelist }, () => {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                const activeTab = tabs[0];
                if (activeTab && activeTab.url && (activeTab.url.includes("x.com") || activeTab.url.includes("twitter.com"))) {
                    chrome.tabs.sendMessage(activeTab.id, { action: "updateSettings" })
                        .catch(err => {
                            console.log("수신 대기 중인 컨텐츠 스크립트가 없습니다. 페이지를 새로고침하세요.");
                        });
                }
            });
        });
    };

    toggle.addEventListener('change', saveAndApply);
    saveBtn.addEventListener('click', saveAndApply);
});