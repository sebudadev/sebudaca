"use strict";

// Redirect to setup if user is not set up, otherwise run checks and show index
(function() {
  const storedName = localStorage.getItem('userName');
  const isSetupPage = window.location.pathname.endsWith('newtosite.html');

  // If no user, redirect to setup (unless already on setup page)
  if ((!storedName || !storedName.trim()) && !isSetupPage) {
    window.location.href = "newtosite.html";
    return;
  }

  // If user exists and is on setup page, redirect to index
  if (storedName && storedName.trim() && isSetupPage) {
    window.location.href = "index.html";
    return;
  }

  // If user exists and is on index, continue with browser/VPN checks and show index
  // (Put your browser/VPN check and page logic here)
})();

/**
 * @type {HTMLFormElement}
 */
const form = document.getElementById("uv-form");
/**
 * @type {HTMLInputElement}
 */
const address = document.getElementById("uv-address");
/**
 * @type {HTMLInputElement}
 */
const searchEngine = document.getElementById("uv-search-engine");
/**
 * @type {HTMLParagraphElement}
 */
const error = document.getElementById("uv-error");
/**
 * @type {HTMLPreElement}
 */
const errorCode = document.getElementById("uv-error-code");

async function registerSW() {
  if (!navigator.serviceWorker.controller) {
    await navigator.serviceWorker.register('/uv/uv.sw.js', {
      scope: __uv$config.prefix,
    });
  }
}

function isUrl(val = "") {
  if (
    /^http(s?):\/\//.test(val) ||
    (val.includes(".") && val.substr(0, 1) !== " ")
  )
    return true;
  return false;
}

function search(query) {
  if (!isUrl(query)) return "https://duckduckgo.com/?q=" + encodeURIComponent(query);
  if (!(query.startsWith("https://") || query.startsWith("http://")))
    return "http://" + query;
  return query;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  try {
    await registerSW();
  } catch (err) {
    error.textContent = "Failed to register service worker.";
    errorCode.textContent = err.toString();
    throw err;
  }

  const url = search(address.value, searchEngine.value);
  location.href = __uv$config.prefix + __uv$config.encodeUrl(url);
});

// Optional: If you want to trigger submit on Enter in a custom input
address.addEventListener("keydown", function(e) {
  if (e.key === "Enter") {
    form.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
  }
});

document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('uv-form');
  const address = document.getElementById('uv-address');
  if (!form || !address) return;

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    const val = address.value.trim();
    if (!val) return;
    // Redirect to search.html with the url as a query param
    window.location.href = `search.html?url=${encodeURIComponent(val)}`;
  });
});

// Paste this at the end of your index.js (or near the top if you want to use it anywhere):

function showToast(msg, type = "success", icon) {
  if (!icon) icon = type;
  const t = document.createElement("div");
  t.className = `toast show ${type}`;
  const icons = {
    success: '<i class="fa-solid fa-check-circle" style="margin-right: 8px;"></i>',
    error: '<i class="fa-solid fa-times-circle" style="margin-right: 8px;"></i>',
    info: '<i class="fa-solid fa-info-circle" style="margin-right: 8px;"></i>',
    warning: '<i class="fa-solid fa-exclamation-triangle" style="margin-right: 8px;"></i>',
    heart: '<i class="fa-solid fa-heart" style="margin-right: 8px;"></i>'
  };
  t.innerHTML = `${icons[icon] || icons.success}${msg} `;
  const pb = document.createElement("div");
  pb.className = "progress-bar";
  t.appendChild(pb);
  const cb = document.createElement("button");
  cb.className = "toast-close";
  cb.innerHTML = '<i class="fa-solid fa-xmark" style="margin-left: 8px; font-size: 0.8em;"></i>';
  cb.addEventListener("click", () => {
    t.classList.add("hide");
    setTimeout(() => t.remove(), 500);
  });
  t.appendChild(cb);
  document.body.appendChild(t);
  setTimeout(() => {
    t.classList.add("hide");
    setTimeout(() => t.remove(), 500);
  }, 3000);
}

// Example usage:
// showToast("Welcome to sebudaca!", "success");
// showToast("Something went wrong.", "error");

// Prompt for nickname if not set, and show welcome back toast if returning

// Helper to get/set nickname in localStorage
function getNickname() {
  return localStorage.getItem("sebuda_nickname");
}
function setNickname(nick) {
  localStorage.setItem("sebuda_nickname", nick);
}

