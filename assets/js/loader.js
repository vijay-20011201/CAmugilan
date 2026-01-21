/**
 * Component Loader with Modal Support
 * Loads HTML components and handles all interactions
 */

(function() {
  'use strict';

  // ============================================
  // GLOBAL MODAL FUNCTIONS
  // ============================================
  window.openConsultationModal = function() {
    const modal = document.getElementById('consultationModal');
    if (!modal) {
      console.warn('Modal not loaded yet');
      return;
    }
    
    modal.classList.remove('hidden');
    setTimeout(() => {
      const inner = modal.querySelector('.transform, .scale-95');
      if (inner) inner.classList.remove('scale-95');
    }, 10);
    document.body.style.overflow = 'hidden';
  };

  window.closeConsultationModal = function() {
    const modal = document.getElementById('consultationModal');
    if (!modal) return;
    
    const inner = modal.querySelector('.transform');
    if (inner) inner.classList.add('scale-95');
    
    setTimeout(() => {
      modal.classList.add('hidden');
      document.body.style.overflow = 'auto';
    }, 300);
  };

  // ============================================
  // EVENT DELEGATION (handles all interactions)
  // ============================================
  
  document.addEventListener('click', function(e) {
    // Modal open buttons
    if (e.target.closest('[data-modal-open="consultation"]') || 
        e.target.matches('#openConsultationModal') ||
        e.target.closest('button')?.textContent.includes('Free Consultation')) {
      e.preventDefault();
      window.openConsultationModal();
      return;
    }
    
    // Modal close button
    if (e.target.closest('[data-modal-close]') || 
        e.target.matches('#closeModalBtn')) {
      e.preventDefault();
      window.closeConsultationModal();
      return;
    }
    
    // Close modal on background click
    const modal = document.getElementById('consultationModal');
    if (modal && e.target === modal) {
      window.closeConsultationModal();
      return;
    }
    
    // Mobile menu toggle - FIXED VERSION
    if (e.target.closest('#menuBtn') || e.target.matches('#menuBtn')) {
      e.preventDefault();
      e.stopPropagation();
      
      const menu = document.getElementById('mobileMenu');
      if (menu) {
        menu.classList.toggle('hidden');
      }
      return;
    }
    
    // Accordion toggles
    const accordionBtn = e.target.closest('[data-accordion-toggle]');
    if (accordionBtn) {
      e.preventDefault();
      const targetId = accordionBtn.getAttribute('data-accordion-toggle');
      const target = document.getElementById(targetId);
      const arrow = accordionBtn.querySelector('span');
      
      if (target) target.classList.toggle('hidden');
      if (arrow) arrow.classList.toggle('rotate-180');
      return;
    }

    // Mobile service button (legacy support)
    if (e.target.closest('#mobileServiceBtn')) {
      e.preventDefault();
      const services = document.getElementById('mobileServices');
      const arrow = e.target.querySelector('span') || e.target.closest('button')?.querySelector('span');
      if (services) services.classList.toggle('hidden');
      if (arrow) arrow.classList.toggle('rotate-180');
      return;
    }

    // ============================================
    // MODAL CUSTOM DROPDOWN HANDLERS
    // ============================================
    
    // Modal dropdown trigger click
    if (e.target.closest('#modalDropdownTrigger')) {
      e.preventDefault();
      e.stopPropagation();
      const options = document.getElementById('modalDropdownOptions');
      const arrow = document.getElementById('modalDropdownArrow');
      if (options) options.classList.toggle('hidden');
      if (arrow) arrow.classList.toggle('rotate-180');
      return;
    }
    
    // Modal dropdown option click
    if (e.target.closest('.modal-dropdown-option')) {
      e.preventDefault();
      const option = e.target.closest('.modal-dropdown-option');
      const value = option.getAttribute('data-value');
      const selectedText = document.getElementById('modalSelectedText');
      const serviceInput = document.getElementById('modalServiceInput');
      const options = document.getElementById('modalDropdownOptions');
      const arrow = document.getElementById('modalDropdownArrow');
      
      if (selectedText) {
        selectedText.textContent = value;
        selectedText.className = 'text-gray-700';
      }
      if (serviceInput) serviceInput.value = value;
      if (options) options.classList.add('hidden');
      if (arrow) arrow.classList.remove('rotate-180');
      return;
    }
    
    // Close modal dropdown when clicking outside
    const modalDropdownOptions = document.getElementById('modalDropdownOptions');
    const modalDropdownTrigger = document.getElementById('modalDropdownTrigger');
    if (modalDropdownOptions && !modalDropdownOptions.classList.contains('hidden')) {
      if (!modalDropdownTrigger?.contains(e.target) && !modalDropdownOptions?.contains(e.target)) {
        modalDropdownOptions.classList.add('hidden');
        const arrow = document.getElementById('modalDropdownArrow');
        if (arrow) arrow.classList.remove('rotate-180');
      }
    }
  }, true); // Use capture phase to catch events early

  // Close modal on Escape
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      window.closeConsultationModal();
    }
  });

  // Form submission
  document.addEventListener('submit', function(e) {
    if (e.target.matches('#appointmentForm')) {
      e.preventDefault();
      handleFormSubmit(e.target);
    }
  });

  function handleFormSubmit(form) {
    const statusMsg = document.getElementById('statusMsg');
    const submitBtn = form.querySelector('button[type="submit"]');
    
    if (statusMsg) {
      statusMsg.textContent = 'Sending your request...';
      statusMsg.className = 'text-center text-sm font-medium h-5 mt-3 text-emerald-600';
    }
    if (submitBtn) submitBtn.disabled = true;
    
    // Simulate submission
    setTimeout(() => {
      if (statusMsg) {
        statusMsg.textContent = "Success! We'll contact you soon.";
        statusMsg.className = 'text-center text-sm font-medium h-5 mt-3 text-emerald-600';
      }
      form.reset();
      
      // Reset modal custom dropdown
      const selectedText = document.getElementById('modalSelectedText');
      const serviceInput = document.getElementById('modalServiceInput');
      if (selectedText) {
        selectedText.textContent = '-- Select a Service --';
        selectedText.className = 'text-gray-500';
      }
      if (serviceInput) serviceInput.value = '';
      
      if (submitBtn) submitBtn.disabled = false;
      
      setTimeout(window.closeConsultationModal, 2000);
    }, 1500);
  }

  // ============================================
  // COMPONENT LOADER
  // ============================================
  async function loadComponent(id, url) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to load ${url}: ${response.status}`);
      }
      const html = await response.text();

      const container = document.getElementById(id);
      if (!container) {
        return; // Container doesn't exist on this page
      }

      // Create temporary container
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;

      // Remove all script tags (we handle interactions via event delegation)
      const scripts = tempDiv.querySelectorAll('script');
      scripts.forEach(script => script.remove());

      // Move content to container
      container.innerHTML = '';
      while (tempDiv.firstChild) {
        container.appendChild(tempDiv.firstChild);
      }

      tempDiv.remove();

    } catch (error) {
      console.error(`Error loading component ${url}:`, error);
    }
  }

  // ============================================
  // LOAD ALL COMPONENTS
  // ============================================
  async function loadAllComponents() {
    await loadComponent("navbar", "components/navbar.html");
    await loadComponent("homepage", "components/homepage.html");
    await loadComponent("footer", "components/footer.html");
    
    // Add backup event listeners after components load
    setTimeout(addBackupListeners, 500);
    
    // Initialize Industries Carousel after homepage loads
    setTimeout(initIndustriesCarousel, 100);
  }

  // ============================================
  // INDUSTRIES CAROUSEL
  // ============================================
  function initIndustriesCarousel() {
    const container = document.getElementById('scrollContainer');
    const dots = document.querySelectorAll('.industry-dot');
    
    if (!container || dots.length === 0) {
      // Retry if elements not found yet
      setTimeout(initIndustriesCarousel, 100);
      return;
    }
    
    const cards = container.children;
    const totalCards = cards.length;
    const cardsPerGroup = 3;
    const totalGroups = Math.ceil(totalCards / cardsPerGroup);
    
    let currentGroup = 0;
    let autoScrollInterval;

    function scrollToGroup(groupIndex) {
      if (groupIndex >= totalGroups) {
        groupIndex = 0;
      }
      
      const cardIndex = groupIndex * cardsPerGroup;
      if (cardIndex < totalCards) {
        // Use container scroll instead of scrollIntoView to prevent page jump
        const card = cards[cardIndex];
        const scrollLeft = card.offsetLeft - container.offsetLeft;
        container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
      }
      
      currentGroup = groupIndex;
      updateDots();
    }

    function updateDots() {
      dots.forEach((dot, index) => {
        if (index === currentGroup) {
          dot.classList.remove('bg-gray-300');
          dot.classList.add('bg-blue-600');
        } else {
          dot.classList.remove('bg-blue-600');
          dot.classList.add('bg-gray-300');
        }
      });
    }

    function startAutoScroll() {
      stopAutoScroll();
      autoScrollInterval = setInterval(() => {
        currentGroup = (currentGroup + 1) % totalGroups;
        scrollToGroup(currentGroup);
      }, 4000);
    }

    function stopAutoScroll() {
      clearInterval(autoScrollInterval);
    }

    // Dot navigation
    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        stopAutoScroll();
        scrollToGroup(index);
        startAutoScroll();
      });
    });

    // Pause on hover
    container.addEventListener('mouseenter', stopAutoScroll);
    container.addEventListener('mouseleave', startAutoScroll);

    // Start auto-scroll
    startAutoScroll();
  }

  // Backup direct event listeners (in case event delegation doesn't catch)
  function addBackupListeners() {
    const menuBtn = document.getElementById('menuBtn');
    if (menuBtn && !menuBtn.hasAttribute('data-listener-added')) {
      menuBtn.setAttribute('data-listener-added', 'true');
      menuBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        const menu = document.getElementById('mobileMenu');
        if (menu) {
          menu.classList.toggle('hidden');
        }
      });
    }
  }

  // Auto-load when ready
  if (document.readyState === 'loading') {
    document.addEventListener("DOMContentLoaded", loadAllComponents);
  } else {
    loadAllComponents();
  }

})();
