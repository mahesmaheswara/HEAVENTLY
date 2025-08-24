// Dashboard Client Shim - Compatibility and utility layer

// Polyfill for older browsers (e.g., addEventListener)
if (!Element.prototype.addEventListener) {
  Element.prototype.addEventListener = function(event, callback) {
    this.attachEvent('on' + event, callback);
  };
}

// Ensure CSS and JS are loaded
function checkAssetLoading() {
  const styles = document.querySelectorAll('link[rel="stylesheet"]');
  const scripts = document.querySelectorAll('script[src]');
  styles.forEach(link => {
    if (!link.href || link.href.includes('404')) {
      console.warn(`CSS not loaded: ${link.href}`);
    }
  });
  scripts.forEach(script => {
    if (!script.src || script.src.includes('404')) {
      console.warn(`JS not loaded: ${script.src}`);
    }
  });
}
document.addEventListener('DOMContentLoaded', checkAssetLoading);

// Fallback for requestAnimationFrame
window.requestAnimationFrame = window.requestAnimationFrame || 
  window.webkitRequestAnimationFrame || 
  window.mozRequestAnimationFrame || 
  function(callback) {
    window.setTimeout(callback, 1000 / 60);
  };

// Shim for classList (for older IE)
if (!('classList' in document.createElement('div'))) {
  (function() {
    var div = document.createElement('div');
    div.className = 'test';
    if (!div.classList) {
      var classListProto = {
        add: function(className) {
          if (!this.contains(className)) this.className += ' ' + className;
        },
        remove: function(className) {
          if (this.contains(className)) this.className = this.className.replace(new RegExp('(?:^|\\s)' + className + '(?!\\S)', 'g'), '');
        },
        toggle: function(className) {
          if (this.contains(className)) {
            this.remove(className);
          } else {
            this.add(className);
          }
        },
        contains: function(className) {
          return new RegExp('(?:^|\\s)' + className + '(?!\\S)', 'g').test(this.className);
        }
      };
      Object.defineProperty(Element.prototype, 'classList', {
        get: function() {
          return {
            __proto__: classListProto,
            item: function(i) {
              return this.className.split(' ')[i] || null;
            }
          };
        }
      });
    }
  })();
}

// Initialize theme and accessibility defaults
function initShim() {
  const body = document.body;
  if (body) {
    // Set default theme variables if not defined
    if (!getComputedStyle(body).getPropertyValue('--theme-primary').trim()) {
      body.style.setProperty('--theme-primary', '#4a44ff');
      body.style.setProperty('--theme-secondary', '#00ccff');
    }
    // Ensure high-contrast and large-text classes are removable
    body.classList.remove('high-contrast', 'large-text');
  }
}
document.addEventListener('DOMContentLoaded', initShim);

// Export utility functions for other scripts
window.dashboardShim = {
  log: function(message) {
    console.log(`[Dashboard Shim] ${message}`, new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
  },
  isLoaded: function() {
    return document.readyState === 'complete';
  }
};