// Prompt user for nickname if not set
function promptForNickname() {
  let nick = "";
  while (!nick || !nick.trim()) {
    nick = prompt("Welcome! Please enter your nickname to use sebudaca:");
    if (nick === null) break; // User cancelled
  }
  if (nick && nick.trim()) setNickname(nick.trim());
}


window.onload = function() {
    const storedName = localStorage.getItem('userName');
    const path = window.location.pathname;
    if (!storedName) {
        document.getElementById('overlay').style.display = 'block';
        document.getElementById('namePrompt').style.display = 'block';
        const nameInput = document.getElementById('userName');
        const doneButton = document.getElementById('doneButton');
        doneButton.disabled = true;
        nameInput.addEventListener('input', () => {
            doneButton.disabled = nameInput.value.trim() === '';
        });
        doneButton.onclick = submitName;
        nameInput.addEventListener('keydown', e => {
            if (e.key === "Enter" && !doneButton.disabled) submitName();
        });
        return;
    }
    const welcomeMsg = getWelcomeMessage(storedName);
    const iconType = getIconType(path);
    showToast(welcomeMsg, 'success', iconType);
    const greetingElement = document.getElementById('greeting');
    if (greetingElement) {
        updateGreeting(storedName);
    }
};

function submitName() {
    const name = document.getElementById('userName').value.trim();
    if (!name) return;
    localStorage.setItem('userName', name);
    updateGreeting(name);
    document.getElementById('namePrompt').classList.add('fade-out');
    showToast(`Hey, ${name}! Welcome to sebudaca!`, 'success', 'wave');

    setTimeout(() => {
        document.getElementById('namePrompt').style.display = 'none';
        document.getElementById('overlay').style.display = 'none';
    }, 300);
}

function getWelcomeMessage(name) {
    const path = window.location.pathname;
    if (path === '/games.html' || path === '/games.html') {
        return `Have fun playing games, ${name}!`;
    } else if (path === '/apps.html' || path === '/apps.html') {
        return `Enjoy our collection of apps, ${name}!`;
    } else if (path === '/ai.html') {
        return `Ask me anything, ${name}!`;
    } else {
        return `Welcome back, ${name}!`;
    }
}

function getIconType(path) {
    if (path === '/games.html' || path === '/g') return 'game';
    if (path === '/apps.html' || path === '/a') return 'apps';
    if (path === '/ai.html') return 'robot';
    return 'wave';
}

// Add this function or update your updateGreeting function:
function updateGreeting(name) {
    const { text, icon } = getGreeting();
    let el = document.getElementById('greeting');
    if (!el) {
        // Try to insert below the logo or URL bar
        // 1. Try below logo
        const logo = document.querySelector('.logo-wrapper, .main-navbar-title, .logo');
        if (logo && logo.parentNode) {
            el = document.createElement('div');
            el.id = 'greeting';
            el.style.cssText = "margin: 1em auto 0.5em auto; text-align: center; font-size: 1.18em; color: #bfc9db; font-weight: 500; opacity: 0; transition: opacity 0.4s;";
            logo.parentNode.insertBefore(el, logo.nextSibling);
        } else {
            // 2. Try below URL/search bar
            const urlBar = document.getElementById('uv-form') || document.getElementById('uv-address');
            if (urlBar && urlBar.parentNode) {
                el = document.createElement('div');
                el.id = 'greeting';
                el.style.cssText = "margin: 1em auto 0.5em auto; text-align: center; font-size: 1.18em; color:rgb(128, 128, 128)ont-weight: 500; opacity: 0; transition: opacity 0.4s;";
                urlBar.parentNode.insertBefore(el, urlBar.nextSibling);
            }
        }
    }
    if (el) {
        el.innerHTML = `${icon} ${text}, ${name}!`;
        setTimeout(() => { el.style.opacity = 1; }, 100);
    }
}

