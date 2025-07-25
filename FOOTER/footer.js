document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('subscribeForm');
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      const input = form.querySelector('.subscribe-input');
      if (input && input.value) {
        alert('Thank you for subscribing, ' + input.value + '!');
        input.value = '';
      }
    });
  }
}); 