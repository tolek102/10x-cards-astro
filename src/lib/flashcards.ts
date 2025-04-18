// src/lib/flashcards.ts
// This module handles flashcard interaction logic, event listeners setup, and utility functions.

export function togglePassword(inputId: string): void {
  const input = document.getElementById(inputId) as HTMLInputElement | null;
  if (!input) return;
  // Using nextElementSibling safely
  const icon = input.nextElementSibling ? input.nextElementSibling.querySelector('i') : null;
  if (!icon) return;
  if (input.type === 'password') {
    input.type = 'text';
    icon.classList.remove('fa-eye');
    icon.classList.add('fa-eye-slash');
  } else {
    input.type = 'password';
    icon.classList.remove('fa-eye-slash');
    icon.classList.add('fa-eye');
  }
}

export function showNotification(message: string, type: 'success' | 'error' = 'success'): void {
  const notification = document.createElement('div');
  notification.className = `fixed top-4 right-4 px-4 py-2 rounded-md shadow-md text-white ${
    type === 'success' ? 'bg-green-500' : 'bg-red-500'
  } z-50`;
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('opacity-0', 'transition-opacity', 'duration-300');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

export function initializeFlashcardsLogic(): void {
  // This function attaches event listeners for flashcard interactions and modal toggles.
  // Example: Attach a click listener to all elements with class 'password-toggle'.
  document.querySelectorAll('.password-toggle').forEach((toggle) => {
    toggle.addEventListener('click', function(this: Element, event: Event) {
      // Expecting the input id to be passed as a data attribute
      const inputId = this.getAttribute('data-input-id');
      if (inputId) {
        togglePassword(inputId);
      } else {
        console.warn('data-input-id attribute missing on password-toggle element.');
      }
    });
  });

  // Further initialization of event listeners for modals and flashcard interactions can be added here.
  // For example, attaching click listeners to buttons, updating counters etc.
} 