// Toast function (reuse your existing one, but add these icons)
function showToast(message, type = 'success', iconType = 'wave') {
    const toast = document.createElement('div');
    toast.className = `toast show ${type}`;
    const icons = {
        success: '<i class="fa-solid fa-check-circle" style="margin-right: 8px;"></i>',
        error:   '<i class="fa-solid fa-times-circle" style="margin-right: 8px;"></i>',
        info:    '<i class="fa-solid fa-info-circle" style="margin-right: 8px;"></i>',
        warning: '<i class="fa-solid fa-exclamation-triangle" style="margin-right: 8px;"></i>',
        wave:    '<i class="fa-solid fa-hand-peace" style="margin-right: 8px;"></i>', // Use fa-hand-peace as a wave
        game:    '<i class="fa-solid fa-gamepad" style="margin-right: 8px;"></i>',
        apps:    '<i class="fa-solid fa-th-large" style="margin-right: 8px;"></i>',
        robot:   '<i class="fa-solid fa-robot" style="margin-right: 8px;"></i>',
    };
    // Fallback to 'wave' if iconType is not found
    toast.innerHTML = `${icons[iconType] || icons.wave}${message}`;
    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    toast.appendChild(progressBar);
    const closeBtn = document.createElement('button');
    closeBtn.className = 'toast-close';
    closeBtn.innerHTML = '<i class="fa-solid fa-xmark" style="margin-left: 8px; font-size: 0.8em;"></i>';
    closeBtn.addEventListener('click', () => {
        toast.classList.add('hide');
        setTimeout(() => toast.remove(), 500);
    });
    toast.appendChild(closeBtn);
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('hide');
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

function getGreeting() {
    const now = new Date();
    const hour = now.getHours();
    const timeGreetings = [];
    const generalGreetings = [
        { text: 'Welcome aboard', icon: '<i class="fa-solid fa-rocket"></i>' },
        { text: 'Let’s do something great', icon: '<i class="fa-solid fa-lightbulb"></i>' },
        { text: 'Hope you enjoy sebudaca', icon: '<i class="fa-solid fa-heart"></i>' },
        { text: 'Time to explore', icon: '<i class="fa-solid fa-compass"></i>' },
        { text: 'Let’s roll', icon: '<i class="fa-solid fa-dice"></i>' },
        { text: 'The adventure continues', icon: '<i class="fa-solid fa-map"></i>' }
    ];
    if (hour >= 5 && hour < 12) {
        timeGreetings.push(
            { text: 'Good morning, sunshine', icon: '<i class="fa-solid fa-sun"></i>' },
            { text: 'Here’s to a bright morning', icon: '<i class="fa-solid fa-cloud-sun"></i>' },
            { text: 'Enjoy your morning', icon: '<i class="fa-solid fa-mug-hot"></i>' },
            { text: 'Your day starts here', icon: '<i class="fa-solid fa-star"></i>' }
        );
    } else if (hour < 17) {
        timeGreetings.push(
            { text: 'Good afternoon', icon: '<i class="fa-solid fa-leaf"></i>' },
            { text: 'Hope your day is going well', icon: '<i class="fa-solid fa-coffee"></i>' },
            { text: 'Keep up the pace', icon: '<i class="fa-solid fa-book"></i>' },
            { text: 'Stay on track today', icon: '<i class="fa-solid fa-sun"></i>' }
        );
    } else if (hour < 21) {
        timeGreetings.push(
            { text: 'Good evening', icon: '<i class="fa-solid fa-cloud-moon"></i>' },
            { text: 'Time to unwind', icon: '<i class="fa-solid fa-fire"></i>' },
            { text: 'Evening’s here—relax', icon: '<i class="fa-solid fa-star"></i>' },
            { text: 'Breathe and recharge', icon: '<i class="fa-solid fa-moon"></i>' }
        );
    } else {
        timeGreetings.push(
            { text: 'Good night', icon: '<i class="fa-solid fa-bed"></i>' },
            { text: 'Rest well', icon: '<i class="fa-solid fa-blanket"></i>' },
            { text: 'Sweet dreams', icon: '<i class="fa-solid fa-star-and-crescent"></i>' },
            { text: 'See you tomorrow', icon: '<i class="fa-solid fa-moon"></i>' }
        );
    }
    const useGeneral = Math.random() < 0.5;
    const pool = useGeneral ? generalGreetings : timeGreetings;
    return pool[Math.floor(Math.random() * pool.length)];
}


// Minimal NProgress loader animation on page load
document.addEventListener("DOMContentLoaded", function() {
  const nprogress = document.getElementById("nprogress");
  if (!nprogress) return;
  nprogress.style.opacity = "1";
  const bar = nprogress.querySelector(".bar");
  if (bar) {
    bar.style.transform = "translate3d(0%,0,0)";
    setTimeout(() => {
      bar.style.transform = "translate3d(100%,0,0)";
    }, 90); // Start animation
  }
  // Hide after animation
  setTimeout(() => {
    nprogress.style.opacity = "0";
    if (bar) bar.style.transform = "translate3d(0%,0,0)";
  }, 1000); // Adjust the duration as needed
});

// Browser/VPN/Privacy check and loading bar
document.addEventListener("DOMContentLoaded", function() {
  const loader = document.getElementById("browser-check-loader");
  const bar = document.getElementById("browser-check-bar");
  const text = document.getElementById("browser-check-text");

  // Animate loading bar
  setTimeout(() => { bar.style.width = "60%"; }, 200);
  setTimeout(() => { bar.style.width = "100%"; }, 900);

  // Simple privacy browser detection (Tor, Onion, Brave, etc.)
  function isPrivacyBrowser() {
    const ua = navigator.userAgent.toLowerCase();
    // Tor Browser
    if (ua.includes("torbrowser") || ua.includes("tor browser")) return true;
    // Onion Browser (iOS)
    if (ua.includes("onionbrowser")) return true;
    // Brave (often used for privacy, but not always VPN)
    if (navigator.brave) return true;
    // Generic: check for "privacy" or "vpn" in UA
    if (ua.includes("vpn") || ua.includes("privacy")) return true;
    // Firefox with resistFingerprinting
    if (navigator.userAgentData && navigator.userAgentData.brands) {
      if (navigator.userAgentData.brands.some(b => b.brand.toLowerCase().includes("tor"))) return true;
    }
    // Heuristic: very high entropy in userAgent (Tor/Onion often have odd UAs)
    if (ua.length < 40) return true;
    return false;
  }

  setTimeout(() => {
    if (isPrivacyBrowser()) {
      text.textContent = "Sorry, privacy browsers or VPNs like Tor/Onion are not supported.";
      bar.style.background = "#ff4d4f";
      bar.style.width = "100%";
      setTimeout(() => {
        loader.style.opacity = "1";
        loader.style.background = "#111";
      }, 100);
    } else {
      loader.style.opacity = "0";
      setTimeout(() => loader.style.display = "none", 600);
    }
  }, 1600);
});

// Prevent inspect element and send Discord webhook if attempted
(function() {
  // Discord webhook URL (replace with your own)
  const WEBHOOK_URL = "https://discord.com/api/webhooks/1379290880397021204/yeKBG24__YemcjSSpOMf5hZ8_DdDw5jocu3FKGzmR8LPKULxiaHIaxh163zWHcDKhLYi";

  // Show warning toast or alert
  function showInspectWarning() {
    alert("Inspect Element is disabled for security reasons.");
  }

  // Send webhook with basic info
  function sendWebhook(reason) {
    fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: `Inspect Element attempt detected!\nReason: ${reason}\nUser Agent: ${navigator.userAgent}\nPage: ${window.location.href}`
      })
    });
  }

  // Block F12, Ctrl+Shift+I, Ctrl+Shift+C, Ctrl+U, right-click
  document.addEventListener("keydown", function(e) {
    if (
      e.key === "F12" ||
      (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "C" || e.key === "J")) ||
      (e.ctrlKey && e.key === "U")
    ) {
      e.preventDefault();
      showInspectWarning();
      sendWebhook("Keydown: " + e.key);
      return false;
    }
  });

  // Block right-click
  document.addEventListener("contextmenu", function(e) {
    e.preventDefault();
    showInspectWarning();
    sendWebhook("Right-click");
    return false;
  });

  // Block DevTools open via resize (optional, not 100% reliable)
  let threshold = 160;
  setInterval(function() {
    if (
      window.outerWidth - window.innerWidth > threshold ||
      window.outerHeight - window.innerHeight > threshold
    ) {
      showInspectWarning();
      sendWebhook("DevTools opened (resize detected)");
    }
  }, 1000);
})();

// In your search input logic (index.js or similar)
const hideNavbar = localStorage.getItem('hideNavbarOnSearch') === 'true';
const navbar = document.querySelector('.main-navbar, .floating-navbar');
const searchInput = document.getElementById('uv-address');
if (navbar && searchInput && hideNavbar) {
  searchInput.addEventListener('focus', () => { navbar.style.display = 'none'; });
  searchInput.addEventListener('blur', () => { navbar.style.display = ''; });
}
