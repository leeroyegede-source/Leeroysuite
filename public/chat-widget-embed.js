(function () {
    const script = document.currentScript;
    const siteUrl = script.getAttribute('data-site-url') || 'http://localhost:3000';
    const supportEmail = script.getAttribute('data-support-email');

    const container = document.createElement('div');
    container.id = 'ai-suite-chat-widget-container';
    container.style.position = 'fixed';
    container.style.bottom = '90px'; // 20px + 56px + 14px gap
    container.style.right = '20px';
    container.style.width = '400px';
    container.style.height = '600px';
    container.style.zIndex = '999999';
    container.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)';
    container.style.borderRadius = '16px';
    container.style.overflow = 'hidden';
    container.style.display = 'none'; // Hidden by default
    container.style.transition = 'all 0.3s ease-in-out';
    container.style.transform = 'translateY(20px)';
    container.style.opacity = '0';

    const iframe = document.createElement('iframe');
    const iframeUrl = new URL(`${siteUrl}/chat-widget`);
    if (supportEmail) {
        iframeUrl.searchParams.set('supportEmail', supportEmail);
    }
    // Add cache buster to prevent stale iframe loading
    iframeUrl.searchParams.set('t', Date.now());
    iframe.src = iframeUrl.toString();
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    iframe.style.background = 'transparent';

    container.appendChild(iframe);
    document.body.appendChild(container);

    // Toggle button
    const button = document.createElement('button');
    button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg>';
    button.style.position = 'fixed';
    button.style.bottom = '20px';
    button.style.right = '20px';
    button.style.width = '56px';
    button.style.height = '56px';
    button.style.borderRadius = '28px';
    button.style.backgroundColor = '#0d9488'; // Teal 600
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.cursor = 'pointer';
    button.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
    button.style.zIndex = '999999';
    button.style.display = 'flex';
    button.style.alignItems = 'center';
    button.style.justifyContent = 'center';
    button.style.transition = 'transform 0.2s';

    button.onmouseover = () => { button.style.transform = 'scale(1.1)'; };
    button.onmouseout = () => { button.style.transform = 'scale(1.0)'; };

    let isOpen = false;
    button.onclick = () => {
        isOpen = !isOpen;
        if (isOpen) {
            container.style.display = 'block';
            setTimeout(() => {
                container.style.transform = 'translateY(0)';
                container.style.opacity = '1';
            }, 10);
            button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';
            button.style.display = 'none'; // Hide button when chat is open
        } else {
            container.style.transform = 'translateY(20px)';
            container.style.opacity = '0';
            setTimeout(() => {
                container.style.display = 'none';
            }, 300);
            button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg>';
            button.style.display = 'flex'; // Show button when chat is closed
        }
    };

    // Listen for close message from iframe
    window.addEventListener('message', function (event) {
        if (event.data === 'close-chat-widget') {
            if (isOpen) {
                button.click();
            }
        }
    });

    document.body.appendChild(button);
})();
